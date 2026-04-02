
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.tsx';
import ProductCard from '../components/ProductCard.tsx';
import BannerCarousel from '../components/BannerCarousel.tsx';
import { useProducts } from '../context/ProductContext.tsx';
import { useCategories } from '../context/CategoryContext.tsx';
import { useBanners } from '../context/BannerContext.tsx';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading: productsLoading, refreshProducts } = useProducts();
  const { categories, refreshCategories } = useCategories();
  const { banners, refreshBanners } = useBanners();
  
  const isLoading = productsLoading;

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          refreshProducts({ limit: 20 }),
          refreshCategories(),
          refreshBanners()
        ]);
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    };
    loadAllData();
  }, []);

  const handleRetry = () => {
    refreshProducts({ limit: 20 });
    refreshCategories();
    refreshBanners();
  };

  const approvedProducts = products.filter(p => p.status === 'approved' || !p.status);

  const activeBanners = banners.filter(b => b.status !== false);

  return (
    <div className="bg-surface min-h-screen pb-20">
      <Header />
      
      {/* Debug UI - Visible for testing */}
      <div className="p-3 bg-yellow-50 border-b border-yellow-100">
        <p className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">Debug Info</p>
        <div className="flex gap-4 mt-1">
          <span className="text-[10px] font-medium text-yellow-600">Banners: {banners.length} (Active: {activeBanners.length})</span>
          <span className="text-[10px] font-medium text-yellow-600">Products: {products.length}</span>
          <span className="text-[10px] font-medium text-yellow-600">Categories: {categories.length}</span>
          <span className="text-[10px] font-medium text-yellow-600">Approved: {approvedProducts.length}</span>
        </div>
      </div>

      <div className="p-3">
        {activeBanners.length > 0 ? (
           <BannerCarousel banners={activeBanners} />
        ) : isLoading ? (
           <div className="w-full h-44 bg-gray-200 rounded-2xl animate-pulse" />
        ) : (
           <div className="w-full h-44 bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center">
             <p className="text-text-muted text-xs font-bold uppercase tracking-widest">No Banners Available</p>
           </div>
        )}
      </div>

      {categories.length > 0 && (
        <section className="bg-white py-3 my-3 rounded-xl shadow-sm">
          <div className="flex space-x-4 overflow-x-auto px-4 no-scrollbar">
            {categories.map(category => (
                <div 
                    key={category.id}
                    onClick={() => navigate(`/products?category=${category.slug}`)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all">
                        <img 
                          src={category.image_url || 'https://placehold.co/100x100'} 
                          alt={category.name} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                    </div>
                    <span className="text-[11px] font-medium text-text-secondary group-hover:text-primary transition-colors">{category.name}</span>
                </div>
            ))}
          </div>
        </section>
      )}

      <section className="p-3">
        <h2 className="text-lg font-bold text-text-main mb-4">New Arrivals</h2>
        
        {isLoading && approvedProducts.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : approvedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <h3 className="font-bold text-text-main">No products found</h3>
            <p className="text-sm text-text-muted mt-2">Check back later for new arrivals.</p>
            <button
              onClick={handleRetry}
              className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {approvedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
