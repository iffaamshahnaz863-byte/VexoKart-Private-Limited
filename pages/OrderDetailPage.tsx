import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useProducts } from '../hooks/useProducts';
import { useReviews } from '../context/ReviewContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import OrderTracker from '../components/OrderTracker';
import RateProductModal from '../components/RateProductModal';
import InvoiceModal from '../components/InvoiceModal';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const { hasUserReviewedOrder } = useReviews();
  
  const [showRating, setShowRating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  const order = useMemo(() => id ? getOrderById(id) : null, [id, getOrderById]);

  useEffect(() => {
    const checkReview = async () => {
        if (id) {
            const result = await hasUserReviewedOrder(id);
            setAlreadyReviewed(result);
        }
    };
    checkReview();
  }, [id, showRating]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-black text-gray-800 uppercase italic">Order Missing</h1>
        <button onClick={() => navigate('/orders')} className="mt-6 text-accent font-bold border-b-2 border-accent pb-1 uppercase text-xs">View all orders</button>
      </div>
    );
  }

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const firstItem = order.items[0];
  const address = order.shippingAddress || order.shipping_address;

  // Bill Calculations
  const itemTotal = order.items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0);
  const deliveryFee = 0;
  const platformFee = 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans select-none overflow-x-hidden">
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      {showRating && <RateProductModal item={firstItem} orderId={order.id} onClose={() => setShowRating(false)} onSubmit={() => setAlreadyReviewed(true)} />}

      {/* Header */}
      <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-1 active:scale-90 transition-transform">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-base font-bold text-gray-800 uppercase tracking-tight italic">Order Details</h1>
        </div>
        <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 bg-white">
           <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <span className="text-[10px] font-black text-gray-600 uppercase">Help</span>
        </button>
      </div>

      {/* Success Banner */}
      {isDelivered && (
        <div className="bg-[#E7F7F0] px-4 py-3 flex items-center gap-3 border-b border-[#D1F7E6]">
           <div className="w-8 h-8 bg-[#34BE82] rounded-full flex items-center justify-center text-white font-bold text-lg">✓</div>
           <div>
              <p className="text-xs font-bold text-gray-800">Yay! Your order reached on time.</p>
              <p className="text-[10px] text-[#34BE82] font-bold">Verified Delivery</p>
           </div>
        </div>
      )}

      {/* Product Summary */}
      <div className="bg-white p-4 space-y-4 shadow-sm">
        <div className="flex gap-4">
          <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
             <img src={firstItem.image} alt="" className="w-full h-full object-contain" />
          </div>
          <div className="flex-grow min-w-0">
             <h3 className="text-sm font-bold text-gray-700 line-clamp-2 leading-snug uppercase tracking-tight italic">{firstItem.name}</h3>
             <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: {order.id.slice(0, 8)}</span>
             </div>
             <div className="mt-1.5 flex gap-2">
                 <span className="text-[9px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10 uppercase italic">{order.payment_mode}</span>
             </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
            <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 shadow-sm active:bg-gray-50">Exchange / Return</button>
            <button className="flex-1 py-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-700 shadow-sm active:bg-gray-50">Need Help?</button>
        </div>
      </div>

      {/* Rating Section */}
      {isDelivered && !alreadyReviewed && (
        <div className="mt-2 bg-white p-4 shadow-sm animate-in slide-in-from-top-4 duration-500">
           <h3 className="text-sm font-bold text-gray-800 mb-3">How was the product?</h3>
           <div className="flex flex-col items-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                   <button 
                    key={star} 
                    onClick={() => setShowRating(true)}
                    className="p-1 active:scale-90 transition-transform"
                   >
                     <svg className={`w-9 h-9 text-gray-200`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   </button>
                ))}
              </div>
              <div className="flex justify-between w-full px-6 mt-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                 <span>Very Bad</span>
                 <span>Bad</span>
                 <span>Ok-Ok</span>
                 <span>Good</span>
                 <span>Very Good</span>
              </div>
           </div>
           <button onClick={() => setShowRating(true)} className="w-full mt-4 text-center text-accent font-black text-[10px] uppercase tracking-[0.2em] italic">Write a detailed review</button>
        </div>
      )}

      {alreadyReviewed && (
        <div className="mt-2 bg-white p-4 shadow-sm">
           <div className="flex items-center gap-2 text-[#34BE82] bg-[#E7F7F0] p-4 rounded-2xl border border-[#D1F7E6]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <p className="text-xs font-bold uppercase tracking-tight italic">Feedback submitted successfully. Thank you!</p>
           </div>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="mt-2 bg-white p-4 shadow-sm">
         <h3 className="text-sm font-bold text-gray-800 mb-6">Order Status</h3>
         <OrderTracker status={order.status} history={order.statusHistory || order.status_history || []} />
      </div>

      {/* Address */}
      <div className="mt-2 bg-white p-4 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">Delivery Address</h3>
            <button className="text-accent text-[10px] font-black uppercase tracking-widest">Change</button>
         </div>
         <div className="space-y-1">
            <p className="text-sm font-black text-gray-800 uppercase italic tracking-tight">{address?.fullName}</p>
            <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
               {address?.street}<br/>
               {address?.city}, {address?.state} — {address?.zip}
            </p>
            <p className="pt-2 text-xs font-black text-gray-700 uppercase">Phone: {address?.phone}</p>
         </div>
      </div>

      {/* Bill Summary */}
      <div className="mt-2 bg-white p-4 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800">Payment Summary</h3>
            <button onClick={() => setShowInvoice(true)} className="text-accent text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               View Bill
            </button>
         </div>
         
         <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
               <span>Total Product Price</span>
               <span>₹{itemTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
               <span>Product Discount</span>
               <span className="text-green-600">- ₹0</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-tighter">
               <span>Delivery Fee</span>
               <span className="text-green-600">Free</span>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-end">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Order Total</span>
                  <span className="text-xl font-black text-gray-900 italic tracking-tighter">₹{order.total.toLocaleString()}</span>
               </div>
               <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                  <span className="text-[10px] font-black text-gray-600 uppercase italic">{order.payment_mode}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Meta */}
      <div className="p-8 text-center">
         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-300">VexoKart Fulfillment System • Secure Node</p>
      </div>
    </div>
  );
};

export default OrderDetailPage;