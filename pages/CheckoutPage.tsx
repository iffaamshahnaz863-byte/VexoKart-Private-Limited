import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { Address, OrderItem } from '../types';

const RAZORPAY_LIVE_KEY_ID = 'rzp_live_RxmIholkGEOYaL';

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder, createPaymentOrder } = useOrders();
  const navigate = useNavigate();

  const canPayOnline = useMemo(
    () => cartItems.every(i => i.payment_modes?.includes('online') ?? true),
    [cartItems]
  );
  const canPayCOD = useMemo(
    () => cartItems.every(i => i.payment_modes?.includes('cod') ?? true),
    [cartItems]
  );

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>(
    canPayOnline ? 'card' : 'cod'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user?.addresses?.length) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  // Razorpay SDK loader
  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      alert('Please select delivery address');
      return;
    }

    if (!cartTotal || cartTotal <= 0) {
      alert('Invalid order amount');
      return;
    }

    setIsProcessing(true);

    // Prepare order payload (BUT DO NOT CREATE ORDER YET)
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

    const orderPayload = {
      items: orderItems,
      total: cartTotal,
      shippingAddress: selectedAddress,
      payment_method:
        paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
    };

    try {
      // 🟢 COD FLOW → ORDER DIRECT
      if (paymentMethod === 'cod') {
        await addOrder(orderPayload);
        alert('Order placed successfully (COD)');
        clearCart();
        navigate('/orders');
        return;
      }

      // 🟢 ONLINE PAYMENT FLOW
      const rzpOrder = await createPaymentOrder(cartTotal);

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const options = {
        key: RAZORPAY_LIVE_KEY_ID,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'VexoKart',
        description: 'Secure Online Payment',
        order_id: rzpOrder.id,

        handler: async () => {
          // ✅ PAYMENT SUCCESS → NOW CREATE ORDER
          await addOrder(orderPayload);

          alert('✅ Payment successful! Order confirmed.');
          clearCart();
          navigate('/orders');
        },

        modal: {
          ondismiss: () => {
            // ❌ PAYMENT CANCELLED → NO ORDER CREATED
            setIsProcessing(false);
          },
        },

        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone,
        },

        theme: { color: '#FF8A00' },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', () => {
        // ❌ PAYMENT FAILED → NO ORDER CREATED
        alert('Payment failed. Order not placed.');
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
        <h1 className="text-xl font-black uppercase">Checkout</h1>
      </div>

      <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
        <GlassmorphicCard className="p-6">
          <h2 className="text-xs font-black uppercase mb-4">Delivery Address</h2>
          {user?.addresses?.map(address => (
            <div
              key={address.id}
              onClick={() => setSelectedAddress(address)}
              className={`p-4 rounded-xl border-2 cursor-pointer mb-2 ${
                selectedAddress?.id === address.id
                  ? 'border-accent'
                  : 'border-border'
              }`}
            >
              <p className="font-bold">{address.fullName}</p>
              <p className="text-xs">
                {address.street}, {address.city}, {address.state}
              </p>
              <p className="text-xs font-bold">{address.phone}</p>
            </div>
          ))}
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6">
          <h2 className="text-xs font-black uppercase mb-4">Payment Method</h2>

          {canPayOnline && (
            <div
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 cursor-pointer mb-2 ${
                paymentMethod === 'card'
                  ? 'border-accent'
                  : 'border-border'
              }`}
            >
              Online Payment (UPI / Card)
            </div>
          )}

          {canPayCOD && (
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-xl border-2 cursor-pointer ${
                paymentMethod === 'cod'
                  ? 'border-accent'
                  : 'border-border'
              }`}
            >
              Cash on Delivery
            </div>
          )}
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
            : `PAY ₹${cartTotal}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
