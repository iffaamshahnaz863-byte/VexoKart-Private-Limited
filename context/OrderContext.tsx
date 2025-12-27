
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string }) => void;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
  const { user } = useAuth();
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
    
    // Trigger notification
    if (user) {
      notifyOrderUpdate(newOrder, user);
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

    // Trigger notification on status change
    const updatedOrder = updated.find(o => o.id === orderId);
    if (updatedOrder && user) {
        notifyOrderUpdate(updatedOrder, user);
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
        
        // Notify Confirmed
        if (user) {
          notifyOrderUpdate(updatedOrder, user);
        }
        
        return updatedOrder;
      }
      return o;
    });
    saveOrders(updated);
  };
  
  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId);

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById, updateOrderPaymentDetails }}>
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
