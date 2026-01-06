import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header.tsx';
import CategoryChip from '../components/CategoryChip.tsx';
import ProductCard from '../components/ProductCard.tsx';
import BannerCarousel from '../components/BannerCarousel.tsx';
import { useProducts } from '../hooks/useProducts.ts';
import { useCategories } from '../hooks/useCategories.ts';
import { useBanners } from '../context/BannerContext.tsx';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners, refreshBanners } = useBanners();
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCatName = searchParams.get('category') || 'All';

  // Filter for active banners
  const activeBanners = banners.filter(b => b.status === true).sort((a, b) => a.display_order - b.display_order);
  
  const liveProducts = products.filter(p => {
    const isLive = p.status === 'approved' || p.status === 'live';
    const matchesCategory = selectedCatName === 'All' || p.category === selectedCatName;
    return isLive && matchesCategory;
  });

  useEffect(() => {
    const init = async () => {
        await refreshBanners();
        setIsLoading(false);
    };
    init();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCatName === categoryName) {
        navigate('/');
    } else {
        navigate(`/?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header title="VexoKart" showSearch />
      
      <div className="p-4 space-y-8 max-w-7xl mx-auto">
        {/* Banner Section */}
        {selectedCatName === 'All' && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                {isLoading ? (
                    <div className="w-full h-44 bg-surface rounded-2xl animate-pulse"></div>
                ) : activeBanners.length > 0 ? (
                    <BannerCarousel banners={activeBanners.map(b => b.image_url)} />
                ) : null}
            </section>
        )}

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-sm font-black text-text-main uppercase tracking-widest italic">Curated Collections</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            <div 
                onClick={() => navigate('/')}
                className={`flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedCatName === 'All' ? 'scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}
            >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${selectedCatName === 'All' ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
                    <svg className={`w-8 h-8 ${selectedCatName === 'All' ? 'text-accent' : 'text-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">All</span>
            </div>
            {categories.map(category => (
                <div 
                    key={category.id}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${selectedCatName === category.name ? 'scale-105 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                >
                    <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${selectedCatName === category.name ? 'border-accent shadow-lg shadow-accent/10' : 'border-border'}`}>
                        <img src={category.image || 'https://placehold.co/100x100/F8F9FA/A0A0A0?text=Cat'} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-center max-w-[64px] line-clamp-1">{category.name}</span>
                </div>
            ))}
          </div>
        </section>

        {/* Product Grid - 2 per row */}
        <section>
          <div className="flex items-center gap-3 mb-6 px-1">
            <h2 className="text-sm font-black text-text-main uppercase tracking-widest italic">
                {selectedCatName === 'All' ? 'Trending Catalog' : selectedCatName}
            </h2>
            <div className="h-px flex-grow bg-gradient-to-r from-border to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 animate-in fade-in duration-500">
            {isLoading ? (
                <>
                    {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </>
            ) : liveProducts.length > 0 ? (
              liveProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
             <div className="col-span-full py-32 text-center bg-surface rounded-3xl border border-dashed border-border">
               <svg className="w-12 h-12 text-text-muted/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
               <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">No matches in this category</p>
             </div>
            )}
          </div>
        </section>

        {/* Footer Promo */}
        {selectedCatName === 'All' && (
            <section className="bg-gradient-to-br from-[#1a1a2e] to-[#0d0d14] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1 relative z-10">Premium Experience</h3>
                <p className="text-white/60 font-bold tracking-[0.2em] text-[8px] uppercase mb-6 relative z-10">Direct to consumer • Authorized Marketplace</p>
                <div className="flex gap-3 relative z-10">
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                        <p className="text-xs font-black italic">100% Genuine</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                        <p className="text-xs font-black italic">Fast Shipping</p>
                    </div>
                </div>
            </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;