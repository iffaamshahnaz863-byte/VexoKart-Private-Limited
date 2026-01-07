import React from 'react';
import GlassmorphicCard from '../../components/GlassmorphicCard';

const AdminAuditLogsPage: React.FC = () => {
    // Mock simulation of audit logs
    const logs = [
        { id: 'LOG-001', actor: 'Super Admin', action: 'COMMISSION_UPDATE', target: 'GLOBAL_RATE: 12%', time: '10 mins ago', type: 'critical' },
        { id: 'LOG-002', actor: 'Admin Node-4', action: 'VENDOR_VERIFY', target: 'Luxe Boutique (VND-22)', time: '2 hours ago', type: 'secure' },
        { id: 'LOG-003', actor: 'Support Bot', action: 'ORDER_OVERRIDE', target: 'Order #VX-9912 (Refund)', time: '4 hours ago', type: 'warning' },
        { id: 'LOG-004', actor: 'Super Admin', action: 'MARKETING_PUBLISH', target: 'Diwali Flash Banner', time: '6 hours ago', type: 'info' },
        { id: 'LOG-005', actor: 'Admin Node-2', action: 'USER_BAN', target: 'user_9921@spam.com', time: '1 day ago', type: 'critical' },
    ];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">Security<br/><span className="text-accent">Protocol</span></h1>
                    <p className="text-gray-400 font-bold text-sm mt-2">Immutable audit trail of administrative marketplace overrides.</p>
                </div>
            </div>

            <div className="space-y-3">
                {logs.map(log => (
                    <div key={log.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-6 group hover:border-accent transition-all shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            log.type === 'critical' ? 'bg-red-50 text-red-500' :
                            log.type === 'warning' ? 'bg-orange-50 text-orange-500' :
                            log.type === 'secure' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase italic">{log.action}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">Target Node: {log.target}</p>
                                </div>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{log.time}</span>
                            </div>
                        </div>
                        <div className="shrink-0 text-right">
                             <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{log.actor}</p>
                             <p className="text-[9px] font-bold text-gray-400 uppercase font-mono">{log.id}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminAuditLogsPage;