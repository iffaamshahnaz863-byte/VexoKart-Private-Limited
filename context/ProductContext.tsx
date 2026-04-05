
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';
import { supabase } from '../supabase';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  getProduct: (id: number) => Product | undefined;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (productData: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  toggleProductStatus: (productId: number) => Promise<void>;
  refreshProducts: (options?: { vendorId?: number; categoryId?: number; search?: string; limit?: number; status?: boolean }) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async (options: { vendorId?: number; categoryId?: number; search?: string; limit?: number; status?: boolean } = {}) => {
    const { vendorId, categoryId, search, limit, status } = options;
    try {
      setIsLoading(true);
      console.log("Fetching products from Supabase with options:", options);
      
      let query = supabase
        .from('products')
        .select('*, category_data:categories(name)')
        .order('created_at', { ascending: false });

      if (status !== undefined) {
        query = query.eq('status', status);
      } else if (options.status === undefined && !window.location.pathname.includes('/admin/')) {
        // Default to active only for non-admin pages if not specified
        query = query.eq('status', true);
      }
      
      if (vendorId) query = query.eq('vendor_id', vendorId);
      if (categoryId) query = query.eq('category_id', categoryId);
      if (search) query = query.ilike('name', `%${search}%`);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      
      if (error) {
        console.error("[ProductSync] Supabase error:", error);
        throw error;
      }

      console.log("Products fetched successfully:", data);
      if (data) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const basePrice = Number(item.price || 0);
          const upiDiscount = item.upi_discount_amount 
            ? Number(item.upi_discount_amount) 
            : Math.min(Math.floor(basePrice * 0.05), 100);
          
          return {
            ...item,
            id: Number(item.id),
            images: Array.isArray(item.images) ? item.images : [],
            price: basePrice,
            original_price: Number(item.original_price || item.price || 0),
            category: item.category_data?.name || 'General',
            category_id: Number(item.category_id),
            vendor_id: String(item.vendor_id),
            status: !!item.status,
            is_cod_enabled: item.allow_cod !== false,
            is_online_enabled: item.allow_online !== false,
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
      console.error("[ProductSync] Error fetching products:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
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
      status: productData.status ?? true,
      allow_cod: is_cod_enabled,
      allow_online: is_online_enabled,
      product_type: productData.product_type || 'simple'
    };

    delete (finalPayload as any).id;

    try {
      const { error } = await supabase
        .from('products')
        .insert([finalPayload]);

      if (error) throw error;
      await refreshProducts({ vendorId: finalPayload.vendor_id });
    } catch (err: any) {
      console.error("[ProductSync] Error adding product:", err.message);
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
      allow_cod: is_cod_enabled,
      allow_online: is_online_enabled
    };

    delete (finalPayload as any).id;
    delete (finalPayload as any).created_at;

    try {
      const { error } = await supabase
        .from('products')
        .update(finalPayload)
        .eq('id', product.id);
      
      if (error) throw error;
      await refreshProducts({ vendorId: finalPayload.vendor_id });
    } catch (err: any) {
      console.error("[ProductSync] Error updating product:", err.message);
      throw err;
    }
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = !product.status;
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      await refreshProducts({ vendorId: Number(product.vendor_id) });
    } catch (err: any) {
      console.error("[ProductSync] Error toggling product status:", err.message);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("[ProductSync] Error deleting product:", err.message);
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

