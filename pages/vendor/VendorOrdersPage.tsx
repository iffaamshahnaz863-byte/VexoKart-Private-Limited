
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import ShippingDetailsModal from '../../components/admin/ShippingDetailsModal';

const VENDOR_UPDATABLE_STATUSES: OrderStatus[] = ['Packed', 'Shipped', 'Out for Delivery'];

const VendorOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { getVendorByUserId } = useVendors();
    const { products } = useProducts();
    const { orders, updateOrderStatus } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);

    const vendor = user ? getVendorByUserId(user.email) : null;
    const vendorProducts = vendor ? products.filter(p => p.vendorId === vendor.id) : [];

    const vendorOrders = orders.map(order => {
        const vendorItems = order.items.filter(item => 
            vendorProducts.some(p => p.id === item.id)
        );
        if (vendorItems.length === 0) return null;
        return { ...order, items: vendorItems };
    }).filter((o): o is Order => {
        if (!o) return false;
        if (statusFilter === 'all') return true;
        if (statusFilter === 'pending') return ['Placed', 'Confirmed', 'Packed'].includes(o.status);
        return o.status === statusFilter;
    });

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
                  <h1 className="text-3xl font-black text-text-main italic tracking-tight uppercase">Order Management</h1>
                  <p className="text-text-muted mt-1 text-sm">Fulfill orders and update customers on shipping status.</p>
                </div>

                <div className="flex bg-surface p-1 rounded-xl border border-border">
                    {['all', 'pending', 'Shipped', 'Delivered'].map(f => (
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
                                <th className="p-6">Customer</th>
                                <th className="p-6">Line Items</th>
                                <th className="p-6">Current Status</th>
                                <th className="p-6 text-right">Update Progression</th>
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
                                        <p className="text-text-main font-bold">{order.shippingAddress.fullName}</p>
                                        <p className="text-[10px] text-text-muted">{order.userEmail}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex -space-x-2">
                                          {order.items.slice(0, 3).map((item, idx) => (
                                            <img key={idx} src={item.image} className="w-8 h-8 rounded-full border border-background object-cover bg-surface" />
                                          ))}
                                          {order.items.length > 3 && (
                                            <div className="w-8 h-8 rounded-full border border-background bg-surface flex items-center justify-center text-[8px] font-bold text-text-muted">+{order.items.length - 3}</div>
                                          )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                          order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                          order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                          'bg-accent/10 text-accent border-accent/20'
                                        }`}>
                                          {order.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        {['Cancelled', 'Delivered'].includes(order.status) ? (
                                            <span className="text-[10px] text-text-muted italic uppercase font-bold tracking-tight">Locked</span>
                                        ) : (
                                            <select
                                                value=""
                                                onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                                                className="bg-surface border border-white/10 rounded-lg py-1.5 px-3 text-[10px] font-black uppercase tracking-widest text-text-main focus:ring-accent focus:border-accent"
                                            >
                                                <option value="" disabled>Set Status</option>
                                                {VENDOR_UPDATABLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                <option value="Delivered">Mark Delivered</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vendorOrders.length === 0 && (
                      <div className="p-20 text-center">
                        <p className="text-text-muted font-bold tracking-tight italic">No orders found matching your criteria.</p>
                      </div>
                    )}
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorOrdersPage;
