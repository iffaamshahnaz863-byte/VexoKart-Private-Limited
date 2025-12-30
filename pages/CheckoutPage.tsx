import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNotifications } from '../context/NotificationContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { Address, OrderItem } from '../types';

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder, createPaymentOrder, verifyPayment, updateOrderStatus } = useOrders();
  const navigate = useNavigate();
  
  const canPayOnline = useMemo(() => cartItems.every(item => item.payment_modes?.includes('online') ?? true), [cartItems]);
  const canPayCOD = useMemo(() => cartItems.every(item => item.payment_modes?.includes('cod') ?? true), [cartItems]);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>(canPayOnline ? 'card' : 'cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) {
      alert("Please select a shipping address.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const orderItems: OrderItem[] = cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images[0],
          vendorId: item.vendor_id
      }));

      const orderPayload = {
          items: orderItems,
          total: cartTotal,
          shippingAddress: selectedAddress,
          payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'
      };

      const newOrderId = await addOrder(orderPayload);

      if (paymentMethod === 'cod') {
        alert("Order Placed Successfully!");
        clearCart();
        navigate('/orders');
        return;
      }

      // Online Payment Flow via Edge Function
      const razorpayOrderId = await createPaymentOrder(newOrderId, cartTotal);

      const options = {
        key: 'rzp_live_PLACEHOLDER', // In production, this would be fetched from Edge Function or Env
        amount: Math.round(cartTotal * 100),
        currency: 'INR',
        name: 'VexoKart',
        description: `Order #${newOrderId}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          const success = await verifyPayment({
            orderId: newOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          
          if (success) {
            alert("Payment Verified! Your order is confirmed.");
            clearCart();
            navigate('/orders');
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone,
        },
        theme: { color: '#FF8A00' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to process order.");
      setIsProcessing(false);
    }
  };

  const addresses = (user?.addresses && Array.isArray(user.addresses)) ? user.addresses : [];

  return (
    <div className="bg-surface min-h-screen">
      <div className="sticky top-0 z-10 p-4 bg-white/80 backdrop-blur-md flex items-center border-b border-border shadow-sm">
        <button onClick={() => navigate('/cart')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6 text-text-main" />
        </button>
        <h1 className="text-xl font-black text-text-main italic tracking-tight uppercase">Checkout</h1>
      </div>

      <div className="p-4 space-y-6 pb-24 max-w-2xl mx-auto">
        <GlassmorphicCard className="p-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Delivery Identity</h2>
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  onClick={() => setSelectedAddress(address)} 
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddress?.id === address.id ? 'border-accent bg-accent/5' : 'border-border bg-white hover:border-accent/30'}`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-text-main">{address.fullName}</p>
                    {selectedAddress?.id === address.id && (
                        <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{address.street}, {address.city}, {address.state} {address.zip}</p>
                  <p className="text-[10px] font-bold text-accent mt-2 uppercase tracking-widest">{address.phone}</p>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-6 bg-surface rounded-xl border border-dashed border-border">
                <p className="text-text-muted text-xs font-bold italic uppercase">No shipping destinations found</p>
             </div>
          )}
          <button onClick={() => navigate('/addresses/new')} className="w-full mt-4 text-accent text-[10px] font-black uppercase tracking-widest border border-accent/20 py-3 rounded-xl hover:bg-accent/5 transition-all">
            Add New Destination
          </button>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Payment Method</h2>
          <div className="grid grid-cols-1 gap-3">
              {canPayOnline && (
                  <div 
                      onClick={() => setPaymentMethod('card')} 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'card' ? 'border-accent bg-accent/5' : 'border-border bg-white'}`}
                  >
                      <div>
                          <p className="font-bold text-text-main">Digital Transaction</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">UPI, Card, NetBanking</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-accent' : 'border-border'}`}>
                          {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                      </div>
                  </div>
              )}
              {canPayCOD && (
                  <div 
                      onClick={() => setPaymentMethod('cod')} 
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-border bg-white'}`}
                  >
                      <div>
                          <p className="font-bold text-text-main">Cash On Delivery</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Pay at doorstep</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-accent' : 'border-border'}`}>
                          {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                      </div>
                  </div>
              )}
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Final Summary</h2>
          <div className="space-y-3">
            {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-xs font-bold">
                    <span className="text-text-secondary truncate pr-4">{item.name} <span className="text-accent">x{item.quantity}</span></span>
                    <span className="text-text-main shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
            ))}
          </div>
          <div className="border-t border-dashed border-border my-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Net Total</span>
            <span className="text-2xl font-black text-text-main italic tracking-tighter">₹{cartTotal.toLocaleString()}</span>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-border z-20">
        <button 
          onClick={handlePlaceOrder} 
          disabled={isProcessing || !selectedAddress}
          className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50" 
        >
          {isProcessing ? 'Processing Transaction...' : paymentMethod === 'cod' ? `Finalize Order (COD)` : `Pay Securely ₹${cartTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;