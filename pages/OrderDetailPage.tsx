
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import OrderTracker from '../components/OrderTracker';
import InvoiceModal from '../components/InvoiceModal';
import RateProductModal from '../components/RateProductModal';
import { OrderItem } from '../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus } = useOrders();
  const { getProduct, addReview } = useProducts();
  const { user } = useAuth();
  
  const [showInvoice, setShowInvoice] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [ratingItem, setRatingItem] = useState<OrderItem | null>(null);

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

  const handleCancelOrder = () => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setIsCancelling(true);
      setTimeout(() => {
        updateOrderStatus(order.id, 'Cancelled');
        setIsCancelling(false);
      }, 500);
    }
  };
  
  const handleReviewSubmit = (rating: number, comment: string) => {
    if (ratingItem && user) {
      // FIX: Removed 'productId' from the review object as it's not part of the Review type.
      // The productId is already passed as the first argument to addReview.
      addReview(ratingItem.id, {
        userId: user.email,
        orderId: order.id,
        author: user.name,
        rating,
        comment
      });
      setRatingItem(null);
      alert("Thank you for your review!");
    }
  };

  const isReviewed = (productId: number) => {
    const product = getProduct(productId);
    return product?.reviews.some(r => r.orderId === order.id && r.userId === user?.email);
  };
  
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);
  const isDelivered = order.status === 'Delivered';
  const { shippingAddress: address } = order;

  return (
    <div className="min-h-screen bg-background pb-12">
      {showInvoice && order && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      
      {ratingItem && (
        <RateProductModal 
          item={ratingItem} 
          orderId={order.id} 
          onClose={() => setRatingItem(null)} 
          onSubmit={handleReviewSubmit} 
        />
      )}

      <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
        <div className="flex items-center">
          <button onClick={() => navigate('/orders')} className="p-2 -ml-2 mr-2">
              <ChevronLeftIcon className="h-6 w-6 text-text-main" />
          </button>
          <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">Order Details</h1>
        </div>
        {canCancel && (
          <button 
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {isCancelling ? 'Processing...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <GlassmorphicCard className="p-4 border-accent/20">
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Receipt ID</p>
              <p className="font-bold text-text-main font-mono">#{order.id}</p>
            </div>
             <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted text-right mb-1">Placed On</p>
              <p className="font-bold text-text-main">{new Date(order.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </GlassmorphicCard>

        <section>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 ml-1">Live Tracking</h2>
          <OrderTracker status={order.status} history={order.statusHistory} />
        </section>

        {order.status !== 'Cancelled' && order.courierName && order.trackingId && (
            <GlassmorphicCard className="p-4 border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="font-bold text-text-main tracking-tight italic">Shipment Dispatched</h2>
                </div>
                <div className="text-sm space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Courier Partner</span>
                      <span className="font-bold text-text-main uppercase tracking-tight">{order.courierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Tracking Reference</span>
                      <span className="font-bold text-accent font-mono">{order.trackingId}</span>
                    </div>
                </div>
                <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(order.courierName + ' ' + order.trackingId + ' tracking')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-accent text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl shadow-lg shadow-accent/20 hover:-translate-y-0.5 transition-all"
                >
                    Track Package
                </a>
            </GlassmorphicCard>
        )}
        
        <GlassmorphicCard className="p-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 border-b border-white/5 pb-2">Order Items</h2>
            <div className="space-y-6">
                {order.items.map(item => (
                    <div key={item.id} className="flex flex-col gap-4">
                      <div className="flex items-center space-x-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-surface border border-white/5 shadow-inner" />
                          <div className="flex-grow min-w-0">
                              <p className="text-text-main font-bold truncate tracking-tight">{item.name}</p>
                              <p className="text-xs text-text-muted">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-text-main font-black italic">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      {isDelivered && (
                        <div className="flex justify-end">
                          {isReviewed(item.id) ? (
                            <span className="text-[9px] font-black uppercase text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20 flex items-center gap-2">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                              Feedback Received
                            </span>
                          ) : (
                            <button 
                              onClick={() => setRatingItem(item)}
                              className="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-4 py-2 rounded-xl hover:bg-accent hover:text-white transition-all active:scale-95"
                            >
                              Rate Experience
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                ))}
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Payment Type</span><span className="text-text-main font-bold">{order.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Address Detail</span><span className="text-text-main text-right font-medium max-w-[200px] truncate">{address.fullName}, {address.city}</span></div>
                <div className="flex justify-between pt-2"><span className="text-text-main font-black uppercase tracking-widest text-[11px]">Final Total</span><span className="text-accent font-black text-lg italic">₹{order.total.toFixed(2)}</span></div>
            </div>

            {order.paymentId && order.status !== 'Cancelled' && (
                <div className="mt-4 pt-4 border-t border-white/5">
                    <button onClick={() => setShowInvoice(true)} className="w-full bg-surface border border-white/10 text-text-main font-black uppercase tracking-widest text-[10px] py-3 rounded-xl hover:bg-white/5 transition">
                        View Digital Invoice
                    </button>
                </div>
            )}
        </GlassmorphicCard>

      </div>
    </div>
  );
};

export default OrderDetailPage;
