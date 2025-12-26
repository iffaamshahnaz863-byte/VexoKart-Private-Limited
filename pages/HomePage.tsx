
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { ProductCardSkeleton, CategoryChipSkeleton } from '../components/Skeleton';

const HomePage: React.FC = () => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial data loading delay
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div>
      <Header title="VexoKart" showSearch />
      <div className="p-4 space-y-8">
        <section>
          <h2 className="text-xl font-bold text-text-main mb-4">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
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
          <h2 className="text-xl font-bold text-text-main mb-4">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
                <>
                    {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </>
            ) : products.length > 0 ? (
              products.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
             <p className="text-text-muted text-sm">No products have been added yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
