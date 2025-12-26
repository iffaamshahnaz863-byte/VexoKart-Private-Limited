
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import Skeleton, { ProductCardSkeleton } from '../components/Skeleton';

const ProductsPage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'All');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [categoryFromUrl]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryName });
    }
  };

  const liveProducts = products.filter(p => p.status === 'approved' || p.status === 'live');

  const filteredProducts = selectedCategory === 'All'
    ? liveProducts
    : liveProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-background min-h-screen">
      <Header title="Shop All" />
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition flex-shrink-0 ${selectedCategory === 'All' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-text-secondary border border-border'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition flex-shrink-0 ${selectedCategory === category.name ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-surface text-text-secondary border border-border'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading ? (
              <>
                  {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 flex flex-col items-center">
                <svg className="w-16 h-16 text-border mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-text-muted font-bold tracking-tight">No approved products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
