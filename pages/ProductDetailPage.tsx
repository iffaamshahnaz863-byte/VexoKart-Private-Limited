import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useVendors } from '../context/VendorContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { CartIcon } from '../components/icons/CartIcon';
import Toast from '../components/Toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct } = useProducts();
  const { addToCart, cartCount } = useCart();
  const { isAuthenticated, user, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { getVendorById } = useVendors();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Swipe logic states
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendor_id) : null;

  const defaultAddress = user?.addresses?.[0];

  const availableSizes = useMemo(() => 
    product?.variants?.filter(v => v.type === 'size').map(v => v.value) || [], 
    [product]
  );
  
  const availableColors = useMemo(() => 
    product?.variants?.filter(v => v.type === 'color') || [], 
    [product]
  );

  // STRICT RULE: Only show if vendor enabled and items exist
  const showSizeSelector = product?.product_type === 'variant' && availableSizes.length > 0;
  const showColorSelector = product?.product_type === 'variant' && availableColors.length > 0;

  const needsSize = showSizeSelector;
  const needsColor = showColorSelector;

  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
  }, [product?.id, isAuthenticated]);

  const displayImages = useMemo(() => {
    if (!product) return ['https://placehold.co/600x600/F8F9FA/A0A0A0?text=VexoKart'];
    return product.images.length > 0 ? product.images : ['https://placehold.co/600x600/F8F9FA/A0A0A0?text=VexoKart'];
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const mrp = Number(product.original_price || product.price);
  const sellingPrice = Number(product.price);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  const upiPrice = Math.floor(sellingPrice * 0.98);

  // Strict Payment Rule logic
  const allowCod = product.is_cod_enabled;
  const allowOnline = product.is_online_enabled;

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const diffX = touchStart.x - currentX;
    const diffY = touchStart.y - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (e.cancelable) e.preventDefault();
      setSwipeOffset(diffX);
    }
    
    setTouchEnd({ x: currentX, y: currentY });
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    const minSwipeDistance = 50;
    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > minSwipeDistance && currentImageIndex < displayImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
      } else if (diffX < -minSwipeDistance && currentImageIndex > 0) {
        setCurrentImageIndex(prev => prev - 1);
      }
    }
    setSwipeOffset(0);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    setIsWishlistAnimating(true);
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
    setTimeout(() => setIsWishlistAnimating(false), 500);
  };

  const handleAction = (type: 'cart' | 'buy') => {
    if (needsSize && !selectedSize) {
      const el = document.getElementById('size-selection');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (needsColor && !selectedColor) {
      const el = document.getElementById('color-selection');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    addToCart({ 
      ...product, 
      selectedSize: needsSize ? selectedSize : undefined, 
      selectedColor: needsColor ? selectedColor : undefined,
      quantity 
    } as any);

    if (type === 'cart') {
      setShowAddedToast(true);
    } else {
      navigate('/checkout');
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/F8F9FA/A0A0A0?text=Product+Image';
  };

  const isBuyDisabled = (needsSize && !selectedSize) || (needsColor && !selectedColor);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32 font-sans select-none overflow-x-hidden touch-pan-y">
      <Toast message="Added to Cart" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      
      {/* HEADER */}
      <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 active:scale-90 transition-transform">
            <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
          </button>
        </div>
        <div className="flex items-center gap-5">
          <SearchIcon className="w-6 h-6 text-gray-700" onClick={() => navigate('/products')} />
          <div className="relative cursor-pointer" onClick={handleToggleWishlist}>
            <HeartIcon 
              className={`w-6 h-6 transition-all duration-300 ${isWishlisted ? 'text-[#F43397] fill-[#F43397]' : 'text-gray-700'} ${isWishlistAnimating ? 'scale-125' : ''}`} 
            />
          </div>
          <Link to="/cart" className="relative p-1">
            <CartIcon className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F43397] text-white text-[9px] font-bold px-1.5 rounded-full border border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* MOBILE-FIRST IMAGE SLIDER */}
      <div 
        className="relative w-full bg-white aspect-[4/5] overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={sliderRef}
          className={`flex h-full will-change-transform ${!isSwiping ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{ 
            transform: `translateX(calc(-${currentImageIndex * 100}% - ${swipeOffset}px))`,
          }}
        >
          {displayImages.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
              <img 
                src={img} 
                className="w-full h-full object-contain pointer-events-none" 
                alt={`${product.name} view ${idx + 1}`} 
                onError={handleImageError}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-sm tracking-widest">
          {currentImageIndex + 1}/{displayImages.length}
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {displayImages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === i ? 'w-5 bg-[#F43397]' : 'w-1.5 bg-gray-300/80'}`}
            />
          ))}
        </div>
      </div>

      {/* PRODUCT CORE INFO */}
      <div className="bg-white p-4 space-y-3 shadow-sm">
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-base font-medium text-gray-600 leading-snug line-clamp-2">
            {product.name}
          </h1>
          <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} className="p-2 bg-gray-50 rounded-full active:bg-gray-100">
             <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">₹{sellingPrice}</span>
          {discountPercent > 0 && (
            <span className="text-sm text-gray-400 line-through">₹{mrp}</span>
          )}
          <span className="text-sm font-bold text-[#34BE82]">{discountPercent}% off</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#E7F7F0] text-[#34BE82] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {product.rating || '4.0'}
          </div>
          <span className="text-xs text-gray-400 font-medium">{product.review_count || '25'} Reviews</span>
        </div>

        {/* PAYMENT BADGES - STRICT PERSISTENCE REFLECTION */}
        <div className="flex flex-wrap gap-2 pt-1">
            {allowCod && allowOnline && (
                <div className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1.5 border border-gray-200">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">COD Available</span>
                </div>
            )}
            {allowOnline && !allowCod && (
                <div className="bg-blue-50 px-2 py-1 rounded flex items-center gap-1.5 border border-blue-100">
                    <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Online Payment Only</span>
                </div>
            )}
            {allowCod && !allowOnline && (
                <div className="bg-orange-50 px-2 py-1 rounded flex items-center gap-1.5 border border-orange-100">
                    <svg className="w-3 h-3 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter">Pay at Doorstep Only</span>
                </div>
            )}
        </div>

        <div className="pt-3 mt-1 border-t border-gray-100">
           <div className="flex items-center gap-2 cursor-pointer active:opacity-60" onClick={() => navigate('/addresses')}>
              <svg className="w-4 h-4 text-[#F43397]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <p className="text-[11px] font-bold text-gray-700 truncate max-w-[250px]">
                {defaultAddress 
                   ? `Delivering to ${defaultAddress.city} - ${defaultAddress.zip}` 
                   : 'Add delivery address'}
              </p>
              <svg className="w-3 h-3 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           </div>
        </div>

        {allowOnline && (
            <div className="pt-2">
                <div className="bg-[#F3FFF9] border border-[#D1F7E6] p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#34BE82] p-1 rounded-full"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg></div>
                        <p className="text-[11px] font-bold text-gray-700">₹{upiPrice} with UPI offer</p>
                    </div>
                    <p className="text-[10px] font-bold text-[#34BE82]">Applied</p>
                </div>
            </div>
        )}
      </div>

      {/* COLOR SELECTION SECTION */}
      {showColorSelector && (
        <div id="color-selection" className="mt-2 bg-white p-4 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-bold text-gray-800">Select Color</h3>
          <div className="flex flex-wrap gap-4">
            {availableColors.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(color.value)}
                className={`flex flex-col items-center gap-1 p-1 rounded-xl border-2 transition-all duration-200 ${
                  selectedColor === color.value ? 'border-[#F43397] bg-[#FFF0F7]' : 'border-transparent'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <img src={color.image || 'https://placehold.co/100x100?text=Color'} className="w-full h-full object-cover" alt={color.value} />
                </div>
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">{color.value}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SIZE SELECTION SECTION */}
      {showSizeSelector && (
        <div id="size-selection" className="mt-2 bg-white p-4 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">Select Size</h3>
            <button className="text-[#F43397] text-xs font-bold active:opacity-60">Size Chart</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[56px] py-2 px-3 rounded-full text-sm font-bold border transition-all duration-200 ${
                  selectedSize === size
                    ? 'border-[#F43397] bg-[#FFF0F7] text-[#F43397]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUANTITY SELECTOR */}
      <div className="mt-2 bg-white p-4 flex items-center justify-between shadow-sm">
        <h3 className="text-sm font-bold text-gray-800">Quantity</h3>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="px-4 py-2 bg-gray-50 text-gray-600 font-bold active:bg-gray-200"
          >-</button>
          <span className="px-4 py-2 text-sm font-bold text-gray-800 min-w-[40px] text-center">{quantity}</span>
          <button 
            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
            className="px-4 py-2 bg-gray-50 text-gray-600 font-bold active:bg-gray-200"
          >+</button>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-2 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Product Details</h3>
        <div className="space-y-3">
          {(product.highlights || []).length > 0 ? product.highlights?.map((h, i) => {
            const [label, ...valParts] = h.includes(':') ? h.split(':') : ['Highlight', h];
            const value = valParts.join(':').trim();
            return (
              <div key={i} className="flex text-xs leading-relaxed border-b border-gray-50 pb-2 last:border-0">
                <span className="w-1/3 text-gray-400 font-medium uppercase tracking-tighter">{label.trim()}</span>
                <span className="w-2/3 text-gray-700 font-semibold">{value}</span>
              </div>
            );
          }) : (
            <p className="text-xs text-text-muted italic">Specifications available upon request.</p>
          )}
        </div>
        
        <div className="mt-4 relative">
          <div 
            className={`text-xs text-gray-500 leading-relaxed whitespace-pre-line overflow-hidden transition-all duration-500 ease-in-out will-change-[max-height] ${
              isDescriptionExpanded ? 'max-h-[2000px]' : 'max-h-[4.8rem]'
            }`}
          >
            {product.description}
          </div>
          {product.description && product.description.length > 120 && (
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-[#F43397] text-xs font-bold mt-2 hover:opacity-80 transition-opacity p-1 -ml-1 active:scale-95"
            >
              {isDescriptionExpanded ? 'Read Less ▲' : 'See More ▼'}
            </button>
          )}
        </div>
      </div>

      {/* SOLD BY SECTION */}
      <div className="mt-2 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Shop Information</h3>
          <button className="text-[#F43397] text-xs font-bold active:opacity-60">View Shop</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#F43397] rounded-full flex items-center justify-center text-white font-black text-xl italic shadow-inner">
            {vendor?.store_name?.[0] || 'V'}
          </div>
          <div className="flex-grow">
            <p className="text-sm font-bold text-gray-800">{vendor?.store_name || 'VexoKart Direct'}</p>
            <div className="flex items-center gap-2 mt-1">
               <div className="bg-[#34BE82] text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                 4.2 <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
               </div>
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Top Rated Seller</span>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white flex items-center gap-3 z-[110] shadow-[0_-10px_30px_rgba(0,0,0,0.08)] border-t border-gray-100">
        <button 
          onClick={() => handleAction('cart')}
          className="flex-1 border-2 border-gray-900 bg-white text-gray-900 font-bold uppercase tracking-tight text-sm py-3.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <CartIcon className="w-4 h-4" />
          Add to Cart
        </button>
        <button 
          onClick={() => handleAction('buy')}
          disabled={isBuyDisabled}
          className={`flex-[1.2] py-4 rounded-lg font-bold uppercase tracking-tight text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
            !isBuyDisabled 
            ? 'bg-[#F43397] text-white shadow-[#F43397]/20' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;