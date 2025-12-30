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

const PRODUCT_COLUMNS = 'id,name,description,price,original_price,images,category_id,vendor_id,status,stock,created_at';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 201,
    name: "Acoustic Noise-Canceling Headset",
    description: "Premium sound quality with advanced active noise cancellation.",
    price: 12999,
    original_price: 18999,
    discount_percent: 32,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80"],
    category_id: 1,
    category: "Electronics",
    vendor_id: "vexokart_direct",
    status: "live",
    stock: 25,
    rating: 4.8,
    review_count: 856,
    reviews: [],
    created_at: new Date().toISOString(),
    payment_modes: ["online", "cod"],
    variants: [{ type: 'color', name: 'Black', value: 'Midnight' }]
  },
  {
    id: 202,
    name: "Classic Chronograph Watch",
    description: "Elegant stainless steel design for the modern professional.",
    price: 4500,
    original_price: 9000,
    discount_percent: 50,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"],
    category_id: 3,
    category: "Lifestyle",
    vendor_id: "vexokart_direct",
    status: "live",
    stock: 12,
    rating: 4.5,
    review_count: 312,
    reviews: [],
    created_at: new Date().toISOString(),
    payment_modes: ["online", "cod"],
    variants: []
  },
  {
    id: 203,
    name: "Performance Mesh Runners",
    description: "Breathable fabric with reactive cushioning for long-distance runs.",
    price: 3200,
    original_price: 4999,
    discount_percent: 36,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80"],
    category_id: 4,
    category: "Footwear",
    vendor_id: "vendor_77",
    status: "live",
    stock: 50,
    rating: 4.2,
    review_count: 1450,
    reviews: [],
    created_at: new Date().toISOString(),
    payment_modes: ["online", "cod"],
    variants: [{ type: 'size', name: 'UK 9', value: '9' }]
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  };

  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      const cats = await fetchCategories();
      const response = await fetch(`${BASE_API_URL}/products?select=${PRODUCT_COLUMNS}&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!response.ok) throw new Error("API Error");

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
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
            vendor_id: String(item.vendor_id || ''),
            status: item.status || 'approved',
            variants: Array.isArray(item.variants) ? item.variants : [],
            payment_modes: ['online', 'cod'],
            rating: 4.2,
            review_count: 100,
            reviews: []
          };
        });
        setProducts(mappedProducts);
      } else {
        setProducts(FALLBACK_PRODUCTS);
      }
    } catch (error) {
      console.warn("[ProductContext] API unreachable. Loading fallback catalog.");
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
    try {
        const res = await fetch(`${BASE_API_URL}/products`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ ...productData, created_at: new Date().toISOString() })
        });
        if (!res.ok) throw new Error("DB error");
        await refreshProducts();
    } catch (e) {
        const newP = { ...productData, id: Date.now() };
        setProducts(prev => [newP, ...prev]);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
        await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
            method: 'PATCH',
            headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
            body: JSON.stringify(product)
        });
    } finally {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
  };

  const toggleProductStatus = async (id: number) => {
    const product = getProduct(id);
    if (!product) return;
    const newStatus = product.status === 'approved' ? 'disabled' : 'approved';
    try {
        await fetch(`${BASE_API_URL}/products?id=eq.${id}`, {
            method: 'PATCH',
            headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: newStatus })
        });
    } finally {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const deleteProduct = async (id: number) => {
    try {
        await fetch(`${BASE_API_URL}/products?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    } finally {
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