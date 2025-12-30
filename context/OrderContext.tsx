import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus, PaymentStatus, StatusHistory } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { BASE_API_URL, API_HEADERS, EDGE_FUNCTION_URL } from '../constants';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: any) => Promise<void>;
  createPaymentOrder: (orderId: string, amount: number) => Promise<string>;
  verifyPayment: (paymentData: any) => Promise<boolean>;
  generateShippingLabel: (orderId: string) => Promise<string>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
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

      const response = await fetch(url, { headers: API_HEADERS });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mapped = data.map(o => ({
            ...o,
            id: o.id.toString(),
            total_amount: Number(o.total_amount),
            status_history: Array.isArray(o.status_history) ? o.status_history : [],
            items: Array.isArray(o.items) ? o.items : []
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) refreshOrders();
  }, [user]);

  const addOrder = async (orderData: any): Promise<string> => {
    const timestamp = new Date().toISOString();
    const qrToken = Math.random().toString(36).substring(2, 15);
    
    const payload = {
      user_id: user?.id,
      vendor_id: orderData.items[0]?.vendorId || 'multiple',
      items: orderData.items,
      total_amount: orderData.total,
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === 'Cash on Delivery' ? 'cod_pending' : 'failed',
      shipping_address: orderData.shippingAddress,
      status: 'Placed',
      qr_token: qrToken,
      status_history: [{ status: 'Placed', timestamp, actor: 'System' }],
      created_at: timestamp
    };

    const res = await fetch(`${BASE_API_URL}/orders`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to place order');
    
    await refreshOrders();
    return result[0].id.toString();
  };

  const createPaymentOrder = async (orderId: string, amount: number): Promise<string> => {
    const res = await fetch(`${EDGE_FUNCTION_URL}/create_payment_order`, {
      method: 'POST',
      headers: { ...API_HEADERS },
      body: JSON.stringify({ orderId, amount })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create payment order');
    return data.id; // Razorpay Order ID
  };

  const verifyPayment = async (paymentData: any): Promise<boolean> => {
    const res = await fetch(`${EDGE_FUNCTION_URL}/verify_payment`, {
      method: 'POST',
      headers: { ...API_HEADERS },
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (data.success) {
        await refreshOrders();
    }
    return data.success;
  };

  const generateShippingLabel = async (orderId: string): Promise<string> => {
    const res = await fetch(`${EDGE_FUNCTION_URL}/generate_shipping_label`, {
      method: 'POST',
      headers: { ...API_HEADERS },
      body: JSON.stringify({ orderId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to generate shipping label');
    
    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify({ label_url: data.label_url, status: 'Packed' })
    });
    
    await refreshOrders();
    return data.label_url;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const timestamp = new Date().toISOString();
    const newHistory = [...(order.status_history || []), { 
        status, 
        timestamp, 
        note: details.note, 
        actor: details.actor || 'System' 
    }];

    const payload: any = { status, status_history: newHistory };
    if (details.courier_name) payload.courier_name = details.courier_name;
    if (details.tracking_id) payload.tracking_id = details.tracking_id;

    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(payload)
    });
    
    // Notify vendor/user via Edge Function if needed
    if (['Packed', 'Shipped', 'Delivered'].includes(status)) {
        fetch(`${EDGE_FUNCTION_URL}/send_notification`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ orderId, status })
        }).catch(console.error);
    }

    await refreshOrders();
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);
  const getOrderByToken = (token: string) => orders.find(o => o.qr_token === token);

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: 'Package identity not found.' };

    try {
        await updateOrderStatus(order.id, status, { note, actor: 'Courier' });
        return { success: true, message: `Package marked as ${status} successfully.` };
    } catch (e) {
        return { success: false, message: 'Update failed. Check connection.' };
    }
  };

  return (
    <OrderContext.Provider value={{ 
        orders, isLoading, addOrder, updateOrderStatus, 
        createPaymentOrder, verifyPayment, generateShippingLabel, 
        getOrderById, getOrderByToken, updateOrderByToken, refreshOrders 
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};