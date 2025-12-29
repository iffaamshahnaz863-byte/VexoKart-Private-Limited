import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import Header from '../components/Header';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import GlassmorphicCard from '../components/GlassmorphicCard';

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { inbox, markAsRead, markAllAsRead } = useNotifications();

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
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-text-main">No Notifications</h3>
                        <p className="text-text-muted text-sm mt-2">Updates about your orders will appear here.</p>
                    </div>
                ) : (
                    inbox.map((msg) => (
                        <GlassmorphicCard 
                            key={msg.id} 
                            className={`p-4 transition-all relative cursor-pointer border-none shadow-sm ${!msg.is_read ? 'bg-white' : 'bg-surface/50 opacity-80'}`}
                            onClick={() => !msg.is_read && markAsRead(msg.id)}
                        >
                            {!msg.is_read && (
                                <div className="absolute top-4 left-4 w-2 h-2 bg-accent rounded-full"></div>
                            )}
                            <div className={!msg.is_read ? 'pl-4' : ''}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm tracking-tight ${!msg.is_read ? 'font-black text-text-main' : 'font-bold text-text-secondary'}`}>
                                        {msg.title}
                                    </h4>
                                    <span className="text-[9px] font-bold text-text-muted uppercase">
                                        {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${!msg.is_read ? 'text-text-secondary font-medium' : 'text-text-muted'}`}>
                                    {msg.message.length > 120 ? msg.message.substring(0, 120) + '...' : msg.message}
                                </p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                        msg.channel === 'sms' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                        {msg.channel}
                                    </span>
                                    {msg.orderId && (
                                        <span className="text-[8px] font-black uppercase text-text-muted">Order: #{msg.orderId}</span>
                                    )}
                                </div>
                            </div>
                        </GlassmorphicCard>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;