
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { OrderStatus } from '../types';

const CourierScanPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { getOrderByToken, updateOrderByToken } = useOrders();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [note, setNote] = useState('');
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const order = token ? getOrderByToken(token) : null;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleUpdate = async (status: OrderStatus) => {
        if (!token || isSubmitting) return;
        setIsSubmitting(true);
        const res = await updateOrderByToken(token, status, note);
        setResult(res);
        setIsSubmitting(false);
    };

    if (!order && !result) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-xl font-bold text-text-main">Invalid Delivery QR</h1>
                    <p className="text-text-muted text-sm">This link appears to be broken or expired.</p>
                    <button onClick={() => navigate('/')} className="text-accent font-bold uppercase text-xs tracking-widest mt-4">Back to Home</button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    <svg className={`w-12 h-12 ${result.success ? 'text-green-500' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {result.success ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-text-main uppercase italic tracking-tight">{result.success ? 'Success!' : 'Update Failed'}</h1>
                <p className="text-text-secondary mt-2 font-medium">{result.message}</p>
                {result.success && (
                    <div className="mt-10 p-4 bg-white rounded-2xl shadow-sm border border-border">
                        <p className="text-[10px] font-black uppercase text-text-muted mb-1">Status Auto-Synced</p>
                        <p className="text-xs font-bold text-text-main">Notifications sent to Vendor & Customer.</p>
                    </div>
                )}
                <button onClick={() => navigate('/')} className="mt-12 text-text-muted font-bold uppercase text-[10px] tracking-widest hover:text-accent">VexoKart Logistics Hub</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            {/* Mobile Header */}
            <div className="bg-white p-6 border-b border-border sticky top-0 z-10 shadow-sm flex items-center justify-center">
                 <h1 className="text-xl font-black text-text-main italic tracking-tighter uppercase leading-none">Vexo<span className="text-accent">Kart</span> Delivery Update</h1>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6">
                <GlassmorphicCard className="p-6 bg-white overflow-hidden border-none shadow-md">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Package Ref</p>
                            <h2 className="text-2xl font-black text-text-main italic tracking-tight uppercase">Order #{order?.id}</h2>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Current</p>
                             <span className="px-2 py-1 bg-accent/10 text-accent rounded text-[10px] font-black uppercase tracking-widest">{order?.status}</span>
                        </div>
                    </div>

                    <div className="space-y-4 text-sm font-medium text-text-secondary border-t border-border pt-4">
                        <div className="flex justify-between">
                            <span>Recipient</span>
                            <span className="text-text-main font-bold">{order?.shippingAddress.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Method</span>
                            <span className="text-text-main font-bold">{order?.paymentMethod}</span>
                        </div>
                         {order?.paymentMethod === 'Cash on Delivery' && (
                            <div className="flex justify-between items-center p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
                                <span className="text-xs font-black uppercase">Collect COD</span>
                                <span className="text-lg font-black tracking-tighter">₹{order.total.toLocaleString()}</span>
                            </div>
                         )}
                    </div>
                </GlassmorphicCard>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Execution Actions</p>
                    
                    <button 
                        onClick={() => handleUpdate('Delivered')}
                        disabled={isSubmitting}
                        className="w-full bg-green-500 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-xs">Mark as Delivered</p>
                                <p className="text-[9px] opacity-70">Handed over to customer</p>
                            </div>
                        </div>
                        <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <button 
                        onClick={() => handleUpdate('Out for Delivery')}
                        disabled={isSubmitting || order?.status === 'Out for Delivery'}
                        className="w-full bg-blue-500 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14a1 1 0 01-1 1h-1m-1 0a1 1 0 10-2 0m-5 0a1 1 0 10-2 0" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-xs">Start Delivery Attempt</p>
                                <p className="text-[9px] opacity-70">Out for delivery now</p>
                            </div>
                        </div>
                        <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleUpdate('Cancelled')}
                            disabled={isSubmitting}
                            className="bg-red-100 text-red-600 p-4 rounded-2xl border border-red-200 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <p className="font-black uppercase tracking-widest text-[10px]">Reject/Cancel</p>
                            <p className="text-[8px] opacity-70 mt-1">Customer refusal</p>
                        </button>
                        <button 
                            onClick={() => handleUpdate('Shipped')}
                            disabled={isSubmitting}
                            className="bg-gray-100 text-gray-600 p-4 rounded-2xl border border-gray-200 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <p className="font-black uppercase tracking-widest text-[10px]">Failed Attempt</p>
                            <p className="text-[8px] opacity-70 mt-1">Unable to contact</p>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2 block">Scan Note (Internal Only)</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Left with neighbor, Gate closed..."
                        className="w-full bg-white border border-border rounded-2xl p-4 text-sm focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all h-24"
                    />
                </div>

                <div className="pt-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">VexoKart Secure Fulfillment Chain</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourierScanPage;
