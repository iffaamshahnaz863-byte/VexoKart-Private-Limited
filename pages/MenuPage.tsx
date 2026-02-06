
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCategories } from '../hooks/useCategories';

const MenuPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();

  const handleCategoryClick = (name: string) => {
    navigate(`/products?category=${encodeURIComponent(name)}`);
  };

  return (
    <div className="bg-[#F2F2F2] min-h-screen pb-24">
      <Header title="Menu" showSearch />
      
      <div className="p-4 space-y-6">
        {/* Highlighted Daily Needs Section */}
        <section>
            <div 
                onClick={() => navigate('/daily')}
                className="bg-gradient-to-br from-[#00B259] to-[#008C45] p-6 rounded-3xl shadow-xl flex items-center justify-between group active:scale-95 transition-all cursor-pointer overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-10 -mt-10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Daily Needs</h2>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Groceries • Fresh • 10 Mins</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <span className="text-3xl">🥦</span>
                </div>
            </div>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-2 gap-4">
            {categories.map(cat => (
                <div 
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all group"
                >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-gray-50 flex items-center justify-center">
                        <img 
                            src={cat.image_url} 
                            alt={cat.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        />
                    </div>
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-tight text-center truncate">{cat.name}</h3>
                </div>
            ))}
        </section>

        {/* Quick Links */}
        <section className="bg-white rounded-3xl p-6 border border-gray-100 space-y-4 shadow-sm">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic border-b border-gray-50 pb-2">Account & Settings</h4>
            <div className="grid grid-cols-2 gap-y-4">
                <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group active:text-accent transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase">Orders</span>
                </button>
                <button onClick={() => navigate('/wishlist')} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase">Favorites</span>
                </button>
                <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase">Profile</span>
                </button>
                <button onClick={() => navigate('/help')} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase">Customer Service</span>
                </button>
            </div>
        </section>
      </div>
    </div>
  );
};

export default MenuPage;
