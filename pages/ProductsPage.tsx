
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
    // Simulate loading on category change
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

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div>
      <Header title="Shop All" />
      <div className="p-4">
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => handleCategorySelect('All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex-shrink-0 ${selectedCategory === 'All' ? 'bg-accent text-white' : 'bg-surface text-text-secondary'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex-shrink-0 ${selectedCategory === category.name ? 'bg-accent text-white' : 'bg-surface text-text-secondary'}`}
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
            <div className="col-span-full text-center py-20">
                <p className="text-text-muted">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
