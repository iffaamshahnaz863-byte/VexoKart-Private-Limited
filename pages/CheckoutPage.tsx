
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { Address, OrderItem } from '../types';

const SHIPPING_FEE = 0; // Free shipping

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' }});
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const subtotal = cartTotal;
  const finalPayable = subtotal + SHIPPING_FEE;

  useEffect(() => {
    if (user?.addresses?.length) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }

    if (finalPayable <= 0) {
      alert('Invalid order amount.');
      return;
    }

    setIsProcessing(true);

    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: String(item.id),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.images[0],
    }));

    try {
      const orderIdString = await addOrder({
        user_id: user.auth_uid,
        items: orderItems,
        shipping_address: selectedAddress,
        full_name: selectedAddress.fullName,
        phone: selectedAddress.phone,
        email: user.email,
        subtotal: subtotal,
        shipping: SHIPPING_FEE,
        total: finalPayable,
        payment_method: 'cod',
      });

      clearCart();
      navigate('/order-success', {
        state: { 
          orderId: String(orderIdString), 
          paymentMethod: 'Cash on Delivery',
          totalAmount: finalPayable
        },
        replace: true
      });
    } catch (err) {
      console.error('[Checkout Critical Error]', err);
      alert('Order placement failed. Please try again or contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="sticky top-0 z-10 p-4 bg-white flex items-center border-b shadow-sm">
        <button onClick={() => navigate('/cart')} className="p-2 -ml-2 mr-2">
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Checkout</h1>
      </div>

      <div className="p-4 pb-32 max-w-2xl mx-auto space-y-6">
        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted tracking-[0.2em] italic">
            Shipping Address
          </h2>
          {user?.addresses?.length ? (
             user.addresses.map(address => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddress(address)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer mb-3 transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">{address.fullName}</p>
                        <p className="text-xs mt-1 text-text-secondary leading-relaxed">
                            {address.street}, {address.city}, {address.state} — {address.zip}
                        </p>
                      </div>
                      {selectedAddress?.id === address.id && (
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                      )}
                  </div>
                  <p className="text-xs font-bold text-primary mt-2">
                    Phone: {address.phone}
                  </p>
                </div>
              ))
          ) : (
            <button onClick={() => navigate('/profile', { state: { focus: 'addresses' }})} className="w-full py-5 border-2 border-dashed border-border rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest hover:border-primary/50 transition-all">Add Shipping Address</button>
          )}
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-4 text-text-muted tracking-[0.2em] italic">
            Payment Method
          </h2>
          <div className="p-5 rounded-2xl border-2 border-primary bg-primary/5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-success rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <span className="font-bold text-sm">Cash on Delivery</span>
              </div>
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <p className="text-center text-xs text-text-muted mt-4">Only Cash on Delivery is available at the moment.</p>
        </GlassmorphicCard>

        <GlassmorphicCard className="p-6 bg-white border-none shadow-premium">
          <h2 className="text-[10px] font-black uppercase mb-6 text-text-muted tracking-[0.2em] italic border-b border-border pb-2">
            Bill Summary
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between font-medium"><span className="text-text-secondary">Subtotal</span><span className="text-text-main font-bold">₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between font-medium"><span className="text-text-secondary">Shipping Fee</span><span className="text-success font-bold">FREE</span></div>
            <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
              <span className="text-text-main font-bold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{finalPayable.toLocaleString()}</span>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-border z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)]">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedAddress}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
        >
          {isProcessing ? 'Placing Order...' : `Confirm Order — ₹${finalPayable.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
