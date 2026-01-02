
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { NotificationLog, NotificationSettings, Order, User } from '../types';
import { BASE_API_URL, API_HEADERS, EDGE_FUNCTION_URL } from '../constants';

interface NotificationContextType {
  settings: NotificationSettings;
  logs: NotificationLog[];
  inbox: NotificationLog[];
  unreadCount: number;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  notifyOrderUpdate: (order: Order, user: User) => Promise<void>;
  notifyLogin: (user: User) => Promise<void>;
  sendInvoiceEmail: (order: Order, user: User) => Promise<boolean>;
  markAsRead: (logId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearLogs: () => void;
  fetchInbox: (email: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  smtpHost: 'api.sendgrid.com',
  smtpUser: '',
  smtpPass: '',
  /* ✅ FIXED VERIFIED SENDER EMAIL & NAME */
  emailFrom: 'BICT Computer Education – VexoKart <bictcomputereducation1@gmail.com>',
  smsApiKey: process.env.FAST2SMS_API_KEY || 'DEMO_KEY_FSTSMS_LIVE',
  smsSenderId: 'VXKART',
  smsTemplateId: '',
  testMode: false,
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const local = localStorage.getItem('vexokart-notification-settings');
    const saved = local ? JSON.parse(local) : DEFAULT_SETTINGS;
    // Always sync the latest API key from environment if available
    return { ...saved, smsApiKey: process.env.FAST2SMS_API_KEY || saved.smsApiKey };
  });

  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [inbox, setInbox] = useState<NotificationLog[]>([]);
  
  const unreadCount = inbox.filter(m => !m.is_read).length;

  useEffect(() => {
    localStorage.setItem('vexokart-notification-settings', JSON.stringify(settings));
  }, [settings]);

