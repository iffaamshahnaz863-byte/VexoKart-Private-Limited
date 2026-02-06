
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { supabase } from '../supabase.ts';
import { Product, Category } from '../types.ts';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const FETCH_TIMEOUT = 10000; // 10 seconds

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q');
  
  const isMounted = useRef(true);
  const retryAttempt = useRef(0);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!isMounted.current) return;
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Fetch categories first (or in parallel)
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) console.warn("Could not fetch categories:", catError.message);
      if (isMounted.current && catData) setCategories(catData);

      // Build product query
      let query = supabase.from('products').select('*, category:categories(name, slug)').eq('is_active', true);

      if (categorySlug) {
        const targetCategory = (catData || categories).find(c => c.slug === categorySlug);
        if (targetCategory) {
          query = query.eq('category_id', targetCategory.id);
        }
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data: prodData, error: prodError } = await query;
      
      clearTimeout(timeoutId);
      if (!isMounted.current) return;

      if (prodError) throw new Error(`Products fetch failed: ${prodError.message}`);
      setProducts(prodData || []);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load products.');
      }
      if (!isRetry && retryAttempt.current < 1) {
        retryAttempt.current += 1;
        setTimeout(() => fetchData(true), 2000);
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [categorySlug, searchQuery]);

  useEffect(() => {
    isMounted.current = true;
    retryAttempt.current = 0;
    fetchData();
    return () => { isMounted.current = false; };
  }, [fetchData]);

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
    <div className="bg-surface min-h-screen">
      <Header title="Our Products" showSearch />
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${!categorySlug ? 'bg-primary text-white' : 'bg-white text-text-secondary'}`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.slug)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${categorySlug === category.slug ? 'bg-primary text-white' : 'bg-white text-text-secondary'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <h3 className="font-bold text-red-500">Oops! Something went wrong.</h3>
            <p className="text-sm text-text-muted mt-2">{error}</p>
            <button onClick={() => fetchData()} className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm">Retry</button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center bg-white rounded-2xl shadow-sm">
            <h3 className="text-xl font-bold text-text-main">No Products Found</h3>
            <p className="text-text-muted mt-2 text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
