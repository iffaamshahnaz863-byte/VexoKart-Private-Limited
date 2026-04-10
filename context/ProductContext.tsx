import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';

/* ================= TYPES ================= */
export interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  images?: string[];
  status: boolean;
}

/* ================= CONTEXT ================= */
export interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  refreshProducts: (options?: any) => Promise<void>;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  toggleProductStatus: (id: number) => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | null>(null);

/* ================= PROVIDER ================= */
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async (options: any = {}) => {
    try {
      setIsLoading(true);
      console.log("Fetching products with options:", options);

      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.status !== undefined) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error:", error);
        return;
      }

      console.log("RAW PRODUCTS:", data);

      // Filter logic if needed, but usually we trust the query
      setProducts(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduct = async (productData: any) => {
    try {
      const { error } = await supabase.from('products').insert([productData]);
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Add error:", err);
      throw err;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { id, ...payload } = product;
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    }
  };

  const toggleProductStatus = async (id: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      const { error } = await supabase.from('products').update({ status: !product.status }).eq('id', id);
      if (error) throw error;
      await refreshProducts();
    } catch (err) {
      console.error("Toggle error:", err);
      throw err;
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ 
      products, 
      isLoading, 
      refreshProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus
    }}>
      {children}
    </ProductContext.Provider>
  );
};

/* ================= HOOK ================= */
export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};

/* ================= UI ================= */
const ProductList = () => {
  const { products, isLoading } = useProducts();

  if (isLoading) return <p>Loading products...</p>;
  if (!products.length) return <p>No products available</p>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      padding: '10px'
    }}>
      {products.map((p) => (
        <div key={p.id} style={{
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '10px'
        }}>
          <img
            src={p.images?.[0] || p.image_url}
            alt={p.name}
            style={{
              width: '100%',
              height: '140px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
          <h4 style={{ margin: '8px 0' }}>{p.name}</h4>
          <p style={{ fontWeight: 'bold' }}>₹{p.price}</p>
        </div>
      ))}
    </div>
  );
};

/* ================= MAIN PAGE ================= */
const ProductPage = () => {
  return (
    <div>
      <h2 style={{ padding: '10px' }}>Products</h2>
      <ProductList />
    </div>
  );
};

/* ================= APP ================= */
export default function App() {
  return (
    <ProductProvider>
      <ProductPage />
    </ProductProvider>
  );
}