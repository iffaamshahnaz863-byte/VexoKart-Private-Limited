import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import StarRating from './StarRating';
import GlassmorphicCard from './GlassmorphicCard';
import { useAuth } from '../context/AuthContext';
import { HeartIcon } from './icons/HeartIcon';
import { useCart } from '../hooks/useCart';
import Toast from './Toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showAddedToast, setShowAddedToast] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
        navigate('/login');
        return;
    }
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setShowAddedToast(true);
  };

  // Requirement: Auto-calculate discount percentage
  const mrp = Number(product.originalPrice || product.price);
  const sellingPrice = Number(product.price);
  const discountPercent = mrp > sellingPrice 
    ? Math.round(((mrp - sellingPrice) / mrp) * 100) 
    : 0;

  return (
    <>
      <Toast message="Added to Bag" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      <div className="bg-white rounded-2xl overflow-hidden border border-border group transition-all hover:shadow-premium relative h-full flex flex-col">
          <button 
              onClick={handleToggleWishlist}
              className={`absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-md rounded-full border border-border transition-all duration-300 ${isWishlisted ? 'text-red-500 shadow-sm' : 'text-text-muted hover:text-red-500 shadow-sm'}`}
          >
              <HeartIcon className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'}/>
          </button>

        <Link to={`/product/${product.id}`} className="flex-grow flex flex-col">
          <div className="relative aspect-[3/4] bg-surface flex items-center justify-center overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {discountPercent > 0 && (
                <div className="absolute bottom-2 left-2 bg-accent text-white text-[9px] font-black px-2 py-1 rounded-md shadow-lg">
                  {discountPercent}% OFF
                </div>
              )}
          </div>
          
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-[11px] font-bold text-text-main line-clamp-2 uppercase tracking-tight leading-tight min-h-[2.4em]">
                {product.name}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-2">
                <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                    <span className="text-[9px] font-black text-green-700">{product.rating || '4.2'}</span>
                    <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <span className="text-[9px] text-text-muted font-bold">| {product.reviewCount || '1.2k'}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-1.5">
                <span className="text-sm font-black text-text-main tracking-tight">₹{sellingPrice.toLocaleString('en-IN')}</span>
                {discountPercent > 0 && (
                  <span className="text-[10px] text-text-muted line-through">₹{mrp.toLocaleString('en-IN')}</span>
                )}
            </div>
            
            <button 
                onClick={handleAddToCart}
                className="mt-3 w-full border border-border group-hover:border-accent group-hover:bg-accent group-hover:text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
                Add to Bag
            </button>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;