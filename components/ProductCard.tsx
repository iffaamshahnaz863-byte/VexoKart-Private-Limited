
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
  const { user, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showAddedToast, setShowAddedToast] = useState(false);

  // This check is required because the new user object from the clean DB might not exist yet
  const isWishlisted = user ? isInWishlist(product.id) : false;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 } as any);
    setShowAddedToast(true);
  }

  const sellingPrice = Number(product.price);
  const mrp = Number(product.original_price || sellingPrice);
  const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/F1F2F6/172337?text=DAR+CYCLE+HUB';
  };

  return (
    <>
      <Toast message="Added to Cart" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      <div className="bg-white overflow-hidden border border-border group relative flex flex-col h-full active:scale-[0.98] transition-all rounded-2xl shadow-premium hover:shadow-premium-hover">
        <Link to={`/product/${product.id}`} className="flex-grow flex flex-col">
          <div className="relative w-full aspect-square bg-white overflow-hidden rounded-t-2xl flex items-center justify-center p-2">
            <img
              src={product.images[0] || 'https://placehold.co/400x400/F1F2F6/172337?text=DAR+CYCLE+HUB'}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            
            <button 
                onClick={handleToggleWishlist}
                className={`absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 ${isWishlisted ? 'text-red-500' : 'text-text-muted'}`}
            >
                <HeartIcon className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'}/>
            </button>
          </div>
          
          <div className="p-3 flex flex-col flex-grow">
            <h3 className="text-sm font-bold text-text-main line-clamp-2 leading-tight">
                {product.name}
            </h3>
            
            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                <span className="text-lg font-bold text-text-main tracking-tight">₹{sellingPrice.toLocaleString()}</span>
                {discount > 0 && (
                  <span className="text-xs text-text-muted line-through">₹{mrp.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold text-success">{discount}% off</span>
                )}
            </div>

            <div className="mt-auto pt-3 flex items-center gap-3">
               <span className="text-xs font-bold text-text-muted">Free Delivery</span>
            </div>
          </div>
        </Link>
        <button onClick={handleAddToCart} className="m-3 mt-0 bg-primary/10 text-primary font-bold py-2 rounded-lg text-xs hover:bg-primary hover:text-white transition-colors">
          Add to Cart
        </button>
      </div>
    </>
  );
};

export default ProductCard;
