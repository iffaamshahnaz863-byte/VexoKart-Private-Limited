

import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import GlassmorphicCard from '../../components/GlassmorphicCard';
import ShippingDetailsModal from '../../components/admin/ShippingDetailsModal';
import OrderStatusHistoryModal from '../../components/admin/OrderStatusHistoryModal';

// Fix: Use capitalized status values to match OrderStatus type
const ALL_STATUSES: OrderStatus[] = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, generateShippingLabel, isLabelGenerating } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isShippingModalOpen, setShippingModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    // Fix: Use capitalized status value and check for existing properties
    if (status === 'Shipped' && !order.awb_code && !order.tracking_id) {
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
  
  const openHistoryModal = (order: Order) => {
    setSelectedOrder(order);
    setHistoryModalOpen(true);
  }
  
  const getStatusColor = (status: OrderStatus) => {
      switch(status) {
          // Fix: Use capitalized status values to match OrderStatus type
          case 'Placed': return 'text-gray-300 bg-gray-700/50 border-gray-600/50';
          case 'Confirmed': return 'text-cyan-400 bg-cyan-900/50 border-cyan-600/50';
          case 'Packed': return 'text-indigo-400 bg-indigo-900/50 border-indigo-600/50';
          case 'Shipped': return 'text-blue-400 bg-blue-900/50 border-blue-600/50';
          case 'Out for Delivery': return 'text-yellow-400 bg-yellow-900/50 border-yellow-600/50';
          case 'Delivered': return 'text-green-400 bg-green-900/50 border-green-600/50';
          case 'Cancelled': return 'text-red-400 bg-red-900/50 border-red-600/50';
          default: return 'text-gray-400 bg-gray-700/50 border-gray-600/50';
      }
  }

  return (
    <div>
      {isShippingModalOpen && selectedOrder && (
        <ShippingDetailsModal
          onClose={() => setShippingModalOpen(false)}
          onSubmit={handleShippingSubmit}
        />
      )}
      {isHistoryModalOpen && selectedOrder && (
        <OrderStatusHistoryModal
          history={selectedOrder.status_history || []}
          onClose={() => setHistoryModalOpen(false)}
        />
      )}
      <h1 className="text-3xl font-bold text-text-main mb-6">Manage Orders</h1>
      <GlassmorphicCard>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-text-muted">
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Update Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-surface/50">
                  <td className="p-4 text-text-main font-mono">#{order.id}</td>
                  <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">{order.shipping_address?.fullName || order.user_id}</td>
                  <td className="p-4 font-semibold">₹{(order.total_amount || order.total || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                     <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        className="bg-surface border border-gray-600 rounded-md p-1.5 text-text-main focus:ring-accent focus:border-accent text-xs"
                     >
                        {ALL_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                  </td>
                   <td className="p-4 space-x-3 whitespace-nowrap">
                    <button onClick={() => openHistoryModal(order)} className="text-accent hover:underline text-xs font-semibold">
                      History
                    </button>
                    {/* Fix: Use capitalized status values for comparison */}
                    {['Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                        <button 
                            onClick={() => generateShippingLabel(order.id)}
                            disabled={isLabelGenerating}
                            className="text-white bg-indigo-600 px-3 py-1 rounded-md text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isLabelGenerating ? '...' : 'Label'}
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center p-8 text-text-muted">No orders have been placed yet.</p>}
        </div>
      </GlassmorphicCard>
    </div>
  );
};

export default AdminOrdersPage;
