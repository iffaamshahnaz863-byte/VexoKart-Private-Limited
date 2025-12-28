
import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';
import ShippingDetailsModal from '../../components/admin/ShippingDetailsModal';
import ShippingLabelModal from '../../components/vendor/ShippingLabelModal';

// Progression rule for vendors: they drive the order towards shipping
const VENDOR_STAGES: OrderStatus[] = ['Confirmed', 'Packed', 'Shipped'];

const VendorOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { getVendorByUserId } = useVendors();
    const { products } = useProducts();
    const { orders, updateOrderStatus, updateOrderLabelInfo } = useOrders();
    
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isShippingModalOpen, setShippingModalOpen] = useState(false);
    const [labelOrder, setLabelOrder] = useState<Order | null>(null);

    const vendor = user ? getVendorByUserId(user.email) : null;
    const vendorProducts = vendor ? products.filter(p => p.vendorId === vendor.id.toString()) : [];

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

    const handleLabelGenerated = (url: string) => {
      if (labelOrder) {
        updateOrderLabelInfo(labelOrder.id, url);
      }
      setLabelOrder(null);
    };
  
    return (
        <div className="space-y-6">
            {isShippingModalOpen && (
                <ShippingDetailsModal
                    onClose={() => setShippingModalOpen(false)}
                    onSubmit={handleShippingSubmit}
                />
            )}

            {labelOrder && vendor && (
                <ShippingLabelModal
                  order={labelOrder}
                  vendor={vendor}
                  onClose={() => setLabelOrder(null)}
                  onGenerated={handleLabelGenerated}
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
                                <th className="p-6">Payment Mode</th>
                                <th className="p-6">Fulfillment</th>
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
                                        <div className="flex items-center gap-2">
                                          <span className="text-text-main font-bold">{order.items.length} items</span>
                                          <span className="text-accent font-black">₹{order.total.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                                          order.payment_method === 'Cash on Delivery' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                                        }`}>
                                          {order.payment_method}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {order.status === 'Cancelled' ? (
                                                <span className="text-red-500 font-black uppercase text-[10px]">Cancelled</span>
                                            ) : order.status === 'Delivered' ? (
                                                <span className="text-green-500 font-black uppercase text-[10px]">Delivered</span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {order.status === 'Placed' && (
                                                        <button onClick={() => handleStatusChange(order, 'Confirmed')} className="bg-accent text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-accent/20">Confirm</button>
                                                    )}
                                                    {order.status === 'Confirmed' && (
                                                        <button onClick={() => handleStatusChange(order, 'Packed')} className="bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-indigo-500/20">Pack Items</button>
                                                    )}
                                                    {order.status === 'Packed' && (
                                                        <button onClick={() => handleStatusChange(order, 'Shipped')} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20">Mark Shipped</button>
                                                    )}
                                                    {['Shipped', 'Out for Delivery'].includes(order.status) && (
                                                        <span className="text-blue-400 font-black uppercase text-[10px] animate-pulse">In Transit</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
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
