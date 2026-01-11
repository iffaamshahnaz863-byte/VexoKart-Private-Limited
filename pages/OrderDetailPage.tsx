
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useReviews } from '../context/ReviewContext';
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
    if (id) hasUserReviewedOrder(id).then(setAlreadyReviewed);
  }, [id, showRating]);

  if (!order) return null;

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const isCancellable = ['Placed', 'Confirmed', 'Packed'].includes(order.status);
  const firstItem = order.items[0];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      {showInvoice && <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />}
      {showRating && <RateProductModal item={firstItem} orderId={order.id} onClose={() => setShowRating(false)} onSubmit={() => setAlreadyReviewed(true)} />}

      <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-1"><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
          <h1 className="text-base font-bold text-gray-800 uppercase tracking-tight italic">Order Hub</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Tracker */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
            <OrderTracker status={order.status} history={order.status_history || []} />
        </div>

        {/* Item Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex gap-4">
                <img src={firstItem.image} className="w-20 h-20 rounded-2xl object-contain bg-gray-50 border border-gray-100" />
                <div>
                    <h3 className="text-sm font-black text-gray-800 uppercase italic leading-tight">{firstItem.name}</h3>
                    <p className="text-[10px] font-bold text-accent mt-1 uppercase tracking-widest">{order.payment_mode}</p>
                    <p className="text-xl font-black text-gray-900 mt-2">₹{order.total.toLocaleString()}</p>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-3">
                {isCancellable && (
                    <button 
                        onClick={() => navigate(`/cancel-order/${order.id}`)}
                        className="w-full py-4 border-2 border-red-100 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] active:bg-red-50 transition-all"
                    >Cancel Order</button>
                )}
                {!isCancelled && (
                    <button onClick={() => setShowInvoice(true)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">Download Invoice</button>
                )}
            </div>
        </div>

        {isCancelled && order.cancellation_reason && (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                <p className="text-[10px] font-black uppercase text-red-400 mb-1">Cancellation Logic</p>
                <p className="text-xs font-bold text-red-600 italic">"Reason: {order.cancellation_reason}"</p>
            </div>
        )}

        {/* Address */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 italic">Fulfillment Node</h3>
            <p className="text-sm font-black text-gray-800 uppercase italic">{order.shippingAddress?.fullName}</p>
            <p className="text-xs font-bold text-gray-500 leading-relaxed mt-1 uppercase tracking-tighter">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zip}
            </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
