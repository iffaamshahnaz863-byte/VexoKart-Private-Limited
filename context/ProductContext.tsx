
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product, Review, Category } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  getProduct: (id: number) => Product | undefined;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (productData: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  toggleProductStatus: (productId: number) => Promise<void>;
  refreshProducts: (vendorId?: number) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

/**
 * CRITICAL FIX: Removed 'variants' and 'highlights' from the SELECT string 
 * because they do not exist as columns in the current database schema.
 */
const PRODUCT_COLUMNS = 'id,name,description,price,original_price,images,category_id,vendor_id,status,stock,created_at';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async (vendorId?: number) => {
    try {
      setIsLoading(true);
      
      // 1. Fetch Categories first
      const catRes = await fetch(`${BASE_API_URL}/categories?select=*`, { headers: API_HEADERS });
      let cats: any[] = [];
      if (catRes.ok) {
        cats = await catRes.json();
      } else {
        console.warn("[ProductContext] Categories fetch failed, using empty list mapping.");
      }
      
      // 2. Build Product Query
      let url = `${BASE_API_URL}/products?select=${PRODUCT_COLUMNS}&order=created_at.desc`;
      if (vendorId && !isNaN(Number(vendorId))) {
          url += `&vendor_id=eq.${vendorId}`;
      }

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        // FIX: Use JSON.stringify to avoid [object Object] in logs
        console.error("[Supabase Sync Error]", JSON.stringify({
            status: response.status,
            message: errBody.message || response.statusText,
            details: errBody.details || "No details provided"
        }, null, 2));
        throw new Error(`Database sync failed: ${errBody.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const cat = Array.isArray(cats) ? cats.find(c => Number(c.id) === Number(item.category_id)) : null;
          
          // Resilient price mapping
          const price = Number(item.price || 0);
          const originalPrice = Number(item.original_price || item.mrp || price);

          return {
            ...item,
            id: Number(item.id),
            price: price,
            original_price: originalPrice,
            category: cat?.name || 'General',
            vendor_id: String(item.vendor_id),
            // Standardize status for UI
            status: ['approved', 'live', 'active', 'published'].includes(item.status) ? 'approved' : item.status || 'pending',
            payment_modes: item.payment_modes || ['online', 'cod'],
            // FALLBACK: These are kept for UI compatibility even if the DB doesn't store them yet
            variants: item.variants || [],
            highlights: item.highlights || []
          };
        });
        setProducts(mappedProducts);
      }
    } catch (error: any) {
      console.error("[ProductContext] Fatal Sync Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
    // Sanitize payload: If variants/highlights aren't in DB, omit them from insertion to avoid 400 error
    const { variants, highlights, ...dbPayload } = productData;
    
    const res = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: { 
        ...API_HEADERS, 
        'Prefer': 'return=representation' 
      },
      body: JSON.stringify({
        ...dbPayload,
        created_at: new Date().toISOString()
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[Supabase Write Error]", JSON.stringify(errorData, null, 2));
      throw new Error(errorData.message || `Save failed: ${res.statusText}`);
    }

    await refreshProducts(productData.vendor_id);
  };

  const updateProduct = async (product: Product) => {
    // Sanitize payload for update
    const { variants, highlights, category, ...dbPayload } = product as any;

    const res = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(dbPayload)
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("[Supabase Update Error]", JSON.stringify(errorData, null, 2));
        throw new Error("Update failed");
    }
    await refreshProducts();
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = product.status === 'approved' ? 'disabled' : 'approved';
    
    await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS },
      body: JSON.stringify({ status: newStatus })
    });
    await refreshProducts();
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`${BASE_API_URL}/products?id=eq.${id}`, { 
      method: 'DELETE', 
      headers: API_HEADERS 
    });
    if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, isLoading, getProduct, addProduct, updateProduct, deleteProduct, toggleProductStatus, refreshProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts missing provider");
  return context;
};
