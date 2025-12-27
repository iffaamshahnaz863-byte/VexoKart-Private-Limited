
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { NotificationLog, NotificationSettings, Order, User } from '../types';

interface NotificationContextType {
  settings: NotificationSettings;
  logs: NotificationLog[];
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  notifyOrderUpdate: (order: Order, user: User) => Promise<void>;
  clearLogs: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  smtpHost: 'smtp.sendgrid.net',
  smtpUser: '',
  smtpPass: '',
  emailFrom: 'VexoKart Support <support@vexokart.com>',
  smsApiKey: '',
  smsSenderId: 'VXKART',
  smsTemplateId: '',
  testMode: false, // PRODUCTION MODE BY DEFAULT
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const local = localStorage.getItem('vexokart-notification-settings');
    return local ? JSON.parse(local) : DEFAULT_SETTINGS;
  });

  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const local = localStorage.getItem('vexokart-notification-logs');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('vexokart-notification-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('vexokart-notification-logs', JSON.stringify(logs));
  }, [logs]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addLog = (log: Omit<NotificationLog, 'id' | 'createdAt'>) => {
    const newLog: NotificationLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  const notifyOrderUpdate = async (order: Order, user: User) => {
    // Only proceed if enabled or in test mode
    if (!settings.emailEnabled && !settings.smsEnabled && !settings.testMode) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // 1. Generate High-Quality Message Content
    let aiContent = { email: '', sms: '' };
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a production-ready transactional notification for VexoKart.
        User Name: ${user.name}
        Order ID: #${order.id}
        Status: ${order.status}
        Total Amount: ₹${order.total}
        Shipping To: ${order.shippingAddress.city}
        
        Output JSON with:
        "emailBody": (Professional Markdown, include order summary, support link: vexokart.com/support)
        "smsBody": (Strictly max 150 chars, must start with "VexoKart: ")`,
        config: { responseMimeType: 'application/json' }
      });
      
      const parsed = JSON.parse(response.text || '{}');
      aiContent.email = parsed.emailBody;
      aiContent.sms = parsed.smsBody;
    } catch (err) {
      aiContent.email = `Your order #${order.id} has been ${order.status.toLowerCase()}. Thank you for shopping with VexoKart.`;
      aiContent.sms = `VexoKart: Order #${order.id} is ${order.status.toLowerCase()}. Track at vexokart.com/orders`;
    }

    // 2. Internal Retry Helper (Exponential Backoff)
    const sendWithRetry = async (
        channel: 'email' | 'sms', 
        sendFn: () => Promise<any>, 
        maxRetries = 2
    ) => {
      let attempts = 0;
      while (attempts <= maxRetries) {
        try {
          if (settings.testMode) {
            // Simulated delay for realistic test feel
            await new Promise(r => setTimeout(r, 800));
            addLog({ userId: user.email, orderId: order.id, channel, status: 'sent', response: 'Test Mode Simulation Success', type: order.status, retryCount: attempts });
            return;
          }

          const result = await sendFn();
          addLog({ userId: user.email, orderId: order.id, channel, status: 'sent', response: 'Live Provider Accepted', type: order.status, retryCount: attempts });
          return result;
        } catch (error: any) {
          attempts++;
          if (attempts > maxRetries) {
            addLog({ userId: user.email, orderId: order.id, channel, status: 'failed', response: error.message || 'Unknown Provider Error', type: order.status, retryCount: attempts - 1 });
            console.error(`Production ${channel} failure after ${maxRetries} retries:`, error);
          } else {
            await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000));
          }
        }
      }
    };

    // 3. Execute Production Email Sending (Logic for SendGrid/Mailgun)
    if (settings.emailEnabled) {
      await sendWithRetry('email', async () => {
        // In a real production environment, this would hit your server's proxy or SendGrid's v3 API
        // For security, keys are assumed to be handled by the environment
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.smtpPass}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: user.email }] }],
            from: { email: settings.emailFrom.match(/<(.+)>/)?.[1] || 'support@vexokart.com', name: 'VexoKart' },
            subject: `Your VexoKart order has been ${order.status}`,
            content: [{ type: 'text/html', value: aiContent.email }]
          })
        });
        if (!response.ok && !settings.testMode) throw new Error(`Email provider returned ${response.status}`);
      });
    }

    // 4. Execute Production SMS Sending (Logic for Fast2SMS/Twilio)
    if (settings.smsEnabled && order.shippingAddress.phone) {
      await sendWithRetry('sms', async () => {
        // Example for Fast2SMS Transactional API
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': settings.smsApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'transactional',
            sender_id: settings.smsSenderId,
            message: aiContent.sms,
            numbers: order.shippingAddress.phone,
          })
        });
        if (!response.ok && !settings.testMode) throw new Error(`SMS gateway returned ${response.status}`);
      });
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <NotificationContext.Provider value={{ settings, logs, updateSettings, notifyOrderUpdate, clearLogs }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
