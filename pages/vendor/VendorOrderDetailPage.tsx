import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useVendors } from '../../context/VendorContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { OrderStatus } from '../../types';

const VendorOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getOrderById, updateOrderStatus, generateShippingLabel, isLabelGenerating } = useOrders();
    const { currentVendor } = useVendors();
    
    const [isProcessing, setIsProcessing] = useState(false);

    const order = useMemo(() => id ? getOrderById(id) : null, [id, getOrderById]);
    const vid = currentVendor ? String(currentVendor.id) : '';

    const vendorItems = useMemo(() => {
        return order?.items?.filter((item: any) => String(item.vendor_id) === vid) || [];
    }, [order, vid]);

    const vendorSubtotal = vendorItems.reduce((sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);

    const handleAction = async (newStatus: OrderStatus, note: string) => {
        if (!order || isProcessing) return;
        setIsProcessing(true);
        try {
            await updateOrderStatus(order.id, newStatus, { note });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!order) return null;

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-32 animate-in fade-in duration-300">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <h1 className="text-base font-black text-gray-900 uppercase tracking-tight italic">Order Workflow</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* ID Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Consignment ID</p>
                        <h2 className="text-xl font-black font-mono text-gray-900">#{order.id?.slice(0, 10)}...</h2>
                    </div>
                    <div className="text-right">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-accent/5 text-accent border-accent/10'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                </div>

                {/* Buyer & Address */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 italic">Delivery Node</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface rounded-2xl flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-900 uppercase italic leading-none">{order.shippingAddress?.fullName}</p>
                                <p className="text-[10px] font-bold text-accent mt-1 tracking-tight">PH: {order.shippingAddress?.phone?.replace(/(\d{4})$/, '****')}</p>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-50">
                            <p className="text-xs font-bold text-gray-600 uppercase leading-relaxed tracking-tighter">
                                {order.shippingAddress?.street}<br/>
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zip}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 italic">Managed Items</h3>
                    <div className="space-y-4">
                        {vendorItems.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <img src={item.image} className="w-14 h-14 rounded-xl object-contain bg-gray-50 border border-gray-100" alt="" />
                                <div className="flex-grow">
                                    <p className="text-xs font-black text-gray-900 line-clamp-1 uppercase italic">{item.name}</p>
                                    <div className="flex gap-2 mt-1">
                                        {item.size && <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">S: {item.size}</span>}
                                        {item.color && <span className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">C: {item.color}</span>}
                                    </div>
                                    <div className="flex justify-between items-end mt-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">QTY: {item.quantity}</p>
                                        <p className="text-xs font-black text-gray-900 italic">₹{(item.price || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Breakup */}
                <div className="bg-gray-900 text-white p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Financial Settlement</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                            <span className="text-gray-400">Merchant Share</span>
                            <span>₹{(vendorSubtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                            <span className="text-gray-400">Logistics Fee</span>
                            <span className="text-green-400">FREE</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Credited on Delivery</span>
                                <span className="text-2xl font-black italic tracking-tighter">₹{(vendorSubtotal || 0).toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded-lg italic">{order.payment_mode}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Workflow Actions (Sticky) - FIXED FOR ALL DEVICES */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 flex flex-col gap-3 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
                 {order.status === 'Placed' && (
                    <button 
                      onClick={() => handleAction('Confirmed', 'Merchant accepted the commitment.')}
                      disabled={isProcessing}
                      className="w-full h-14 bg-[#F43397] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#F43397]/20 active:scale-95 transition-all flex items-center justify-center"
                    >
                      {isProcessing ? 'SYNCHRONIZING...' : 'ACCEPT ORDER'}
                    </button>
                 )}
                 {order.status === 'Confirmed' && (
                    <button 
                      onClick={() => handleAction('Packed', 'Items verified and packed.')}
                      disabled={isProcessing}
                      className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center"
                    >
                      {isProcessing ? 'PACKING...' : 'MARK AS PACKED'}
                    </button>
                 )}
                 {['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                    <div className="flex gap-3 h-14">
                        <button 
                            onClick={() => generateShippingLabel(order.id)}
                            disabled={isLabelGenerating}
                            className="flex-1 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {isLabelGenerating ? 'WAIT...' : 'LABEL'}
                        </button>
                        {order.status === 'Packed' && (
                            <button 
                                onClick={() => handleAction('Shipped', 'Handed over to logistics partner.')}
                                disabled={isProcessing}
                                className="flex-[1.5] bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg active:scale-95 transition-all flex items-center justify-center"
                            >
                                {isProcessing ? 'SYNC...' : 'DISPATCH'}
                            </button>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};

export default VendorOrderDetailPage;