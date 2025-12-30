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
  const { addOrder, createPaymentOrder, verifyPayment } = useOrders();
  const navigate = useNavigate();

  const canPayOnline = useMemo(
    () => cartItems.every(item => item.payment_modes?.includes('online') ?? true),
    [cartItems]
  );
  const canPayCOD = useMemo(
    () => cartItems.every(item => item.payment_modes?.includes('cod') ?? true),
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

  // ✅ Razorpay SDK auto loader
  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !user) {
      alert('Please select a delivery address');
      return;
    }

    if (!cartTotal || cartTotal <= 0) {
      alert('Invalid cart total');
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

      // 1️⃣ Create order in DB
      const newOrderId = await addOrder(orderPayload);

      if (paymentMethod === 'cod') {
        alert('Order placed successfully (COD)');
        clearCart();
        navigate('/orders');
        return;
      }

      // 2️⃣ Create Razorpay order (Supabase Edge Function)
      const rzpOrder = await createPaymentOrder(cartTotal);

      // 3️⃣ Load Razorpay SDK
      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 4️⃣ Open Razorpay popup
      const options = {
        key: RAZORPAY_LIVE_KEY_ID,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'VexoKart',
        description: `Order #${newOrderId}`,
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          try {
            const verified = await verifyPayment({
              orderId: newOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verified) {
              alert('Payment successful');
              clearCart();
              navigate('/orders');
            } else {
              alert('Payment verification failed');
              setIsProcessing(false);
            }
          } catch {
            alert('Verification error');
            setIsProcessing(false);
          }
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
      rzp.open();

    } catch (err: any) {
      console.error(err);
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
          <h2 className="text-xs font-black uppercase mb-4">
            Delivery Address
          </h2>

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
          <h2 className="text-xs font-black uppercase mb-4">
            Payment Method
          </h2>

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
            : `INITIALIZE SECURE PAYMENT ₹${cartTotal}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
