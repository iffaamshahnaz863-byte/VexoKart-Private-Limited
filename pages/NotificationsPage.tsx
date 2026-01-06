
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import GlassmorphicCard from '../components/GlassmorphicCard';

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { inbox, markAsRead, markAllAsRead, fetchInbox } = useNotifications();

    useEffect(() => {
        if (user) fetchInbox(user);
    }, [user]);

    const getRelativeTime = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return past.toLocaleDateString();
    };

    return (
        <div className="bg-surface min-h-screen">
            <div className="sticky top-0 z-10 p-4 bg-white/80 backdrop-blur-md flex items-center justify-between border-b border-border shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 mr-2">
                        <ChevronLeftIcon className="h-6 w-6 text-text-main" />
                    </button>
                    <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">Inbox</h1>
                </div>
                {inbox.some(m => !m.is_read) && (
                    <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-black uppercase text-accent tracking-widest hover:bg-accent/5 px-3 py-1 rounded-lg"
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            <div className="p-4 space-y-3 max-w-2xl mx-auto">
                {inbox.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-border p-10">
                        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <svg className="w-12 h-12 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-text-main uppercase italic">Inbox Empty</h3>
                        <p className="text-text-muted text-xs font-bold uppercase mt-2 tracking-widest">No notifications to show at this moment.</p>
                    </div>
                ) : (
                    inbox.map((msg) => (
                        <GlassmorphicCard 
                            key={msg.id} 
                            className={`p-5 transition-all relative cursor-pointer border-none shadow-premium ${!msg.is_read ? 'bg-white scale-100' : 'bg-white/60 opacity-70 grayscale-[0.5]'}`}
                            onClick={() => !msg.is_read && markAsRead(msg.id)}
                        >
                            {!msg.is_read && (
                                <div className="absolute top-6 left-2 w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(255,138,0,0.5)]"></div>
                            )}
                            <div className="pl-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm tracking-tight leading-tight uppercase italic ${!msg.is_read ? 'font-black text-text-main' : 'font-bold text-text-secondary'}`}>
                                        {msg.title}
                                    </h4>
                                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest bg-surface px-1.5 py-0.5 rounded">
                                        {getRelativeTime(msg.created_at)}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed mt-1 ${!msg.is_read ? 'text-text-secondary font-medium' : 'text-text-muted'}`}>
                                    {msg.message}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                     <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${msg.is_read ? 'bg-gray-100 border-gray-200' : 'bg-accent/5 border-accent/10'}`}>
                                        <svg className={`w-3.5 h-3.5 ${msg.is_read ? 'text-text-muted' : 'text-accent'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                     </div>
                                     <span className="text-[9px] font-black uppercase text-text-muted tracking-tighter">System Alert</span>
                                </div>
                            </div>
                        </GlassmorphicCard>
                    ))
                )}
            </div>
            
            <div className="p-10 text-center pb-24">
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-[0.4em] italic opacity-40">End of Notification Manifest</p>
            </div>
        </div>
    );
};

export default NotificationsPage;
