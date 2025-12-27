
import React, { useState } from 'react';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useNotifications } from '../../context/NotificationContext';

const AdminNotificationsPage: React.FC = () => {
  const { settings, logs, updateSettings, clearLogs } = useNotifications();
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  const inputClasses = "w-full mt-1 bg-surface text-text-main border border-border rounded-lg p-3 transition focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase leading-none">Notification Hub</h1>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm border ${settings.testMode ? 'bg-yellow-100 text-yellow-600 border-yellow-200' : 'bg-green-100 text-green-600 border-green-200'}`}>
               {settings.testMode ? 'Sandbox Mode' : 'Live Production'}
            </span>
          </div>
          <p className="text-text-muted text-sm">Configure automated delivery of transactional Email and SMS alerts.</p>
        </div>
        <div className="flex bg-surface p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
          >
            Gateways
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassmorphicCard className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Production Email
                </h2>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.emailEnabled} onChange={(e) => updateSettings({ emailEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                </label>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">From Identity</label>
                <input type="text" value={settings.emailFrom} onChange={(e) => updateSettings({ emailFrom: e.target.value })} className={inputClasses} placeholder="VexoKart Support <support@vexokart.com>" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">API / SMTP Host</label>
                <input type="text" value={settings.smtpHost} onChange={(e) => updateSettings({ smtpHost: e.target.value })} className={inputClasses} placeholder="smtp.sendgrid.net" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">API Key / User</label>
                  <input type="text" value={settings.smtpUser} onChange={(e) => updateSettings({ smtpUser: e.target.value })} className={inputClasses} placeholder="apikey" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Secret Token</label>
                  <input type="password" value={settings.smtpPass} onChange={(e) => updateSettings({ smtpPass: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard className="p-6 space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Transactional SMS
                </h2>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={settings.smsEnabled} onChange={(e) => updateSettings({ smsEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                </label>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Sender ID</label>
                  <input type="text" value={settings.smsSenderId} onChange={(e) => updateSettings({ smsSenderId: e.target.value })} className={inputClasses} placeholder="VXKART" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">DLT Template ID</label>
                  <input type="text" value={settings.smsTemplateId} onChange={(e) => updateSettings({ smsTemplateId: e.target.value })} className={inputClasses} placeholder="1207..." />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Provider API Key</label>
                <input type="password" value={settings.smsApiKey} onChange={(e) => updateSettings({ smsApiKey: e.target.value })} className={inputClasses} placeholder="Live Auth Key" />
              </div>
              
              <div className={`p-4 rounded-xl border transition-colors ${settings.testMode ? 'bg-yellow-50 border-yellow-200' : 'bg-surface border-border'}`}>
                 <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.testMode} 
                    onChange={(e) => updateSettings({ testMode: e.target.checked })}
                    className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                  />
                  <div>
                    <span className={`text-sm font-bold ${settings.testMode ? 'text-yellow-700' : 'text-text-main'}`}>Enable Sandbox Mode</span>
                    <p className={`text-[10px] mt-0.5 ${settings.testMode ? 'text-yellow-600' : 'text-text-muted'}`}>Logs only; no API credits consumed during testing.</p>
                  </div>
                </label>
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      ) : (
        <GlassmorphicCard className="overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center bg-surface/30">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Broadcast Audit Trail</h3>
            <button onClick={clearLogs} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Flush History</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/50 text-text-muted text-[10px] uppercase font-black">
                <tr>
                  <th className="p-4">Time</th>
                  <th className="p-4">Medium</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Retries</th>
                  <th className="p-4">Gateway Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.length > 0 ? logs.map(log => (
                  <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                    <td className="p-4 whitespace-nowrap text-text-muted text-xs font-medium">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${log.channel === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-text-main text-xs">#{log.orderId}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'sent' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}></div>
                        <span className={`text-[10px] font-black uppercase ${log.status === 'sent' ? 'text-green-600' : 'text-red-600'}`}>{log.status}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-text-secondary">{log.retryCount || 0}</td>
                    <td className="p-4 text-xs italic text-text-muted max-w-[200px] truncate">{log.response}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-text-muted italic">No delivery attempts recorded in this session.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassmorphicCard>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
