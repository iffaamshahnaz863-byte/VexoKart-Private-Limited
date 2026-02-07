
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
// Fix: Import newly added Vendor type
import { Order, OrderStatus, Address, PaymentStatus, Vendor } from "../types.ts";
import { useAuth } from "./AuthContext.tsx";
import { useNotifications } from "./NotificationContext.tsx";
import { BASE_API_URL, API_HEADERS } from "../constants.ts";

interface OrderContextType {
  orders: any[];
  isLoading: boolean;
  isLabelGenerating: boolean;
  activeOrderForLabel: any | null;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: any
  ) => Promise<void>;
  createShipment: (orderId: string, vendorData: any) => Promise<void>;
  generateShippingLabel: (orderId: string) => void;
  closeLabelPreview: () => void;
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
  const { user } = useAuth();
  const { fetchInbox, createAppNotification } = useNotifications();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeOrderForLabel, setActiveOrderForLabel] = useState<any | null>(null);

  const refreshOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // FIX: Skip fetch for guest users (ID starts with 'guest-') to avoid DB type errors
    if (user.id.toString().startsWith('guest-')) {
        setOrders([]);
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true);
      // Simplified join syntax for better compatibility
      let selectString = `*,vendor:vendors(*)`;
      let filter = `order=created_at.desc`;

      if (user.role === "user") {
        // Use auth_id (UUID) to query orders, ensuring consistency with how reviews are linked.
        filter += `&user_id=eq.${user.auth_uid}`;
      } else if (user.role === "vendor") {
        const vRes = await fetch(`${BASE_API_URL}/vendors?user_id=eq.${user.id}&select=id`, { headers: API_HEADERS });
        if (!vRes.ok) {
           const errText = await vRes.text();
           console.error("[OrderContext] Vendor profile fetch failed:", errText);
           throw new Error("Vendor profile unreachable");
        }
        const vData = await vRes.json();
        if (Array.isArray(vData) && vData.length > 0) {
            filter += `&vendor_id=eq.${vData[0].id}`;
        } else {
            setOrders([]);
            setIsLoading(false);
            return;
        }
      }

      const res = await fetch(`${BASE_API_URL}/orders?select=${selectString}&${filter}`, {
        headers: { ...API_HEADERS, "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: res.statusText }));
        console.warn("[OrderContext] Primary fetch failed, trying fallback. Error:", errData.message);
        
        const fallbackRes = await fetch(`${BASE_API_URL}/orders?select=*&${filter}`, {
            headers: { ...API_HEADERS, "Cache-Control": "no-cache" },
        });
        
        if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            processOrders(data);
            return;
        } else {
            const fallbackErr = await fallbackRes.json().catch(() => ({ message: fallbackRes.statusText }));
            console.error("[OrderContext] Fallback fetch failed:", fallbackErr.message);
            // Don't throw here to avoid crashing the UI loop, just log
            setOrders([]); 
            return;
        }
      }

      const data = await res.json();
      processOrders(data);
    } catch (e: any) {
      console.error("[OrderContext] Fatal Sync Error:", e.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processOrders = (data: any[]) => {
    if (Array.isArray(data)) {
      setOrders(
        data.map((o: any) => {
          /**
           * Robust Address Extraction:
           * Retrieve the snapshot from the status_history entry where it was saved.
           */
          const addressSource = (o.status_history?.[0]?.address_snapshot) ||
                                (typeof o.metadata === 'object' && o.metadata?.address ? o.metadata.address : null) ||
                                (typeof o.address === 'object' ? o.address : null) || 
                                (typeof o.shipping_address === 'object' ? o.shipping_address : null) || 
                                null;

          return {
            ...o,
            id: o.id.toString(),
            total: Number(o.total_amount || o.total || 0),
            discount_amount: Number(o.discount_amount || 0),
            statusHistory: o.status_history || [],
            qrToken: o.qr_token,
            date: o.created_at,
            seller_name: o.vendor?.store_name || "DAR CYCLE HUB Direct",
            shippingAddress: addressSource,
          };
        })
      );
    }
  };

  useEffect(() => {
    if (user) {
        refreshOrders();
        // Only fetch inbox if it's a real user, guests usually don't have DB notifications
        if (!user.id.toString().startsWith('guest-')) {
            fetchInbox(user);
        }
    } else {
        setOrders([]);
        setIsLoading(false);
    }
  }, [user]);

  const generateShippingLabel = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrderForLabel(order);
    }
  };

  const closeLabelPreview = () => {
    setActiveOrderForLabel(null);
  };

  const addOrder = async (orderData: any): Promise<string> => {
    if (!user) throw new Error("Authentication required.");
    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);
    
    const addressSnapshot = {
      fullName: orderData.shippingAddress?.fullName || 'Customer',
      street: orderData.shippingAddress?.street || '',
      city: orderData.shippingAddress?.city || '',
      state: orderData.shippingAddress?.state || '',
      zip: orderData.shippingAddress?.zip || '',
      phone: orderData.shippingAddress?.phone || '',
    };

    const rawVendorId = orderData.items[0]?.vendor_id;
    let vendorIdValue: any = null;
    if (rawVendorId) {
      vendorIdValue = isNaN(Number(rawVendorId)) ? rawVendorId : Number(rawVendorId);
    }

    // CRITICAL FIX: Use the auth_id (UUID) as the user_id foreign key.
    // This aligns with how reviews are stored and assumes orders.user_id is a UUID.
    const userIdValue = user.auth_uid ? user.auth_uid : null;

    const payload: any = {
      user_id: userIdValue,
      vendor_id: vendorIdValue,
      items: orderData.items,
      total_amount: Number(orderData.total),
      discount_amount: Number(orderData.discount_amount || 0), // Store UPI discount
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === "Cash on Delivery" ? "cod_pending" : "paid",
      status: "Placed" as OrderStatus,
      qr_token: qrToken,
      status_history: [{ 
        status: "Placed", 
        timestamp, 
        actor: "User", 
        note: "Order placed",
        address_snapshot: addressSnapshot 
      }],
      created_at: timestamp
    };

    const res = await fetch(`${BASE_API_URL}/orders`, {
      method: "POST",
      headers: { ...API_HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      console.error("[OrderContext] Database Rejection Details:", res.status, JSON.stringify(errorBody));
      throw new Error(errorBody.message || `Order placement failed (Status: ${res.status})`);
    }

    const result = await res.json();
    const orderId = result[0].id.toString();

    // Only attempt notifications if we have a valid user ID, otherwise client-side only
    if (userIdValue) {
        try {
            await createAppNotification({
                user_id: userIdValue,
                role: 'user',
                title: 'Order Confirmed',
                message: 'Your order has been placed successfully.',
                type: 'order_status'
            });

            if (vendorIdValue) {
                await createAppNotification({
                    vendor_id: vendorIdValue,
                    role: 'vendor',
                    title: 'New Order Received',
                    message: `You have received a new order (#${orderId.slice(-6)}). Please pack it.`,
                    type: 'order_alert'
                });
            }
        } catch (notifErr) {
            console.warn("Background notification trigger failed", notifErr);
        }
    }

    refreshOrders();
    // Only refresh inbox if valid user
    if (userIdValue && user) fetchInbox(user);
    
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const history = order.statusHistory || [];
    const newHistory = [...history, {
        status,
        timestamp: new Date().toISOString(),
        actor: user?.role === "vendor" ? "Vendor" : user?.role === "admin" ? "Admin" : "System",
        note: details.note || `Order status transitioned to ${status}`,
    }];

    const updatePayload: any = { status, status_history: newHistory };
    if (details.courier_name) updatePayload.courier_name = details.courier_name;
    if (details.tracking_id) updatePayload.tracking_id = details.tracking_id;

    const res = await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: "PATCH",
      headers: { ...API_HEADERS },
      body: JSON.stringify(updatePayload),
    });

    if (res.ok) {
        // Notifications only for non-guest users usually, but logic exists inside createAppNotification
        try {
            if (order.user_id && !order.user_id.toString().startsWith('guest-')) {
// Fix: Use capitalized status values to match the OrderStatus type
                if (status === 'Packed') {
                    await createAppNotification({
                        user_id: order.user_id,
                        role: 'user',
                        title: 'Order Packed',
                        message: 'Your order has been packed and will be shipped soon.',
                        type: 'order_status'
                    });
// Fix: Use capitalized status values to match the OrderStatus type
                } else if (status === 'Shipped') {
                    await createAppNotification({
                        user_id: order.user_id,
                        role: 'user',
                        title: 'Order Shipped',
                        message: 'Your order is on the way. Tracking updates will be available soon.',
                        type: 'order_status'
                    });
// Fix: Use capitalized status values to match the OrderStatus type
                } else if (status === 'Delivered') {
                    await createAppNotification({
                        user_id: order.user_id,
                        role: 'user',
                        title: 'Order Delivered',
                        message: 'Your order has been delivered successfully. Please rate the product.',
                        type: 'order_status'
                    });
                    if (order.vendor_id) {
                        await createAppNotification({
                            vendor_id: order.vendor_id,
                            role: 'vendor',
                            title: 'Payment Credited',
                            message: `Order #${orderId.slice(-6)} has been delivered. Amount has been added to your wallet.`,
                            type: 'wallet_update'
                        });
                    }
                }
            }
        } catch (notifErr) {
            console.warn("Status notification trigger failed", notifErr);
        }
        
        await refreshOrders();
        if (user && !user.id.toString().startsWith('guest-')) await fetchInbox(user);
    }
  };

  const createShipment = async (orderId: string, vendorData: any) => {
    // Fix: Use capitalized status to match OrderStatus type
    await updateOrderStatus(orderId, 'Confirmed', { note: 'Shipment manifest processing started.' });
  };

  const getOrderById = (id: string) => orders.find((o) => o.id === id);
  const getOrderByToken = (token: string) => orders.find((o) => o.qrToken === token || o.qr_token === token);

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: "Invalid token." };
    await updateOrderStatus(order.id, status, { note });
    return { success: true, message: `Status updated to ${status}` };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        isLabelGenerating: false,
        activeOrderForLabel,
        addOrder,
        updateOrderStatus,
        createShipment,
        generateShippingLabel,
        closeLabelPreview,
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
  if (!context) throw new Error("OrderContext missing.");
  return context;
};
