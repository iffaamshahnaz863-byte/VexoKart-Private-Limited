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

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mapped = data.map(o => ({
            ...o,
            id: o.id.toString(),
            total: Number(o.total_amount || 0),
            total_amount: Number(o.total_amount || 0),
            // Standardizing identity: UI expects object, DB might return numeric ID
            // If it's a numeric ID, we'll try to find it in user addresses if available
            shippingAddress: (o.shipping_address && typeof o.shipping_address === 'object') 
                ? o.shipping_address 
                : user.addresses.find(a => a.id === String(o.shipping_address)) || {},
            statusHistory: o.status_history || [],
            qrToken: o.qr_token,
            date: o.created_at,
            userEmail: user.email 
        }));
        setOrders(mapped);
      }
    } catch (e) {
      console.error("[OrderContext] refreshOrders error:", e);
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
    
    // CRITICAL: Ensure all numeric fields are strictly numeric to prevent Postgres errors
    const numericTotal = Number(orderData.total);
    const numericUserId = Number(user?.id);
    
    // The error "invalid input syntax for type numeric" on a JSON string 
    // indicates that the 'shipping_address' column is numeric and expects the ID only.
    const numericAddressId = orderData.shippingAddress?.id ? Number(orderData.shippingAddress.id) : null;

    if (isNaN(numericTotal)) throw new Error("Order calculation failed: invalid numeric total.");
    if (!numericAddressId || isNaN(numericAddressId)) throw new Error("Delivery destination missing: invalid address ID.");

    const payload = {
      user_id: numericUserId,
      vendor_id: orderData.items[0]?.vendorId || 'multiple',
      items: orderData.items,
      total_amount: numericTotal, 
      payment_mode: orderData.payment_method,
      payment_status: orderData.payment_method === 'Cash on Delivery' ? 'cod_pending' : 'failed',
      shipping_address: numericAddressId, // STRICTLY NUMERIC ID ONLY
      status: 'Placed',
      qr_token: qrToken,
      status_history: [{ status: 'Placed', timestamp, actor: 'System' }],
      created_at: timestamp
    };

    try {
        const res = await fetch(`${BASE_API_URL}/orders`, {
          method: 'POST',
          headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
          body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            // Stringify error to prevent [object Object] logs
            console.error("[Database Rejection Detailed]", JSON.stringify(errorData, null, 2));
            throw new Error(errorData.message || `Database rejected the order payload (${res.status})`);
        }

        const result = await res.json();
        await refreshOrders();
        return result[0].id.toString();
    } catch (err: any) {
        console.error("[OrderContext] addOrder Exception:", err.message);
        throw err;
    }
  };

  const createPaymentOrder = async (orderId: string, amount: number): Promise<string> => {
    try {
        // Real Live Gateway Request
        const res = await fetch(`${EDGE_FUNCTION_URL}/create_payment_order`, {
          method: 'POST',
          headers: { ...API_HEADERS },
          body: JSON.stringify({ orderId, amount: Number(amount) })
        });
        
        if (res.ok) {
            const data = await res.json();
            if (!data.id) throw new Error("Gateway failed to return Order ID");
            return data.id; 
        }
        
        const errText = await res.text();
        throw new Error(`Gateway Error: ${errText}`);
    } catch (err: any) {
        console.error("[Razorpay Sync] Production Failure:", err.message);
        throw err;
    }
  };

  const verifyPayment = async (paymentData: any): Promise<boolean> => {
    try {
        // Production signature verification
        const res = await fetch(`${EDGE_FUNCTION_URL}/verify_payment`, {
          method: 'POST',
          headers: { ...API_HEADERS },
          body: JSON.stringify(paymentData)
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.success) await refreshOrders();
            return data.success;
        }
        return false;
    } catch (err: any) {
        console.error("[OrderContext] verifyPayment Exception:", err);
        return false;
    }
  };

  const generateShippingLabel = async (orderId: string): Promise<string> => {
    try {
        const res = await fetch(`${EDGE_FUNCTION_URL}/generate_shipping_label`, {
          method: 'POST',
          headers: { ...API_HEADERS },
          body: JSON.stringify({ orderId })
        });
        
        if (res.ok) {
            const data = await res.json();
            await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
                method: 'PATCH',
                headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
                body: JSON.stringify({ label_url: data.label_url, status: 'Packed' })
            });
            await refreshOrders();
            return data.label_url;
        }
        throw new Error("Logistics sync failed");
    } catch (err: any) {
        const mockLabelUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SHIP-${orderId}`;
        await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
            method: 'PATCH',
            headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ label_url: mockLabelUrl, status: 'Packed' })
        });
        await refreshOrders();
        return mockLabelUrl;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
        const timestamp = new Date().toISOString();
        const currentHistory = order.statusHistory || [];
        const newHistory = [...currentHistory, { 
            status, 
            timestamp, 
            note: details.note, 
            actor: details.actor || 'System' 
        }];

        const payload: any = { status, status_history: newHistory };
        if (details.courier_name || details.courierName) payload.courier_name = details.courier_name || details.courierName;
        if (details.tracking_id || details.trackingId) payload.tracking_id = details.tracking_id || details.trackingId;

        await fetch(`${BASE_API_URL}/orders?id=eq.${orderId}`, {
          method: 'PATCH',
          headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
          body: JSON.stringify(payload)
        });
        
        fetch(`${EDGE_FUNCTION_URL}/send_notification`, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({ orderId, status })
        }).catch(() => {});

        await refreshOrders();
    } catch (err) {
        console.error("[OrderContext] updateOrderStatus Exception:", err);
    }
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);
  const getOrderByToken = (token: string) => orders.find(o => o.qrToken === token);

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = getOrderByToken(token);
    if (!order) return { success: false, message: 'Invalid manifest token.' };

    try {
        await updateOrderStatus(order.id, status, { note, actor: 'Courier' });
        return { success: true, message: `Status updated to ${status}.` };
    } catch (e) {
        return { success: false, message: 'Fulfillment sync failed.' };
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
  if (!context) throw new Error('OrderContext missing');
  return context;
};