  const fetchInbox = async (email: string) => {
    try {
      const res = await fetch(`${BASE_API_URL}/notifications_log?userId=eq.${encodeURIComponent(email)}&order=createdAt.desc`, {
        headers: API_HEADERS
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setInbox(data);
      }
    } catch (e) {
      console.warn("[Inbox Sync] Network issue. Skipping inbox refresh...");
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const markAsRead = async (logId: string) => {
    try {
      await fetch(`${BASE_API_URL}/notifications_log?id=eq.${logId}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ is_read: true })
      });
      setInbox(prev => prev.map(m => m.id === logId ? { ...m, is_read: true } : m));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = inbox.filter(m => !m.is_read).map(m => m.id);
    if (unreadIds.length === 0) return;
    
    try {
      for (const id of unreadIds) {
        await fetch(`${BASE_API_URL}/notifications_log?id=eq.${id}`, {
          method: 'PATCH',
          headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ is_read: true })
        });
      }
      setInbox(prev => prev.map(m => ({ ...m, is_read: true })));
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  const saveLogToDB = async (log: Omit<NotificationLog, 'id' | 'createdAt' | 'is_read'>) => {
    const timestamp = new Date().toISOString();
    const newLog = {
      ...log,
      createdAt: timestamp,
      is_read: false
    };

    try {
      const res = await fetch(`${BASE_API_URL}/notifications_log`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify(newLog)
      });
      const data = await res.json().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        setInbox(prev => [data[0], ...prev]);
        setLogs(prev => [data[0], ...prev].slice(0, 100));
      } else {
        setLogs(prev => [{ ...newLog, id: 'temp-' + Date.now() } as any, ...prev].slice(0, 100));
      }
    } catch (e) {
      console.warn("[Notifications Log] DB sync skipped. Storing in local session.");
      setLogs(prev => [{ ...newLog, id: 'temp-' + Date.now() } as any, ...prev].slice(0, 100));
    }
  };

  const sendQuickSMS = async (number: string, message: string) => {
    if (!settings.smsEnabled || !number) return;
    
    try {
        const apiKey = process.env.FAST2SMS_API_KEY || settings.smsApiKey;
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: message,
            numbers: number,
          })
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.error("Fast2SMS API Error:", err);
        throw err;
    }
  };

  const notifyLogin = async (user: User) => {
    const message = `VexoKart: Login successful for ${user.email}. If this wasn't you, secure your account immediately. - Team VexoKart`;
    
    try {
      if (settings.testMode) {
        await saveLogToDB({ userId: user.email, orderId: 'N/A', title: 'Login Alert', message, channel: 'sms', status: 'sent', response: 'Sandbox Simulation Success', type: 'Login' });
        return;
      }

      await sendQuickSMS(user.phone, message);
      await saveLogToDB({ userId: user.email, orderId: 'N/A', title: 'Login Alert', message, channel: 'sms', status: 'sent', response: 'Live SMS Delivered', type: 'Login' });
    } catch (e: any) {
      await saveLogToDB({ userId: user.email, orderId: 'N/A', title: 'Login Alert', message, channel: 'sms', status: 'failed', response: e.message, type: 'Login' });
    }
  };

  const sendInvoiceEmail = async (order: Order, userData: User): Promise<boolean> => {
    try {
        const baseSubtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const gstAmount = Number((baseSubtotal * 0.18).toFixed(2));
        const finalTotal = Number((baseSubtotal + gstAmount).toFixed(2));

        const isCOD = order.payment_mode === 'Cash on Delivery';
        const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

        const payload = {
            orderId: order.id,
            user: { name: userData.name, email: userData.email, phone: userData.phone },
            orderDate: order.created_at,
            items: order.items.map(item => ({ ...item, lineTotal: item.price * item.quantity, vendor_name: item.vendor_name || 'VexoKart Direct' })),
            subtotal: baseSubtotal,
            gst: gstAmount,
            total: finalTotal,
            paymentMode: order.payment_mode,
            paymentStatus: paymentStatusText,
            shippingAddress: order.shippingAddress || order.shipping_address,
            seller: { name: "VexoKart Authorized Marketplace", email: "bictcomputereducation1@gmail.com", footer: "This is a system generated invoice." },
            emailConfig: { subject: `Your VexoKart Invoice – Order #${order.id}`, fromEmail: "bictcomputereducation1@gmail.com", fromName: "BICT Computer Education – VexoKart", message: `Your order #${order.id} has been confirmed. PDF Invoice attached.` }
        };

        if (settings.testMode) {
            await new Promise(r => setTimeout(r, 1000));
            await saveLogToDB({ userId: userData.email, orderId: order.id, title: `Invoice Generated: #${order.id}`, message: `Simulation: PDF dispatched via bictcomputereducation1@gmail.com`, channel: 'email', status: 'sent', response: 'Simulation Success', type: 'Invoice' });
            return true;
        }

        const response = await fetch(`${EDGE_FUNCTION_URL}/send-invoice`, {
            method: 'POST',
            headers: { ...API_HEADERS, 'Authorization': `Bearer ${process.env.API_KEY || ''}` },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Gateway Error: ${response.status}`);
        await saveLogToDB({ userId: userData.email, orderId: order.id, title: `Invoice Dispatched – #${order.id}`, message: `PDF Invoice sent from bictcomputereducation1@gmail.com.`, channel: 'email', status: 'sent', response: 'Live Edge Function Success', type: 'Invoice' });
        return true;
    } catch (err: any) {
        await saveLogToDB({ userId: userData.email, orderId: order.id, title: `Invoice Failed – #${order.id}`, message: `Invoice delivery failed: ${err.message}`, channel: 'in-app', status: 'failed', response: err.message, type: 'Invoice' });
        return false;
    }
  };

  const notifyOrderUpdate = async (order: Order, user: User) => {
    const smsConsent = user.sms_enabled ?? true;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let aiContent = { email: '', sms: '', title: '' };
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate transactional notifications. Name: ${user.name}, ID: #${order.id}, Status: ${order.status}, Total: ₹${order.total_amount || order.total}. Output JSON with: "title", "emailBody", "smsBody" (max 140 chars, start with "VexoKart: " and end with "- Team VexoKart")`,
        config: { responseMimeType: 'application/json' }
      });
      const parsed = JSON.parse(response.text || '{}');
      aiContent.title = parsed.title || `Order Update: #${order.id}`;
      aiContent.email = parsed.emailBody;
      aiContent.sms = parsed.smsBody || `VexoKart: Order #${order.id} is ${order.status}. Total: ₹${order.total_amount || order.total}. - Team VexoKart`;
    } catch (err) {
      aiContent.title = `Order ${order.status}`;
      aiContent.email = `Order #${order.id} is now ${order.status}.`;
      aiContent.sms = `VexoKart: Hi ${user.name}, your order #${order.id} is ${order.status}. - Team VexoKart`;
    }

    const sendWithRetry = async (channel: 'email' | 'sms', sendFn: () => Promise<any>) => {
        try {
          if (settings.testMode) {
            await saveLogToDB({ userId: user.email, orderId: order.id, title: aiContent.title, message: channel === 'sms' ? aiContent.sms : aiContent.email, channel, status: 'sent', response: 'Simulation Success', type: order.status });
            return;
          }
          if (channel === 'sms' && (!smsConsent || !user.phone)) return;
          await sendFn();
          await saveLogToDB({ userId: user.email, orderId: order.id, title: aiContent.title, message: channel === 'sms' ? aiContent.sms : aiContent.email, channel, status: 'sent', response: 'Live Accepted', type: order.status });
        } catch (error: any) {
            await saveLogToDB({ userId: user.email, orderId: order.id, title: aiContent.title, message: channel === 'sms' ? aiContent.sms : aiContent.email, channel, status: 'failed', response: error.message, type: order.status });
        }
    };

    if (settings.emailEnabled) {
      await sendWithRetry('email', async () => {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${settings.smtpPass}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalizations: [{ to: [{ email: user.email }] }], from: { email: 'bictcomputereducation1@gmail.com', name: 'VexoKart Support' }, subject: aiContent.title, content: [{ type: 'text/html', value: aiContent.email }] })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
      });
    }

    if (settings.smsEnabled && user.phone) {
      await sendWithRetry('sms', async () => sendQuickSMS(user.phone, aiContent.sms));
    }
  };

  // Fix: Implement clearLogs to clear audit logs and resolve shorthand property scope error
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      settings, logs, inbox, unreadCount, updateSettings, 
      notifyOrderUpdate, notifyLogin, sendInvoiceEmail, markAsRead, markAllAsRead, clearLogs, fetchInbox
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
