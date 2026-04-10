
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { Order, OrderStatus, Address, PaymentStatus, Vendor, User, AppNotification } from "../types.ts";
import { useAuth } from "./AuthContext.tsx";
import { useNotifications } from "./NotificationContext.tsx";
import { supabase } from "../supabase";

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

    if (user.id.toString().startsWith('guest-')) {
        setOrders([]);
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true);
      
      let query = supabase
        .from('orders')
        .select('*, vendor:vendors(*)')
        .order('created_at', { ascending: false });

      if (user.role === "user") {
        query = query.eq('user_id', user.id);
      } else if (user.role === "vendor") {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (vendorError) throw vendorError;
        if (vendorData) {
          query = query.eq('vendor_id', vendorData.id);
        } else {
          setOrders([]);
          setIsLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      processOrders(data || []);
    } catch (e: any) {
      console.error("[OrderContext] Error fetching orders:", e.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processOrders = (data: any[]) => {
    if (Array.isArray(data)) {
      setOrders(
        data.map((o: any) => {
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
            seller_name: o.vendor?.store_name || "VEXOKART Direct",
            shippingAddress: addressSource,
          };
        })
      );
    }
  };

  useEffect(() => {
    if (user) {
        refreshOrders();
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
      name: orderData.shipping_address?.name || 'Customer',
      phone: orderData.shipping_address?.phone || '',
      address_line: orderData.shipping_address?.address_line || '',
      city: orderData.shipping_address?.city || '',
      state: orderData.shipping_address?.state || '',
      pincode: orderData.shipping_address?.pincode || '',
    };

    const rawVendorId = orderData.items[0]?.vendor_id;
    let vendorIdValue: any = null;
    if (rawVendorId) {
      vendorIdValue = isNaN(Number(rawVendorId)) ? rawVendorId : Number(rawVendorId);
    }

    const userIdValue = user.id;

    const payload: any = {
      user_id: userIdValue,
      vendor_id: vendorIdValue,
      items: orderData.items,
      total_amount: Number(orderData.total),
      discount_amount: Number(orderData.discount_amount || 0),
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

    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select();

    if (error) throw error;

    const orderId = data[0].id.toString();

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

    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (!error) {
        try {
            if (order.user_id && !order.user_id.toString().startsWith('guest-')) {
                if (status === 'Packed') {
                    await createAppNotification({
                        user_id: order.user_id,
                        role: 'user',
                        title: 'Order Packed',
                        message: 'Your order has been packed and will be shipped soon.',
                        type: 'order_status'
                    });
                } else if (status === 'Shipped') {
                    await createAppNotification({
                        user_id: order.user_id,
                        role: 'user',
                        title: 'Order Shipped',
                        message: 'Your order is on the way. Tracking updates will be available soon.',
                        type: 'order_status'
                    });
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

