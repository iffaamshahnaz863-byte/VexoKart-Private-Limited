
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { SearchIcon } from '../components/icons/SearchIcon';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const DailyNeedsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, updateQuantity, cartItems, cartTotal } = useCart();
  const [activeCategory, setActiveCategory] = useState('All');

  // Simulated categories for Daily Needs layout
  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages'];

  const filteredProducts = products.filter(p => {
      // In a real app, filter by category_id or a specific "Daily Needs" tag.
      // For now, we show all approved products to populate the UI.
      const isLive = p.status === 'approved' || p.status === 'live';
      const catMatch = activeCategory === 'All' || p.category === activeCategory;
      return isLive && catMatch;
  });

  const getItemQty = (id: number) => cartItems.find(i => i.id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
            <div className="p-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full active:bg-gray-100">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-black text-gray-900 italic uppercase leading-none">Daily<span className="text-[#00B259]">Needs</span></h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Delivery in 10-15 Minutes</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">🛍️</span>
                </div>
            </div>
            
            {/* Search Bar */}
            <div className="px-4 pb-4">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search milk, bread, eggs..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00B259] transition-colors"
                    />
                    <div className="absolute top-3 left-3 text-gray-400">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Category Rail */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-[#E7F7F0] border-[#00B259] text-[#00B259]' : 'bg-white border-gray-200 text-gray-500'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
                const qty = getItemQty(product.id);
                return (
                    <div key={product.id} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col justify-between h-full">
                        <div className="relative aspect-square mb-2 bg-white rounded-xl flex items-center justify-center">
                            <img 
                                src={product.images[0]} 
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight uppercase tracking-tight">{product.name}</h3>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">1 Unit</p>
                            
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-gray-900">₹{product.price}</span>
                                    {product.original_price > product.price && (
                                        <span className="text-[9px] text-gray-400 line-through">₹{product.original_price}</span>
                                    )}
                                </div>
                                {qty === 0 ? (
                                    <button 
                                        onClick={() => addToCart({...product, quantity: 1} as any)}
                                        className="bg-white border border-[#00B259] text-[#00B259] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#E7F7F0] active:scale-95 transition-all shadow-sm"
                                    >
                                        ADD
                                    </button>
                                ) : (
                                    <div className="flex items-center bg-[#00B259] rounded-lg shadow-sm">
                                        <button onClick={() => updateQuantity(product.id, qty - 1)} className="px-2.5 py-1 text-white text-sm font-bold">-</button>
                                        <span className="text-xs font-black text-white px-1">{qty}</span>
                                        <button onClick={() => updateQuantity(product.id, qty + 1)} className="px-2.5 py-1 text-white text-sm font-bold">+</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Floating Cart Bar */}
        {cartTotal > 0 && (
            <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#00B259] text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center" onClick={() => navigate('/cart')}>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-80 tracking-widest">{cartItems.length} Items</span>
                        <span className="text-lg font-black italic tracking-tight">₹{cartTotal}</span>
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                        View Cart
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DailyNeedsPage;
