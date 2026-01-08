import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header.tsx';
import ProductCard from '../components/ProductCard.tsx';
import BannerCarousel from '../components/BannerCarousel.tsx';
import { useProducts } from '../hooks/useProducts.ts';
import { useCategories } from '../hooks/useCategories.ts';
import { useBanners } from '../context/BannerContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedCatName = searchParams.get('category') || 'All';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const liveProducts = products.filter(p => {
    const isLive = p.status === 'approved' || p.status === 'live';
    const matchesCategory = selectedCatName === 'All' || p.category === selectedCatName;
    return isLive && matchesCategory;
  });

  const activeBanners = banners.filter(b => b.status).map(b => b.image_url);

  const recentlyViewedProducts = user?.recentlyViewed 
    ? products.filter(p => user.recentlyViewed.includes(p.id)) 
    : [];

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCatName === categoryName) {
        navigate('/');
    } else {
        navigate(`/?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-20 font-sans selection:bg-accent/30 overflow-x-hidden">
      <Header />
      
      {/* 1. MAIN BANNERS */}
      <section className="p-3 bg-white">
        {activeBanners.length > 0 ? (
           <BannerCarousel banners={activeBanners} />
        ) : (
           <div className="w-full h-40 bg-gray-50 rounded-2xl animate-pulse border border-gray-100 flex items-center justify-center">
             <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Synchronizing Global Promos...</span>
           </div>
        )}
      </section>

      {/* 2. CATEGORY SCROLL */}
      <section className="bg-white pb-4 overflow-hidden border-b border-gray-100">
        <div 
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto px-4 no-scrollbar scroll-smooth"
        >
          <div 
              onClick={() => navigate('/')}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
          >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${selectedCatName === 'All' ? 'border-accent bg-accent/5' : 'border-gray-100 bg-gray-50'}`}>
                  <svg className={`w-6 h-6 ${selectedCatName === 'All' ? 'text-accent' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedCatName === 'All' ? 'text-accent' : 'text-gray-500'}`}>All</span>
          </div>

          {categories.map(category => (
              <div 
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                  <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all ${selectedCatName === category.name ? 'border-accent' : 'border-gray-100 group-hover:border-gray-200'}`}>
                      <img src={category.image || 'https://placehold.co/100x100/F8F9FA/A0A0A0?text=Cat'} alt={category.name} className="w-full h-full object-cover" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${selectedCatName === category.name ? 'text-accent' : 'text-gray-500'}`}>{category.name}</span>
              </div>
          ))}
        </div>
      </section>

      {/* 3. RECENTLY VIEWED */}
      {recentlyViewedProducts.length > 0 && selectedCatName === 'All' && (
        <section className="mt-4 px-4">
            <h3 className="text-xs font-black text-gray-900 uppercase italic tracking-widest mb-3 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
               Pick up where you left off
            </h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {recentlyViewedProducts.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => navigate(`/product/${p.id}`)}
                        className="w-28 flex-shrink-0 bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform"
                    >
                        <div className="aspect-square bg-gray-50">
                            <img src={p.images[0]} className="w-full h-full object-contain" alt="" />
                        </div>
                        <div className="p-2">
                            <p className="text-[10px] font-black text-gray-900 truncate">₹{p.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
      )}

      {/* 4. PRODUCT FEED */}
      <section className="p-2 pt-6">
        <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">
                {selectedCatName === 'All' ? 'Products For You' : `${selectedCatName} Collection`}
            </h2>
            <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border border-green-200">Free Delivery</div>
        </div>

        <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
              <>
                  {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </>
          ) : liveProducts.length > 0 ? (
            liveProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
             <div className="col-span-full py-32 text-center bg-white rounded-3xl border border-dashed border-gray-200 m-2">
               <svg className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No matches in this collection</p>
               <button onClick={() => navigate('/')} className="mt-4 text-accent font-black uppercase text-[10px] underline underline-offset-4">Reset Discovery</button>
             </div>
          )}
        </div>
      </section>

      {/* 5. ADSENSE HIGH-VALUE CONTENT ARTICLE SECTION */}
      <article className="mt-16 bg-white border-t border-gray-100 px-6 py-16 md:px-12 lg:px-24">
        <header className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 italic uppercase tracking-tighter mb-6">VexoKart: Redefining the Indian Digital Marketplace</h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">Welcome to VexoKart, India's premier authorized multi-vendor e-commerce platform. Built on the core philosophy of "Shop Online, Shop Smart," we bridge the gap between quality Indian manufacturers and discerning global consumers through a seamless, technology-driven shopping environment.</p>
        </header>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-600 leading-relaxed">
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4">The VexoKart Vision</h2>
                <p>In a rapidly evolving digital landscape, VexoKart stands out by prioritizing quality over volume. We understand that shopping is not just a transaction—it's an experience of discovery and trust. Our platform is designed from the ground up to empower both verified vendors and lifestyle-oriented buyers. By leveraging advanced inventory synchronization and hyper-local logistics, we ensure that every product listed is authentic, accurately described, and ready for dispatch.</p>
                <p>Our mission is simple: to make "Smart Shopping" the default standard for every household in India. Whether you are looking for the latest tech gear, artisan-crafted fashion, or everyday lifestyle essentials, VexoKart provides a curated selection that passes through a multi-tier quality audit.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4">How Our Platform Works</h2>
                <p>Operating as a sophisticated multi-vendor ecosystem, VexoKart utilizes a decentralized fulfillment node system. When a buyer browse our catalog, they are seeing real-time inventory from authorized merchant nodes across the country. Our Intelligent Routing Algorithm (IRA) automatically calculates the most efficient shipping path, reducing carbon footprint and delivery timelines significantly.</p>
                <ul className="list-none p-0 space-y-4">
                    <li className="flex items-start gap-3 italic"><span className="text-accent font-black">01.</span> <strong>Discovery:</strong> Use our AI-powered search to find products across categories like Electronics, Fashion, and Footwear.</li>
                    <li className="flex items-start gap-3 italic"><span className="text-accent font-black">02.</span> <strong>Selection:</strong> Inspect high-resolution galleries and verified customer reviews to make an informed choice.</li>
                    <li className="flex items-start gap-3 italic"><span className="text-accent font-black">03.</span> <strong>Secure Checkout:</strong> Choose between seamless UPI payments, Credit/Debit cards, or Cash on Delivery.</li>
                </ul>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4">Commitment to Quality & Transparency</h2>
                <p>One of the primary challenges in modern e-commerce is product authenticity. At VexoKart, we address this through our **VexoShield Manifest**. Every vendor wishing to join our platform undergoes a rigorous 7-step verification process, including supply chain legitimacy checks and manufacturing audits. This ensures that the products you buy aren't just "items" but verified assets of durability and style.</p>
                <p>Transparency is our currency. We provide detailed "Product Highlights" for every entry, including fabric composition, battery chemistry, and warranty details. If a product fails to meet the specified standards, our "No-Questions-Asked" return policy provides a safety net for our community.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4">Secure Payments and Data Integrity</h2>
                <p>Your safety is our highest priority. VexoKart employs end-to-end 256-bit SSL encryption for all browsing sessions. Our partnership with PCI-DSS compliant payment gateways ensures that your financial identity is never stored on our local servers. Whether you use biometric-authenticated UPI or tokenized card transactions, your data remains shielded from external threats.</p>
                <p>Furthermore, our robust customer support desk operates 24/7 to resolve any discrepancies in billing, tracking, or technical navigation. We believe that a marketplace is built on relationships, and trust is the foundation of every successful relationship on VexoKart.</p>
            </section>
        </div>

        <section className="mt-20 border-t border-gray-100 pt-16 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-8">Informational Resources for Consumers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Link to="/blog/safe-shopping" className="p-6 bg-surface rounded-3xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-2">Safety Guide</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent">Shopping Safely Online</p>
                </Link>
                <Link to="/blog/quality-guide" className="p-6 bg-surface rounded-3xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-2">Quality Audit</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent">Identifying Authentic Goods</p>
                </Link>
                <Link to="/about-us" className="p-6 bg-surface rounded-3xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-2">The Brand</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent">Our Corporate Mission</p>
                </Link>
                <Link to="/privacy-policy" className="p-6 bg-surface rounded-3xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-2">Legality</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent">Data Privacy Protocol</p>
                </Link>
            </div>
        </section>

        <footer className="mt-24 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-300">VexoKart Authorized Marketplace Manifesto • Manifest v2.1</p>
        </footer>
      </article>

      {/* Infinite Scroll Indicator */}
      {!isLoading && liveProducts.length > 0 && (
          <div className="py-12 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[9px] font-black uppercase text-gray-400 mt-2 tracking-widest italic">Curating your style...</span>
          </div>
      )}
    </div>
  );
};

export default HomePage;