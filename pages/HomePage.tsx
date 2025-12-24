
import React from 'react';
import Header from '../components/Header';
import BannerCarousel from '../components/BannerCarousel';
import CategoryChip from '../components/CategoryChip';
import ProductCard from '../components/ProductCard';
import { BANNERS, CATEGORIES } from '../constants';
import { useProducts } from '../hooks/useProducts';

const HomePage: React.FC = () => {
  const { products } = useProducts();

  return (
    <div>
      <Header title="VexoKart" showSearch />
      <div className="p-4 space-y-8">
        <BannerCarousel banners={BANNERS} />

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
            {CATEGORIES.map(category => (
              <CategoryChip key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-white mb-4">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
