
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../hooks/useCart';
import GlassmorphicCard from '../components/GlassmorphicCard';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div>
      <Header title={`My Cart (${cartCount})`} />
      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg">Your cart is empty.</p>
            <button onClick={() => navigate('/products')} className="mt-4 bg-accent text-white font-bold py-2 px-6 rounded-lg">
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <GlassmorphicCard key={item.id} className="p-4 flex items-center space-x-4">
                <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md"/>
                <div className="flex-grow">
                  <h3 className="font-semibold text-text-main">{item.name}</h3>
                  <p className="text-accent font-bold">₹{item.price.toFixed(2)}</p>
                   <div className="flex items-center mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 bg-surface rounded">-</button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 bg-surface rounded">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-text-muted hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </GlassmorphicCard>
            ))}
            
            <GlassmorphicCard className="p-4 mt-8">
              <div className="flex justify-between items-center text-lg">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="font-bold text-text-main">₹{cartTotal.toFixed(2)}</span>
              </div>
               <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-text-muted">Shipping:</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="border-t border-gray-700 my-4"></div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span className="text-text-main">Total:</span>
                <span className="text-accent">₹{cartTotal.toFixed(2)}</span>
              </div>
            </GlassmorphicCard>

            <div className="mt-6">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-accent to-accent-secondary text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;