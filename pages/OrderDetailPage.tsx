
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

  const address = order.shipping_address || order.shippingaddress || order.address || null;
  const history = order.statusHistory || order.status_history || [];
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);
  const isCOD = order.payment_mode === 'Cash on Delivery';
  const paymentStatusText = isCOD ? 'Payment Pending (COD)' : 'Paid';

  const handleCancelOrder = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      setIsCancelling(true);
      updateOrderStatus(order.id, 'Cancelled').finally(() => setIsCancelling(false));
    }
  };

  const handleReviewSubmit = (rating: number, comment: string) => {
    setRatingItem(null);
    alert('Feedback submitted!');
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      {ratingItem && <RateProductModal item={ratingItem} orderId={order.id} onClose={() => setRatingItem(null)} onSubmit={handleReviewSubmit} />}

      <div className="sticky top-0 z-20 p-4 bg-white/80 backdrop-blur-md flex items-center justify-between border-b border-border shadow-sm">
        <div className="flex items-center">
          <button onClick={() => navigate('/orders')} className="p-2 -ml-2 mr-2 bg-surface rounded-full border border-border">
            <ChevronLeftIcon className="h-5 w-5 text-text-main" />
          </button>
          <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">Manifest #{order.id}</h1>
        </div>
        {canCancel && (
          <button onClick={handleCancelOrder} disabled={isCancelling} className="text-[10px] font-black uppercase tracking-widest text-red-500 disabled:opacity-50">
            {isCancelling ? 'Processing...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
        {/* Logistics Tracking Card */}
        {order.awb_code && (
            <GlassmorphicCard className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Logistics Partner</p>
                        <h2 className="text-xl font-black italic uppercase">{order.courier_name || 'VexoKart Express'}</h2>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V14a1 1 0 01-1 1h-1m-1 0a1 1 0 10-2 0m-5 0a1 1 0 10-2 0" /></svg>
                    </div>
                </div>
                
                <div className="space-y-4">
                    <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Air Waybill Number</span>
                            <button 
                                onClick={() => { navigator.clipboard.writeText(order.awb_code); alert('AWB Copied'); }}
                                className="text-[8px] font-black uppercase bg-white/10 px-2 py-1 rounded"
                            >Copy</button>
                        </div>
                        <p className="text-lg font-mono font-black tracking-widest mt-1">{order.awb_code}</p>
                    </div>
                    
                    {order.tracking_url && (
                        <a 
                            href={order.tracking_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-white text-indigo-700 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                        >
                            Track Live Progress
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </a>
                    )}
                </div>
            </GlassmorphicCard>
        )}

        {/* Settlement Summary */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Order Ref</p>
                    <p className="font-mono font-black text-xl text-text-main">#{order.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Payable</p>
                    <p className="text-2xl font-black text-accent italic tracking-tighter">₹{order.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                <div>
                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Mode</p>
                    <p className="text-xs font-black text-text-main uppercase">{order.payment_mode}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-text-muted tracking-widest mb-1">Status</p>
                    <p className={`text-xs font-black uppercase ${isCOD ? 'text-orange-500' : 'text-green-600'}`}>{paymentStatusText}</p>
                </div>
            </div>
            
            <button 
                onClick={() => setShowInvoice(true)}
                className="w-full mt-6 bg-surface border border-border text-text-main py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all"
            >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Tax Invoice PDF
            </button>
        </GlassmorphicCard>

        {/* Shipping Destination */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-surface rounded-xl flex items-center justify-center border border-border">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Delivery Address</h2>
          </div>

          {address ? (
            <div className="text-sm text-text-main space-y-1 bg-surface p-4 rounded-2xl border border-border">
              <p className="font-black italic uppercase text-xs">{address.fullName}</p>
              <p className="text-text-secondary font-bold uppercase tracking-tight leading-relaxed">
                {address.street}<br />
                {address.city}, {address.state} — {address.zip}
              </p>
              <div className="pt-2 border-t border-dashed border-border mt-2">
                 <p className="text-[10px] text-accent font-black uppercase italic">Mobile: {address.phone}</p>
              </div>
            </div>
          ) : (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-4 bg-red-50 rounded-2xl border border-red-100">Manifest data unavailable</p>
          )}
        </GlassmorphicCard>

        {/* Fulfillment Pipeline */}
        <section>
          <div className="flex items-center gap-3 mb-4 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Shipment Pipeline</h2>
              <div className="h-px flex-grow bg-border"></div>
          </div>
          <OrderTracker status={order.status} history={history} />
        </section>
      </div>
    </div>
  );
};

export default OrderDetailPage;
