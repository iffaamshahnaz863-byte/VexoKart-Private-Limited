
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
    <div>
      <div className="sticky top-0 z-10 p-4 bg-navy-charcoal flex items-center shadow-md">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 mr-2">
            <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">My Wishlist</h1>
      </div>
      
      <div className="p-4">
        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Your wishlist is empty.</p>
            <p className="text-gray-500 text-sm mt-2">Tap the heart on products to save them here.</p>
            <button onClick={() => navigate('/products')} className="mt-6 bg-teal-500 text-white font-bold py-2 px-6 rounded-lg">
              Find Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
