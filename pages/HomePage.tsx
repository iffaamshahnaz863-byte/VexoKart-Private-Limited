
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';
import BannerCarousel from '../components/BannerCarousel';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBanners } from '../context/BannerContext';
import { ProductCardSkeleton } from '../components/Skeleton';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const activeBanners = banners.filter(b => b.status === 'active').sort((a, b) => a.displayOrder - b.displayOrder);
  const liveProducts = products.filter(p => p.status === 'approved' || p.status === 'live');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="bg-background min-h-screen">
      <Header title="VexoKart" showSearch />
      
      <div className="p-4 space-y-8 max-w-7xl mx-auto">
        <section className="mt-2">
            {isLoading ? (
                <div className="w-full h-40 bg-surface rounded-2xl animate-pulse"></div>
            ) : (
                <BannerCarousel banners={activeBanners.map(b => b.imageUrl)} />
            )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-extrabold text-text-main uppercase tracking-tight">Explore Categories</h2>
            <button onClick={() => navigate('/products')} className="text-accent text-[10px] font-bold uppercase tracking-widest bg-accent/5 px-3 py-1.5 rounded-full border border-accent/10">View All</button>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(category => (
              <CategoryChip key={category.id} category={category} onClick={() => handleCategoryClick(category.name)} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-extrabold text-text-main uppercase tracking-tight">Trending Now</h2>
            <div className="h-0.5 flex-grow mx-4 bg-border rounded-full opacity-50"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {isLoading ? (
                <>
                    {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </>
            ) : liveProducts.length > 0 ? (
              liveProducts.slice(0, 10).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
             <div className="col-span-full py-20 text-center">
               <p className="text-text-muted font-bold italic">No featured products available.</p>
             </div>
            )}
          </div>
        </section>

        {/* Promotional Section */}
        <section className="bg-gradient-to-br from-accent to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-accent/20 flex flex-col items-center text-center">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Weekend Mega Sale</h3>
            <p className="text-white/80 font-bold tracking-widest text-[10px] uppercase mb-6">Up to 60% off on flagship products</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-white text-accent px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg active:scale-95 transition-all"
            >
              Shop the Collection
            </button>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
