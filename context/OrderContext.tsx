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
  orders: Order[];
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: any
  ) => Promise<void>;
  generateShippingLabel: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
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
  const { sendInvoiceEmail } = useNotifications();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     FETCH ORDERS
  ========================== */
  const refreshOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      let url = `${BASE_API_URL}/orders?select=*&order=created_at.desc`;

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

            // ✅ ALWAYS read from shippingaddress first
            shippingAddress:
              o.shippingaddress || o.address || null,
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
     CREATE ORDER (FIXED)
  ========================== */
  const addOrder = async (orderData: any): Promise<string> => {
    if (!user) throw new Error("User not logged in");

    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);

    /* ✅ ADDRESS SNAPSHOT */
    const addressSnapshot: Address = {
      id: orderData.shippingAddress.id || Date.now().toString(),
      fullName: orderData.shippingAddress.fullName,
      street: orderData.shippingAddress.street,
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state,
      zip: orderData.shippingAddress.zip,
      phone: orderData.shippingAddress.phone,
    };

    const primaryVendorId =
      orderData.items.length > 1 &&
      new Set(orderData.items.map((i: any) => i.vendorId)).size > 1
        ? "multiple"
        : orderData.items[0]?.vendorId;

    /* ✅ FINAL PAYLOAD (COLUMN NAMES FIXED) */
    const payload = {
      user_id: Number(user.id),
      vendor_id: String(primaryVendorId),
      items: orderData.items,
      total_amount: Number(orderData.total),

      payment_mode: orderData.payment_method as
        | "Online Payment"
        | "Cash on Delivery",

      payment_status:
        orderData.payment_method === "Cash on Delivery"
          ? ("cod_pending" as PaymentStatus)
          : ("paid" as PaymentStatus),

      // 🔥 THIS IS THE MAIN FIX
      address: addressSnapshot,
      shippingaddress: addressSnapshot, // ✅ CORRECT COLUMN

      status: "Placed" as OrderStatus,
      qr_token: qrToken,

      status_history: [
        {
          status: "Placed" as OrderStatus,
          timestamp,
          // Fix: Use const assertion for actor to satisfy literal union type in StatusHistory
          actor: "User" as const,
          note: "Order placed by customer",
        },
      ],

      created_at: timestamp,
    };

    try {
      const res = await fetch(`${BASE_API_URL}/orders`, {
        method: "POST",
        headers: { ...API_HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const result = await res.json();
      const createdOrder = result[0];
      
      // ✅ TRIGGER AUTOMATED INVOICE EMAIL IMMEDIATELY AFTER SUCCESSFUL DB WRITE
      // We pass the full created record (including items) to the notification engine
      const orderObj: Order = {
          ...createdOrder,
          id: createdOrder.id.toString(),
          items: createdOrder.items || [], // Crucial for PDF itemization
          total: Number(createdOrder.total_amount || createdOrder.total || 0),
          shippingAddress: createdOrder.shippingaddress || createdOrder.address,
          created_at: createdOrder.created_at,
          payment_mode: createdOrder.payment_mode,
          payment_status: createdOrder.payment_status
      };
      
      // Trigger as background task to avoid blocking the main UI redirect
      sendInvoiceEmail(orderObj, user).catch(err => {
          console.warn("[Background Task] Automatic invoice delivery failed silently", err);
      });

      await refreshOrders();
      return createdOrder.id.toString();
    } catch (err) {
      console.warn("[OrderContext] Offline fallback order used");

      const tempId = "ORD-" + Math.floor(Math.random() * 100000);

      // Fix: Construct newOrder explicitly with typed properties to resolve incompatible spread assignments
      const newOrder: Order = {
        id: tempId,
        user_id: payload.user_id,
        vendor_id: payload.vendor_id,
        items: payload.items,
        total: payload.total_amount,
        total_amount: payload.total_amount,
        payment_mode: payload.payment_mode,
        payment_status: payload.payment_status,
        shippingAddress: payload.shippingaddress,
        shipping_address: payload.shippingaddress,
        status: payload.status,
        statusHistory: payload.status_history as any,
        status_history: payload.status_history as any,
        qrToken: payload.qr_token,
        qr_token: payload.qr_token,
        created_at: payload.created_at,
        date: payload.created_at,
      };

      setOrders((prev) => [newOrder, ...prev]);
      return tempId;
    }
  };

  /* =========================
     UPDATE ORDER STATUS
  ========================== */
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    details: any = {}
  ) => {
    const order = orders.find((o) => o.id === orderId);
    const history = order?.statusHistory || [];

    const newHistory = [
      ...history,
      {
        status,
        timestamp: new Date().toISOString(),
        actor:
          user?.role === "vendor"
            ? "Vendor"
            : user?.role === "admin"
            ? "Admin"
            : "System",
        note: details.note || `Order marked as ${status}`,
      },
    ];

    const payload = {
      status,
      status_history: newHistory,
      ...details,
    };

    try {
      await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: { ...API_HEADERS },
        body: JSON.stringify(payload),
      });

      await refreshOrders();
    } catch {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, ...payload } : o
        )
      );
    }
  };

  /* =========================
     SHIPPING LABEL
  ========================== */
  const generateShippingLabel = async (orderId: string) => {
    const labelUrl = `https://ghzadiplpazekzgjbdxu.supabase.co/storage/v1/object/public/labels/${orderId}.pdf`;
    await updateOrderStatus(orderId, "Packed", {
      label_url: labelUrl,
    });
  };

  const getOrderById = (id: string) =>
    orders.find((o) => o.id === id);

  const getOrderByToken = (token: string) =>
    orders.find((o) => o.qrToken === token || o.qr_token === token);

  const updateOrderByToken = async (
    token: string,
    status: OrderStatus,
    note?: string
  ) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: "Invalid token" };

    await updateOrderStatus(order.id, status, { note });
    return { success: true, message: "Status updated" };
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
  if (!context) throw new Error("OrderContext missing");
  return context;
};