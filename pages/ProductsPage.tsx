
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

const ProductsPage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl || 'All');

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || 'All');
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
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCategory === 'All' ? 'bg-teal-500 text-white' : 'bg-navy-light text-gray-300'}`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex-shrink-0 ${selectedCategory === category.name ? 'bg-teal-500 text-white' : 'bg-navy-light text-gray-300'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
