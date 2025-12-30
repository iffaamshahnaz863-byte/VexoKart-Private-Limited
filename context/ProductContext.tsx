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
  refreshProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

// CRITICAL: Normalized column set for stable Supabase sync
const PRODUCT_COLUMNS = 'id,name,description,price,original_price,images,category_id,vendor_id,status,stock,created_at';

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        return data;
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const refreshProducts = async () => {
    try {
      const cats = await fetchCategories();
      const response = await fetch(`${BASE_API_URL}/products?select=${PRODUCT_COLUMNS}&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) {
        const err = await response.json();
        console.error("[ProductContext] Fetch Error:", err);
        return;
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const cat = cats.find(c => Number(c.id) === Number(item.category_id));
          const price = Number(item.price);
          const originalPrice = Number(item.original_price || item.price);
          
          return {
            ...item,
            id: Number(item.id),
            price: price,
            original_price: originalPrice,
            discount_percent: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
            images: Array.isArray(item.images) ? item.images : [],
            category: cat?.name || 'General',
            // Normalize vendor_id from both snake_case and camelCase DB variants
            vendor_id: String(item.vendor_id || item.vendorId || ''),
            status: item.status || 'approved',
            variants: Array.isArray(item.variants) ? item.variants : [],
            payment_modes: ['online', 'cod'],
            highlights: ['Premium Quality', 'Verified Seller', 'Fast Delivery'],
            specifications: {},
            reviews: []
          };
        });
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("[ProductContext] refreshProducts Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
    const price = Number(productData.price);
    const originalPrice = Number(productData.original_price || productData.price);

    // CRITICAL: Ensure vendor_id is the primary identity used for linking
    const payload = {
      name: productData.name,
      description: productData.description,
      price,
      original_price: originalPrice,
      images: Array.isArray(productData.images) ? productData.images : [], 
      category_id: Number(productData.category_id || productData.category),
      vendor_id: String(productData.vendor_id || productData.vendorId),
      status: productData.status || 'approved',
      stock: Number(productData.stock || 0),
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("[ProductContext] Write Error:", errorData);
      throw new Error(errorData.message || 'Database rejected the product listing');
    }
    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    const price = Number(product.price);
    const originalPrice = Number(product.original_price || product.price);

    const payload = {
      name: product.name,
      description: product.description,
      price,
      original_price: originalPrice,
      images: product.images,
      category_id: Number(product.category_id),
      stock: Number(product.stock),
      status: product.status,
      vendor_id: String(product.vendor_id)
    };

    const res = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("[ProductContext] Update Error:", errorData);
      throw new Error(errorData.message || 'Database update failed');
    }
    await refreshProducts();
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = product.status === 'approved' ? 'disabled' : 'approved';
    await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ status: newStatus })
    });
    await refreshProducts();
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`${BASE_API_URL}/products?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Delete failed');
    }
    await refreshProducts();
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      isLoading, 
      getProduct, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      toggleProductStatus,
      refreshProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts error");
  return context;
};