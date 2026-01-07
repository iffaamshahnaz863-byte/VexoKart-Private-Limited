import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { HeartIcon } from './icons/HeartIcon.tsx';
import { useCart } from '../hooks/useCart.ts';
import Toast from './Toast.tsx';

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
    if (!isAuthenticated) { navigate('/login'); return; }
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const sellingPrice = Number(product.price);
  const mrp = Number(product.original_price || sellingPrice);
  const discount = Math.round(((mrp - sellingPrice) / mrp) * 100);
  
  // Meesho Style: COD is usually available for most, UPI is 2-3% cheaper
  const upiPrice = Math.floor(sellingPrice * 0.98);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/F8F9FA/A0A0A0?text=VexoKart';
  };

  return (
    <>
      <Toast message="Added to Cart" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      <div className="bg-white overflow-hidden border border-gray-100 group relative flex flex-col h-full active:scale-[0.98] transition-all">
        <Link to={`/product/${product.id}`} className="flex-grow flex flex-col">
          {/* Image Section */}
          <div className="relative w-full aspect-[4/5] bg-[#F8F9FA] overflow-hidden">
            <img
              src={product.images[0] || 'https://placehold.co/400x400/F8F9FA/A0A0A0?text=VexoKart'}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover"
            />
            <button 
                onClick={handleToggleWishlist}
                className={`absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm transition-all ${isWishlisted ? 'text-[#F43397]' : 'text-gray-400'}`}
            >
                <HeartIcon className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'}/>
            </button>
            {product.status === 'live' && (
                <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[8px] font-bold px-2 py-0.5 rounded-tr-md backdrop-blur-sm">
                  Verified Partner
                </div>
            )}
          </div>
          
          <div className="p-2.5 flex flex-col flex-grow">
            <h3 className="text-[11px] font-medium text-gray-500 line-clamp-1 truncate">
                {product.name}
            </h3>
            
            <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-gray-900 tracking-tight">₹{sellingPrice}</span>
                {discount > 0 && (
                  <span className="text-[10px] text-gray-400 line-through">₹{mrp}</span>
                )}
                {discount > 0 && (
                  <span className="text-[10px] font-bold text-[#34BE82]">{discount}% off</span>
                )}
            </div>

            {/* UPI Badge */}
            <div className="mt-1 flex items-center gap-1">
               <div className="bg-[#E7F7F0] text-[#34BE82] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                 <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                 ₹{upiPrice} with UPI
               </div>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
               <span className="text-[10px] font-bold text-gray-500">Free Delivery</span>
            </div>

            <div className="mt-2 flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-[#34BE82] px-1.5 py-0.5 rounded text-white">
                    <span className="text-[10px] font-bold">{product.rating || '4.0'}</span>
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{product.review_count || '1k'} Reviews</span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;
