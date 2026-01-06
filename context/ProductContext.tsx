
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
 * FIXED: Join categories table to get the name for display purposes only.
 * Source of truth for products is always the numeric category_id.
 */
const PRODUCT_COLUMNS = '*,category_data:categories(name)';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async (vendorId?: number) => {
    try {
      setIsLoading(true);
      
      // Build Product Query with join
      let url = `${BASE_API_URL}/products?select=${PRODUCT_COLUMNS}&order=created_at.desc`;
      if (vendorId && !isNaN(Number(vendorId))) {
          url += `&vendor_id=eq.${vendorId}`;
      }

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
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
          // Resilient price mapping
          const price = Number(item.price || 0);
          const originalPrice = Number(item.original_price || item.mrp || price);

          return {
            ...item,
            id: Number(item.id),
            price: price,
            original_price: originalPrice,
            // MAPPING: Use joined name for UI, fallback to 'General'
            category: item.category_data?.name || 'General',
            category_id: Number(item.category_id),
            vendor_id: String(item.vendor_id),
            // Standardize status for UI
            status: ['approved', 'live', 'active', 'published'].includes(item.status) ? 'approved' : item.status || 'pending',
            // FALLBACK: payment_modes is not in DB, providing UI default
            payment_modes: item.payment_modes || ['online', 'cod'],
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
    /**
     * FIXED: Explicitly sanitize payload.
     * MUST store only columns present in DB.
     * Stripped 'payment_modes' as it causes PGRST204 column not found error.
     */
    const { category, category_data, variants, highlights, payment_modes, ...dbPayload } = productData;
    
    // Ensure category_id is an integer
    const finalPayload = {
      ...dbPayload,
      category_id: Number(dbPayload.category_id),
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: { 
        ...API_HEADERS, 
        'Prefer': 'return=representation' 
      },
      body: JSON.stringify(finalPayload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("[Supabase Write Error]", JSON.stringify(errorData, null, 2));
      throw new Error(errorData.message || `Save failed: ${res.statusText}`);
    }

    await refreshProducts(productData.vendor_id);
  };

  const updateProduct = async (product: Product) => {
    /**
     * FIXED: Sanitize payload for update.
     * Stripped 'payment_modes' as it causes PGRST204 column not found error.
     */
    const { category, category_data, variants, highlights, payment_modes, ...dbPayload } = product as any;

    const finalPayload = {
      ...dbPayload,
      category_id: Number(dbPayload.category_id)
    };

    const res = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(finalPayload)
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
