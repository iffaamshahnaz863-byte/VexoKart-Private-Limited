
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import StarRating from './StarRating';
import GlassmorphicCard from './GlassmorphicCard';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <GlassmorphicCard>
      <Link to={`/product/${product.id}`} className="block">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{product.category}</p>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xl font-bold text-purple-400">₹{product.price.toFixed(2)}</p>
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
