
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../hooks/useCart';
import GlassmorphicCard from '../components/GlassmorphicCard';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="bg-surface min-h-screen">
      <Header title="Shopping Bag" />
      <div className="p-4 space-y-6">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl p-8 shadow-sm">
            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6">
               <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-text-main mb-2">Your bag is empty</h2>
            <p className="text-text-muted text-sm mb-8">Browse our collection and find something you love!</p>
            <button onClick={() => navigate('/products')} className="bg-accent text-white font-black uppercase tracking-widest text-xs py-4 px-10 rounded-2xl shadow-lg shadow-accent/20">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-border flex gap-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="w-24 h-24 bg-surface rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2"/>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-text-main text-sm truncate uppercase tracking-tight italic">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-text-muted hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <p className="text-accent font-black text-base mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-surface rounded-xl border border-border">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-10 h-8 flex items-center justify-center text-text-main font-bold hover:bg-border rounded-l-xl">-</button>
                        <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-10 h-8 flex items-center justify-center text-text-main font-bold hover:bg-border rounded-r-xl">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-premium border border-border space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted border-b border-border pb-3">Bill Details</h4>
              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between items-center"><span className="text-text-secondary">Subtotal ({cartCount} items)</span><span className="text-text-main font-bold">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between items-center"><span className="text-text-secondary">Shipping & Delivery</span><span className="text-green-500 font-bold">FREE</span></div>
                <div className="flex justify-between items-center"><span className="text-text-secondary">Platform Fee</span><span className="text-text-main font-bold">₹0</span></div>
              </div>
              <div className="pt-4 border-t border-dashed border-border flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">Final Amount</p>
                  <p className="text-2xl font-black text-text-main tracking-tighter italic">₹{cartTotal.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-accent text-white font-black uppercase tracking-widest text-[10px] py-4 px-8 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
