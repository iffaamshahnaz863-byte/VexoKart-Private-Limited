
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { Address } from '../types';

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setSelectedAddress(user.addresses[0]);
    }
  }, [user]);

  const completeOrder = () => {
    if (!selectedAddress) {
      alert("Please select a shipping address.");
      return;
    }

    addOrder({
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.images[0]
        })),
        total: cartTotal
    });

    console.log("--- SIMULATING ORDER CONFIRMATION EMAIL ---");
    console.log(`To: ${user?.email}`);
    console.log(`From: no-reply@vexokart.com`);
    console.log(`Subject: Your VexoKart Order #${new Date().getTime().toString()} is Confirmed!`);
    console.log(`\nShipping to: ${selectedAddress.fullName}, ${selectedAddress.street}, ${selectedAddress.city}`);
    console.log("-------------------------------------------");

    setOrderPlaced(true);
    setTimeout(() => {
        clearCart();
        navigate('/');
    }, 3000);
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert("Please add and select a shipping address before placing an order.");
      return;
    }
    
    if (paymentMethod === 'cod') {
      completeOrder();
      return;
    }

    const options = {
      key: 'rzp_test_RvSXZKknVfrNUA',
      amount: cartTotal * 100,
      currency: 'INR',
      name: 'VexoKart',
      description: 'VexoKart Purchase',
      image: 'https://picsum.photos/seed/logo/128/128',
      handler: (response: any) => {
        completeOrder();
      },
      prefill: {
        name: user?.name || 'John Doe',
        email: user?.email || 'john.doe@example.com',
        contact: selectedAddress.phone || '9999999999',
      },
      theme: { color: '#8B5CF6' },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on('payment.failed', (response: any) => {
      alert(`Payment failed. Error: ${response.error.description}`);
    });
    paymentObject.open();
  };

  if (orderPlaced) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-400 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h1 className="text-2xl font-bold text-white">Order Confirmed!</h1>
            <p className="text-gray-400 mt-2">A confirmation has been sent to your email.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 p-4 bg-navy-charcoal flex items-center"><button onClick={() => navigate('/cart')} className="p-2 -ml-2 mr-2"><ChevronLeftIcon className="h-6 w-6 text-white" /></button><h1 className="text-xl font-bold text-white">Checkout</h1></div>
      <div className="p-4 space-y-6 pb-24">
        <GlassmorphicCard className="p-4">
          <h2 className="font-semibold text-lg mb-2">Shipping Address</h2>
          {user?.addresses && user.addresses.length > 0 ? (
            <div className="space-y-2">
              {user.addresses.map(address => (
                <div key={address.id} onClick={() => setSelectedAddress(address)} className={`p-3 rounded-lg border-2 cursor-pointer ${selectedAddress?.id === address.id ? 'border-purple-500 bg-navy-light' : 'border-gray-700'}`}>
                  <p className="font-semibold">{address.fullName}</p>
                  <p className="text-sm text-gray-400">{address.street}, {address.city}, {address.state} {address.zip}</p>
                </div>
              ))}
            </div>
          ) : (
             <p className="text-gray-400 text-sm">No addresses found.</p>
          )}
          <button onClick={() => navigate('/addresses/new')} className="text-purple-400 text-sm mt-3 font-semibold">Add New Address</button>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-4">
          <h2 className="font-semibold text-lg mb-3">Payment Method</h2>
          <div className="space-y-3"><div onClick={() => setPaymentMethod('card')} className={`p-3 rounded-lg border-2 cursor-pointer ${paymentMethod === 'card' ? 'border-purple-500 bg-navy-light' : 'border-gray-700'}`}><p className="font-semibold">Pay Online</p><p className="text-xs text-gray-400">Card, UPI, Wallet</p></div><div onClick={() => setPaymentMethod('cod')} className={`p-3 rounded-lg border-2 cursor-pointer ${paymentMethod === 'cod' ? 'border-purple-500 bg-navy-light' : 'border-gray-700'}`}><p className="font-semibold">Cash on Delivery (COD)</p></div></div>
        </GlassmorphicCard>
        <GlassmorphicCard className="p-4">
          <h2 className="font-semibold text-lg mb-2">Order Summary</h2>
          <div className="space-y-2 text-sm">{cartItems.map(item => (<div key={item.id} className="flex justify-between"><span className="text-gray-300 w-3/4 truncate">{item.name} x{item.quantity}</span><span className="text-gray-400">₹{(item.price * item.quantity).toFixed(2)}</span></div>))}</div>
          <div className="border-t border-gray-700 my-3"></div><div className="flex justify-between items-center text-lg font-bold"><span className="text-white">Total:</span><span className="text-purple-400">₹{cartTotal.toFixed(2)}</span></div>
        </GlassmorphicCard>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-navy-charcoal/80 backdrop-blur-sm border-t border-gray-700/50"><button onClick={handlePlaceOrder} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50" disabled={!selectedAddress}>{paymentMethod === 'cod' ? `Place Order (COD)` : `Pay ₹${cartTotal.toFixed(2)}`}</button></div>
    </div>
  );
};

export default CheckoutPage;
