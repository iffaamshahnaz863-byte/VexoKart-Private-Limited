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
        // Refresh orders context to ensure we have the token-to-order mapping
    }, [token]);

    const handleUpdate = async (status: OrderStatus) => {
        if (!token || isSubmitting) return;
        
        // Confirmation for final delivery or RTO
        if (['Delivered', 'Cancelled'].includes(status)) {
            const confirmMsg = status === 'Delivered' 
                ? "Collect payment (if applicable) before marking as Delivered. Continue?" 
                : "Mark this package for Return to Origin (RTO)?";
            if (!window.confirm(confirmMsg)) return;
        }

        setIsSubmitting(true);
        const res = await updateOrderByToken(token, status, note);
        setResult(res);
        setIsSubmitting(false);
    };

    if (!order && !result) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6 text-center">
                <div className="space-y-4 max-w-sm">
                    <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h1 className="text-xl font-black text-text-main italic uppercase tracking-tight">Invalid Package Token</h1>
                    <p className="text-text-muted text-sm leading-relaxed font-medium">This logistics link is either broken, expired, or doesn't belong to a valid order in the system.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest mt-6 shadow-xl shadow-accent/20">Return to Portal</button>
                </div>
            </div>
        );
    }

    if (result) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-2xl ${result.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {result.success ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                </div>
                <h1 className="text-3xl font-black text-text-main uppercase italic tracking-tighter">{result.success ? 'Sync Successful' : 'Update Blocked'}</h1>
                <p className="text-text-secondary mt-3 font-bold text-lg leading-tight max-w-[280px]">{result.message}</p>
                
                {result.success && (
                    <div className="mt-12 p-6 bg-white rounded-3xl shadow-premium border border-border w-full max-w-sm">
                        <p className="text-[11px] font-black uppercase text-accent mb-2 tracking-widest italic">Digital Manifest Updated</p>
                        <p className="text-xs font-medium text-text-secondary leading-relaxed">Notifications have been dispatched to the Customer and Merchant. The supply chain history is now updated.</p>
                    </div>
                )}
                
                <button onClick={() => window.location.reload()} className="mt-12 text-accent font-black uppercase text-[11px] tracking-widest hover:opacity-70 transition-opacity border-b-2 border-accent pb-1">Reset for New Scan</button>
            </div>
        );
    }

    const isCOD = order?.payment_method === 'Cash on Delivery';
    const isPaid = order?.payment_status === 'paid';

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-24">
            <div className="bg-white p-6 border-b border-border sticky top-0 z-10 shadow-sm flex items-center justify-between">
                 <h1 className="text-xl font-black text-text-main italic tracking-tighter uppercase leading-none">Vexo<span className="text-accent">Kart</span> <span className="text-text-muted font-medium ml-1">Scan Station</span></h1>
                 <span className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100">Authenticated</span>
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6">
                {/* Logistics Header Card */}
                <GlassmorphicCard className="p-6 bg-white border-none shadow-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 -mr-10 -mt-10 rounded-full"></div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Consignment ID</p>
                            <h2 className="text-3xl font-black text-text-main italic tracking-tighter uppercase leading-none">Order #{order?.id}</h2>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Workflow</p>
                             <span className="px-3 py-1 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">{order?.status}</span>
                        </div>
                    </div>

                    <div className="space-y-6 text-sm font-bold border-t border-border pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted uppercase text-[10px] tracking-widest">Consignee</span>
                            <div className="text-right text-text-main">
                                <p className="text-base font-black italic">{order?.shippingAddress.fullName}</p>
                                <p className="text-[11px] font-bold text-accent uppercase">{order?.shippingAddress.phone}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-start">
                            <span className="text-text-muted uppercase text-[10px] tracking-widest">Delivery Route</span>
                            <div className="text-right text-text-main max-w-[200px]">
                                <p className="uppercase tracking-tighter">{order?.shippingAddress.city}, {order?.shippingAddress.state}</p>
                                <p className="text-lg font-black tracking-widest border-b-2 border-text-main inline-block">{order?.shippingAddress.zip}</p>
                            </div>
                        </div>

                         {isCOD && !isPaid ? (
                            <div className="p-5 bg-black text-white rounded-2xl flex flex-col gap-1 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#fff_0%,_transparent_70%)]"></div>
                                <div className="flex justify-between items-center relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Collect Settlement</span>
                                    <span className="px-2 py-0.5 bg-red-500 text-white rounded text-[8px] font-black uppercase animate-pulse">Required</span>
                                </div>
                                <div className="flex justify-between items-end mt-1 relative z-10">
                                    <p className="text-4xl font-black italic tracking-tighter leading-none">₹{order?.total.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase text-gray-400">COD Settlement</p>
                                </div>
                            </div>
                         ) : (
                            <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Billing Info</p>
                                    <p className="text-sm font-black italic uppercase">Digital Settlement Paid</p>
                                </div>
                                <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                         )}
                    </div>
                </GlassmorphicCard>

                {/* Fulfillment Controls */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-[11px] font-black uppercase tracking-widest text-text-muted italic">Stage Transition</p>
                        <p className="text-[10px] font-bold text-text-muted">Actor: Courier Partner</p>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdate('Delivered')}
                        disabled={isSubmitting || order?.status === 'Delivered' || order?.status === 'Cancelled'}
                        className="w-full bg-green-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-2xl shadow-green-600/30 active:scale-95 transition-all disabled:opacity-50 group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-sm italic">Deliver Package</p>
                                <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Confirmed Handover to Buyer</p>
                            </div>
                        </div>
                        <svg className="w-6 h-6 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <button 
                        onClick={() => handleUpdate('Out for Delivery')}
                        disabled={isSubmitting || order?.status === 'Out for Delivery' || order?.status === 'Delivered' || order?.status === 'Cancelled'}
                        className="w-full bg-blue-600 text-white p-6 rounded-3xl flex items-center justify-between shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14a1 1 0 01-1 1h-1m-1 0a1 1 0 10-2 0m-5 0a1 1 0 10-2 0" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black uppercase tracking-widest text-sm italic">Out for Delivery</p>
                                <p className="text-[10px] opacity-70 font-bold uppercase tracking-tight">Initiate Delivery Attempt</p>
                            </div>
                        </div>
                        <svg className="w-6 h-6 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleUpdate('Shipped')}
                            disabled={isSubmitting || ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order?.status || '')}
                            className="bg-white text-text-main p-5 rounded-3xl border border-border shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                            <p className="font-black uppercase tracking-[0.2em] text-[11px] italic">Picked Up</p>
                            <p className="text-[9px] text-text-muted mt-1 uppercase font-bold">Transit Entry</p>
                        </button>
                        <button 
                            onClick={() => handleUpdate('Cancelled')}
                            disabled={isSubmitting || order?.status === 'Delivered' || order?.status === 'Cancelled'}
                            className="bg-red-50 text-red-600 p-5 rounded-3xl border border-red-100 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                        >
                            <p className="font-black uppercase tracking-[0.2em] text-[11px] italic">RTO / Refused</p>
                            <p className="text-[9px] text-red-400 mt-1 uppercase font-bold">Return to Origin</p>
                        </button>
                    </div>
                </div>

                {/* Audit Input */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-text-muted ml-2 block italic">Shipment Logs (Audit)</label>
                    <textarea 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g. Identity Verified, Handed over to security, RTO due to incorrect address..."
                        className="w-full bg-white border border-border rounded-3xl p-5 text-sm font-medium focus:ring-8 focus:ring-accent/5 focus:outline-none focus:border-accent transition-all h-32 resize-none shadow-inner"
                    />
                </div>

                {/* Secure Protocol Meta */}
                <div className="pt-10 flex flex-col items-center">
                    <div className="flex items-center gap-3 py-2 px-4 bg-white/50 rounded-full border border-border">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted italic">VexoKart Logistics Protocol v4.0</span>
                    </div>
                    <p className="mt-4 text-[8px] text-text-muted uppercase font-bold max-w-[200px] text-center opacity-60 leading-relaxed tracking-tighter">Every status update is geo-tagged and permanently logged for audit protection.</p>
                </div>
            </div>
        </div>
    );
};

export default CourierScanPage;