import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import GlassmorphicCard from '../components/GlassmorphicCard.tsx';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon.tsx';
import { Address, OrderItem } from '../types.ts';

/**
 * PRODUCTION RAZORPAY KEY
 */
const RAZORPAY_LIVE_KEY_ID = 'rzp_live_RxmIholkGEOYaL';

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

    if (cartTotal <= 0) {
      alert('Invalid cart total');
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
      await addOrder({
        items: orderItems,
        total: cartTotal,
        shippingAddress: selectedAddress,
        payment_method: paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : 'Online Payment',
      });
      clearCart();
      navigate('/order-success');
    };

    try {
      // COD FLOW
      if (paymentMethod === 'cod') {
        await finalizeOrder();
        return;
      }

      // ONLINE PAYMENT FLOW
      if (!(window as any).Razorpay) {
        alert('Payment gateway not loaded');
        setIsProcessing(false);
        return;
      }

      const razorpayAmountPaise = Math.round(cartTotal * 100);

      const options = {
        key: RAZORPAY_LIVE_KEY_ID,
        amount: razorpayAmountPaise,
        currency: 'INR',
        name: 'VexoKart',
        description: 'Secure Order Payment',
        handler: async () => {
          await finalizeOrder();
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone,
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
        theme: { color: '#FF8A00' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (err: any) => {
        alert(err.error?.description || 'Payment failed');
        setIsProcessing(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error('[Checkout Error]', err);
      alert('Checkout failed');
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
        <GlassmorphicCard className="p-6 bg-white">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-4">
            Destination Identity
          </h2>
          {user?.addresses?.map(address => (
            <div
              key={address.id}
              onClick={() => setSelectedAddress(address)}
              className={`p-4 rounded-xl border-2 cursor-pointer mb-3 ${
                selectedAddress?.id === address.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border'
              }`}
            >
              <p className="font-black text-xs uppercase">{address.fullName}</p>
              <p className="text-[10px] mt-1">
                {address.street}, {address.city}, {address.state}
              </p>
              <p className="text-[10px] font-black text-accent mt-2">
                {address.phone}
              </p>
            </div>
          ))}
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-white">
          <h2 className="text-[10px] font-black uppercase tracking-widest mb-4">
            Settlement Channel
          </h2>

          <div className="space-y-3">
            <div
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 cursor-pointer ${
                paymentMethod === 'card'
                  ? 'border-accent bg-accent/5'
                  : 'border-border'
              }`}
            >
              Digital Settlement
            </div>

            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-xl border-2 cursor-pointer ${
                paymentMethod === 'cod'
                  ? 'border-accent bg-accent/5'
                  : 'border-border'
              }`}
            >
              Cash on Delivery
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress}
          className="w-full bg-accent text-white py-4 rounded-xl font-black uppercase"
        >
          {isProcessing
            ? 'Processing...'
            : paymentMethod === 'cod'
            ? 'Confirm Order (COD)'
            : `INITIALIZE SECURE PAYMENT ₹${cartTotal}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
