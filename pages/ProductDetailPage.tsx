
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
import GlassmorphicCard from '../components/GlassmorphicCard';
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
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  
  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendorId) : null;

  // Auto-slide logic
  useEffect(() => {
    if (product && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 4000); // 4 seconds interval
      return () => clearInterval(interval);
    }
  }, [product, productId]);

  const TABS: { id: Tab; label: string; isVisible: boolean }[] = [
    { id: 'description', label: 'Info', isVisible: !!product?.description },
    { id: 'highlights', label: 'Highlights', isVisible: !!product?.highlights && product.highlights.length > 0 },
    { id: 'specs', label: 'Specs', isVisible: !!product?.specifications && Object.keys(product.specifications).length > 0 },
    { id: 'reviews', label: 'Reviews', isVisible: true },
    { id: 'shipping', label: 'Delivery', isVisible: true },
  ];

  const visibleTabs = TABS.filter(t => t.isVisible);
  
  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
    setCurrentImageIndex(0);
    setActiveTab(visibleTabs[0]?.id || 'description');
    window.scrollTo(0, 0);
  }, [productId, product, isAuthenticated]);

  if (!product) {
    return <div className="text-center p-8 text-text-main">Product not found</div>;
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'approved').slice(0, 4);

  const handleToggleWishlist = () => {
    if (!isAuthenticated) navigate('/login'); else isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAddToCart = () => { 
    addToCart(product); 
    setShowAddedToast(true);
  };

  const handleBuyNow = () => { addToCart(product); navigate('/checkout'); };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description': return <p className="text-text-secondary leading-relaxed text-sm font-medium">{product.description}</p>;
      case 'highlights': return (
        <ul className="space-y-4">
          {product.highlights?.map((h, i) => (
            <li key={i} className="flex items-start gap-3 text-sm font-medium text-text-secondary">
              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      );
      case 'specs': return (
        <div className="space-y-1">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="flex border-b border-border py-4 last:border-0 group">
              <span className="w-1/3 text-text-muted uppercase text-[9px] font-black tracking-widest group-hover:text-accent transition-colors">{key}</span>
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
              <div className="mt-1"><StarRating rating={product.rating} /></div>
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
          <div className="space-y-4">
            {product.reviews.length > 0 ? product.reviews.map((review) => (
              <div key={review.id} className="p-4 border border-border rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-main">{review.author}</span>
                      <span className="bg-green-100 text-green-600 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Verified</span>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <span className="text-[9px] text-text-muted font-bold">{new Date(review.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                </div>
                <p className="text-sm text-text-secondary italic">"{review.comment}"</p>
              </div>
            )) : (
              <p className="text-center py-8 text-text-muted italic text-sm">No verified reviews yet.</p>
            )}
          </div>
        </div>
      );
      case 'shipping': return <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 border border-border rounded-2xl">
            <img src={vendor?.storeLogo || `https://ui-avatars.com/api/?name=${vendor?.storeName || 'V'}`} className="w-12 h-12 rounded-full border border-border" />
            <div>
              <p className="text-[9px] font-bold text-text-muted uppercase">Seller</p>
              <p className="font-bold text-text-main">{vendor?.storeName || 'VexoKart Direct'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-surface rounded-xl">
               <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Return Policy</p>
               <p className="text-xs font-semibold text-text-secondary">{product.returnPolicy || '30-Day Returns'}</p>
             </div>
             <div className="p-4 bg-surface rounded-xl">
               <p className="text-[9px] font-bold text-text-muted uppercase mb-1">Warranty</p>
               <p className="text-xs font-semibold text-text-secondary">{product.warranty || '1 Year Brand'}</p>
             </div>
          </div>
        </div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Toast message="Added to bag" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      {/* Navigation & Actions */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full text-text-main shadow-sm"><ChevronLeftIcon className="h-5 w-5" /></button>
        <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 bg-surface rounded-full text-text-main shadow-sm"><ShareIcon className="w-5 h-5" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-surface rounded-full shadow-sm ${isWishlisted ? 'text-accent' : 'text-text-main'}`}><HeartIcon className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden mb-4">
          <img 
            src={product.images[currentImageIndex]} 
            className="max-w-full max-h-full object-contain p-8 animate-in fade-in transition-opacity duration-700" 
            alt={product.name}
          />
          {product.images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {product.images.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-1.5 transition-all duration-300 rounded-full ${currentImageIndex === i ? 'w-6 bg-accent' : 'w-1.5 bg-border'}`}
                ></button>
              ))}
            </div>
          )}
      </div>

      {/* Info Section */}
      <div className="px-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1"><StarRating rating={product.rating} /><span className="text-[10px] font-bold text-text-muted">({product.reviewCount})</span></div>
          </div>
          <h1 className="text-2xl font-black text-text-main tracking-tight leading-tight uppercase italic">{product.name}</h1>
        </div>

        <div className="flex items-baseline gap-4">
          <p className="text-3xl font-black text-text-main tracking-tight">₹{product.price.toLocaleString('en-IN')}</p>
          {product.originalPrice && (
            <div className="flex items-center gap-2">
              <p className="text-base text-text-muted line-through opacity-60 italic">₹{product.originalPrice.toLocaleString('en-IN')}</p>
              <span className="text-xs font-black text-accent">{discount}% OFF</span>
            </div>
          )}
        </div>

        {/* Tab System */}
        <div className="pt-6">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar scroll-smooth mb-6">
            {visibleTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-accent' : 'text-text-muted'}`}>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full"></div>}
              </button>
            ))}
          </div>
          <div className="min-h-[100px]">{renderTabContent()}</div>
        </div>

        {/* Recommendations */}
        {similarProducts.length > 0 && (
          <div className="pt-10 border-t border-border">
             <h2 className="text-lg font-black text-text-main italic tracking-tighter uppercase mb-6">You might also like</h2>
             <div className="grid grid-cols-2 gap-4">
               {similarProducts.slice(0, 2).map(p => <ProductCard key={p.id} product={p} />)}
             </div>
          </div>
        )}
      </div>
      
      {/* Dynamic CTA Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border flex items-center gap-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
         <button onClick={handleAddToCart} className="flex-1 border-2 border-accent text-accent font-black uppercase tracking-widest text-xs py-4 rounded-2xl hover:bg-accent/5 transition-all active:scale-95">
            Add to Cart
         </button>
         <button onClick={handleBuyNow} className="flex-[1.5] bg-accent text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-xl shadow-accent/20 active:scale-95 transition-all">
            Buy Experience
         </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
