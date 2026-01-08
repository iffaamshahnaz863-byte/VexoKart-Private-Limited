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

      {/* 4. PRODUCT FEED - Fixed Grid Columns for Meesho Behavior */}
      <section className="p-3 pt-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between px-1 mb-4">
            <h2 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter">
                {selectedCatName === 'All' ? 'Products For You' : `${selectedCatName} Collection`}
            </h2>
            <div className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border border-green-200">Free Delivery</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {isLoading ? (
              <>
                  {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
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

      {/* 5. POLISHED ADSENSE CONTENT ARTICLE SECTION */}
      <article className="mt-12 bg-white border-t border-gray-100 px-6 py-12 md:px-12 lg:px-20 overflow-hidden shadow-inner">
        <header className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 italic uppercase tracking-tighter mb-4">VexoKart: India's Premier Multi-Vendor Authorized Marketplace</h1>
            <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">Experience a smarter way to shop. VexoKart is built on transparency, quality, and a commitment to providing an unparalleled digital lifestyle experience for the modern Indian consumer.</p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-gray-600 leading-relaxed text-base">
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4 italic">What is VexoKart?</h2>
                <p>VexoKart is a next-generation multi-vendor e-commerce platform designed to bridge the gap between verified Indian manufacturers and quality-conscious consumers. We believe that shopping online should be more than just a transaction; it should be an experience rooted in absolute trust and technological efficiency. Our platform curates products from authorized sellers across Electronics, Fashion, and Home segments, ensuring that every item on our catalog is genuine and high-performing.</p>
                <p>By leveraging a decentralized fulfillment model, VexoKart empowers local small-to-medium enterprises (SMEs) to compete on a national stage. This unique ecosystem not only promotes the "Make in India" initiative but also ensures that our customers have access to unique, artisan-level products that are often missed by large-scale retailers.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4 italic">The Smart Shopping Process</h2>
                <p>Our platform is engineered for simplicity and speed. Users can effortlessly browse through thousands of curated listings using our AI-enhanced search functionality. The journey from discovery to delivery is seamless: browse by category, add verified items to your digital bag, and proceed to a streamlined checkout. We provide comprehensive product specifications, including material breakdowns and warranty information, so you can make informed decisions in seconds.</p>
                <p>At the core of the VexoKart experience is our Intelligent Routing Algorithm. Once an order is placed, our system automatically selects the closest distribution node to minimize delivery time and environmental impact, ensuring that your package reaches you with maximum speed and minimum carbon footprint.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4 italic">The Technological Infrastructure</h2>
                <p>Beyond being a marketplace, VexoKart is a technological powerhouse. Our backend is built on a high-availability serverless architecture that scales instantly to handle millions of simultaneous sessions. We use end-to-end 256-bit SSL encryption to protect every interaction on our site, from simple browsing to complex payment settlements. Our database uses real-time synchronization to ensure that inventory levels are always accurate, preventing the frustration of out-of-stock orders.</p>
                <p>Furthermore, our vendor-facing "Partner Console" provides merchants with advanced data analytics and demand forecasting tools. This allows our vendors to optimize their supply chains, resulting in better prices and more consistent product availability for our end users. This synergy of consumer UX and vendor empowerment is what sets VexoKart apart in the crowded digital retail space.</p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest text-xs border-l-4 border-accent pl-4 italic">Cultivating a Sustainable Digital Future</h2>
                <p>We are deeply committed to sustainable commerce. VexoKart’s logistics network is being progressively optimized for green energy delivery. We prioritize vendors who use eco-friendly packaging and implement ethical manufacturing practices. Trust, at VexoKart, extends beyond the product—it includes our responsibility to the planet and the communities we serve. Our customer support desk is available 24/7 to address any concerns regarding product lifecycle or environmental certifications.</p>
                <p>As we continue to grow, our mission remains fixed: to provide the most reliable, high-value, and technologically advanced shopping destination for Digital Bharat. Join us in this revolution of smart commerce where quality is never compromised and user safety is our highest protocol.</p>
            </section>
        </div>

        <section className="mt-16 border-t border-gray-100 pt-12 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter mb-8">Authoritative Consumer Resources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/about-us" className="p-4 bg-surface rounded-2xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-1">Company</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent italic">Our History</p>
                </Link>
                <Link to="/privacy-policy" className="p-4 bg-surface rounded-2xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-1">Legal</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent italic">Data Protocol</p>
                </Link>
                <Link to="/blog/safe-shopping" className="p-4 bg-surface rounded-2xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-1">Safety</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent italic">Shopping Guide</p>
                </Link>
                <Link to="/contact-us" className="p-4 bg-surface rounded-2xl border border-gray-100 hover:border-accent transition-all group">
                    <p className="text-[10px] font-black uppercase text-accent mb-1">Support</p>
                    <p className="text-xs font-bold text-gray-900 group-hover:text-accent italic">Contact Us</p>
                </Link>
            </div>
        </section>

        <footer className="mt-16 text-center opacity-30">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">VexoKart Marketplace Manifesto • Version 3.0 Compliance</p>
        </footer>
      </article>

      {/* Infinite Scroll Indicator */}
      {!isLoading && liveProducts.length > 0 && (
          <div className="py-12 flex flex-col items-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[9px] font-black uppercase text-gray-400 mt-2 tracking-widest italic">Syncing more products...</span>
          </div>
      )}
    </div>
  );
};

export default HomePage;