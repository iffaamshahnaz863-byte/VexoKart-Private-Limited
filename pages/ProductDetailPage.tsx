
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useVendors } from '../context/VendorContext';
import { useReviews } from '../context/ReviewContext';
import { useLocationService } from '../context/LocationContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { CartIcon } from '../components/icons/CartIcon';
import Toast from '../components/Toast';
import LocationModal from '../components/LocationModal';
import { Review } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct } = useProducts();
  const { addToCart, cartCount } = useCart();
  const { isAuthenticated, user, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { getVendorById } = useVendors();
  const { getReviewsByProduct } = useReviews();
  const { currentPincode, isServiceable: locationIsServiceable, hasPermission } = useLocationService();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  const sliderRef = useRef<HTMLDivElement>(null);
  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendor_id) : null;

  // Amazon logic: Check serviceability
  const isServiceable = useMemo(() => {
    if (!product) return false;
    if (product.product_type === 'daily_needs') return locationIsServiceable;
    return true; // Normal e-commerce logic
  }, [product, locationIsServiceable]);

  useEffect(() => {
    if (product && isAuthenticated) addRecentlyViewed(product.id);
  }, [product?.id, isAuthenticated]);

  useEffect(() => {
    if (productId) getReviewsByProduct(productId).then(setReviews);
  }, [productId]);

  if (!product) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>;

  const isWishlisted = isInWishlist(product.id);
  const mrp = Number(product.original_price || product.price);
  const sellingPrice = Number(product.price);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  
  const handleAction = (type: 'cart' | 'buy') => {
    if (!isServiceable) {
        setShowLocationModal(true);
        return;
    }
    
    addToCart({ 
      ...product, 
      selectedSize, 
      selectedColor,
      delivery_type: deliveryType,
      quantity 
    } as any);

    if (type === 'cart') setShowAddedToast(true);
    else navigate('/checkout');
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-surface overflow-hidden">
      <Toast message="Added to Cart" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} onSuccess={() => setShowLocationModal(false)} />}
      
      {/* Sticky Header */}
      <div className="flex-none z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm w-full">
        <button onClick={() => navigate(-1)} className="p-1"><ChevronLeftIcon className="w-6 h-6 text-gray-800" /></button>
        <div className="flex items-center gap-4">
          <button onClick={handleAction.bind(null, 'cart')} className="relative p-1">
            <CartIcon className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold px-1.5 rounded-full">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden w-full scroll-smooth bg-white">
        <div className="flex flex-col w-full">
            {/* Gallery */}
            <div className="w-full bg-white relative">
                <div className="aspect-square w-full max-h-[50vh] flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img 
                        src={product.images[0]} 
                        className="w-full h-full object-contain" 
                        alt={product.name} 
                    />
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-4 w-full">
                <div>
                    <h1 className="text-lg font-bold text-gray-800 leading-tight">{product.name}</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Vendor: {vendor?.store_name || 'VEXOKART Verified'}</p>
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900">₹{sellingPrice}</span>
                    {discountPercent > 0 && <span className="text-sm text-gray-400 line-through">₹{mrp}</span>}
                    {discountPercent > 0 && <span className="text-sm font-bold text-green-600">{discountPercent}% OFF</span>}
                </div>

                {product.weight_info && <p className="text-xs font-bold text-gray-500 uppercase">Weight/Size: {product.weight_info}</p>}

                {/* Pincode & Delivery Options */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                            <p className="text-xs font-bold text-gray-700">Deliver to <span className="text-accent">{currentPincode || 'Select Location'}</span></p>
                        </div>
                        <button onClick={() => setShowLocationModal(true)} className="text-[10px] font-black uppercase text-accent underline">Change</button>
                    </div>

                    {!isServiceable && (
                        <div className="p-2 bg-red-50 rounded-lg flex items-center gap-2 border border-red-100">
                            <span className="text-[10px] text-red-600 font-black uppercase italic">Unserviceable Area for Daily Needs</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${deliveryType === 'standard' ? 'bg-white border-accent' : 'bg-gray-50 border-transparent opacity-60'}`}>
                            <div className="flex items-center gap-3">
                                <input type="radio" checked={deliveryType === 'standard'} onChange={() => setDeliveryType('standard')} className="w-4 h-4 accent-accent" />
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Standard Delivery</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">3-5 Business Days • Free</p>
                                </div>
                            </div>
                        </label>

                        <label className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${!product.express_delivery_enabled ? 'opacity-40 grayscale cursor-not-allowed' : deliveryType === 'express' ? 'bg-white border-accent' : 'bg-gray-50 border-transparent'}`}>
                            <div className="flex items-center gap-3">
                                <input type="radio" disabled={!product.express_delivery_enabled} checked={deliveryType === 'express'} onChange={() => setDeliveryType('express')} className="w-4 h-4 accent-accent" />
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Express Delivery</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase">
                                        {product.express_delivery_enabled ? 'Within 24 Hours • ₹49' : 'Not available for this SKU'}
                                    </p>
                                </div>
                            </div>
                            {product.express_delivery_enabled && <span className="text-[10px] font-black text-accent italic">FAST</span>}
                        </label>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 w-full">
                    <div className={`shrink-0 flex flex-col items-center p-3 rounded-2xl border ${product.is_returnable ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100 grayscale'}`}>
                        <svg className={`w-5 h-5 mb-1 ${product.is_returnable ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>
                        <span className="text-[8px] font-black uppercase whitespace-nowrap">{product.is_returnable ? '7-Day Return' : 'No Returns'}</span>
                    </div>
                    <div className={`shrink-0 flex flex-col items-center p-3 rounded-2xl border ${product.is_cod_enabled ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 grayscale'}`}>
                        <svg className={`w-5 h-5 mb-1 ${product.is_cod_enabled ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span className="text-[8px] font-black uppercase whitespace-nowrap">{product.is_cod_enabled ? 'COD Available' : 'No COD'}</span>
                    </div>
                    <div className="shrink-0 flex flex-col items-center p-3 rounded-2xl border bg-orange-50 border-orange-100">
                        <svg className="w-5 h-5 mb-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-[8px] font-black uppercase whitespace-nowrap text-accent">VEXOKART Verified</span>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2 w-full pb-10">
                    <h3 className="text-sm font-black uppercase italic tracking-widest text-gray-800">Description</h3>
                    <p className={`text-xs text-gray-500 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                        {product.description}
                    </p>
                    <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-[10px] font-black text-accent uppercase">{isDescriptionExpanded ? 'Read Less' : 'Read More'}</button>
                </div>
            </div>
        </div>
      </div>

      {/* Sticky Action Bar - Bottom */}
      <div className="flex-none z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] w-full">
            <div className="flex gap-3">
                <button 
                    onClick={handleAction.bind(null, 'cart')}
                    disabled={!isServiceable}
                    className="flex-1 h-12 md:h-14 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] active:scale-95 transition-all disabled:opacity-50"
                >Add to Cart</button>
                <button 
                    onClick={handleAction.bind(null, 'buy')}
                    disabled={!isServiceable}
                    className="flex-[1.5] h-12 md:h-14 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-xl shadow-accent/20 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isServiceable ? 'Buy Now' : 'Check Availability'}
                </button>
            </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
