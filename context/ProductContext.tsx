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
  refreshProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

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
      const response = await fetch(`${BASE_API_URL}/products?select=*&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const cat = cats.find(c => Number(c.id) === Number(item.category_id));
          return {
            ...item,
            id: Number(item.id),
            price: Number(item.price),
            original_price: Number(item.original_price || item.price),
            discount_percent: Number(item.discount_percent || 0),
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            category: cat?.name || 'General',
            vendor_id: String(item.vendor_id),
            status: item.status || 'approved',
            variants: Array.isArray(item.variants) ? item.variants : [],
            payment_modes: Array.isArray(item.payment_modes) ? item.payment_modes : ['online', 'cod'],
            reviews: Array.isArray(item.reviews) ? item.reviews : []
          };
        });
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error("Error refreshing products:", error);
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
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const payload = {
      name: productData.name,
      description: productData.description,
      price,
      original_price: originalPrice,
      discount_percent: discount,
      images: productData.images,
      category_id: Number(productData.category_id),
      vendor_id: productData.vendor_id,
      status: 'approved',
      stock: Number(productData.stock),
      payment_modes: productData.payment_modes || ['online', 'cod'],
      variants: productData.variants || [],
      highlights: productData.highlights || [],
      specifications: productData.specifications || {},
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to save product');
    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    const price = Number(product.price);
    const originalPrice = Number(product.original_price || product.price);
    const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    const payload = {
      name: product.name,
      description: product.description,
      price,
      original_price: originalPrice,
      discount_percent: discount,
      images: product.images,
      category_id: product.category_id,
      stock: Number(product.stock),
      payment_modes: product.payment_modes,
      variants: product.variants,
      highlights: product.highlights,
      specifications: product.specifications
    };

    const res = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Update failed');
    await refreshProducts();
  };

  const deleteProduct = async (id: number) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    await refreshProducts();
  };

  return (
    <ProductContext.Provider value={{ products, isLoading, getProduct, addProduct, updateProduct, deleteProduct, refreshProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts error");
  return context;
};