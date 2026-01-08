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

      {/* 3. PRODUCT FEED */}
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

      {/* 4. ADSENSE COMPLIANCE CONTENT SECTION */}
      <article className="mt-16 bg-white border-t border-gray-100 p-8 md:p-16 max-w-7xl mx-auto rounded-[3rem] shadow-premium">
        <header className="mb-12 text-center">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 italic uppercase tracking-tighter mb-4">VexoKart: Redefining the Digital Commerce Experience</h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-3xl mx-auto">Discover the ultimate multi-vendor marketplace built on trust, quality, and lightning-fast logistics. Shop smart, shop online with the India's fastest growing retail node.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-gray-600 leading-relaxed text-sm md:text-base">
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-accent pl-4 uppercase tracking-widest italic">What is VexoKart?</h2>
                <p>VexoKart is a state-of-the-art multi-vendor e-commerce platform designed to bridge the gap between high-quality Indian manufacturers and discerning global consumers. Our mission is simple: to provide a curated, secure, and hyper-efficient shopping environment where authenticity is guaranteed and every transaction is backed by the VexoShield Protection protocol.</p>
                <p>Unlike traditional marketplaces that prioritize volume over quality, VexoKart employs a rigorous 7-tier verification process for every vendor. This ensures that the products reaching your doorstep aren't just items, but verified lifestyle assets that meet international standards of durability and aesthetics.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-accent pl-4 uppercase tracking-widest italic">How Our Platform Works</h2>
                <p>VexoKart utilizes a decentralized fulfillment architecture. When you browse our catalog, you are seeing live inventory from dozens of authorized partner nodes across India. Our Intelligent Routing Algorithm (IRA) automatically calculates the most efficient shipping path from the vendor's warehouse to your specific geo-location.</p>
                <div className="bg-surface p-6 rounded-3xl border border-gray-100 italic space-y-4">
                    <p className="font-bold text-accent">The Shopping Journey:</p>
                    <ul className="list-decimal pl-5 space-y-2 text-xs">
                        <li><strong>Discovery:</strong> Use our AI-powered search to find products across Categories like Fashion, Tech, and Lifestyle.</li>
                        <li><strong>Validation:</strong> Read verified customer reviews and inspect high-resolution gallery images.</li>
                        <li><strong>Checkout:</strong> Settle your bill via our PCI-DSS compliant digital gateways or select Cash on Delivery.</li>
                        <li><strong>Fulfillment:</strong> Track your consignment in real-time as it moves through our courier network.</li>
                    </ul>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-accent pl-4 uppercase tracking-widest italic">A Commitment to Product Integrity</h2>
                <p>We understand that trust is the currency of the internet. That's why "Shop Smart" isn't just a tagline—it's our operational blueprint. Every product listing on VexoKart must include detailed specifications, fabric/material breakdowns, and original photography. Our team of quality auditors performs random physical inspections at vendor hubs to ensure that what you see online is exactly what you receive in your package.</p>
                <p>Furthermore, our robust feedback loop allows the community to flag discrepancies. Any vendor falling below our 4.0-star threshold is automatically placed under "Audit Review," ensuring that the VexoKart catalog remains a gold standard for digital retail.</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-accent pl-4 uppercase tracking-widest italic">Security and User Protection</h2>
                <p>Your data security is our highest priority. VexoKart employs end-to-end 256-bit SSL encryption for all data transmissions. We never store your full card details; instead, we partner with industry leaders like Razorpay to facilitate secure, tokenized transactions. Whether you're paying via UPI, Credit Card, or Netbanking, your financial identity remains shielded from external threats.</p>
                <p>Our dedicated customer support desk operates 24/7 to resolve inquiries regarding order manifests, return processing, and technical troubleshooting. At VexoKart, we don't just sell products; we build long-term relationships through transparency and reliability.</p>
            </section>
        </div>

        <section className="mt-20 border-t border-gray-100 pt-16">
            <h2 className="text-center text-2xl font-black text-gray-900 uppercase italic mb-10 tracking-tight">Informational Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/blog/safe-shopping" className="group bg-surface p-6 rounded-3xl border border-gray-100 hover:border-accent transition-all">
                    <h3 className="font-bold text-gray-900 group-hover:text-accent mb-2 uppercase text-xs">Safe Shopping Guide</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Learn how to protect your digital identity while shopping online.</p>
                </Link>
                <Link to="/blog/quality-guide" className="group bg-surface p-6 rounded-3xl border border-gray-100 hover:border-accent transition-all">
                    <h3 className="font-bold text-gray-900 group-hover:text-accent mb-2 uppercase text-xs">Choosing Quality</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed">A deep dive into identifying authentic materials and verified vendors.</p>
                </Link>
                <Link to="/blog/ecommerce-india" className="group bg-surface p-6 rounded-3xl border border-gray-100 hover:border-accent transition-all">
                    <h3 className="font-bold text-gray-900 group-hover:text-accent mb-2 uppercase text-xs">Digital India Growth</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Why e-commerce is the backbone of the modern Indian economy.</p>
                </Link>
                <Link to="/about-us" className="group bg-surface p-6 rounded-3xl border border-gray-100 hover:border-accent transition-all">
                    <h3 className="font-bold text-gray-900 group-hover:text-accent mb-2 uppercase text-xs">The Vexo Story</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed">Our mission to empower every small business in the subcontinent.</p>
                </Link>
            </div>
        </section>

        <footer className="mt-20 text-center opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">VexoKart Authorized Marketplace Manifesto • Manifest v2.4</p>
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