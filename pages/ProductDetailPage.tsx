import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import StarRating from '../components/StarRating';
import { ChevronLeftIcon } from '../components/icons/ChevronLeftIcon';
import { HeartIcon } from '../components/icons/HeartIcon';
import { ShareIcon } from '../components/icons/ShareIcon';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ProductCard from '../components/ProductCard';
import { useVendors } from '../context/VendorContext';
import Toast from '../components/Toast';

type Tab = 'description' | 'highlights' | 'specs' | 'reviews' | 'shipping';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProduct } = useProducts();
  const { addToCart } = useCart();
  const { user, isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { getVendorById } = useVendors();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [showAddedToast, setShowAddedToast] = useState(false);
  
  // Touch Swiping Logic
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendorId) : null;

  const displayImages = product?.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/600x600?text=No+Image+Available'];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    } else if (isRightSwipe) {
      setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  };

  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
    setCurrentImageIndex(0);
    window.scrollTo(0, 0);
  }, [productId, product, isAuthenticated]);

  if (!product) {
    return <div className="text-center p-20 text-text-main font-bold italic uppercase tracking-widest">Product not found</div>;
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'approved').slice(0, 4);

  const handleToggleWishlist = () => {
    if (!isAuthenticated) navigate('/login'); 
    else isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description': return <p className="text-text-secondary leading-relaxed text-sm font-medium">{product.description}</p>;
      case 'highlights': return (
        <ul className="space-y-4">
          {product.highlights?.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium text-text-secondary">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5"><svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      );
      case 'specs': return (
        <div className="space-y-1">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="flex border-b border-border py-4 last:border-0">
              <span className="w-1/3 text-text-muted uppercase text-[9px] font-black tracking-widest">{key}</span>
              <span className="w-2/3 text-text-main font-bold tracking-tight">{value}</span>
            </div>
          ))}
        </div>
      );
      case 'reviews': return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-surface p-6 rounded-2xl">
            <div className="text-center">
              <p className="text-4xl font-black text-text-main tracking-tighter">{product.rating || '0.0'}</p>
              <StarRating rating={product.rating} />
              <p className="text-[10px] font-bold text-text-muted mt-1 uppercase">{product.reviewCount} Ratings</p>
            </div>
            <div className="flex-grow space-y-1">
              {[5, 4, 3, 2, 1].map(num => (
                <div key={num} className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-text-muted w-2">{num}</span>
                  <div className="flex-grow h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(product.reviews.filter(r => r.rating === num).length / (product.reviewCount || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {product.reviews.length > 0 ? product.reviews.map((review) => (
            <div key={review.id} className="p-4 border border-border rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-xs font-bold text-text-main">{review.author}</span>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-[9px] text-text-muted font-bold">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-text-secondary italic">"{review.comment}"</p>
            </div>
          )) : <p className="text-center py-8 text-text-muted italic text-sm">No verified reviews yet.</p>}
        </div>
      );
      case 'shipping': return (
        <div className="space-y-4">
           <div className="p-4 bg-surface rounded-2xl flex items-center gap-4">
              <img src={vendor?.profile_image} className="w-12 h-12 rounded-xl object-cover border border-border" />
              <div>
                 <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Shipped from</p>
                 <p className="font-bold text-text-main italic">{vendor?.store_name || 'VexoKart Warehouse'}</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-xl">
                 <p className="text-[9px] font-black text-text-muted uppercase mb-1">Returns</p>
                 <p className="text-xs font-bold">{product.returnPolicy}</p>
              </div>
              <div className="p-4 border border-border rounded-xl">
                 <p className="text-[9px] font-black text-text-muted uppercase mb-1">Warranty</p>
                 <p className="text-xs font-bold">{product.warranty}</p>
              </div>
           </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toast message="Added to bag" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      
      {/* Top Nav */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full text-text-main shadow-sm"><ChevronLeftIcon className="h-5 w-5" /></button>
        <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 bg-surface rounded-full text-text-main shadow-sm"><ShareIcon className="w-5 h-5" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-surface rounded-full shadow-sm ${isWishlisted ? 'text-accent' : 'text-text-main'}`}><HeartIcon className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>
      </div>

      {/* Multi-Image Swipeable Gallery */}
      <div 
        className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden mb-4 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
          {displayImages.map((img, idx) => (
             <img 
               key={idx}
               src={img} 
               alt={`${product.name} - ${idx + 1}`}
               className={`absolute inset-0 w-full h-full object-contain p-8 transition-all duration-500 ease-out ${
                 idx === currentImageIndex ? 'opacity-100 translate-x-0' : idx < currentImageIndex ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'
               }`} 
             />
          ))}

          {displayImages.length > 1 && (
            <div className="absolute bottom-6 flex gap-2 z-10">
              {displayImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${currentImageIndex === i ? 'w-6 bg-accent shadow-lg shadow-accent/20' : 'w-1.5 bg-border hover:bg-text-muted'}`}
                ></button>
              ))}
            </div>
          )}

          {/* Desktop Navigation */}
          {displayImages.length > 1 && (
            <div className="hidden md:contents">
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev - 1 + displayImages.length) % displayImages.length)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/50 hover:bg-white rounded-full shadow-lg transition-all z-20"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setCurrentImageIndex(prev => (prev + 1) % displayImages.length)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/50 hover:bg-white rounded-full shadow-lg transition-all rotate-180 z-20"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            </div>
          )}
      </div>

      <div className="px-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1"><StarRating rating={product.rating} /><span className="text-[10px] font-bold text-text-muted">({product.reviewCount})</span></div>
          </div>
          <h1 className="text-2xl font-black text-text-main tracking-tight leading-tight uppercase italic">{product.name}</h1>
        </div>

        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-black text-text-main tracking-tight">₹{product.price.toLocaleString('en-IN')}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-center gap-2">
              <p className="text-base text-text-muted line-through opacity-60 italic">₹{product.originalPrice.toLocaleString('en-IN')}</p>
              <span className="text-xs font-black text-accent">{discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Dynamic Tab Navigation */}
        <div className="pt-6">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar scroll-smooth mb-6">
            {(['description', 'highlights', 'specs', 'reviews', 'shipping'] as Tab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-shrink-0 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-accent' : 'text-text-muted'}`}
              >
                {tab === 'description' ? 'Info' : tab === 'shipping' ? 'Delivery' : tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full"></div>}
              </button>
            ))}
          </div>
          <div className="min-h-[160px] animate-in fade-in duration-300">{renderTabContent()}</div>
        </div>

        {/* Similar Items */}
        {similarProducts.length > 0 && (
          <div className="pt-10 border-t border-border">
             <h2 className="text-lg font-black text-text-main italic tracking-tighter uppercase mb-6">Similar Picks</h2>
             <div className="grid grid-cols-2 gap-4">
               {similarProducts.slice(0, 2).map(p => <ProductCard key={p.id} product={p} />)}
             </div>
          </div>
        )}
      </div>
      
      {/* Checkout Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border flex items-center gap-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
         <button onClick={() => { addToCart(product); setShowAddedToast(true); }} className="flex-1 border-2 border-accent text-accent font-black uppercase tracking-widest text-xs py-4 rounded-2xl active:scale-95 transition-all">
            Add to Bag
         </button>
         <button onClick={() => { addToCart(product); navigate('/checkout'); }} className="flex-[1.5] bg-accent text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all">
            Checkout Now
         </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;