import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      
      {/* 1. MAIN BANNERS (Dynamic from DB) */}
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

      {/* 3. RECENTLY VIEWED (Personalization) */}
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