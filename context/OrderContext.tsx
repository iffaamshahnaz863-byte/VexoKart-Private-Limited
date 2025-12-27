
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus, CourierScanLog } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string }) => void;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => void;
  updateOrderLabelInfo: (orderId: string, labelUrl: string) => string;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
  const { users } = useAuth(); // Needed to find users for notification if session isn't active (courier scan)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-orders');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });

  const saveOrders = (updatedOrders: Order[]) => {
    localStorage.setItem('vexokart-orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>): string => {
    const timestamp = new Date().toISOString();
    const newOrder: Order = {
        ...orderData,
        id: new Date().getTime().toString().slice(-6),
        date: timestamp,
        status: 'Placed',
        statusHistory: [{ status: 'Placed', timestamp }]
    };
    saveOrders([newOrder, ...orders]);
    
    // Attempt to notify (if user is present)
    const orderUser = users.find(u => u.email === newOrder.userEmail);
    if (orderUser) {
      notifyOrderUpdate(newOrder, orderUser);
    }
    
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, details: { courierName?: string; trackingId?: string } = {}) => {
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updated = orders.map(o => {
      if (o.id === orderId) {
        if (o.status === status) return o;
        return { 
          ...o, 
          status, 
          statusHistory: [...o.statusHistory, { status, timestamp: new Date().toISOString() }],
          courierName: details.courierName || o.courierName,
          trackingId: details.trackingId || o.trackingId,
        };
      }
      return o;
    });
    saveOrders(updated);

    const updatedOrder = updated.find(o => o.id === orderId);
    const orderUser = users.find(u => u.email === updatedOrder?.userEmail);
    if (updatedOrder && orderUser) {
        notifyOrderUpdate(updatedOrder, orderUser);
    }
  };

  const updateOrderPaymentDetails = (orderId: string, paymentId: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        const newStatus: OrderStatus = 'Confirmed';
        const newStatusHistory = o.status === 'Placed' 
            ? [...o.statusHistory, { status: newStatus, timestamp: new Date().toISOString() }] 
            : o.statusHistory;
        const updatedOrder = { ...o, paymentId, status: newStatus, statusHistory: newStatusHistory };
        
        const orderUser = users.find(u => u.email === updatedOrder.userEmail);
        if (orderUser) {
          notifyOrderUpdate(updatedOrder, orderUser);
        }
        
        return updatedOrder;
      }
      return o;
    });
    saveOrders(updated);
  };

  const updateOrderLabelInfo = (orderId: string, labelUrl: string): string => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // Valid for 7 days

    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
            ...o, 
            shippingLabelUrl: labelUrl, 
            labelGeneratedAt: new Date().toISOString(),
            qrToken: token,
            qrExpiresAt: expiry.toISOString()
        };
      }
      return o;
    });
    saveOrders(updated);
    return token;
  };

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string): Promise<{ success: boolean; message: string }> => {
    const order = orders.find(o => o.qrToken === token);
    
    if (!order) return { success: false, message: 'Invalid or expired QR code.' };
    
    const expiryDate = order.qrExpiresAt ? new Date(order.qrExpiresAt) : null;
    if (expiryDate && expiryDate < new Date()) {
        return { success: false, message: 'This QR code has expired.' };
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
        return { success: false, message: `Order #${order.id} is already ${order.status}.` };
    }

    const newLog: CourierScanLog = {
        id: Math.random().toString(36).substr(2, 9),
        orderId: order.id,
        statusSet: status,
        note,
        scannedAt: new Date().toISOString(),
        ipAddress: 'N/A (Client Side Update)'
    };

    const updated = orders.map(o => {
        if (o.qrToken === token) {
            const history = [...o.statusHistory, { status, timestamp: new Date().toISOString() }];
            return {
                ...o,
                status,
                statusHistory: history,
                qrUsedAt: new Date().toISOString(),
                scanLogs: [...(o.scanLogs || []), newLog]
            };
        }
        return o;
    });

    saveOrders(updated);

    const updatedOrder = updated.find(o => o.qrToken === token);
    const orderUser = users.find(u => u.email === updatedOrder?.userEmail);
    if (updatedOrder && orderUser) {
        await notifyOrderUpdate(updatedOrder, orderUser);
    }

    return { success: true, message: `Order #${order.id} status updated to ${status}.` };
  };
  
  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId);
  const getOrderByToken = (token: string) => orders.find(o => o.qrToken === token);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById, updateOrderPaymentDetails, updateOrderLabelInfo, updateOrderByToken, getOrderByToken }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within a OrderProvider');
  }
  return context;
};
