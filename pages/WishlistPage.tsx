import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products } = useProducts();

  const wishlistedProducts = user ? products.filter(p => user.wishlist.includes(p.id)) : [];

  return (
    <div className="bg-surface min-h-screen">
      <div className="sticky top-0 z-10 p-4 bg-white flex items-center border-b border-border shadow-sm">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-text-main" />
        </button>
        <h1 className="text-xl font-black uppercase italic tracking-tight text-text-main">My Favorites</h1>
      </div>
      
      <div className="p-3">
        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-border mt-4">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <p className="text-text-main font-bold text-lg">Your wishlist is empty</p>
            <p className="text-text-muted text-sm mt-2">Tap the heart on products to save them here.</p>
            <button onClick={() => navigate('/products')} className="mt-8 bg-accent text-white font-black uppercase tracking-widest text-[10px] py-4 px-10 rounded-2xl shadow-lg shadow-accent/20">
              Find Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;