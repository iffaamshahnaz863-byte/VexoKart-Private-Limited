
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus } from '../types';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string }) => void;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-orders');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse order data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory'>): string => {
    const timestamp = new Date().toISOString();
    const newOrder: Order = {
        ...orderData,
        id: new Date().getTime().toString().slice(-6),
        date: timestamp,
        status: 'Placed',
        statusHistory: [{ status: 'Placed', timestamp }]
    };
    setOrders(prevOrders => [newOrder, ...prevOrders]);
    return newOrder.id;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, details: { courierName?: string; trackingId?: string } = {}) => {
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === orderId) {
        const newHistoryEntry = { status, timestamp: new Date().toISOString() };
        // Avoid duplicate history entries if status hasn't changed
        if (o.status === status) return o;
        return { 
          ...o, 
          status, 
          statusHistory: [...o.statusHistory, newHistoryEntry],
          courierName: details.courierName || o.courierName,
          trackingId: details.trackingId || o.trackingId,
        };
      }
      return o;
    }));
  }

  const updateOrderPaymentDetails = (orderId: string, paymentId: string) => {
    setOrders(prevOrders => prevOrders.map(o => {
        if (o.id === orderId) {
            const newStatus: OrderStatus = 'Confirmed';
            const newHistoryEntry = { status: newStatus, timestamp: new Date().toISOString() };
            // Only add Confirmed step if it was previously Placed
            const newStatusHistory = o.status === 'Placed' 
                ? [...o.statusHistory, newHistoryEntry] 
                : o.statusHistory;
            
            return {
                ...o,
                paymentId,
                status: newStatus,
                statusHistory: newStatusHistory
            };
        }
        return o;
    }));
  }
  
  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  }

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, getOrderById, updateOrderPaymentDetails }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
