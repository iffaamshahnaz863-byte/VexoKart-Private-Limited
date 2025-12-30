import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import GlassmorphicCard from '../components/GlassmorphicCard.tsx';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon.tsx';
import { Address, OrderItem } from '../types.ts';

/**
 * PRODUCTION SECURE GATEWAY CONFIGURATION
 */
const RAZORPAY_LIVE_KEY_ID = 'rzp_live_RxmIholkGEOYaL';
const FIXED_PAYMENT_AMOUNT_PAISE = 2000; // ₹20.00

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user?.addresses?.length) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      alert('Please select delivery address');
      return;
    }

    setIsProcessing(true);

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images[0],
      vendorId: item.vendor_id,
      color: item.selectedColor,
      size: item.selectedSize,
    }));

    const finalizeOrder = async () => {
      const orderPayload = {
        items: orderItems,
        total: cartTotal,
        shippingAddress: selectedAddress,
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
      };
      await addOrder(orderPayload);
      clearCart();
      navigate('/order-success', { state: { address: selectedAddress } });
    };

    try {
      if (paymentMethod === 'cod') {
        await finalizeOrder();
        return;
      }

      // NATIVE RAZORPAY INTEGRATION (LIVE)
      if (!(window as any).Razorpay) {
        alert("Payment gateway not loaded. Please check your connection.");
        setIsProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_LIVE_KEY_ID,
        amount: FIXED_PAYMENT_AMOUNT_PAISE,
        currency: 'INR',
        name: 'VexoKart Premium',
        description: 'Secure Order Settlement',
        image: 'https://ghzadiplpazekzgjbdxu.supabase.co/storage/v1/object/public/assets/logo-icon.png',
        handler: async (response: any) => {
          // ON SUCCESS: Proceed with local order creation
          await finalizeOrder();
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone,
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        theme: { color: '#FF8A00' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (err: any) => {
        alert(`Payment failed: ${err.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('[Checkout Error]', err);
      alert(err.message || 'Checkout failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="sticky top-0 z-10 p-4 bg-white flex items-center border-b">
        <button onClick={() => navigate('/cart')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tight">Checkout</h1>
      </div>

      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Destination Identity</h2>
          {user?.addresses?.map(address => (
            <div
              key={address.id}
              onClick={() => setSelectedAddress(address)}
              className={`p-4 rounded-2xl border-2 cursor-pointer mb-3 transition-all ${
                selectedAddress?.id === address.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface'
              }`}
            >
              <p className="font-black text-text-main text-xs uppercase italic">{address.fullName}</p>
              <p className="text-[10px] text-text-secondary mt-1 font-medium">
                {address.street}, {address.city}, {address.state}
              </p>
              <p className="text-[10px] font-black text-accent mt-2 uppercase">{address.phone}</p>
            </div>
          ))}
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Settlement Channel</h2>
          <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'card' ? 'border-accent bg-accent/5' : 'border-border bg-surface'
                }`}
              >
                <div>
                  <p className="font-bold text-text-main text-xs uppercase tracking-tight">Digital Settlement</p>
                  <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Secure UPI, Cards, NetBanking</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-accent' : 'border-border'}`}>
                    {paymentMethod === 'card' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'cod' ? 'border-accent bg-accent/5' : 'border-border bg-surface'
                }`}
              >
                <div>
                  <p className="font-bold text-text-main text-xs uppercase tracking-tight">Cash on Delivery</p>
                  <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Settle with Handover Agent</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-accent' : 'border-border'}`}>
                    {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>}
                </div>
              </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-border z-20">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress}
          className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessing
            ? 'Synchronizing Secure Layers...'
            : paymentMethod === 'cod'
            ? 'Confirm Order (COD)'
            : `INITIALIZE SECURE PAYMENT ₹20`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;