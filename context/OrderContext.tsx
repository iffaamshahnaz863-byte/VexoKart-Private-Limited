import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { Order, OrderStatus } from "../types";
import { useNotifications } from "./NotificationContext";
import { useAuth } from "./AuthContext";
import {
  BASE_API_URL,
  API_HEADERS,
  EDGE_FUNCTION_URL,
} from "../constants";

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    details?: any
  ) => Promise<void>;
  createPaymentOrder: (
    amount: number
  ) => Promise<{ id: string; amount: number }>;
  verifyPayment: (paymentData: any) => Promise<boolean>;
  generateShippingLabel: (orderId: string) => Promise<string>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  updateOrderByToken: (
    token: string,
    status: OrderStatus,
    note?: string
  ) => Promise<{ success: boolean; message: string }>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(
  undefined
);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { notifyOrderUpdate } = useNotifications();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ================================
     REFRESH ORDERS
  ================================= */
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
          data.map((o) => ({
            ...o,
            id: o.id.toString(),
            total: Number(o.total_amount || 0),
            total_amount: Number(o.total_amount || 0),
            statusHistory: o.status_history || [],
            qrToken: o.qr_token,
            date: o.created_at,
            userEmail: user.email,
          }))
        );
      }
    } catch (e) {
      console.error("[OrderContext] refreshOrders:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshOrders();
  }, [user]);

  /* ================================
     ADD ORDER
  ================================= */
  const addOrder = async (orderData: any): Promise<string> => {
    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);

    const payload = {
      user_id: Number(user?.id),
      vendor_id: orderData.items[0]?.vendorId || "multiple",
      items: orderData.items,
      total_amount: Number(orderData.total),
      payment_mode: orderData.payment_method,
      payment_status:
        orderData.payment_method === "Cash on Delivery"
          ? "cod_pending"
          : "failed",
      shipping_address: Number(orderData.shippingAddress?.id),
      status: "Placed",
      qr_token: qrToken,
      status_history: [
        { status: "Placed", timestamp, actor: "User" },
      ],
      created_at: timestamp,
    };

    const res = await fetch(`${BASE_API_URL}/orders`, {
      method: "POST",
      headers: { ...API_HEADERS, Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Order creation failed");

    const result = await res.json();
    await refreshOrders();
    return result[0].id.toString();
  };

  /* ================================
     🔥 FIXED PAYMENT ORDER CREATION
     (FAILED TO FETCH FIX HERE)
  ================================= */
  const createPaymentOrder = async (
    amount: number
  ): Promise<{ id: string; amount: number }> => {
    const apiEndpoint =
      "https://ghzadiplpazekzgjbdxu.supabase.co/functions/v1/super-handler";

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Payment gateway error");
    }

    const data = await response.json();

    return {
      id: data.id,
      amount: data.amount,
    };
  };

  /* ================================
     VERIFY PAYMENT
  ================================= */
  const verifyPayment = async (paymentData: any): Promise<boolean> => {
    try {
      const res = await fetch(
        `${EDGE_FUNCTION_URL}/verify_payment`,
        {
          method: "POST",
          headers: API_HEADERS,
          body: JSON.stringify(paymentData),
        }
      );

      if (!res.ok) return false;

      const data = await res.json();
      if (data.success) {
        await refreshOrders();
        return true;
      }
      return false;
    } catch (err) {
      console.error("[verifyPayment]", err);
      return false;
    }
  };

  /* ================================
     SHIPPING LABEL
  ================================= */
  const generateShippingLabel = async (
    orderId: string
  ): Promise<string> => {
    const res = await fetch(
      `${EDGE_FUNCTION_URL}/generate_shipping_label`,
      {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({ orderId }),
      }
    );

    if (!res.ok) throw new Error("Label generation failed");

    const data = await res.json();
    await refreshOrders();
    return data.label_url;
  };

  /* ================================
     UPDATE ORDER STATUS
  ================================= */
  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    details: any = {}
  ) => {
    try {
      await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
        method: "PATCH",
        headers: { ...API_HEADERS, Prefer: "return=minimal" },
        body: JSON.stringify({ status }),
      });
      await refreshOrders();
    } catch (err) {
      console.error("[updateOrderStatus]", err);
    }
  };

  const getOrderById = (id: string) =>
    orders.find((o) => o.id === id);

  const getOrderByToken = (token: string) =>
    orders.find((o) => o.qrToken === token);

  const updateOrderByToken = async (
    token: string,
    status: OrderStatus,
    note?: string
  ) => {
    const order = getOrderByToken(token);
    if (!order)
      return { success: false, message: "Invalid token" };

    await updateOrderStatus(order.id, status, {
      note,
      actor: "Courier",
    });

    return { success: true, message: "Status updated" };
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        addOrder,
        updateOrderStatus,
        createPaymentOrder,
        verifyPayment,
        generateShippingLabel,
        getOrderById,
        getOrderByToken,
        updateOrderByToken,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context)
    throw new Error("OrderContext must be used inside provider");
  return context;
};
