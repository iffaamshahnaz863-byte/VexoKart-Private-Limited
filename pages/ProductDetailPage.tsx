
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  
  const productId = parseInt(id || '');
  const product = getProduct(productId);
  const vendor = product ? getVendorById(product.vendorId) : null;

  // Define tabs and their visibility logic
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
     // Reset state on component mount/id change
    setCurrentImageIndex(0);
    // Set active tab to the first visible tab
    setActiveTab(visibleTabs[0]?.id || 'description');
  }, [productId, product, isAuthenticated, addRecentlyViewed]);

  if (!product) {
    return <div className="text-center p-8 text-text-main">Product not found</div>;
  }

  const isWishlisted = isInWishlist(product.id);
  const discount = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const recentlyViewedProducts = user?.recentlyViewed.map(id => getProduct(id)).filter(p => p && p.id !== product.id) || [];

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
            <img src={vendor?.storeLogo || 'https://picsum.photos/seed/storelogo/100'} alt={vendor?.storeName} className="w-12 h-12 rounded-full object-cover bg-surface" />
            <div>
              <p className="text-text-muted text-xs">Sold By</p>
              <p className="font-semibold text-text-main">{vendor?.storeName || product.sellerInfo || 'VexoKart'}</p>
            </div>
          </div>
          <p><strong className="text-text-secondary">Return Policy:</strong> {product.returnPolicy || 'N/A'}</p>
          <p><strong className="text-text-secondary">Warranty:</strong> {product.warranty || 'N/A'}</p>
        </div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Video Modal */}
      {showVideoModal && product.videoUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md" onClick={() => setShowVideoModal(false)}>
            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-border" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setShowVideoModal(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-text-main rounded-full hover:bg-black/70 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {product.videoUrl.includes('youtube') || product.videoUrl.includes('youtu.be') ? (
                    <iframe 
                        className="w-full h-full" 
                        src={getEmbedUrl(product.videoUrl)} 
                        title="Product Video" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                ) : (
                    <video className="w-full h-full" controls autoPlay>
                        <source src={product.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        </div>
      )}

      {/* Image Gallery */}
      <div className="relative">
        <img src={product.images[currentImageIndex]} alt={product.name} className="w-full h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        {/* Play Button Overlay */}
        {product.videoUrl && (
            <button 
                onClick={() => setShowVideoModal(true)}
                className="absolute inset-0 flex items-center justify-center group"
            >
                <div className="p-4 bg-accent/80 rounded-full shadow-lg transform group-hover:scale-110 transition-transform backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <span className="absolute bottom-24 bg-surface/80 text-text-main text-xs font-bold px-3 py-1 rounded-full border border-border group-hover:bg-accent transition-colors">
                    Watch Product Video
                </span>
            </button>
        )}

        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-text-main hover:bg-black/50 transition"><ChevronLeftIcon className="h-6 w-6" /></button>
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="p-2 bg-black/30 rounded-full text-text-main hover:bg-black/50 transition"><ShareIcon className="w-6 h-6" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-black/30 rounded-full transition-colors ${isWishlisted ? 'text-red-500' : 'text-text-main hover:text-red-400'}`}><HeartIcon className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>
      </div>
      <div className="flex justify-center gap-2 p-2 -mt-10 relative z-10">
        {product.images.map((img, index) => (
            <img key={index} src={img} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${currentImageIndex === index ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'}`}/>
        ))}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-text-main">{product.name}</h1>
        <div className="flex items-center"><StarRating rating={product.rating} /><span className="text-xs text-text-muted ml-2">{product.rating} ({product.reviewCount} reviews)</span></div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-accent">₹{product.price.toFixed(2)}</p>
          {product.originalPrice && product.originalPrice > product.price && <>
            <p className="text-lg text-text-muted line-through opacity-75">₹{product.originalPrice.toFixed(2)}</p>
            <span className="text-sm font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-md">{discount}% OFF</span>
          </>}
        </div>
        {product.stock !== undefined && product.stock > 0 && product.stock < 10 && <p className="text-sm font-semibold text-orange-400">Hurry, only {product.stock} left!</p>}

        {/* Info Tabs */}
        <div className="pt-2">
          <div className="flex border-b border-gray-700 mb-4 overflow-x-auto">
            {visibleTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 text-sm font-semibold capitalize transition-colors ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-text-muted hover:text-text-secondary'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="min-h-[100px]">{renderTabContent()}</div>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && <section>
          <h2 className="text-xl font-bold text-text-main mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-4">{similarProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>}
        
        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && <section>
          <h2 className="text-xl font-bold text-text-main mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 gap-4">{recentlyViewedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>}

      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-surface/90 backdrop-blur-md border-t border-gray-700/50 flex items-center gap-2">
         <button onClick={handleAddToCart} className="w-1/2 bg-white/10 border border-accent text-accent font-bold py-3 rounded-xl shadow-lg hover:bg-white/20 transition">Add to Cart</button>
         <button onClick={handleBuyNow} className="w-1/2 bg-gradient-to-r from-accent to-accent-secondary text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 transition">Buy Now</button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
