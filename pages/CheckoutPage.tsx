import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useVendors } from '../context/VendorContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { Address, OrderItem } from '../types';

/* 🔐 Razorpay Live Key */
const RAZORPAY_LIVE_KEY_ID = 'rzp_live_RxmIholkGEOYaL';

/* 🇮🇳 GST Rate */
const GST_RATE = 0.18;

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const { vendors, refreshVendors } = useVendors();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  /* 🚫 PAYMENT RESTRICTION LOGIC */
  const allowCodForCart = useMemo(() => {
    // If any item restricts COD, we must disable it for the whole order
    return cartItems.every(item => item.allow_cod !== false);
  }, [cartItems]);

  const allowOnlineForCart = useMemo(() => {
    // If any item restricts Online, we must disable it for the whole order
    return cartItems.every(item => item.allow_online !== false);
  }, [cartItems]);

  // Adjust selection if current becomes invalid
  useEffect(() => {
    if (paymentMethod === 'cod' && !allowCodForCart) {
      setPaymentMethod('card');
    } else if (paymentMethod === 'card' && !allowOnlineForCart) {
      setPaymentMethod('cod');
    }
  }, [allowCodForCart, allowOnlineForCart]);

  /* ✅ Precise Calculations */
  const gstAmount = Number((cartTotal * GST_RATE).toFixed(2));
  const finalPayable = Number((cartTotal + gstAmount).toFixed(2));

  useEffect(() => {
    if (user?.addresses?.length) {
      setSelectedAddress(user.addresses[0]);
    }
    if (vendors.length === 0) {
      refreshVendors();
    }
  }, [user, vendors.length, refreshVendors]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      alert('Please select delivery address');
      return;
    }

    if (finalPayable <= 0) {
      alert('Invalid order amount');
      return;
    }

    setIsProcessing(true);

    const orderItems: OrderItem[] = cartItems.map(item => {
      const vendor = vendors.find(v => String(v.id) === String(item.vendor_id));
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images[0],
        vendor_id: String(item.vendor_id),
        vendor_name: vendor?.store_name || (item.vendor_id === 'vexokart_direct' ? 'VexoKart Direct' : 'Unknown Seller'),
        color: item.selectedColor,
        size: item.selectedSize,
      };
    });

    try {
      /* 🟢 CASH ON DELIVERY FLOW */
      if (paymentMethod === 'cod') {
        const orderIdString = await addOrder({
          items: orderItems,
          subtotal: cartTotal,
          gst_amount: gstAmount,
          total: finalPayable,
          shippingAddress: selectedAddress,
          payment_method: 'Cash on Delivery',
        });

        clearCart();
        navigate('/order-success', {
          state: { 
            orderId: String(orderIdString), 
            address: selectedAddress 
          },
          replace: true
        });
        return;
      }

      /* 🟢 ONLINE PAYMENT FLOW */
      if (!(window as any).Razorpay) {
        alert('Payment gateway not loaded. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const razorpayAmountPaise = Math.round(finalPayable * 100);

      const options = {
        key: RAZORPAY_LIVE_KEY_ID,
        amount: razorpayAmountPaise,
        currency: 'INR',
        name: 'VexoKart',
        description: 'Secured Checkout Payment',
        image: 'https://ghzadiplpazekzgjbdxu.supabase.co/storage/v1/object/public/assets/logo.png',
        handler: async (response: any) => {
          const orderIdString = await addOrder({
            items: orderItems,
            subtotal: cartTotal,
            gst_amount: gstAmount,
            total: finalPayable,
            shippingAddress: selectedAddress,
            payment_method: 'Online Payment',
            payment_id: response.razorpay_payment_id
          });

          clearCart();
          navigate('/order-success', {
            state: { 
              orderId: String(orderIdString), 
              address: selectedAddress 
            },
            replace: true
          });
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: selectedAddress.phone,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: false,
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All Secure Methods',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'netbanking' }
                ],
              },
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
          escape: false,
          backdropclose: false
        },
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300,
        theme: { color: '#FF8A00' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (err: any) => {
        console.error('[Razorpay Failed]', err);
        alert(err.error?.description || 'Payment failed or declined. Please try another card or UPI.');
        setIsProcessing(false);
      });

      rzp.open();

    } catch (err) {
      console.error('[Checkout Critical Error]', err);
      alert('Order placement encountered a problem. Please contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-white flex items-center border-b shadow-sm">
        <button onClick={() => navigate('/cart')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black uppercase italic">Checkout</h1>
      </div>

      <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
        {/* Address */}
        <GlassmorphicCard className="p-6 bg-white">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted">
            Delivery Destination
          </h2>
          {user?.addresses?.length ? (
             user.addresses.map(address => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`p-4 rounded-xl border-2 cursor-pointer mb-3 transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-xs uppercase">{address.fullName}</p>
                        <p className="text-[10px] mt-1 text-text-secondary leading-relaxed uppercase tracking-tighter">
                            {address.street}<br/>
                            {address.city}, {address.state} — {address.zip}
                        </p>
                      </div>
                      {selectedAddress?.id === address.id && (
                          <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                      )}
                  </div>
                  <p className="text-[10px] font-black text-accent mt-2">
                    {address.phone}
                  </p>
                </div>
              ))
          ) : (
            <button onClick={() => navigate('/addresses/new')} className="w-full py-4 border-2 border-dashed border-border rounded-xl text-xs font-bold text-text-muted uppercase">Add Shipping Address</button>
          )}
        </GlassmorphicCard>

        {/* Payment */}
        <GlassmorphicCard className="p-6 bg-white">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted">
            Select Payment Method
          </h2>

          <div className="space-y-3">
            {allowOnlineForCart ? (
                <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'card'
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/20'
                    }`}
                >
                    <span className="font-bold text-sm">Online Payment (UPI / Cards)</span>
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between opacity-60">
                    <span className="font-bold text-sm text-gray-400 italic">Online Payment Unavailable for this Selection</span>
                </div>
            )}

            {allowCodForCart ? (
                <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'cod'
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/20'
                    }`}
                >
                    <span className="font-bold text-sm">Cash on Delivery</span>
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
            ) : (
                <div className="p-4 rounded-xl border border-red-50 bg-red-50/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                         <span className="font-bold text-sm text-red-400">COD Restricted for some items</span>
                         <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest italic">Please pay online to complete this order.</p>
                </div>
            )}
          </div>
        </GlassmorphicCard>

        {/* Summary */}
        <GlassmorphicCard className="p-6 bg-white">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted border-b pb-2">
            Pricing Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Bag Subtotal</span>
              <span className="font-bold text-text-main">₹{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>GST (18%)</span>
              <span className="font-bold text-text-main">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Shipping Fee</span>
              <span className="font-bold text-green-600 uppercase text-[10px]">Free</span>
            </div>
            <div className="pt-3 border-t border-dashed flex justify-between items-end">
              <span className="text-text-main font-black uppercase tracking-widest text-xs">Total Payable</span>
              <span className="text-2xl font-black text-accent italic tracking-tighter">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-border z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress || (!allowCodForCart && !allowOnlineForCart)}
          className="w-full bg-accent text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isProcessing
            ? 'Establishing Secure Session...'
            : paymentMethod === 'cod'
            ? `Confirm Order — ₹${finalPayable}`
            : `Pay Secured ₹${finalPayable} (Incl. GST)`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;