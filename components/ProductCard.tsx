
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
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setShowAddedToast(true);
  };

  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <>
      <Toast message="Added to bag" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      <GlassmorphicCard className="hover:shadow-premium-hover relative group border-none">
          <button 
              onClick={handleToggleWishlist}
              className={`absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full border border-border transition-all duration-300 ${isWishlisted ? 'text-accent shadow-sm' : 'text-text-muted hover:text-accent shadow-sm'}`}
          >
              <HeartIcon className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'}/>
          </button>

        <Link to={`/product/${product.id}`} className="block">
          <div className="w-full aspect-square bg-surface flex items-center justify-center overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              />
              {discount > 0 && (
                <div className="absolute top-2 left-2 bg-accent text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm">
                  -{discount}%
                </div>
              )}
          </div>
          <div className="p-3">
            <h3 className="text-xs font-bold text-text-main truncate uppercase tracking-tight leading-tight">{product.name}</h3>
            <p className="text-[10px] text-text-secondary font-medium mt-1">{product.category}</p>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-text-main">₹{product.price.toLocaleString('en-IN')}</p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-[10px] text-text-muted line-through opacity-70">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                )}
              </div>
              <button 
                className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/20 active:scale-90 transition-transform"
                onClick={handleAddToCart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mt-2 pt-2 border-t border-border">
              <StarRating rating={product.rating} />
              <span className="text-[10px] text-text-muted font-bold ml-auto">{product.rating}</span>
            </div>
          </div>
        </Link>
      </GlassmorphicCard>
    </>
  );
};

export default ProductCard;
