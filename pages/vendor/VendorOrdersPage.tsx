
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, OrderItem } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useOrders } from '../../context/OrderContext';
import ShippingDetailsModal from '../../components/admin/ShippingDetailsModal';

interface VendorAugmentedOrder extends Order {
    vendorItems: OrderItem[];
    vendorSubtotal: number;
}

const VendorOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { currentVendor, fetchCurrentVendor } = useVendors();
    const { orders, isLoading, updateOrderStatus, generateShippingLabel, refreshOrders, isLabelGenerating } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);

    useEffect(() => {
        refreshOrders();
        if (user?.id && !currentVendor) {
            fetchCurrentVendor(user.id.toString());
        }
    }, [user, currentVendor]);

    const vendorOrders = useMemo(() => {
        if (!currentVendor) return [];

        return orders.filter(order => {
            const matchesVendorId = Number(order.vendor_id) === Number(currentVendor.id);
            const hasVendorItems = Array.isArray(order.items) && order.items.some(item => 
                Number(item.vendor_id) === Number(currentVendor.id)
            );
            return matchesVendorId || hasVendorItems;
        }).map(order => {
            const matchedItems = order.items.filter(item => 
                Number(item.vendor_id) === Number(currentVendor.id)
            );
            const vendorSubtotal = matchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                ...order,
                vendorItems: matchedItems,
                vendorSubtotal: vendorSubtotal
            } as VendorAugmentedOrder;
        }).filter((o): o is VendorAugmentedOrder => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return ['Placed', 'Confirmed'].includes(o.status);
            return o.status === statusFilter;
        });
    }, [orders, currentVendor, statusFilter]);

    const handleConfirmOrder = async (orderId: string) => {
        await updateOrderStatus(orderId, 'Confirmed', { note: "Consignment confirmed by merchant node." });
    };

    const handlePacked = async (orderId: string) => {
        await updateOrderStatus(orderId, 'Packed', { note: "Items verified and manifest generated." });
    };

    const handleStatusChange = (order: Order, status: OrderStatus) => {
        if (status === 'Shipped') {
            setSelectedOrder(order);
            setShippingModalOpen(true);
        } else {
            updateOrderStatus(order.id, status);
        }
    };

    const handleShippingSubmit = (courierName: string, trackingId: string) => {
        if (selectedOrder) {
            updateOrderStatus(selectedOrder.id, 'Shipped', { courier_name: courierName, tracking_id: trackingId });
        }
        setShippingModalOpen(false);
        setSelectedOrder(null);
    };

    if (isLoading && vendorOrders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-text-muted font-black uppercase tracking-widest text-[10px]">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isShippingModalOpen && (
                <ShippingDetailsModal
                    onClose={() => setShippingModalOpen(false)}
                    onSubmit={handleShippingSubmit}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Vendor Orders</h1>
                  <p className="text-text-muted mt-1 text-sm font-medium">Automated fulfillment lifecycle.</p>
                </div>

                <div className="flex bg-surface p-1 rounded-xl border border-border">
                    {['all', 'pending', 'Packed', 'Shipped', 'Delivered'].map(f => (
                        <button
                            key={f}
                            onClick={() => setStatusFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-accent text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <GlassmorphicCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] uppercase font-black tracking-widest">
                                <th className="p-6">Order Reference</th>
                                <th className="p-6 text-center">Settlement</th>
                                <th className="p-6 text-center">Status</th>
                                <th className="p-6 text-right">Workflow Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {vendorOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <p className="text-text-main font-mono font-bold text-base">#{order.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">{order.shippingAddress?.fullName || 'Buyer'}</p>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className="text-text-main font-black text-sm italic">₹{order.vendorSubtotal.toLocaleString()}</span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                                            order.status === 'Delivered' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 
                                            order.status === 'Cancelled' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 
                                            'text-blue-400 border-blue-400/20 bg-blue-400/5'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                        {order.status === 'Placed' && (
                                            <button onClick={() => handleConfirmOrder(order.id)} className="bg-accent text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all hover:scale-105 active:scale-95">Accept Order</button>
                                        )}
                                        {order.status === 'Confirmed' && (
                                            <button 
                                                onClick={() => handlePacked(order.id)} 
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all hover:scale-105 active:scale-95"
                                            >
                                                Generate Manifest
                                            </button>
                                        )}
                                        {['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                                            <button 
                                                onClick={() => generateShippingLabel(order.id)}
                                                disabled={isLabelGenerating}
                                                className="bg-white border border-border text-text-main px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:border-accent transition-all shadow-sm inline-flex items-center gap-2 group disabled:opacity-50"
                                            >
                                                <svg className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                {isLabelGenerating ? '...' : 'View Label'}
                                            </button>
                                        )}
                                        {order.status === 'Packed' && (
                                            <button onClick={() => handleStatusChange(order, 'Shipped')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all hover:scale-105 active:scale-95">Dispatch</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vendorOrders.length === 0 && !isLoading && (
                        <div className="p-20 text-center text-text-muted italic font-medium uppercase text-[10px] tracking-widest">
                            Market Node Manifest Empty
                        </div>
                    )}
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorOrdersPage;
