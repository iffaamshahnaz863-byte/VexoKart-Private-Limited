
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
          // We calculate the UPI discount here to ensure consistency across the entire app.
          // Rule: 5% Discount, Max ₹100 per item.
          const basePrice = Number(item.price || 0);
          const calculatedDiscount = Math.min(Math.floor(basePrice * 0.05), 100);
          const upiDiscount = calculatedDiscount > 0 ? calculatedDiscount : 0;
          
          return {
            ...item,
            id: Number(item.id),
            price: basePrice,
            original_price: Number(item.original_price || item.price || 0),
            category: item.category_data?.name || 'General',
            category_id: Number(item.category_id),
            vendor_id: String(item.vendor_id),
            status: item.status || 'approved',
            
            // Computed Fields
            upi_discount: upiDiscount,
            upi_price: basePrice - upiDiscount,

            // Defaults since persistence is unavailable
            product_type: 'simple',
            is_cod_enabled: true, 
            is_online_enabled: true,
            
            variants: [], // Column missing in DB
            highlights: item.highlights || [],
            specifications: {} 
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
    // Extract UI flags & Virtual fields to exclude from payload
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes, 
      cash_on_delivery,
      product_type,
      category, 
      category_data, 
      specifications,
      variants,
      upi_price,
      upi_discount,
      ...payloadData 
    } = productData;
    
    // NOTE: We cannot save extended config because columns do not exist in the schema.
    
    const finalPayload = {
      ...payloadData,
      
      vendor_id: Number(productData.vendor_id),
      category_id: Number(productData.category_id),
      images: Array.isArray(productData.images) ? productData.images : [],
      created_at: new Date().toISOString(),
      status: productData.status || 'approved'
    };

    // Strict Cleanup: Ensure no invalid columns are sent
    delete (finalPayload as any).id; // Auto-generated
    delete (finalPayload as any).payment_modes;
    delete (finalPayload as any).cash_on_delivery;
    delete (finalPayload as any).category;
    delete (finalPayload as any).category_data;
    delete (finalPayload as any).product_type;
    delete (finalPayload as any).specifications;
    delete (finalPayload as any).variants; // Remove variants column payload
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
    // Extract UI flags & Virtual fields to exclude from payload
    const { 
      is_cod_enabled,
      is_online_enabled,
      payment_modes,
      cash_on_delivery,
      product_type,
      category, 
      category_data, 
      specifications,
      variants,
      upi_price,
      upi_discount,
      ...payloadData 
    } = product as any;

    const finalPayload = {
      ...payloadData,
      
      vendor_id: Number(payloadData.vendor_id),
      category_id: Number(payloadData.category_id)
    };

    // Strict Cleanup
    delete (finalPayload as any).id; // Cannot update identity column
    delete (finalPayload as any).created_at; // Should not update creation timestamp
    delete (finalPayload as any).payment_modes;
    delete (finalPayload as any).cash_on_delivery;
    delete (finalPayload as any).is_cod_enabled;
    delete (finalPayload as any).is_online_enabled;
    delete (finalPayload as any).category;
    delete (finalPayload as any).category_data;
    delete (finalPayload as any).product_type;
    delete (finalPayload as any).specifications;
    delete (finalPayload as any).variants; // Remove variants column payload
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
