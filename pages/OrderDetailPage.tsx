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

const getPaymentStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case 'paid':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'cod_pending':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'failed':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

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
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold text-text-main">Order Not Found</h1>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 bg-accent text-white font-bold py-2 px-6 rounded-lg"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  /* 🔥 FINAL ADDRESS FIX 🔥 */
  const address =
    order.shippingaddress ||
    order.shippingAddress ||
    order.shipping_address ||
    null;

  const history = order.statusHistory || order.status_history || [];
  const canCancel = ['Placed', 'Confirmed'].includes(order.status);
  const isDelivered = order.status === 'Delivered';

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

  const isReviewed = (productId: number) => {
    const product = getProduct(productId);
    return product?.reviews?.some(
      (r) => r.orderId === order.id && r.userId === user?.email
    );
  };

  return (
    <div className="min-h-screen bg-background pb-12">
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

      <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-xl flex items-center justify-between border-b border-white/5">
        <div className="flex items-center">
          <button onClick={() => navigate('/orders')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-text-main" />
          </button>
          <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">
            Order Details
          </h1>
        </div>
        {canCancel && (
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 disabled:opacity-50"
          >
            {isCancelling ? 'Processing...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <GlassmorphicCard className="p-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4 border-b border-white/5 pb-2">
            Shipping Address
          </h2>

          {address ? (
            <div className="text-sm text-text-main space-y-1">
              <p className="font-bold">{address.fullName}</p>
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state}
              </p>
              <p>{address.zip}</p>
              <p className="text-text-muted">Phone: {address.phone}</p>
            </div>
          ) : (
            <p className="text-red-400 text-sm font-bold">Address not available</p>
          )}
        </GlassmorphicCard>

        <section>
          <OrderTracker status={order.status} history={history} />
        </section>
      </div>
    </div>
  );
};

export default OrderDetailPage;
