import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus, OrderItem } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useOrders } from '../../context/OrderContext';
import ShippingDetailsModal from '../../components/admin/ShippingDetailsModal';
import ShippingLabelModal from '../../components/vendor/ShippingLabelModal';

interface VendorAugmentedOrder extends Order {
    vendorItems: OrderItem[];
    vendorSubtotal: number;
}

const VendorOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { currentVendor, fetchCurrentVendor } = useVendors();
    const { orders, isLoading, updateOrderStatus, generateShippingLabel, refreshOrders } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);
    const [labelOrder, setLabelOrder] = useState<Order | null>(null);
    const [isGeneratingLabel, setIsGeneratingLabel] = useState<string | null>(null);

    useEffect(() => {
        refreshOrders();
        if (user?.id && !currentVendor) {
            fetchCurrentVendor(user.id.toString());
        }
    }, [user, currentVendor]);

    const vendorOrders = useMemo(() => {
        if (!currentVendor) return [];

        return orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const matchedItems = items.filter(item => {
                const itemVid = String(item.vendorId || (item as any).vendor_id || '');
                return itemVid === String(currentVendor.id) || itemVid === String(currentVendor.user_id);
            });

            if (matchedItems.length === 0) return null;

            const vendorSubtotal = matchedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            return {
                ...order,
                vendorItems: matchedItems,
                vendorSubtotal: vendorSubtotal
            } as VendorAugmentedOrder;
        }).filter((o): o is VendorAugmentedOrder => {
            if (!o) return false;
            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return ['Placed', 'Confirmed'].includes(o.status);
            return o.status === statusFilter;
        });
    }, [orders, currentVendor, statusFilter]);

    const handlePackAndLabel = async (orderId: string) => {
        setIsGeneratingLabel(orderId);
        try {
            await generateShippingLabel(orderId);
            alert('Label generated successfully.');
        } catch (err: any) {
            alert(err.message || 'Failed to generate label.');
        } finally {
            setIsGeneratingLabel(null);
        }
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

            {labelOrder && currentVendor && (
                <ShippingLabelModal
                  order={labelOrder}
                  vendor={currentVendor}
                  onClose={() => setLabelOrder(null)}
                  onGenerated={() => {}}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Vendor Orders</h1>
                  <p className="text-text-muted mt-1 text-sm">Fulfill orders and generate labels.</p>
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
                                <th className="p-6">Order ID</th>
                                <th className="p-6">Customer</th>
                                <th className="p-6">Revenue</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {vendorOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <p className="text-text-main font-mono font-bold">#{order.id}</p>
                                        <p className="text-[10px] text-text-muted font-bold mt-1 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-text-main font-bold">{order.shipping_address?.fullName || 'Customer'}</p>
                                        <p className="text-[10px] text-text-muted mt-1 uppercase">{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-accent font-black text-sm">₹{order.vendorSubtotal.toLocaleString()}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase ${
                                            order.status === 'Delivered' ? 'text-green-500' : 
                                            order.status === 'Cancelled' ? 'text-red-500' : 
                                            'text-blue-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right space-x-2 whitespace-nowrap">
                                        {order.status === 'Placed' && (
                                            <button onClick={() => handleStatusChange(order, 'Confirmed')} className="bg-accent text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-accent/20">Confirm</button>
                                        )}
                                        {order.status === 'Confirmed' && !order.label_url && (
                                            <button 
                                                onClick={() => handlePackAndLabel(order.id)} 
                                                disabled={isGeneratingLabel === order.id}
                                                className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                                            >
                                                {isGeneratingLabel === order.id ? 'Generating...' : 'Pack & Label'}
                                            </button>
                                        )}
                                        {order.label_url && (
                                            <button 
                                                onClick={() => setLabelOrder(order)} 
                                                className="bg-surface border border-border text-text-main px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-white transition-all shadow-sm flex items-center gap-2"
                                            >
                                                View Label
                                            </button>
                                        )}
                                        {order.status === 'Packed' && (
                                            <button onClick={() => handleStatusChange(order, 'Shipped')} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Mark Shipped</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vendorOrders.length === 0 && !isLoading && (
                        <div className="p-20 text-center text-text-muted italic">
                            No orders found for your storefront.
                        </div>
                    )}
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorOrdersPage;