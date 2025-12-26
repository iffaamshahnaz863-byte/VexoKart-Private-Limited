
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';
import BannerCarousel from '../components/BannerCarousel';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBanners } from '../context/BannerContext';
import { ProductCardSkeleton, CategoryChipSkeleton } from '../components/Skeleton';

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
      
      <div className="p-4 space-y-8 max-w-lg mx-auto md:max-w-7xl">
        <section className="mt-2">
            {isLoading ? (
                <div className="w-full h-48 bg-surface rounded-2xl animate-pulse"></div>
            ) : (
                <BannerCarousel banners={activeBanners.map(b => b.imageUrl)} />
            )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-text-main italic tracking-tight">Categories</h2>
            <button className="text-accent text-xs font-black uppercase tracking-widest">See All</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
            {isLoading ? (
                <>
                    {[...Array(5)].map((_, i) => <CategoryChipSkeleton key={i} />)}
                </>
            ) : categories.length > 0 ? (
              categories.map(category => (
                <CategoryChip key={category.id} category={category} onClick={() => handleCategoryClick(category.name)} />
              ))
            ) : (
              <p className="text-text-muted text-sm">No categories have been added yet.</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-text-main italic tracking-tight">Featured Products</h2>
            <button onClick={() => navigate('/products')} className="text-accent text-xs font-black uppercase tracking-widest">View More</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
                <>
                    {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </>
            ) : liveProducts.length > 0 ? (
              liveProducts.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
             <p className="text-text-muted text-sm col-span-full py-10 text-center">No products have been approved yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
