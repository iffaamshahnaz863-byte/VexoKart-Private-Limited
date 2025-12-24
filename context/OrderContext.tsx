
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order } from '../types';

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Order) => void;
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

  const addOrder = (order: Order) => {
    setOrders(prevOrders => [order, ...prevOrders]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
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
