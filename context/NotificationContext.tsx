
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { NotificationLog, NotificationSettings, Order, User, AppNotification } from '../types.ts';
import { BASE_API_URL, API_HEADERS } from '../constants.ts';

interface NotificationContextType {
  settings: NotificationSettings;
  logs: NotificationLog[];
  inbox: AppNotification[];
  unreadCount: number;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  notifyOrderUpdate: (order: Order, user: User) => Promise<void>;
  notifyLogin: (user: User) => Promise<void>;
  createAppNotification: (notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
  markAsRead: (logId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearLogs: () => void;
  fetchInbox: (user?: User) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getEnvKey = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key];
    }
  } catch (e) {
    // ReferenceError or other issues safely ignored
  }
  return undefined;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  smtpHost: 'api.sendgrid.com',
  smtpUser: '',
  smtpPass: '',
  emailFrom: 'BICT Computer Education – VexoKart <bictcomputereducation1@gmail.com>',
  smsApiKey: getEnvKey('FAST2SMS_API_KEY') || 'DEMO_KEY_FSTSMS_LIVE',
  smsSenderId: 'VXKART',
  smsTemplateId: '',
  testMode: false,
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const local = localStorage.getItem('vexokart-notification-settings');
    const saved = local ? JSON.parse(local) : DEFAULT_SETTINGS;
    return { ...saved, smsApiKey: getEnvKey('FAST2SMS_API_KEY') || saved.smsApiKey };
  });

  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [inbox, setInbox] = useState<AppNotification[]>([]);
  
  const unreadCount = inbox.filter(m => !m.is_read).length;

  useEffect(() => {
    localStorage.setItem('vexokart-notification-settings', JSON.stringify(settings));
  }, [settings]);

  const fetchInbox = async (user?: User) => {
    if (!user) return;
    try {
      let query = `role=eq.${user.role}&order=created_at.desc`;
      
      if (user.role === 'user') {
        query += `&user_id=eq.${user.id}`;
      } else if (user.role === 'vendor') {
        query += `&vendor_id=not.is.null`; 
      }

      const res = await fetch(`${BASE_API_URL}/notifications?${query}`, {
        headers: API_HEADERS
      });
      
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setInbox(data);
      }
    } catch (e) {
      console.warn("[Inbox Sync] Failed to fetch notifications from DB.");
    }
  };

  const createAppNotification = async (notif: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => {
    try {
      const payload = {
        ...notif,
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      const res = await fetch(`${BASE_API_URL}/notifications`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        console.error("Failed to insert notification row");
      }
    } catch (e) {
      console.error("Notification DB Write Error:", e);
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`${BASE_API_URL}/notifications?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ is_read: true })
      });
      setInbox(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = inbox.filter(m => !m.is_read).map(m => m.id);
    if (unreadIds.length === 0) return;
    
    try {
      for (const id of unreadIds) {
        await fetch(`${BASE_API_URL}/notifications?id=eq.${id}`, {
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

  const sendQuickSMS = async (number: string, message: string) => {
    if (!settings.smsEnabled || !number) return { success: false, message: 'SMS Disabled or Number missing' };
    const apiKey = getEnvKey('FAST2SMS_API_KEY') || settings.smsApiKey;
    if (!apiKey || apiKey.includes('DEMO_KEY')) return { success: false, message: 'Invalid API Key' };

    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ route: 'q', message: message, numbers: number })
        });
        const result = await response.json().catch(() => ({ message: 'Invalid response format' }));
        return result;
    } catch (err: any) {
        return { success: false, message: err.message };
    }
  };

  const notifyOrderUpdate = async (order: Order, user: User) => {
      // Internal notification logic handled via OrderContext and createAppNotification
  };

  const notifyLogin = async (user: User) => {
    try {
        const message = `VexoKart: Login successful for ${user.email}. If this wasn't you, secure your account immediately.`;
        if (settings.testMode) return;
        // Fix: Handled potentially undefined phone number on User type
        await sendQuickSMS(user.phone || '', message);
    } catch (err) {}
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      settings, logs, inbox, unreadCount, updateSettings, 
      notifyOrderUpdate, notifyLogin, createAppNotification, markAsRead, markAllAsRead, clearLogs, fetchInbox
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
