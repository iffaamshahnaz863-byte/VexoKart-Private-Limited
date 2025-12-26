
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
    <GlassmorphicCard className="transform hover:scale-105 hover:border-accent/50 relative">
        <button 
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 z-10 p-1.5 bg-navy-light/50 rounded-full transition-colors duration-300 ${isWishlisted ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
        >
            <HeartIcon className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'}/>
        </button>

      <Link to={`/product/${product.id}`} className="block">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-xl bg-gray-700"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{product.category}</p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-accent">₹{product.price.toFixed(2)}</p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</p>
            )}
          </div>
          <div className="flex items-center">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-400 ml-2">({product.reviewCount})</span>
          </div>
        </div>
      </Link>
    </GlassmorphicCard>
  );
};

export default ProductCard;
