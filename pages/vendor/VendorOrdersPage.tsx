

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useOrders } from '../../context/OrderContext';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';

const VendorOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentVendor, fetchCurrentVendor } = useVendors();
    const { orders, isLoading, refreshOrders, updateOrderStatus } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        refreshOrders();
        if (user?.id && !currentVendor) {
            fetchCurrentVendor(user.id.toString());
        }
    }, [user, currentVendor]);

    const vid = currentVendor ? String(currentVendor.id) : '';

    const handleAction = async (orderId: string, newStatus: OrderStatus, note: string) => {
        if (processingId) return;
        setProcessingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus, { note });
        } catch (err) {
            console.error("Action failed", err);
        } finally {
            setProcessingId(null);
        }
    };

    const vendorOrders = useMemo(() => {
        return orders.filter(order => {
            const hasVendorItems = Array.isArray(order.items) && order.items.some((item: any) => 
                String(item.vendor_id) === vid
            );
            return hasVendorItems;
        }).map(order => {
            const matchedItems = order.items.filter((item: any) => 
                String(item.vendor_id) === vid
            );
            const vendorSubtotal = matchedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            return { ...order, vendorItems: matchedItems, vendorSubtotal };
        }).filter((o: any) => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return ['Placed', 'Confirmed'].includes(o.status);
            return o.status === statusFilter;
        });
    }, [orders, vid, statusFilter]);

    const filters = [
      { id: 'all', label: 'All' },
      { id: 'pending', label: 'Pending' },
      { id: 'Packed', label: 'Packed' },
      { id: 'Shipped', label: 'Shipped' },
      { id: 'Delivered', label: 'Delivered' }
    ];

    if (isLoading && vendorOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-24">
            <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-md pb-4 pt-1">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/vendor')} className="p-2 -ml-2">
                        <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter">Order Manifests</h1>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${statusFilter === f.id ? 'bg-accent border-accent text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {vendorOrders.map((order: any) => {
                    const firstItem = order.vendorItems[0];
                    const isProcessing = processingId === order.id;

                    return (
                        <div 
                          key={order.id} 
                          onClick={() => navigate(`/vendor/order/${order.id}`)}
                          className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm active:scale-[0.99] transition-all cursor-pointer group"
                        >
                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                    <img src={firstItem.image} className="w-full h-full object-contain" alt="" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-6)}</p>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                            order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                                            order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1 italic uppercase tracking-tight mt-1">{firstItem.name}</h3>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Qty:</span>
                                            <span className="text-[10px] font-black text-gray-900">{order.vendorItems.length > 1 ? `${order.vendorItems.length} items` : firstItem.quantity}</span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <p className="text-xs font-black text-accent italic">₹{order.vendorSubtotal.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* VENDOR ACTION BUTTONS - FIXED FOR ALL DEVICES */}
                            {(order.status === 'Placed' || order.status === 'Confirmed') && (
                                <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col sm:flex-row gap-2">
                                    {order.status === 'Placed' && (
                                        <button 
                                            // Fix: Use capitalized status value
                                            onClick={(e) => { e.stopPropagation(); handleAction(order.id, 'Confirmed', 'Order accepted via dashboard'); }}
                                            disabled={isProcessing}
                                            className="w-full sm:flex-1 h-11 bg-[#F43397] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#F43397]/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Syncing...' : 'Accept Order'}
                                        </button>
                                    )}
                                    {order.status === 'Confirmed' && (
                                        <button 
                                            // Fix: Use capitalized status value
                                            onClick={(e) => { e.stopPropagation(); handleAction(order.id, 'Packed', 'Order packed via dashboard'); }}
                                            disabled={isProcessing}
                                            className="w-full sm:flex-1 h-11 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
                                        >
                                            {isProcessing ? 'Syncing...' : 'Mark as Packed'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); navigate(`/vendor/order/${order.id}`); }}
                                        className="w-full sm:w-auto h-11 px-6 bg-gray-50 text-gray-500 rounded-xl font-black uppercase text-[10px] tracking-widest active:bg-gray-100 transition-all flex items-center justify-center"
                                    >
                                        View Details
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {vendorOrders.length === 0 && (
                    <div className="py-20 text-center space-y-4 opacity-50 grayscale">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                           <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">No orders match this criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrdersPage;
