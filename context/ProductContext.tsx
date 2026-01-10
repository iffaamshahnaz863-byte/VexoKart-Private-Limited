
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';
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
          const basePrice = Number(item.price || 0);
          
          // Use 'upi_discount_amount' from DB if exists, else calculate default
          const upiDiscount = item.upi_discount_amount 
            ? Number(item.upi_discount_amount) 
            : Math.min(Math.floor(basePrice * 0.05), 100);
          
          return {
            ...item,
            id: Number(item.id),
            price: basePrice,
            original_price: Number(item.original_price || item.price || 0),
            category: item.category_data?.name || 'General',
            category_id: Number(item.category_id),
            vendor_id: String(item.vendor_id),
            status: item.status || 'approved',
            
            // Map Database 'allow_cod' / 'allow_online' to UI flags 'is_cod_enabled' / 'is_online_enabled'
            is_cod_enabled: item.allow_cod !== false, // Default true if null/undefined
            is_online_enabled: item.allow_online !== false, // Default true if null/undefined
            
            product_type: item.product_type || 'simple',
            
            upi_discount: upiDiscount,
            upi_price: basePrice - upiDiscount,

            variants: item.variants || [], 
            highlights: item.highlights || [],
            specifications: item.specifications || {} 
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
    // Separate UI flags from DB payload
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes, 
      cash_on_delivery,
      category, 
      category_data, 
      upi_price,
      upi_discount,
      ...payloadData 
    } = productData;
    
    const finalPayload = {
      ...payloadData,
      vendor_id: Number(productData.vendor_id),
      category_id: Number(productData.category_id),
      images: Array.isArray(productData.images) ? productData.images : [],
      created_at: new Date().toISOString(),
      status: productData.status || 'approved',
      
      // Save flags to correct DB columns
      allow_cod: is_cod_enabled,
      allow_online: is_online_enabled,
      product_type: productData.product_type || 'simple'
    };

    // Cleanup extra virtual fields
    delete (finalPayload as any).id;
    delete (finalPayload as any).category;
    delete (finalPayload as any).category_data;
    delete (finalPayload as any).upi_price;
    delete (finalPayload as any).upi_discount;

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
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes,
      cash_on_delivery,
      category, 
      category_data, 
      upi_price,
      upi_discount,
      ...payloadData 
    } = product as any;

    const finalPayload = {
      ...payloadData,
      vendor_id: Number(payloadData.vendor_id),
      category_id: Number(payloadData.category_id),
      
      // Map UI flags back to DB columns
      allow_cod: is_cod_enabled,
      allow_online: is_online_enabled
    };

    delete (finalPayload as any).id;
    delete (finalPayload as any).created_at;
    delete (finalPayload as any).category;
    delete (finalPayload as any).category_data;
    delete (finalPayload as any).upi_price;
    delete (finalPayload as any).upi_discount;

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
