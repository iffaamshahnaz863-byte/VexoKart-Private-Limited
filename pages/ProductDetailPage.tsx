
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

type Tab = 'description' | 'highlights' | 'specs' | 'shipping';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, getProduct } = useProducts();
  const { addToCart } = useCart();
  const { user, isAuthenticated, addToWishlist, removeFromWishlist, isInWishlist } = useAuth();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  
  const productId = parseInt(id || '');
  const product = getProduct(productId);

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
    return <div className="text-center p-8">Product not found</div>;
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description': return <p className="text-gray-300 leading-relaxed text-sm">{product.description}</p>;
      case 'highlights': return <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">{product.highlights?.map((h, i) => <li key={i}>{h}</li>)}</ul>;
      case 'specs': return <div className="text-sm">{Object.entries(product.specifications || {}).map(([key, value]) => (<div key={key} className="flex border-b border-gray-700/50 py-2"><span className="w-1/3 text-gray-400">{key}</span><span className="w-2/3 text-white">{value}</span></div>))}</div>;
      case 'shipping': return <div className="text-sm text-gray-300 space-y-3">
          <p><strong className="text-gray-200">Sold By:</strong> {product.sellerInfo || 'VexoKart'}</p>
          <p><strong className="text-gray-200">Return Policy:</strong> {product.returnPolicy || 'N/A'}</p>
          <p><strong className="text-gray-200">Warranty:</strong> {product.warranty || 'N/A'}</p>
        </div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-charcoal pb-24">
      {/* Image Gallery */}
      <div className="relative">
        <img src={product.images[currentImageIndex]} alt={product.name} className="w-full h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-charcoal via-transparent to-transparent"></div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/30 rounded-full text-white"><ChevronLeftIcon className="h-6 w-6" /></button>
        <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleShare} className="p-2 bg-black/30 rounded-full text-white"><ShareIcon className="w-6 h-6" /></button>
            <button onClick={handleToggleWishlist} className={`p-2 bg-black/30 rounded-full transition-colors ${isWishlisted ? 'text-red-500' : 'text-white'}`}><HeartIcon className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'}/></button>
        </div>
      </div>
      <div className="flex justify-center gap-2 p-2 -mt-10 relative z-10">
        {product.images.map((img, index) => (
            <img key={index} src={img} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-all ${currentImageIndex === index ? 'border-accent' : 'border-transparent opacity-60'}`}/>
        ))}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-white">{product.name}</h1>
        <div className="flex items-center"><StarRating rating={product.rating} /><span className="text-xs text-gray-400 ml-2">{product.rating} ({product.reviewCount} reviews)</span></div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-accent">₹{product.price.toFixed(2)}</p>
          {product.originalPrice && product.originalPrice > product.price && <>
            <p className="text-lg text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</p>
            <span className="text-sm font-bold text-green-400 bg-green-900/50 px-2 py-0.5 rounded-md">{discount}% OFF</span>
          </>}
        </div>
        {product.stock !== undefined && product.stock > 0 && product.stock < 10 && <p className="text-sm font-semibold text-orange-400">Hurry, only {product.stock} left!</p>}

        {/* Info Tabs */}
        <div className="pt-2">
          <div className="flex border-b border-gray-700 mb-4 overflow-x-auto">
            {visibleTabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2 text-sm font-semibold capitalize transition-colors ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="min-h-[100px]">{renderTabContent()}</div>
        </div>
        
        {/* Similar Products */}
        {similarProducts.length > 0 && <section>
          <h2 className="text-xl font-bold text-white mb-4">You Might Also Like</h2>
          <div className="grid grid-cols-2 gap-4">{similarProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>}
        
        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && <section>
          <h2 className="text-xl font-bold text-white mb-4">Recently Viewed</h2>
          <div className="grid grid-cols-2 gap-4">{recentlyViewedProducts.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </section>}

      </div>
      
      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-2 bg-navy-light/90 backdrop-blur-md border-t border-gray-700/50 flex items-center gap-2">
         <button onClick={handleAddToCart} className="w-1/2 bg-white/10 border border-accent text-accent font-bold py-3 rounded-xl shadow-lg">Add to Cart</button>
         <button onClick={handleBuyNow} className="w-1/2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold py-3 rounded-xl shadow-lg">Buy Now</button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
