import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Order, OrderStatus, PaymentStatus, StatusHistory } from '../types';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'statusHistory' | 'payment_status'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, details?: { courierName?: string; trackingId?: string; label_url?: string; note?: string; actor?: StatusHistory['actor'] }) => Promise<void>;
  updateOrderPaymentDetails: (orderId: string, paymentId: string) => Promise<void>;
  updateOrderLabelInfo: (orderId: string, labelUrl: string) => Promise<string>;
  updateOrderByToken: (token: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; message: string }>;
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByToken: (token: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const ORDER_FIELDS = 'id,created_at,status,total_amount,address,user_id,items,payment_method,payment_status,courier_name,tracking_id,label_url,history,qr_token';

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { notifyOrderUpdate } = useNotifications();
  const { user, users } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshOrders = async () => {
    try {
      let url = `${BASE_API_URL}/orders?select=${ORDER_FIELDS}&order=created_at.desc`;
      if (user && user.role === 'user') {
        url += `&user_id=eq.${user.id}`;
      }

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      
      if (!response.ok) {
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
                statusHistory: o.history || [{ status: o.status || 'Placed', timestamp: o.created_at, actor: 'System' }],
                courierName: o.courier_name,
                trackingId: o.tracking_id,
                label_url: o.label_url,
                qrToken: o.qr_token,
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

  const safeOrderSave = async (url: string, method: string, payload: any) => {
    let currentPayload = { ...payload };
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          method,
          headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
          body: JSON.stringify(currentPayload)
        });

        const result = await response.json();
        if (response.ok) return result;

        if (result.code === 'PGRST204' || result.message?.includes('column')) {
          const match = result.message.match(/column ['"](.+?)['"]/i);
          const missingColumn = match ? match[1] : null;

          if (missingColumn && currentPayload.hasOwnProperty(missingColumn)) {
            console.warn(`[Order Adaptation] Dropping missing column: ${missingColumn}`);
            delete currentPayload[missingColumn];
            attempts++;
            continue;
          }
          
          const suspects = ['history', 'address', 'items', 'payment_status', 'payment_method', 'user_id', 'label_url', 'qr_token'];
          let cleaned = false;
          for (const s of suspects) {
            if (currentPayload.hasOwnProperty(s)) {
                delete currentPayload[s];
                cleaned = true;
                break;
            }
          }
          if (!cleaned) throw new Error(result.message);
          attempts++;
        } else {
          throw new Error(result.message || 'Database Transaction Error');
        }
      } catch (err: any) {
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            throw new Error("Network Error: Connectivity to Supabase lost.");
        }
        throw err;
      }
    }
    throw new Error("Schema synchronization failed after multiple attempts.");
  };

  useEffect(() => {
    if (user) {
        refreshOrders();
    }
  }, [user, users]);

  const addOrder = async (orderData: any): Promise<string> => {
    const timestamp = new Date().toISOString();
    const paymentStatus: PaymentStatus = orderData.payment_method === 'Cash on Delivery' ? 'cod_pending' : 'paid';
    
    // Generate a secure QR token for courier scanning
    const qrToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const supabasePayload = {
      created_at: timestamp,
      user_id: orderData.userId, 
      items: orderData.items,
      total_amount: orderData.total, 
      address: orderData.shippingAddress, 
      payment_method: orderData.payment_method,
      payment_status: paymentStatus,
      status: 'Placed',
      qr_token: qrToken,
      history: [{ status: 'Placed', timestamp, actor: 'System' }]
    };

    const result = await safeOrderSave(`${BASE_API_URL}/orders`, 'POST', supabasePayload);
    await refreshOrders();
    return result[0].id.toString();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, details: any = {}) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const timestamp = new Date().toISOString();
    const newHistoryEntry: StatusHistory = { 
      status, 
      timestamp, 
      note: details.note, 
      actor: details.actor || (user?.role === 'vendor' ? 'Vendor' : user?.role === 'admin' ? 'Admin' : 'System')
    };
    
    const newHistory = [...(order.statusHistory || []), newHistoryEntry];

    const updateBody: any = { 
      status, 
      history: newHistory,
      updated_at: timestamp
    };

    if (details.courierName) updateBody.courier_name = details.courierName;
    if (details.trackingId) updateBody.tracking_id = details.trackingId;
    if (details.label_url) updateBody.label_url = details.label_url;

    await safeOrderSave(`${BASE_API_URL}/orders?id=eq.${encodeURIComponent(orderId)}`, 'PATCH', updateBody);
    
    // Trigger in-app notification for the user
    const matchedUser = users.find(u => u.id === order.userId);
    if (matchedUser) {
        notifyOrderUpdate({ ...order, status }, matchedUser);
    }
    
    await refreshOrders();
  };

  const updateOrderPaymentDetails = async (orderId: string, paymentId: string) => {
    await safeOrderSave(`${BASE_API_URL}/orders?id=eq.${encodeURIComponent(orderId)}`, 'PATCH', { 
        payment_id: paymentId, 
        payment_status: 'paid', 
        status: 'Confirmed'
    });
    await refreshOrders();
  };

  const updateOrderLabelInfo = async (orderId: string, labelUrl: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");
    
    await updateOrderStatus(orderId, 'Packed', { label_url: labelUrl });
    return order.qrToken || 'token_gen';
  };

  const updateOrderByToken = async (token: string, status: OrderStatus, note?: string) => {
    const order = orders.find(o => o.qrToken === token);
    if (!order) return { success: false, message: 'Invalid or expired scan token.' };

    try {
        await updateOrderStatus(order.id, status, { note, actor: 'Courier' });
        return { success: true, message: `Status updated to ${status} successfully.` };
    } catch (err: any) {
        return { success: false, message: err.message || 'Update failed.' };
    }
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
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
};
