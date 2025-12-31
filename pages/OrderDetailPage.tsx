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
import { OrderItem, PaymentStatus } from '../types';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus } = useOrders();
  const { getProduct } = useProducts();
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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
        <h1 className="text-2xl font-black text-text-main italic uppercase">Order Not Found</h1>
        <button
          onClick={() => navigate('/orders')}
          className="mt-6 bg-accent text-white font-black uppercase text-[10px] py-4 px-10 rounded-2xl shadow-xl shadow-accent/20"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const address = order.shippingAddress || order.shipping_address || null;
  const history = order.statusHistory || order.status_history || [];
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);
  const isCOD = order.payment_mode === 'Cash on Delivery';
  const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

  const handleCancelOrder = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel this order? This action cannot be undone.'
      )
    ) {
      setIsCancelling(true);
      setTimeout(() => {
        updateOrderStatus(order.id, 'Cancelled');
        setIsCancelling(false);
      }, 500);
    }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    setRatingItem(null);
    alert('Thank you for your feedback!');
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}

      {ratingItem && (
        <RateProductModal
          item={ratingItem}
          orderId={order.id}
          onClose={() => setRatingItem(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <div className="sticky top-0 z-20 p-4 bg-white/80 backdrop-blur-md flex items-center justify-between border-b border-border shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/orders')} className="p-2 -ml-2 mr-2 bg-surface rounded-full border border-border">
            <ChevronLeftIcon className="h-5 w-5 text-text-main" />
          </button>
          <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">
            Order Status
          </h1>
        </div>
        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:opacity-70 disabled:opacity-50"
          >
            {isCancelling ? 'Revoking...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
        {/* Settlement Summary */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Order Reference</p>
                    <p className="font-mono font-black text-xl text-text-main">#{order.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Order Total</p>
                    <p className="text-2xl font-black text-accent italic tracking-tighter">₹{order.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                <div>
                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Settlement Mode</p>
                    <p className="text-xs font-black text-text-main uppercase">{order.payment_mode}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Payment Status</p>
                    <p className={`text-xs font-black uppercase ${isCOD ? 'text-orange-500' : 'text-green-600'}`}>{paymentStatusText}</p>
                </div>
            </div>
            
            <button 
                onClick={() => setShowInvoice(true)}
                className="w-full mt-6 bg-surface border border-border text-text-main py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all shadow-sm"
            >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download Tax Invoice PDF
            </button>
        </GlassmorphicCard>

        {/* Shipping Address */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-surface rounded-xl flex items-center justify-center border border-border shadow-sm">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Dispatch Destination</h2>
          </div>

          {address ? (
            <div className="text-sm text-text-main space-y-1 bg-surface p-4 rounded-2xl border border-border">
              <p className="font-black italic uppercase text-xs">{address.fullName}</p>
              <p className="text-text-secondary font-bold uppercase tracking-tight leading-relaxed">
                {address.street}<br />
                {address.city}, {address.state} — {address.zip}
              </p>
              <div className="pt-2 border-t border-dashed border-border mt-2">
                 <p className="text-[10px] text-accent font-black uppercase italic">Contact: {address.phone}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-4 bg-red-50 rounded-2xl border border-red-100">Manifest data unavailable</p>
          )}
        </GlassmorphicCard>

        {/* Items List */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 border-b border-border pb-2">Order Manifest Items</h2>
             <div className="divide-y divide-gray-50">
                 {order.items.map((item, idx) => (
                     <div key={idx} className="py-4 flex gap-4 items-center">
                         <img src={item.image} className="w-16 h-16 rounded-xl object-cover border border-border bg-surface" alt={item.name} />
                         <div className="flex-grow min-w-0">
                             <p className="text-xs font-black text-text-main truncate uppercase italic">{item.name}</p>
                             <p className="text-[9px] font-black text-accent uppercase tracking-tighter mt-0.5 italic">Sold by: {item.vendorName || 'VexoKart Direct'}</p>
                             <div className="flex gap-3 mt-1">
                                 <p className="text-[10px] font-bold text-text-muted uppercase">Qty: {item.quantity}</p>
                                 {item.size && <p className="text-[10px] font-bold text-text-muted uppercase">Size: {item.size}</p>}
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-xs font-black text-text-main italic">₹{(item.price * item.quantity).toLocaleString()}</p>
                         </div>
                     </div>
                 ))}
             </div>
        </GlassmorphicCard>

        {/* Tracking */}
        <section>
          <div className="flex items-center gap-3 mb-4 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Fulfillment Progress</h2>
              <div className="h-px flex-grow bg-border"></div>
          </div>
          <OrderTracker status={order.status} history={history} />
        </section>
      </div>
    </div>
  );
};

export default OrderDetailPage;