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

const PRODUCT_COLUMNS = '*,category_data:categories(name)';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async (vendorId?: number) => {
    try {
      setIsLoading(true);
      
      let url = `${BASE_API_URL}/products?select=${PRODUCT_COLUMNS}&order=created_at.desc`;
      if (vendorId && !isNaN(Number(vendorId))) {
          url += `&vendor_id=eq.${vendorId}`;
      }

      const response = await fetch(url, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(`Supabase Sync Error: ${errBody.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => ({
          ...item,
          id: Number(item.id),
          price: Number(item.price || 0),
          original_price: Number(item.original_price || item.price || 0),
          category: item.category_data?.name || 'General',
          category_id: Number(item.category_id),
          vendor_id: String(item.vendor_id),
          status: item.status || 'approved',
          // FALLBACK: If columns are missing in DB, default to true for UI/UX
          cash_on_delivery: item.cash_on_delivery !== undefined ? Boolean(item.cash_on_delivery) : true,
          payment_modes: Array.isArray(item.payment_modes) ? item.payment_modes : ['online', 'cod'],
          variants: item.variants || [],
          highlights: item.highlights || []
        }));
        setProducts(mappedProducts);
      }
    } catch (error: any) {
      console.error("[ProductSync] Fatal Error:", error.message);
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
     * CRITICAL FIX: Destructure and exclude non-existent columns 
     * from the dbPayload to prevent Supabase "Column Not Found" errors.
     */
    const { 
      id, 
      category, 
      category_data, 
      variants, 
      cash_on_delivery, 
      payment_modes, 
      ...dbPayload 
    } = productData;
    
    const finalPayload = {
      ...dbPayload,
      vendor_id: Number(productData.vendor_id),
      category_id: Number(dbPayload.category_id),
      images: Array.isArray(dbPayload.images) ? dbPayload.images : [],
      created_at: new Date().toISOString(),
      status: dbPayload.status || 'approved'
    };

    try {
      const res = await fetch(`${BASE_API_URL}/products`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(finalPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Database save failed`);
      }

      await refreshProducts(finalPayload.vendor_id);
    } catch (err: any) {
      console.error("[ProductSync] Submission Error:", err);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    /** 
     * CRITICAL FIX: Sanitize outgoing PATCH payload to remove virtual/UI-only keys
     */
    const { 
      id, 
      category, 
      category_data, 
      variants, 
      cash_on_delivery, 
      payment_modes, 
      ...dbPayload 
    } = product as any;

    const finalPayload = {
      ...dbPayload,
      vendor_id: Number(dbPayload.vendor_id),
      category_id: Number(dbPayload.category_id)
    };

    try {
      const res = await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(finalPayload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Update failed");
      }
      await refreshProducts(finalPayload.vendor_id);
    } catch (err) {
      console.error("[ProductSync] Update Error:", err);
      throw err;
    }
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = product.status === 'approved' ? 'disabled' : 'approved';
    
    try {
      await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS },
        body: JSON.stringify({ status: newStatus })
      });
      await refreshProducts(Number(product.vendor_id));
    } catch (err) {
      console.error("[ProductSync] Status Toggle Error:", err);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`${BASE_API_URL}/products?id=eq.${id}`, { 
        method: 'DELETE', 
        headers: API_HEADERS 
      });
      if (res.ok) {
          setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("[ProductSync] Delete Error:", err);
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