
import React, { useState, useEffect } from 'react';
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

type Tab = 'description' | 'highlights' | 'specs' | 'shipping';

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
  
  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendorId) : null;

  const TABS: { id: Tab; label: string; isVisible: boolean }[] = [
    { id: 'description', label: 'Description', isVisible: !!product?.description },
    { id: 'highlights', label: 'Highlights', isVisible: !!product?.highlights && product.highlights.length > 0 },
    { id: 'specs', label: 'Specifications', isVisible: !!product?.specifications && Object.keys(product.specifications).length > 0 },
    { id: 'shipping', label: 'Shipping & Policy', isVisible: true },
  ];

  const visibleTabs = TABS.filter(t => t.isVisible);
  
  useEffect(() => {
    if (product && isAuthenticated) {
      addRecentlyViewed(product.id);
    }
    setCurrentImageIndex(0);
    setActiveTab(visibleTabs[0]?.id || 'description');
  }, [productId, product, isAuthenticated, addRecentlyViewed]);

  if (!product) {
    return <div className="text-center p-8 text-text-main">Product not found</div>;
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id && p.status === 'approved').slice(0, 4);
  const recentlyViewedProducts = user?.recentlyViewed.map(id => getProduct(id)).filter(p => p && p.id !== product.id && p.status === 'approved') || [];

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

  const handleAddToCart = () => { addToCart(product); };
  const handleBuyNow = () => { addToCart(product); navigate('/checkout'); };

  const nextImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
    }
    return url;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description': return <p className="text-text-secondary leading-relaxed text-sm">{product.description}</p>;
      case 'highlights': return <ul className="list-disc list-inside text-text-secondary space-y-2 text-sm">{product.highlights?.map((h, i) => <li key={i}>{h}</li>)}</ul>;
      case 'specs': return <div className="text-sm">{Object.entries(product.specifications || {}).map(([key, value]) => (<div key={key} className="flex border-b border-gray-700/50 py-2"><span className="w-1/3 text-text-muted">{key}</span><span className="w-2/3 text-text-main">{value}</span></div>))}</div>;
      case 'shipping': return <div className="text-sm text-text-secondary space-y-4">
          <div className="flex items-center gap-3">
            <img src={vendor?.storeLogo || `https://ui-avatars.com/api/?name=${vendor?.storeName || 'V'}`} alt={vendor?.storeName} className="w-12 h-12 rounded-full object-cover bg-surface border border-border" />
            <div>
              <p className="text-text-muted text-xs">Sold By</p>
              <p className="font-semibold text-text-main">{vendor?.storeName || product.sellerInfo || 'VexoKart'}</p>
            </div>
          </div>
          <p><strong className="text-text-secondary">Return Policy:</strong> {product.returnPolicy || '30-Day Returns'}</p>
          <p><strong className="text-text-secondary">Warranty:</strong> {product.warranty || '1 Year Brand Warranty'}</p>
        </div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-text-secondary">
      {/* Image Lightbox Modal */}
      {showImageLightbox && (
          <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300" onClick={() => setShowImageLightbox(false)}>
              <button className="absolute top-6 right-6 text-white text-3xl font-light hover:scale-110 transition">&times;</button>
              <img src={product.images[currentImageIndex]} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} alt="Product High Res" />
          </div>
      )}

      {/* Video Modal */}
      {showVideoModal && product.videoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowVideoModal(false)}>
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-text-main rounded-full hover:bg-black/70 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <iframe className="w-full h-full" src={getEmbedUrl(product.videoUrl)} title="Product Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="relative group/gallery">
        <div className="w-full h-96 bg-surface flex items-center justify-center overflow-hidden cursor-zoom-in relative" onClick={() => setShowImageLightbox(true)}>
             <img src={product.images[currentImageIndex]} alt={product.name} className="max-w-full max-h-full object-contain p-4 drop-shadow-2xl transition-transform duration-500 hover:scale-105" />
            
            {product.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                    <button onClick={prevImage} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <button onClick={nextImage} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all rotate-180"><ChevronLeftIcon className="w-6 h-6" /></button>
                </div>
            )}
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>

        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-text-main hover:bg-black/50 transition backdrop-blur-md border border-white/5 shadow-lg"><ChevronLeftIcon className="h-6 w-6" /></button>
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="p-2 bg-black/30 rounded-full text-text-main hover:bg-black/50 transition backdrop-blur-md border border-white/5 shadow-lg"><ShareIcon className="w-6 h-6" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-black/30 rounded-full transition-colors backdrop-blur-md border border-white/5 shadow-lg ${isWishlisted ? 'text-red-500' : 'text-text-main hover:text-red-400'}`}><HeartIcon className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>

        {/* Video Play Button */}
        {product.videoUrl && (
            <button onClick={(e) => { e.stopPropagation(); setShowVideoModal(true); }} className="absolute bottom-6 right-6 p-4 bg-accent/90 rounded-full shadow-2xl transform hover:scale-110 active:scale-95 transition-all backdrop-blur-md z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
        )}
      </div>

      <div className="flex justify-center gap-2 p-2 -mt-4 relative z-10 overflow-x-auto no-scrollbar max-w-full px-4">
        {product.images.map((img, index) => (
            <div key={index} className="flex-shrink-0 relative group">
                <img src={img} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-xl object-cover cursor-pointer border-2 transition-all shadow-md ${currentImageIndex === index ? 'border-accent ring-2 ring-accent/20' : 'border-border opacity-70 hover:opacity-100 hover:border-text-muted'}`} />
            </div>
        ))}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight leading-tight italic uppercase">{product.name}</h1>
            <div className="flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-sm text-text-muted font-bold tracking-tight">{product.rating} ({product.reviewCount} Reviews)</span>
            </div>
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-black text-accent tracking-tighter italic">₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
                <p className="text-lg text-text-muted line-through opacity-75 decoration-red-500/50">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                <span className="text-xs font-black text-green-400 bg-green-900/40 px-2 py-1 rounded-md border border-green-500/20 uppercase tracking-widest">{discount}% OFF</span>
            </>
          )}
        </div>
        
        {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                <p className="text-xs font-black text-orange-400 uppercase tracking-widest">Hurry, only {product.stock} units left in stock!</p>
            </div>
        )}

        {/* Info Tabs */}
        <div className="pt-2">
          <div className="flex border-b border-border mb-4 overflow-x-auto no-scrollbar">
            {visibleTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[120px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            {renderTabContent()}
          </div>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && (
            <section className="pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">Similar Items</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {similarProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </section>
        )}
      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-xl border-t border-white/5 flex items-center gap-3 z-50">
         <button onClick={handleAddToCart} className="w-1/2 bg-surface border border-accent/40 text-accent font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-lg hover:bg-accent/10 transition-all active:scale-95">
            Add to Cart
         </button>
         <button onClick={handleBuyNow} className="w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl shadow-2xl shadow-orange-500/20 hover:brightness-110 transition-all active:scale-95">
            Buy Now
         </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
