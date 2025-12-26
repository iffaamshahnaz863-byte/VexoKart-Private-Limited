
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import OrderTracker from '../components/OrderTracker';
import InvoiceModal from '../components/InvoiceModal';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [showInvoice, setShowInvoice] = useState(false);

  if (!id) {
    navigate('/orders');
    return null;
  }

  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-text-main">Order Not Found</h1>
        <button onClick={() => navigate('/orders')} className="mt-4 bg-accent text-white font-bold py-2 px-6 rounded-lg">
          Back to My Orders
        </button>
      </div>
    );
  }
  
  const { shippingAddress: address } = order;

  return (
    <div>
      {showInvoice && order && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      <div className="sticky top-0 z-10 p-4 bg-background flex items-center shadow-md">
        <button onClick={() => navigate('/orders')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-text-main" />
        </button>
        <h1 className="text-xl font-bold text-text-main">Order Details</h1>
      </div>

      <div className="p-4 space-y-4">
        <GlassmorphicCard className="p-4">
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-text-muted">Order ID</p>
              <p className="font-bold text-text-main">#{order.id}</p>
            </div>
             <div>
              <p className="text-text-muted text-right">Order Date</p>
              <p className="font-bold text-text-main">{new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>
        </GlassmorphicCard>

        <OrderTracker status={order.status} history={order.statusHistory} />

        {order.courierName && order.trackingId && (
            <GlassmorphicCard className="p-4">
                <h2 className="font-semibold text-lg mb-2 text-text-main">Tracking Information</h2>
                <div className="text-sm space-y-1">
                    <p><span className="text-text-muted w-24 inline-block">Courier:</span> <span className="font-bold text-text-main">{order.courierName}</span></p>
                    <p><span className="text-text-muted w-24 inline-block">Tracking ID:</span> <span className="font-bold text-text-main">{order.trackingId}</span></p>
                </div>
                <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(order.courierName + ' ' + order.trackingId + ' tracking')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center mt-3 bg-accent/10 border border-accent/50 text-accent font-bold py-2 rounded-xl hover:bg-accent/20 transition"
                >
                    Track on Courier Website
                </a>
            </GlassmorphicCard>
        )}
        
        <GlassmorphicCard className="p-4">
            <h2 className="font-semibold text-lg mb-2 text-text-main">Items in Order</h2>
            <div className="space-y-3">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 text-sm">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover bg-gray-700" />
                        <div className="flex-grow">
                            <p className="text-text-secondary font-semibold">{item.name}</p>
                            <p className="text-text-muted">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-text-secondary font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-4">
            <h2 className="font-semibold text-lg mb-2 text-text-main">Shipping Address</h2>
             <div className="text-text-secondary text-sm">
                <p className="font-bold text-text-main">{address.fullName}</p>
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>Phone: {address.phone}</p>
            </div>
        </GlassmorphicCard>

         <GlassmorphicCard className="p-4">
            <h2 className="font-semibold text-lg mb-2 text-text-main">Payment Summary</h2>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Payment Method:</span><span className="text-text-secondary">{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Subtotal:</span><span className="text-text-secondary">₹{order.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Shipping:</span><span className="text-text-secondary">₹0.00</span></div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between font-bold text-base"><span className="text-text-main">Total Paid:</span><span className="text-accent">₹{order.total.toFixed(2)}</span></div>
            </div>
             {order.paymentId && order.status !== 'Cancelled' && (
                <div className="mt-4 border-t border-gray-700/50 pt-3">
                    <button onClick={() => setShowInvoice(true)} className="w-full bg-accent/10 backdrop-blur-sm border border-accent/50 text-accent font-bold py-2 rounded-xl hover:bg-accent/20 transition">
                        View Invoice
                    </button>
                </div>
            )}
        </GlassmorphicCard>

      </div>
    </div>
  );
};

export default OrderDetailPage;