
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.tsx';
import ProductCard from '../components/ProductCard.tsx';
import BannerCarousel from '../components/BannerCarousel.tsx';
import { supabase } from '../supabase.ts';
import { Product, Category, Banner } from '../types.ts';
import { ProductCardSkeleton } from '../components/Skeleton.tsx';

const FETCH_TIMEOUT = 10000; // 10 seconds

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent state updates on unmounted component
  const isMounted = useRef(true);
  // Ref to track retry attempts
  const retryAttempt = useRef(0);

  const fetchData = useCallback(async (isRetry = false) => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);
    
    // Use AbortController for fetch timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, FETCH_TIMEOUT);

    try {
      // Fetch all data in parallel
      const [productsRes, categoriesRes, bannersRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_active', true).limit(20).order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('banners').select('*').eq('status', true).order('display_order', { ascending: true })
      ]);

      clearTimeout(timeoutId); // Clear timeout if fetches succeed

      if (!isMounted.current) return;

      // Handle Products
      if (productsRes.error) throw new Error(`Products Fetch Failed: ${productsRes.error.message}`);
      setProducts(productsRes.data || []);

      // Handle Categories (optional, don't throw error if it fails)
      if (categoriesRes.error) console.warn("Could not fetch categories:", categoriesRes.error.message);
      else setCategories(categoriesRes.data || []);
      
      // Handle Banners (optional)
      if (bannersRes.error) console.warn("Could not fetch banners:", bannersRes.error.message);
      else setBanners(bannersRes.data || []);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(err.message || 'Failed to load data.');
      }

      // Retry logic: attempt only once
      if (!isRetry && retryAttempt.current < 1) {
        retryAttempt.current += 1;
        console.log('Fetch failed, retrying once...');
        setTimeout(() => fetchData(true), 2000); // Wait 2s before retry
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  const handleRetry = () => {
    retryAttempt.current = 0; // Reset retry counter
    fetchData();
  };

  return (
    <div className="bg-surface min-h-screen">
      <Header />
      
      <div className="p-3">
        {banners.length > 0 ? (
           <BannerCarousel banners={banners.map(b => b.image_url)} />
        ) : (
           <div className="w-full h-40 bg-gray-200 rounded-2xl animate-pulse" />
        )}
      </section>

      {categories.length > 0 && (
        <section className="bg-white py-3 my-3 rounded-xl shadow-sm">
          <div className="flex space-x-4 overflow-x-auto px-4 no-scrollbar">
            {categories.map(category => (
                <div 
                    key={category.id}
                    onClick={() => navigate(`/products?category=${category.slug}`)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                >
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-all">
                        <img src={category.image_url || 'https://placehold.co/100x100'} alt={category.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[11px] font-medium text-text-secondary group-hover:text-primary transition-colors">{category.name}</span>
                </div>
            ))}
          </div>
        </section>
      )}

      <section className="p-3">
        <h2 className="text-lg font-bold text-text-main mb-4">New Arrivals</h2>
        
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : error && products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <h3 className="font-bold text-red-500">Oops! Something went wrong.</h3>
            <p className="text-sm text-text-muted mt-2">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
