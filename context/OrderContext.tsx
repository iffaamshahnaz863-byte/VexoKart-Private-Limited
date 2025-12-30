
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus } from '../types.ts';
import { useNotifications } from './NotificationContext.tsx';
import { useAuth } from './AuthContext.tsx';
import { BASE_API_URL, API_HEADERS } from '../constants.ts';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: any) => Promise<void>;
  // Fix: Added missing generateShippingLabel property to the context interface
  generateShippingLabel: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrders = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      let url = `${BASE_API_URL}/orders?select=*&order=created_at.desc`;
      if (user.role === 'user') {
        url += `&user_id=eq.${user.id}`;
      }
      const res = await fetch(url, { headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data.map(o => ({
          ...o,
          id: o.id.toString(),
          total: Number(o.total_amount || 0),
          statusHistory: o.status_history || [],
          qrToken: o.qr_token,
          date: o.created_at,
          userEmail: user.email
        })));
      }
    } catch (e) {
      console.error("[OrderContext] refreshOrders:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (user) refreshOrders(); }, [user]);

  const addOrder = async (orderData: any): Promise<string> => {
    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);
    const payload = {
      user_id: Number(user?.id),
      vendor_id: orderData.items[0]?.vendorId || 'multiple',
      items: orderData.items,
      total_amount: Number(orderData.total),
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === 'Cash on Delivery' ? 'cod_pending' : 'paid',
      shipping_address: Number(orderData.shippingAddress?.id),
      status: 'Placed',
      qr_token: qrToken,
      status_history: [{ status: 'Placed', timestamp, actor: 'User' }],
      created_at: timestamp
    };

    const res = await fetch(`${BASE_API_URL}/orders`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Order creation failed");
    const result = await res.json();
    await refreshOrders();
    return result[0].id.toString();
  };

  // Fix: Enhanced updateOrderStatus to handle metadata and maintain status history logs
  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    const history = order?.status_history || [];
    const newHistory = [...history, { 
      status, 
      timestamp: new Date().toISOString(), 
      actor: user?.role === 'vendor' ? 'Vendor' : user?.role === 'admin' ? 'Admin' : 'System',
      note: details.note || `Order marked as ${status}`
    }];

    const payload = { 
      status, 
      status_history: newHistory,
      ...details 
    };

    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
    await refreshOrders();
  };

  // Fix: Implemented generateShippingLabel to fulfill requirement for vendor pack and label workflow
  const generateShippingLabel = async (orderId: string) => {
    // Generate a placeholder label URL for Meesho-style fulfillment simulation
    const labelUrl = `https://ghzadiplpazekzgjbdxu.supabase.co/storage/v1/object/public/labels/${orderId}.pdf`;
    await updateOrderStatus(orderId, 'Packed', { label_url: labelUrl });
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);
  const getOrderByToken = (token: string) => orders.find(o => o.qrToken === token);

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: 'Invalid token' };
    await updateOrderStatus(order.id, status, { note });
    return { success: true, message: 'Status updated' };
  };

  return (
    <OrderContext.Provider value={{ 
      orders, isLoading, addOrder, updateOrderStatus, generateShippingLabel, refreshOrders, 
      getOrderById, getOrderByToken, updateOrderByToken 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("OrderContext missing");
  return context;
};
