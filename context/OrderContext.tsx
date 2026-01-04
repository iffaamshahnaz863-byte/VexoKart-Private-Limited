
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { Order, OrderStatus, Address, PaymentStatus } from "../types.ts";
import { useAuth } from "./AuthContext.tsx";
import { useNotifications } from "./NotificationContext.tsx";
import { BASE_API_URL, API_HEADERS } from "../constants.ts";

interface OrderContextType {
  orders: any[]; // Using any temporarily for joined structure
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: any
  ) => Promise<void>;
  generateShippingLabel: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  getOrderById: (orderId: string) => any | undefined;
  getOrderByToken: (token: string) => any | undefined;
  updateOrderByToken: (
    token: string,
    status: OrderStatus,
    note?: string
  ) => Promise<{ success: boolean; message: string }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user, users } = useAuth();
  const { sendInvoiceEmail, notifyOrderUpdate } = useNotifications();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     FETCH ORDERS (WITH JOIN)
  ========================== */
  const refreshOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Join with vendors table to get store_name for invoices and orders
      let url = `${BASE_API_URL}/orders?select=*,vendor:vendors(store_name)&order=created_at.desc`;

      if (user.role === "user") {
        url += `&user_id=eq.${user.id}`;
      }

      const res = await fetch(url, {
        headers: { ...API_HEADERS, "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();

      if (Array.isArray(data)) {
        setOrders(
          data.map((o: any) => ({
            ...o,
            id: o.id.toString(),
            total: Number(o.total_amount || 0),
            statusHistory: o.status_history || [],
            qrToken: o.qr_token,
            date: o.created_at,
            // Fallback for store_name from joined vendor object
            seller_name: o.vendor?.store_name || "VexoKart Direct",
            shippingAddress: o.shippingaddress || o.address || null,
          }))
        );
      }
    } catch (e) {
      console.error("[OrderContext] Order fetch failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshOrders();
    else setOrders([]);
  }, [user]);

  /* =========================
     CREATE ORDER
  ========================== */
  const addOrder = async (orderData: any): Promise<string> => {
    if (!user) throw new Error("Authentication required to place order.");

    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);

    const addressSnapshot: Address = {
      id: orderData.shippingAddress?.id || Date.now().toString(),
      fullName: orderData.shippingAddress?.fullName || 'Customer',
      street: orderData.shippingAddress?.street || '',
      city: orderData.shippingAddress?.city || '',
      state: orderData.shippingAddress?.state || '',
      zip: orderData.shippingAddress?.zip || '',
      phone: orderData.shippingAddress?.phone || '',
    };

    const rawVendorId = orderData.items[0]?.vendor_id;
    let numericVendorId = null;
    if (rawVendorId && !isNaN(Number(rawVendorId))) {
      numericVendorId = Number(rawVendorId);
    }

    // Prepare a descriptive note for history, capturing payment ID if present
    const historyNote = orderData.payment_id 
        ? `Order placed successfully (Ref: ${orderData.payment_id})`
        : "Order placed successfully";

    const payload = {
      user_id: Number(user.id),
      vendor_id: numericVendorId,
      items: orderData.items,
      total_amount: Number(orderData.total),
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === "Cash on Delivery" ? "cod_pending" : "paid",
      // FIXED: Removed 'payment_id' and 'invoice_generated' columns as they don't exist in the current DB schema.
      address: addressSnapshot,
      shippingaddress: addressSnapshot,
      status: "Placed" as OrderStatus,
      qr_token: qrToken,
      status_history: [{
          status: "Placed" as OrderStatus,
          timestamp,
          actor: "User" as const,
          note: historyNote,
      }],
      created_at: timestamp,
    };

    try {
      const res = await fetch(`${BASE_API_URL}/orders`, {
        method: "POST",
        headers: { 
          ...API_HEADERS, 
          "Prefer": "return=representation" 
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const errorMessage = errorBody.message || errorBody.details || `Server responded with ${res.status}`;
        throw new Error(`Order System Error: ${errorMessage}`);
      }

      const result = await res.json();
      if (!Array.isArray(result) || result.length === 0) {
          throw new Error("Order creation verified but manifest receipt failed. Check My Orders.");
      }
      
      const createdOrder = result[0];
      const finalOrderId = createdOrder.id.toString();
      
      refreshOrders();
      
      // Fire-and-forget notification block (Customer specific)
      (async () => {
          try {
              const orderForNotify = { 
                  ...createdOrder, 
                  id: finalOrderId, 
                  total: Number(createdOrder.total_amount), 
                  shippingAddress: createdOrder.shippingaddress 
              };
              await Promise.allSettled([
                  sendInvoiceEmail(orderForNotify, user),
                  notifyOrderUpdate(orderForNotify, user)
              ]);
          } catch (sideEffectErr) {
              console.warn("Notification side-effects failed silently:", sideEffectErr);
          }
      })();

      return finalOrderId;
    } catch (err: any) {
      console.error("[CRITICAL] Order Placement Failed:", err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    
    const history = order?.statusHistory || [];
    const newHistory = [...history, {
        status,
        timestamp: new Date().toISOString(),
        actor: user?.role === "vendor" ? "Vendor" : user?.role === "admin" ? "Admin" : "System",
        note: details.note || `Order status transitioned to ${status}`,
    }];

    try {
      const res = await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: { ...API_HEADERS },
        body: JSON.stringify({ 
          status, 
          status_history: newHistory,
          ...(details.courier_name && { courier_name: details.courier_name }),
          ...(details.tracking_id && { tracking_id: details.tracking_id }),
          ...(details.label_url && { label_url: details.label_url })
        }),
      });
      
      if (!res.ok) throw new Error("Status update failed");
      await refreshOrders();

      // Send automated notifications in the background
      (async () => {
        if ((status === 'Cancelled' || status === 'Shipped' || status === 'Delivered')) {
            const customerAccount = users.find(u => Number(u.id) === Number(order.user_id));
            if (customerAccount) {
                await notifyOrderUpdate(order, customerAccount);
            }
        }
      })();
    } catch (err) { 
      console.error("Status Update Error:", err); 
    }
  };

  const generateShippingLabel = async (orderId: string) => {
    const labelUrl = `https://ghzadiplpazekzgjbdxu.supabase.co/storage/v1/object/public/labels/${orderId}.pdf`;
    await updateOrderStatus(orderId, "Packed", { label_url: labelUrl });
  };

  const getOrderById = (id: string) => orders.find((o) => o.id === id);
  const getOrderByToken = (token: string) => orders.find((o) => o.qrToken === token || o.qr_token === token);

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: "Invalid package manifest token." };
    await updateOrderStatus(order.id, status, { note });
    return { success: true, message: `Manifest updated to ${status}` };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        addOrder,
        updateOrderStatus,
        generateShippingLabel,
        refreshOrders,
        getOrderById,
        getOrderByToken,
        updateOrderByToken,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("OrderContext provider missing.");
  return context;
};
