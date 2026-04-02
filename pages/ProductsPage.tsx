
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { useProducts } from '../context/ProductContext.tsx';
import { useCategories } from '../context/CategoryContext.tsx';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const ProductsPage: React.FC = () => {
  const { products, isLoading: productsLoading, refreshProducts } = useProducts();
  const { categories, refreshCategories } = useCategories();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  
  const isLoading = productsLoading;

  useEffect(() => {
    const loadData = async () => {
      // Find category ID if slug is present
      let categoryId: number | undefined;
      if (categorySlug && categories.length > 0) {
        const cat = categories.find(c => c.slug === categorySlug);
        if (cat) categoryId = Number(cat.id);
      }

      await Promise.all([
        refreshProducts({ 
          categoryId, 
          search: searchQuery || undefined,
          limit: 50 
        }),
        refreshCategories()
      ]);
    };
    loadData();
  }, [categorySlug, searchQuery, categories.length]);

  const handleCategorySelect = (slug: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-surface min-h-screen pb-20">
      <Header title="Our Products" showSearch />
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${!categorySlug ? 'bg-primary text-white shadow-md' : 'bg-white text-text-secondary border border-border'}`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${categorySlug === category.slug ? 'bg-primary text-white shadow-md' : 'bg-white text-text-secondary border border-border'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.filter(p => p.status === 'approved').map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center bg-white rounded-2xl shadow-sm border border-border">
            <h3 className="text-xl font-bold text-text-main">No Products Found</h3>
            <p className="text-text-muted mt-2 text-sm">Try adjusting your search or filter.</p>
            <button 
              onClick={() => handleCategorySelect(null)}
              className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
