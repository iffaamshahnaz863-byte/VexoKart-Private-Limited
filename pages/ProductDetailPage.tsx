import React, { useState, useEffect, useMemo } from 'react';
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
  const { isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const { getVendorById } = useVendors();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [showAddedToast, setShowAddedToast] = useState(false);
  
  // Requirement: Variants state
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendorId) : null;

  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
    setCurrentImageIndex(0);
    window.scrollTo(0, 0);
    
    // Auto-select first variant if available
    if (product?.colors?.length) setSelectedColor(product.colors[0].name);
    if (product?.sizes?.length) setSelectedSize(product.sizes[0]);
  }, [productId, product, isAuthenticated]);

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-white">
            <div className="text-center">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-xl font-black text-text-main italic uppercase tracking-tight">Product Unlisted</h2>
                <p className="text-text-muted text-xs mt-2">The requested item has been moved or removed.</p>
                <button onClick={() => navigate('/')} className="mt-8 bg-accent text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Return to Catalog</button>
            </div>
        </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const mrp = Number(product.originalPrice || product.price);
  const sellingPrice = Number(product.price);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'approved').slice(0, 4);

  const displayImages = useMemo(() => {
      // If a color variant with a specific image is selected, we could prioritize it, 
      // but requirement says Detail page uses full gallery.
      return product.images.length > 0 ? product.images : ['https://via.placeholder.com/600x600?text=No+Image+Available'];
  }, [product]);

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
        alert("Please select a size first.");
        return;
    }
    addToCart({ ...product, selectedColor, selectedSize } as any);
    setShowAddedToast(true);
  };

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

  return (
    <div className="min-h-screen bg-white pb-32">
      <Toast message="Added to Bag" isVisible={showAddedToast} onClose={() => setShowAddedToast(false)} />
      
      {/* Dynamic Navigation */}
      <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-border">
        <button onClick={() => navigate(-1)} className="p-2 bg-surface rounded-full text-text-main shadow-sm border border-border"><ChevronLeftIcon className="h-5 w-5" /></button>
        <h1 className="text-[11px] font-black uppercase tracking-widest text-text-main max-w-[200px] truncate italic">{product.name}</h1>
        <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 bg-surface rounded-full text-text-main shadow-sm border border-border"><ShareIcon className="w-5 h-5" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-surface rounded-full shadow-sm border border-border ${isWishlisted ? 'text-red-500' : 'text-text-main'}`}><HeartIcon className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>
      </div>

      {/* Gallery Slider */}
      <div className="relative w-full aspect-[3/4] bg-surface overflow-hidden group">
          <div className="flex transition-transform duration-500 h-full" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
              {displayImages.map((img, idx) => (
                  <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center">
                    <img src={img} className="w-full h-full object-cover" alt={`${product.name} ${idx}`} />
                  </div>
              ))}
          </div>
          {displayImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
              {displayImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-1 rounded-full transition-all ${currentImageIndex === i ? 'w-6 bg-accent' : 'w-2 bg-text-muted/40'}`}
                ></button>
              ))}
            </div>
          )}
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded border border-green-100">
                <span className="text-xs font-black text-green-700">{product.rating || '4.2'}</span>
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>
          <h1 className="text-2xl font-black text-text-main tracking-tight leading-none uppercase italic">{product.name}</h1>
          <p className="text-xs text-text-muted font-bold">Sold by: <span className="text-accent underline">{vendor?.store_name || 'VexoKart Direct'}</span></p>
        </div>

        {/* Pricing */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-text-main tracking-tight italic">₹{sellingPrice.toLocaleString('en-IN')}</span>
            {discountPercent > 0 && (
                <>
                    <span className="text-lg text-text-muted line-through opacity-60">₹{mrp.toLocaleString('en-IN')}</span>
                    <span className="text-lg font-black text-orange-500">({discountPercent}% OFF)</span>
                </>
            )}
          </div>
          <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Inclusive of all taxes</p>
        </div>

        {/* Variant Selectors */}
        {product.colors && product.colors.length > 0 && (
            <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Selected Shade: <span className="text-text-main">{selectedColor}</span></p>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                    {product.colors.map((color, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedColor(color.name)}
                            className={`flex-shrink-0 w-12 h-12 rounded-full border-2 p-0.5 transition-all ${selectedColor === color.name ? 'border-accent scale-110 shadow-lg' : 'border-border'}`}
                        >
                            <img src={color.image} className="w-full h-full rounded-full object-cover" alt={color.name} />
                        </button>
                    ))}
                </div>
            </div>
        )}

        {product.sizes && product.sizes.length > 0 && (
             <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Select Fit</p>
                    <button className="text-[9px] font-black uppercase text-accent tracking-tighter">Size Chart</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                        <button 
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`w-12 h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center border-2 ${selectedSize === size ? 'border-accent bg-accent text-white shadow-xl shadow-accent/20' : 'border-border bg-white text-text-main hover:border-accent'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Content Tabs */}
        <div className="pt-6 border-t border-border">
          <div className="flex border-b border-border overflow-x-auto no-scrollbar mb-6">
            {(['highlights', 'description', 'shipping'] as Tab[]).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-shrink-0 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-accent' : 'text-text-muted'}`}
              >
                {tab === 'description' ? 'About' : tab === 'shipping' ? 'Dispatch' : tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-t-full"></div>}
              </button>
            ))}
          </div>
          <div className="min-h-[160px]">
              {activeTab === 'highlights' && (
                <ul className="space-y-4">
                    {(product.highlights || ['Premium built', 'Verified quality', 'Authorized dealer']).map((h, i) => (
                        <li key={i} className="flex items-start gap-4 text-xs font-bold text-text-secondary">
                        <div className="w-6 h-6 rounded-lg bg-accent/5 flex items-center justify-center shrink-0 border border-accent/10"><svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                        <span className="mt-1 leading-relaxed uppercase tracking-tighter">{h}</span>
                        </li>
                    ))}
                </ul>
              )}
              {activeTab === 'description' && (
                <p className="text-text-secondary leading-relaxed text-xs font-medium whitespace-pre-wrap uppercase tracking-tighter opacity-80">{product.description}</p>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-surface rounded-2xl border border-border">
                            <p className="text-[9px] font-black text-text-muted uppercase mb-1">Standard Delivery</p>
                            <p className="text-xs font-bold text-text-main italic">Expected in 3-5 Working Days</p>
                        </div>
                        <div className="p-4 bg-surface rounded-2xl border border-border">
                            <p className="text-[9px] font-black text-text-muted uppercase mb-1">Returns</p>
                            <p className="text-xs font-bold text-text-main italic">{product.returnPolicy || '7 Day Replacement'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {product.allow_cod && (
                            <span className="bg-green-50 text-green-600 text-[8px] font-black uppercase px-2 py-1 rounded border border-green-100 tracking-widest">COD Available</span>
                        )}
                        {product.allow_online && (
                            <span className="bg-blue-50 text-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded border border-blue-100 tracking-widest">Digital Ready</span>
                        )}
                    </div>
                </div>
              )}
          </div>
        </div>

        {/* Similar items */}
        {similarProducts.length > 0 && (
          <div className="pt-10 border-t border-border">
             <h2 className="text-sm font-black text-text-main italic tracking-widest uppercase mb-6">Discovery Queue</h2>
             <div className="grid grid-cols-2 gap-3">
               {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
          </div>
        )}
      </div>
      
      {/* Sticky Checkout Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-border flex items-center gap-3 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
         <button 
            onClick={handleAddToCart}
            className="flex-1 bg-white border-2 border-text-main text-text-main font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl active:scale-95 transition-all hover:bg-surface"
        >
            Bag It
         </button>
         <button 
            onClick={() => { handleAddToCart(); navigate('/checkout'); }} 
            className="flex-[1.5] bg-accent text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl shadow-2xl shadow-accent/20 active:scale-95 transition-all"
        >
            Buy Now
         </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;