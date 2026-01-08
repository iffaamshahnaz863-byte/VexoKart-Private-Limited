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

      {/* 5. ADSENSE RICH CONTENT SECTION (MANDATORY FOR APPROVAL) */}
      <article className="mt-12 px-6 py-12 bg-white border-t border-gray-100 prose prose-sm max-w-none">
        <header className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter mb-4">VexoKart: Redefining the Digital Commerce Experience in India</h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-3xl mx-auto">Discover a smarter way to shop online with VexoKart—India's premier authorized multi-vendor marketplace built on the pillars of trust, speed, and quality.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-600 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs mb-4 border-l-4 border-accent pl-4">The VexoKart Vision: Shop Online, Shop Smart</h2>
                <p>In an era where digital marketplaces are becoming increasingly crowded, VexoKart stands out by prioritizing the "Smart Shopping" philosophy. We believe that e-commerce should be more than just a transaction; it should be a seamless integration of technology and lifestyle. Our platform is designed from the ground up to empower both local Indian manufacturers and global distributors, providing them with a secure digital storefront to reach millions of discerning customers across the subcontinent.</p>
                <p className="mt-4">Our tagline, "Shop Online, Shop Smart," isn't just a marketing slogan—it's our operational blueprint. By leveraging advanced logistics protocols and real-time inventory management, we ensure that every product you see on our catalog is verified for authenticity and ready for immediate dispatch.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs mb-4 border-l-4 border-accent pl-4">How Our Multi-Vendor Marketplace Operates</h2>
                <p>VexoKart operates as a high-performance bridge between specialized vendors and consumers. Unlike traditional retail models, our marketplace utilizes a decentralized fulfillment node system. When you place an order, our Intelligent Routing Protocol identifies the closest authorized merchant holding the stock. This ensures that your package travels the shortest possible distance, reducing carbon footprint and drastically cutting down delivery times.</p>
                <ul className="mt-4 space-y-2 list-none p-0">
                    <li className="flex items-start gap-2"><span className="text-accent font-black">✔</span> <strong>Merchant Verification:</strong> Every vendor undergoes a rigorous 7-step identity and supply chain audit.</li>
                    <li className="flex items-start gap-2"><span className="text-accent font-black">✔</span> <strong>Catalog Integrity:</strong> We use automated vision tools to ensure product descriptions match the physical inventory.</li>
                    <li className="flex items-start gap-2"><span className="text-accent font-black">✔</span> <strong>Secure Settlements:</strong> Payments are processed via PCI-DSS compliant gateways like Razorpay.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs mb-4 border-l-4 border-accent pl-4">A Commitment to Quality Assurance and Consumer Trust</h2>
                <p>Consumer trust is the currency of the digital age. At VexoKart, we maintain this trust through our VexoShield program. This comprehensive quality assurance framework involves random stock inspections and a strict "Anti-Counterfeit" policy. If a product fails to meet our stringent standards, it is immediately archived, and the vendor is flagged for internal review. This relentless pursuit of excellence ensures that when you see the "Verified Partner" badge on a Product Card, you are buying with absolute confidence.</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs mb-4 border-l-4 border-accent pl-4">Secure Logistics and Pan-India Delivery</h2>
                <p>Navigating the complex geography of India requires a robust logistics backbone. VexoKart partners with leading national courier networks to provide door-to-door fulfillment even in Tier-3 cities and rural districts. Every consignment is assigned a unique Digital Manifest and a tracking token, allowing you to monitor your package's journey from the warehouse shelf to your doorstep in real-time. Furthermore, our Cash on Delivery (COD) and Easy Returns policies provide a safety net for new users exploring the platform.</p>
            </section>
        </div>

        <section className="mt-16 bg-surface p-10 rounded-3xl border border-gray-100 text-center">
            <h3 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter mb-6">Explore Our Informational Resources</h3>
            <div className="flex flex-wrap justify-center gap-6">
                <Link to="/about-us" className="bg-white px-8 py-3 rounded-xl shadow-sm border border-gray-200 text-xs font-black uppercase text-gray-700 hover:text-accent transition-colors">Our History</Link>
                <Link to="/blog/safe-shopping" className="bg-white px-8 py-3 rounded-xl shadow-sm border border-gray-200 text-xs font-black uppercase text-gray-700 hover:text-accent transition-colors">Shopping Safely</Link>
                <Link to="/blog/quality-guide" className="bg-white px-8 py-3 rounded-xl shadow-sm border border-gray-200 text-xs font-black uppercase text-gray-700 hover:text-accent transition-colors">Quality Control</Link>
                <Link to="/contact-us" className="bg-white px-8 py-3 rounded-xl shadow-sm border border-gray-200 text-xs font-black uppercase text-gray-700 hover:text-accent transition-colors">Support Desk</Link>
            </div>
        </section>

        <footer className="mt-16 text-center opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">VexoKart Marketplace Protocol • SEO Content Manifest v1.2</p>
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