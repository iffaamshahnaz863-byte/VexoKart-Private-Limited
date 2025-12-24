
import React, { useState } from 'react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';
import { useProducts } from '../hooks/useProducts';

const ProductsPage: React.FC = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div>
      <Header title="Shop All" />
      <div className="p-4">
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedCategory === 'All' ? 'bg-purple-600 text-white' : 'bg-navy-light text-gray-300'}`}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex-shrink-0 ${selectedCategory === category.name ? 'bg-purple-600 text-white' : 'bg-navy-light text-gray-300'}`}
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
