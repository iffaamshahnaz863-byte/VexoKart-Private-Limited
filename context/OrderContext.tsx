import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { Order, OrderStatus, Address, PaymentStatus, Vendor } from "../types.ts";
import { useAuth } from "./AuthContext.tsx";
import { useNotifications } from "./NotificationContext.tsx";
import { BASE_API_URL, API_HEADERS } from "../constants.ts";

interface OrderContextType {
  orders: any[];
  isLoading: boolean;
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
  const { fetchInbox } = useNotifications();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // IN-APP REACT COMPONENT PREVIEW STATE
  const [activeOrderForLabel, setActiveOrderForLabel] = useState<any | null>(null);

  const refreshOrders = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let selectString = `*,vendor:vendors!vendor_id(*)`;
      let filter = `order=created_at.desc`;

      if (user.role === "user") {
        filter += `&user_id=eq.${user.id}`;
      } else if (user.role === "vendor") {
        const vRes = await fetch(`${BASE_API_URL}/vendors?user_id=eq.${user.id}&select=id`, { headers: API_HEADERS });
        if (!vRes.ok) throw new Error("Vendor profile unreachable");
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
        const fallbackRes = await fetch(`${BASE_API_URL}/orders?select=*&${filter}`, {
            headers: { ...API_HEADERS, "Cache-Control": "no-cache" },
        });
        if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            processOrders(data);
            return;
        }
        throw new Error("Order fetch failed");
      }

      const data = await res.json();
      processOrders(data);
    } catch (e: any) {
      console.error("[OrderContext] Fetch failed:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processOrders = (data: any[]) => {
    if (Array.isArray(data)) {
      setOrders(
        data.map((o: any) => ({
          ...o,
          id: o.id.toString(),
          total: Number(o.total_amount || o.total || 0),
          statusHistory: o.status_history || [],
          qrToken: o.qr_token,
          date: o.created_at,
          seller_name: o.vendor?.store_name || "VexoKart Direct",
          shippingAddress: o.shipping_address || o.shippingaddress || o.address || null,
        }))
      );
    }
  };

  useEffect(() => {
    if (user) {
        refreshOrders();
        fetchInbox(user);
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
    if (rawVendorId && !isNaN(Number(rawVendorId))) numericVendorId = Number(rawVendorId);

    const payload = {
      user_id: Number(user.id),
      vendor_id: numericVendorId,
      items: orderData.items,
      total: Number(orderData.total),
      total_amount: Number(orderData.total),
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === "Cash on Delivery" ? "cod_pending" : "paid",
      shipping_address: addressSnapshot,
      status: "Placed" as OrderStatus,
      qr_token: qrToken,
      status_history: [{ status: "Placed", timestamp, actor: "User", note: "Order placed" }],
      created_at: timestamp,
    };

    const res = await fetch(`${BASE_API_URL}/orders`, {
      method: "POST",
      headers: { ...API_HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Order placement failed");
    const result = await res.json();
    refreshOrders();
    return result[0].id.toString();
  };

  const createShipment = async (orderId: string, vendor: any) => {};

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find((o) => o.id === orderId);
    const history = order?.statusHistory || [];
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
    if (res.ok) await refreshOrders();
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