
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import StarRating from './StarRating';
import GlassmorphicCard from './GlassmorphicCard';
import { useAuth } from '../context/AuthContext';
import { HeartIcon } from './icons/HeartIcon';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const navigate = useNavigate();

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

  return (
    <GlassmorphicCard className="transform hover:scale-[1.03] hover:border-accent/30 relative group">
        <button 
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 z-10 p-2 bg-surface/80 backdrop-blur-md rounded-full border border-white/5 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isWishlisted ? 'text-red-500 opacity-100' : 'text-text-secondary hover:text-red-400'}`}
        >
            <HeartIcon className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'}/>
        </button>

      <Link to={`/product/${product.id}`} className="block">
        <div className="w-full aspect-square bg-white/[0.02] flex items-center justify-center overflow-hidden border-b border-white/5">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
            />
        </div>
        <div className="p-3">
          <h3 className="text-xs font-black text-text-main truncate italic tracking-tight">{product.name}</h3>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-black text-accent tracking-tighter italic">₹{product.price.toLocaleString('en-IN')}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-[10px] text-text-muted line-through opacity-70">₹{product.originalPrice.toLocaleString('en-IN')}</p>
            )}
          </div>
          
          <div className="flex items-center mt-1">
            <StarRating rating={product.rating} />
            <span className="text-[10px] text-text-muted font-bold ml-1.5 opacity-80">({product.reviewCount})</span>
          </div>
        </div>
      </Link>
    </GlassmorphicCard>
  );
};

export default ProductCard;
