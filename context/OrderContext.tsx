
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string }) => Promise<void>;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => Promise<void>;
  updateOrderLabelInfo: (orderId: string, labelUrl: string) => Promise<string>;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
  const { users } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrders = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/orders?select=*&order=date.desc`, { headers: API_HEADERS });
      const data = await response.json();
      setOrders(data);
    } catch (e) {
      console.error("Orders sync failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const addOrder = async (orderData: any): Promise<string> => {
    const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const timestamp = new Date().toISOString();
    const newOrder = {
      ...orderData,
      id: orderId,
      date: timestamp,
      status: 'Placed',
      statusHistory: [{ status: 'Placed', timestamp }]
    };

    await fetch(`${BASE_API_URL}/orders`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newOrder)
    });
    
    await refreshOrders();
    const orderUser = users.find(u => u.email === orderData.userEmail);
    if (orderUser) notifyOrderUpdate(newOrder as any, orderUser);
    
    return orderId;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === status) return;

    const updatedHistory = [...order.statusHistory, { status, timestamp: new Date().toISOString() }];
    const updateBody = { 
      status, 
      statusHistory: updatedHistory,
      courierName: details.courierName || order.courierName,
      trackingId: details.trackingId || order.trackingId
    };

    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(updateBody)
    });

    await refreshOrders();
    const updatedOrder = { ...order, ...updateBody };
    const orderUser = users.find(u => u.email === order.userEmail);
    if (orderUser) notifyOrderUpdate(updatedOrder as any, orderUser);
  };

  const updateOrderPaymentDetails = async (orderId: string, paymentId: string) => {
    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ paymentId, status: 'Confirmed' })
    });
    await refreshOrders();
  };

  const updateOrderLabelInfo = async (orderId: string, labelUrl: string) => {
    const token = Math.random().toString(36).substring(2, 15);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ 
        shippingLabelUrl: labelUrl, 
        labelGeneratedAt: new Date().toISOString(),
        qrToken: token,
        qrExpiresAt: expiry.toISOString()
      })
    });
    await refreshOrders();
    return token;
  };

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = orders.find(o => o.qrToken === token);
    if (!order) return { success: false, message: 'Invalid token' };
    
    const newLog = { id: Date.now().toString(), orderId: order.id, statusSet: status, note, scannedAt: new Date().toISOString() };
    const updatedHistory = [...order.statusHistory, { status, timestamp: new Date().toISOString() }];
    
    await fetch(`${BASE_API_URL}/orders?id=eq.${order.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ 
        status, 
        statusHistory: updatedHistory,
        qrUsedAt: new Date().toISOString(),
        scanLogs: [...(order.scanLogs || []), newLog]
      })
    });

    await refreshOrders();
    return { success: true, message: 'Status updated' };
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);
  const getOrderByToken = (token: string) => orders.find(o => o.qrToken === token);

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
  if (!context) throw new Error('useOrders error');
  return context;
};
