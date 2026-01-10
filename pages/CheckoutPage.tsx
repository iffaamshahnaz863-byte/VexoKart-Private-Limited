
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useVendors } from '../context/VendorContext';
import { useServiceAreas } from '../context/ServiceAreaContext';
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
  const { activePincodes } = useServiceAreas(); // Import service areas for validation
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  /* 
   * DYNAMIC BILLING LOGIC
   * Recalculates total based on real product.upi_discount data 
   * strictly when Online (UPI/Card) payment is selected.
   */
  const upiDiscountTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.upi_discount * item.quantity), 0);
  }, [cartItems]);

  const subtotal = paymentMethod === 'online' ? (cartTotal - upiDiscountTotal) : cartTotal;
  const gstAmount = Number((subtotal * GST_RATE).toFixed(2));
  const finalPayable = Number((subtotal + gstAmount).toFixed(2));
  const discountApplied = paymentMethod === 'online' ? upiDiscountTotal : 0;

  // Determine allowed payment methods based on cart contents
  const allowCodForCart = useMemo(() => {
    // True if NO item explicitly disables COD. Default to true if flag is missing.
    return !cartItems.some(item => item.is_cod_enabled === false);
  }, [cartItems]);

  const allowOnlineForCart = useMemo(() => {
    // True if NO item explicitly disables Online. Default to true if flag is missing.
    return !cartItems.some(item => item.is_online_enabled === false);
  }, [cartItems]);

  // Auto-switch payment method if current selection is invalid
  useEffect(() => {
    if (paymentMethod === 'cod' && !allowCodForCart) {
      setPaymentMethod('online');
    } else if (paymentMethod === 'online' && !allowOnlineForCart && allowCodForCart) {
      setPaymentMethod('cod');
    }
  }, [allowCodForCart, allowOnlineForCart, paymentMethod]);

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

    // --- DAILY NEEDS SERVICEABILITY CHECK ---
    const dailyNeedsItems = cartItems.filter(i => i.product_type === 'daily_needs');
    if (dailyNeedsItems.length > 0) {
        const deliveryPincode = String(selectedAddress.zip).trim();
        // Check strict match against active admin-enabled areas
        const isAllowed = activePincodes.includes(deliveryPincode);
        if (!isAllowed) {
            alert(`Unserviceable Area: We cannot deliver Daily Needs items to pincode ${deliveryPincode}. Please change address or remove these items.`);
            return;
        }
    }
    // ----------------------------------------

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
        if (!allowCodForCart) {
            alert("Cash on Delivery is not available for one or more items in your cart.");
            setIsProcessing(false);
            return;
        }

        const orderIdString = await addOrder({
          items: orderItems,
          subtotal: subtotal,
          gst_amount: gstAmount,
          total: finalPayable,
          discount_amount: 0, // No discount on COD
          shippingAddress: selectedAddress,
          payment_method: 'Cash on Delivery',
        });

        clearCart();
        navigate('/order-success', {
          state: { 
            orderId: String(orderIdString), 
            address: selectedAddress,
            paymentMethod: 'Cash on Delivery',
            totalAmount: finalPayable
          },
          replace: true
        });
        return;
      }

      /* 🟢 ONLINE PAYMENT FLOW */
      if (!allowOnlineForCart) {
          alert("Online Payment is not available for one or more items in your cart.");
          setIsProcessing(false);
          return;
      }

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
            subtotal: subtotal,
            gst_amount: gstAmount,
            total: finalPayable,
            discount_amount: discountApplied, // Store the UPI discount in DB
            shippingAddress: selectedAddress,
            payment_method: 'Online Payment',
            payment_id: response.razorpay_payment_id
          });

          clearCart();
          navigate('/order-success', {
            state: { 
              orderId: String(orderIdString), 
              address: selectedAddress,
              paymentMethod: 'Online Payment',
              totalAmount: finalPayable
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
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Checkout Hub</h1>
      </div>

      <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
        {/* Address Selector */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted tracking-[0.2em] italic">
            Fulfillment Destination
          </h2>
          {user?.addresses?.length ? (
             user.addresses.map(address => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer mb-3 transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-xs uppercase italic">{address.fullName}</p>
                        <p className="text-[10px] mt-1 text-text-secondary leading-relaxed uppercase tracking-tighter">
                            {address.street}<br/>
                            {address.city}, {address.state} — {address.zip}
                        </p>
                      </div>
                      {selectedAddress?.id === address.id && (
                          <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/20">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                      )}
                  </div>
                  <p className="text-[10px] font-black text-accent mt-2">
                    PH: {address.phone}
                  </p>
                </div>
              ))
          ) : (
            <button onClick={() => navigate('/addresses/new')} className="w-full py-5 border-2 border-dashed border-border rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest hover:border-accent/50 transition-all">Add Shipping Manifest</button>
          )}
        </GlassmorphicCard>

        {/* Payment Logic */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted tracking-[0.2em] italic">
            Settlement Method
          </h2>

          <div className="space-y-3">
            {/* ONLINE PAYMENT */}
            {allowOnlineForCart ? (
                <div
                    onClick={() => setPaymentMethod('online')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'online'
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-border hover:border-accent/20'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <div>
                            <span className="font-black text-xs uppercase italic block">UPI / Cards</span>
                            {upiDiscountTotal > 0 && (
                                <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 rounded uppercase tracking-tighter">Extra ₹{upiDiscountTotal} OFF</span>
                            )}
                        </div>
                    </div>
                    {paymentMethod === 'online' && <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-sm"></div>}
                </div>
            ) : (
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between opacity-60">
                    <span className="font-bold text-[10px] text-gray-400 uppercase italic">Digital Payment Restricted</span>
                </div>
            )}

            {/* CASH ON DELIVERY */}
            {allowCodForCart ? (
                <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                        paymentMethod === 'cod'
                        ? 'border-accent bg-accent/5 shadow-sm'
                        : 'border-border hover:border-accent/20'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <span className="font-black text-xs uppercase italic">Cash on Delivery</span>
                    </div>
                    {paymentMethod === 'cod' && <div className="w-4 h-4 bg-accent rounded-full border-2 border-white shadow-sm"></div>}
                </div>
            ) : (
                <div className="p-5 rounded-2xl border border-red-50 bg-red-50/30 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                         <span className="font-black text-[10px] text-red-500 uppercase italic">COD Restricted</span>
                         <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-[8px] text-red-400 font-bold uppercase tracking-widest italic leading-tight">Vendor has disabled COD for this product.</p>
                </div>
            )}
          </div>
        </GlassmorphicCard>

        {/* Financial Summary */}
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-6 text-text-muted tracking-[0.2em] italic border-b border-gray-50 pb-2">
            Pricing Intelligence
          </h2>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between font-bold text-gray-500 uppercase">
              <span>Bag Subtotal</span>
              <span className="text-gray-900">₹{cartTotal.toLocaleString()}</span>
            </div>
            
            {discountApplied > 0 && (
                <div className="flex justify-between font-black text-green-600 uppercase tracking-tight bg-green-50 px-2 py-1 rounded">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        UPI / Online Savings
                    </span>
                    <span>- ₹{discountApplied.toLocaleString()}</span>
                </div>
            )}

            <div className="flex justify-between font-bold text-gray-500 uppercase">
              <span>Tax (GST 18%)</span>
              <span className="text-gray-900">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-green-600 uppercase">
              <span>Shipping Fee</span>
              <span className="font-black tracking-widest italic">FREE</span>
            </div>
            <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-end">
              <span className="text-gray-900 font-black uppercase tracking-widest text-[10px] italic">Total Settlement</span>
              <span className="text-3xl font-black text-accent italic tracking-tighter leading-none">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Primary Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress || (!allowCodForCart && !allowOnlineForCart)}
          className="w-full bg-accent text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
        >
          {isProcessing
            ? 'Initializing Secure Session...'
            : (!allowCodForCart && !allowOnlineForCart)
            ? 'No Payment Methods Available'
            : paymentMethod === 'cod'
            ? `Confirm Order — ₹${finalPayable}`
            : `Secure Pay ₹${finalPayable}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
