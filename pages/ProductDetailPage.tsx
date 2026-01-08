import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useVendors } from '../context/VendorContext';
import { useReviews } from '../context/ReviewContext';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { CartIcon } from '../components/icons/CartIcon';
import Toast from '../components/Toast';
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
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isWishlistAnimating, setIsWishlistAnimating] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

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

  const showSizeSelector = product?.product_type === 'variant' && availableSizes.length > 0;
  const showColorSelector = product?.product_type === 'variant' && availableColors.length > 0;

  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
  }, [product?.id, isAuthenticated]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (productId) {
        setIsLoadingReviews(true);
        const data = await getReviewsByProduct(productId);
        setReviews(data);
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const aHasMedia = (a.images?.length || 0) > 0 || !!a.video_url;
      const bHasMedia = (b.images?.length || 0) > 0 || !!b.video_url;
      if (aHasMedia && !bHasMedia) return -1;
      if (!aHasMedia && bHasMedia) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reviews]);

  const displayImages = useMemo(() => {
    if (!product) return ['https://placehold.co/600x600/F8F9FA/A0A0A0?text=VexoKart'];
    return product.images.length > 0 ? product.images : ['https://placehold.co/600x600/F8F9FA/A0A0A0?text=VexoKart'];
  }, [product]);

  const handleScroll = () => {
    if (sliderRef.current) {
      const scrollLeft = sliderRef.current.scrollLeft;
      const width = sliderRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

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

  const allowCod = product.is_cod_enabled;
  const allowOnline = product.is_online_enabled;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    setIsWishlistAnimating(true);
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
    setTimeout(() => setIsWishlistAnimating(false), 500);
  };

  const handleAction = (type: 'cart' | 'buy') => {
    if (showSizeSelector && !selectedSize) {
      document.getElementById('size-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (showColorSelector && !selectedColor) {
      document.getElementById('color-selection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    addToCart({ 
      ...product, 
      selectedSize: showSizeSelector ? selectedSize : undefined, 
      selectedColor: showColorSelector ? selectedColor : undefined,
      quantity 
    } as any);

    if (type === 'cart') {
      setShowAddedToast(true);
    } else {
      navigate('/checkout');
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/F8F9FA/A0A0A0?text=VexoKart';
  };

  const isBuyDisabled = (showSizeSelector && !selectedSize) || (showColorSelector && !selectedColor);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32 font-sans select-none overflow-x-hidden">
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

      {/* MEESHO STYLE: FIXED STABLE IMAGE GALLERY */}
      <div className="relative w-full aspect-square max-h-[90vw] overflow-hidden bg-[#f6f6f6] mx-auto">
        <div 
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar touch-pan-x"
          style={{ scrollBehavior: 'smooth' }}
        >
          {displayImages.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
              <img 
                src={img} 
                className="w-full h-full object-cover object-center pointer-events-none user-select-none" 
                alt={`${product.name} ${idx + 1}`} 
                onError={handleImageError}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        
        {/* Pagination Overlay */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
          {currentImageIndex + 1} / {displayImages.length}
        </div>

        {/* Swipe Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          {displayImages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === i ? 'w-5 bg-[#F43397]' : 'w-1.5 bg-gray-300/60'}`}
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
          <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} className="p-2 bg-gray-50 rounded-full active:bg-gray-100 shrink-0">
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
          <span className="text-xs text-gray-400 font-medium">{reviews.length || '0'} Reviews</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
            {allowCod && (
                <div className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1.5 border border-gray-200">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">COD Available</span>
                </div>
            )}
            <div className="bg-orange-50 px-2 py-1 rounded flex items-center gap-1.5 border border-orange-100">
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter italic">Free Delivery</span>
            </div>
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

      {/* PRODUCT DETAILS - MEESHO STYLE COLLAPSIBLE */}
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
          }) : null}
        </div>
        
        <div className="mt-4 relative">
          <div 
            className={`text-xs text-gray-500 leading-relaxed whitespace-pre-line overflow-hidden transition-all duration-300 ${
              isDescriptionExpanded ? 'max-h-[3000px]' : 'max-h-[4.5rem] line-clamp-3'
            }`}
          >
            {product.description}
          </div>
          {product.description && product.description.length > 120 && (
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-[#F43397] text-xs font-bold mt-2 hover:opacity-80 transition-opacity p-1 -ml-1 active:scale-95"
            >
              {isDescriptionExpanded ? 'View Less' : 'View More'}
            </button>
          )}
        </div>
      </div>

      {/* REVIEWS SECTION - MEESHO STYLE */}
      <div className="mt-2 bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-gray-800">Product Reviews</h3>
          {reviews.length > 0 && (
             <div className="flex items-center gap-1 bg-[#34BE82] text-white px-2 py-0.5 rounded text-[10px] font-bold">
               {product.rating || '4.0'} <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
             </div>
          )}
        </div>

        {isLoadingReviews ? (
          <div className="flex justify-center py-6">
             <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : sortedReviews.length > 0 ? (
          <div className="space-y-6">
            {sortedReviews.slice(0, 10).map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-6 last:border-0">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                        {review.author[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{review.author}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${review.rating >= 4 ? 'bg-[#34BE82]' : review.rating >= 3 ? 'bg-yellow-400' : 'bg-red-400'}`}>
                      {review.rating} <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                   </div>
                </div>

                {review.review_text && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed font-medium">{review.review_text}</p>
                )}

                {(review.images.length > 0 || review.video_url) && (
                  <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {review.video_url && (
                      <div className="relative w-16 h-16 shrink-0 bg-black rounded-lg overflow-hidden border border-gray-100">
                        <video src={review.video_url} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                        </div>
                      </div>
                    )}
                    {review.images.map((img, i) => (
                      <img key={i} src={img} loading="lazy" className="w-16 h-16 shrink-0 object-cover rounded-lg border border-gray-100" alt="" />
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-1 text-[#34BE82]">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   <span className="text-[10px] font-black uppercase tracking-widest">Verified Purchase</span>
                </div>
              </div>
            ))}
            {reviews.length > 5 && (
              <button className="w-full py-3 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl active:bg-gray-100">View all {reviews.length} reviews</button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 grayscale opacity-60">
             <p className="text-xs font-bold text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>

      {/* SOLD BY SECTION */}
      <div className="mt-2 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Shop Information</h3>
          <button className="text-[#F43397] text-xs font-bold active:opacity-60">View Shop</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-black text-xl italic shadow-inner">
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
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;