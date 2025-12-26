
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div>
      <Header title="VexoKart" showSearch />
      <div className="p-4 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
          {categories.length > 0 ? (
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
              {categories.map(category => (
                <CategoryChip key={category.id} category={category} onClick={() => handleCategoryClick(category.name)} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No categories have been added yet.</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Featured Products</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <p className="text-gray-500 text-sm">No products have been added yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;
