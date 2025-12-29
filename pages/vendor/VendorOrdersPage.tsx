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
    const { orders, isLoading, updateOrderStatus, updateOrderLabelInfo, refreshOrders } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);
    const [labelOrder, setLabelOrder] = useState<Order | null>(null);
    const [isGeneratingLabel, setIsGeneratingLabel] = useState<string | null>(null);

    useEffect(() => {
        refreshOrders();
        if (user?.email && !currentVendor) {
            fetchCurrentVendor(user.email);
        }
    }, [user]);

    // Filter orders to show only those belonging to this vendor
    const vendorOrders = useMemo(() => {
        if (!currentVendor) return [];

        return orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            
            // Filter only items belonging to THIS vendor
            const matchedItems = items.filter(item => {
                const itemVendorId = String(item.vendorId || (item as any).vendor_id || '');
                const itemVendorEmail = String((item as any).vendor_email || '');
                
                return itemVendorId === String(currentVendor.id) || 
                       itemVendorId === String(currentVendor.user_id) ||
                       (itemVendorEmail && itemVendorEmail.toLowerCase() === currentVendor.email.toLowerCase());
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
            
            // Visibility: Only fulfillment stages
            const isValidStatus = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(o.status);
            if (!isValidStatus) return false;

            if (statusFilter === 'all') return true;
            if (statusFilter === 'pending') return ['Placed', 'Confirmed'].includes(o.status);
            return o.status === statusFilter;
        });
    }, [orders, currentVendor, statusFilter]);

    const handlePackAndLabel = async (order: VendorAugmentedOrder) => {
        setIsGeneratingLabel(order.id);
        try {
            // Simulate Cloud Label Generation
            // In a real app, this URL would point to a generated PDF stored in Supabase Storage
            const mockStorageUrl = `https://storage.vexokart.com/shipping-labels/order_${order.id}_label.pdf`;
            
            // Update status to 'Packed' and save label URL
            await updateOrderLabelInfo(order.id, mockStorageUrl);
            
            alert('Order marked as Packed. Shipping label generated successfully.');
        } catch (err) {
            alert('Failed to generate shipping label. Please try again.');
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
            updateOrderStatus(selectedOrder.id, 'Shipped', { courierName, trackingId });
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
                  <p className="text-text-muted mt-1 text-sm">Fulfill orders and generate shipping documentation.</p>
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
                                <th className="p-6">My Items</th>
                                <th className="p-6">Revenue</th>
                                <th className="p-6">Method</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {vendorOrders.map(order => (
                                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <p className="text-text-main font-mono font-bold">#{order.id}</p>
                                        <p className="text-[10px] text-text-muted uppercase font-bold mt-1">{new Date(order.date).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-text-main font-bold">{order.shippingAddress?.fullName || 'Customer'}</p>
                                        <p className="text-[10px] text-text-muted">{order.userEmail}</p>
                                        <p className="text-[9px] text-text-muted mt-1 truncate max-w-[140px] uppercase">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            {order.vendorItems.map((item, idx) => (
                                                <span key={idx} className="text-text-main font-bold text-xs truncate max-w-[150px]">
                                                    {item.name} <span className="text-accent">x{item.quantity}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-accent font-black text-sm">₹{order.vendorSubtotal.toLocaleString()}</span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                          order.payment_method === 'Cash on Delivery' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                                        }`}>
                                          {order.payment_method === 'Cash on Delivery' ? 'COD' : 'Online'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase ${
                                            order.status === 'Delivered' ? 'text-green-500' : 
                                            order.status === 'Cancelled' ? 'text-red-500' : 
                                            order.status === 'Packed' ? 'text-indigo-400' : 'text-blue-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status === 'Cancelled' ? (
                                                <span className="text-text-muted font-bold uppercase text-[10px]">Void</span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {order.status === 'Placed' && (
                                                        <button onClick={() => handleStatusChange(order, 'Confirmed')} className="bg-accent text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-accent/20">Confirm</button>
                                                    )}
                                                    {order.status === 'Confirmed' && !order.label_url && (
                                                        <button 
                                                            onClick={() => handlePackAndLabel(order)} 
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
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                            View Label
                                                        </button>
                                                    )}
                                                    {order.status === 'Packed' && (
                                                        <button onClick={() => handleStatusChange(order, 'Shipped')} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Mark Shipped</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vendorOrders.length === 0 && !isLoading && (
                      <div className="p-20 text-center">
                        <p className="text-text-muted font-bold tracking-tight italic">No orders found matching this filter.</p>
                      </div>
                    )}
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorOrdersPage;
