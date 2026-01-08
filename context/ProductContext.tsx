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
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || response.statusText);
      }

      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          // Schema Adaptation:
          // cash_on_delivery column DOES NOT exist.
          // payment_modes column DOES NOT exist.
          // We use specifications JSON for both flags.
          const specs = item.specifications || {};
          
          return {
            ...item,
            id: Number(item.id),
            price: Number(item.price || 0),
            original_price: Number(item.original_price || item.price || 0),
            category: item.category_data?.name || 'General',
            category_id: Number(item.category_id),
            vendor_id: String(item.vendor_id),
            status: item.status || 'approved',
            product_type: item.product_type || 'simple',
            // Map JSON keys to UI flags. Default to 'true' if not set.
            is_cod_enabled: specs['payment.cod'] !== 'false', 
            is_online_enabled: specs['payment.online'] !== 'false',
            variants: item.variants || [],
            highlights: item.highlights || [],
            specifications: specs
          };
        });
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
    // Extract UI flags
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes, 
      cash_on_delivery, // Remove potentially existing field
      ...payloadData 
    } = productData;
    
    // Prepare specifications to store payment flags
    const specs = { ...(payloadData.specifications || {}) };
    specs['payment.online'] = String(is_online_enabled);
    specs['payment.cod'] = String(is_cod_enabled);

    const finalPayload = {
      ...payloadData,
      specifications: specs,
      
      vendor_id: Number(productData.vendor_id),
      category_id: Number(productData.category_id),
      images: Array.isArray(productData.images) ? productData.images : [],
      created_at: new Date().toISOString(),
      status: productData.status || 'approved'
    };

    // Strict Cleanup: Ensure no invalid columns are sent
    delete (finalPayload as any).payment_modes;
    delete (finalPayload as any).cash_on_delivery;

    try {
      const res = await fetch(`${BASE_API_URL}/products`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify(finalPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Database save failed`);
      }

      await refreshProducts(finalPayload.vendor_id);
    } catch (err: any) {
      console.error("[ProductSync] Submission Error:", err.message);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    // Extract UI flags
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes,
      cash_on_delivery,
      ...payloadData 
    } = product as any;

    // Prepare specifications to store payment flags
    const specs = { ...(payloadData.specifications || {}) };
    specs['payment.online'] = String(is_online_enabled);
    specs['payment.cod'] = String(is_cod_enabled);

    const finalPayload = {
      ...payloadData,
      specifications: specs,
      
      vendor_id: Number(payloadData.vendor_id),
      category_id: Number(payloadData.category_id)
    };

    // Strict Cleanup
    delete (finalPayload as any).payment_modes;
    delete (finalPayload as any).cash_on_delivery;
    delete (finalPayload as any).is_cod_enabled;
    delete (finalPayload as any).is_online_enabled;

    try {
      const res = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(finalPayload)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Update failed");
      }
      await refreshProducts(finalPayload.vendor_id);
    } catch (err: any) {
      console.error("[ProductSync] Update Error:", err.message);
      throw err;
    }
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = product.status === 'approved' ? 'disabled' : 'approved';
    
    try {
      const res = await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Status toggle failed:", err?.message);
      }
      await refreshProducts(Number(product.vendor_id));
    } catch (err: any) {
      console.error("[ProductSync] Status Toggle Error:", err.message);
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
      } else {
          const err = await res.json().catch(() => ({}));
          console.error("Delete failed:", err?.message);
      }
    } catch (err: any) {
      console.error("[ProductSync] Delete Error:", err.message);
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