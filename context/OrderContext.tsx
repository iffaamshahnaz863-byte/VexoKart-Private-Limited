import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus, PaymentStatus } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory' | 'payment_status'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string; label_url?: string }) => Promise<void>;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => Promise<void>;
  updateOrderLabelInfo: (orderId: string, labelUrl: string) => Promise<string>;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDER_FIELDS = 'id,created_at,status,total_amount,address,user_id,items,payment_method,payment_status,courier_name,tracking_id,label_url,history';

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
  const { user, users } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrders = async () => {
    try {
      // Role-based visibility logic
      let url = `${BASE_API_URL}/orders?select=${ORDER_FIELDS}&order=created_at.desc`;
      
      // Part 1.1: Standard users only fetch their own orders
      if (user && user.role === 'user') {
        url += `&user_id=eq.${user.id}`;
      }

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Order Fetch Error: ${response.status}`, data?.message);
        setOrders([]);
        return;
      }

      if (Array.isArray(data)) {
        const mappedData = data.map((o: any) => {
            const userId = Number(o.user_id || 0);
            const matchedUser = users.find(u => u.id === userId);
            
            return {
                ...o,
                id: o.id.toString(),
                date: o.created_at || new Date().toISOString(),
                total: Number(o.total_amount || 0),
                userId: userId,
                userEmail: matchedUser?.email || o.email || '',
                shippingAddress: o.address || {} as any,
                statusHistory: o.history || [{ status: o.status || 'Placed', timestamp: o.created_at }],
                courierName: o.courier_name,
                trackingId: o.tracking_id,
                label_url: o.label_url,
                scanLogs: o.scan_logs || []
            };
        });
        setOrders(mappedData);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error("Network fault during order sync:", e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        refreshOrders();
    }
  }, [user, users]);

  const addOrder = async (orderData: any): Promise<string> => {
    const timestamp = new Date().toISOString();
    const paymentStatus: PaymentStatus = orderData.payment_method === 'Cash on Delivery' ? 'cod_pending' : 'paid';

    const supabasePayload = {
      created_at: timestamp,
      user_id: orderData.userId, 
      items: orderData.items,
      total_amount: orderData.total, 
      address: orderData.shippingAddress, 
      payment_method: orderData.payment_method,
      payment_status: paymentStatus,
      status: 'Placed',
      history: [{ status: 'Placed', timestamp }]
    };

    const response = await fetch(`${BASE_API_URL}/orders`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(supabasePayload)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Order creation failed');
    
    await refreshOrders();
    return result[0].id.toString();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const timestamp = new Date().toISOString();
    const newHistory = [...(order.statusHistory || []), { status, timestamp }];

    const updateBody: any = { 
      status, 
      history: newHistory,
      updated_at: timestamp
    };

    if (details.courierName) updateBody.courier_name = details.courierName;
    if (details.trackingId) updateBody.tracking_id = details.trackingId;
    if (details.label_url) updateBody.label_url = details.label_url;

    const response = await fetch(`${BASE_API_URL}/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(updateBody)
    });

    if (!response.ok) throw new Error('Failed to update order status');

    await refreshOrders();
  };

  const updateOrderPaymentDetails = async (orderId: string, paymentId: string) => {
    await fetch(`${BASE_API_URL}/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ 
          payment_id: paymentId, 
          payment_status: 'paid', 
          status: 'Confirmed'
      })
    });
    await refreshOrders();
  };

  const updateOrderLabelInfo = async (orderId: string, labelUrl: string) => {
    await updateOrderStatus(orderId, 'Packed', { label_url: labelUrl });
    return 'token_gen';
  };

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    // Basic mock update logic for logistics flow
    return { success: true, message: `Status updated to ${status}` };
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);
  const getOrderByToken = (token: string) => undefined;

  return (
    <OrderContext.Provider value={{ 
      orders, isLoading, addOrder, updateOrderStatus, updateOrderPaymentDetails, 
      updateOrderLabelInfo, updateOrderByToken, getOrderById, getOrderByToken, refreshOrders 
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