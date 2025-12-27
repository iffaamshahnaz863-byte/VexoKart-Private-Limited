
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton } from '../components/Skeleton';

const ProductsPage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const categoryFromUrl = searchParams.get('category');
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'All');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [categoryFromUrl, searchQuery]);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const newParams: any = {};
    if (categoryName !== 'All') newParams.category = categoryName;
    if (searchQuery) newParams.q = searchQuery;
    setSearchParams(newParams);
  };

  const liveProducts = products.filter(p => p.status === 'approved' || p.status === 'live');

  const filteredProducts = liveProducts.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      p.category.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery);
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-surface min-h-screen">
      <Header title="Our Catalog" showSearch />
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {searchQuery && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-text-secondary">
              Results for "<span className="font-bold text-text-main">{searchQuery}</span>"
            </p>
            <button 
              onClick={() => setSearchParams({})}
              className="text-xs font-bold text-accent uppercase tracking-widest"
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${selectedCategory === 'All' ? 'bg-accent text-white shadow-lg shadow-accent/20 border border-accent' : 'bg-white text-text-secondary border border-border shadow-sm'}`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${selectedCategory === category.name ? 'bg-accent text-white shadow-lg shadow-accent/20 border border-accent' : 'bg-white text-text-secondary border border-border shadow-sm'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-500">
          {isLoading ? (
              <>
                  {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
              </>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-32 flex flex-col items-center bg-white rounded-3xl shadow-sm border border-border">
                <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                   <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-text-main">No Match Found</h3>
                <p className="text-text-muted mt-2 text-sm italic">Adjust your search or filter to find more items.</p>
                <button onClick={() => { setSearchParams({}); setSelectedCategory('All'); }} className="mt-8 text-accent text-[10px] font-black uppercase tracking-widest border-b-2 border-accent pb-1">Reset All</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
