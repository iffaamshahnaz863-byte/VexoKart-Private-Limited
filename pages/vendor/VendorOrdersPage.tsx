
import React from 'react';
import { Order, OrderStatus, Product } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import { useAuth } from '../../context/AuthContext';
import { useVendors } from '../../context/VendorContext';
import { useProducts } from '../../hooks/useProducts';
import { useOrders } from '../../context/OrderContext';

const VENDOR_UPDATABLE_STATUSES: OrderStatus[] = ['Packed', 'Shipped'];

const VendorOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const { getVendorByUserId } = useVendors();
    const { products } = useProducts();
    const { orders, updateOrderStatus } = useOrders();

    const vendor = user ? getVendorByUserId(user.email) : null;
    const vendorProducts = vendor ? products.filter(p => p.vendorId === vendor.id) : [];

    // Filter orders to only include those with this vendor's products
    const vendorOrders = orders.map(order => {
        const vendorItems = order.items.filter(item => 
            vendorProducts.some(p => p.id === item.id)
        );
        if (vendorItems.length === 0) return null;

        // In a real system, this would be a sub-order. Here we simulate it.
        // We can't change the main order status, just manage our part.
        // For this simulation, we'll show the main order status.
        return { ...order, items: vendorItems };
    }).filter((o): o is Order => o !== null);

    const handleStatusChange = (orderId: string, status: OrderStatus) => {
        // Vendors can only update status to a few states.
        // In a real system, this would only affect the line item status.
        // Here, we update the main order for simplicity.
        if (VENDOR_UPDATABLE_STATUSES.includes(status)) {
            updateOrderStatus(orderId, status);
        } else {
            alert(`As a vendor, you can only update status to: ${VENDOR_UPDATABLE_STATUSES.join(', ')}`);
        }
    };
  
    return (
        <div>
            <h1 className="text-3xl font-bold text-text-main mb-6">My Orders</h1>
            <GlassmorphicCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-700 text-text-muted">
                                <th className="p-4 font-semibold">Order ID</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Customer</th>
                                <th className="p-4 font-semibold">Items</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-800 hover:bg-surface/50">
                                    <td className="p-4 text-text-main font-mono">#{order.id}</td>
                                    <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-4">{order.userEmail}</td>
                                    <td className="p-4">{order.items.length}</td>
                                    <td className="p-4 text-xs font-bold">{order.status}</td>
                                    <td className="p-4">
                                        <select
                                            defaultValue=""
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="bg-surface border border-gray-600 rounded-md p-1.5 text-text-main focus:ring-accent focus:border-accent"
                                        >
                                            <option value="" disabled>Update Status</option>
                                            {VENDOR_UPDATABLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vendorOrders.length === 0 && <p className="text-center p-8 text-text-muted">You have no orders yet.</p>}
                </div>
            </GlassmorphicCard>
        </div>
    );
};

export default VendorOrdersPage;