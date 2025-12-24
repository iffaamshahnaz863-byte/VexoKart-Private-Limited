import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';
import { PRODUCTS as initialProducts } from '../constants';

interface ProductContextType {
  products: Product[];
  getProduct: (id: number) => Product | undefined;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
}

// FIX: Export ProductContext so it can be imported by the dedicated hook file.
export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-products');
      // If there's data, use it. Otherwise, seed with initial data.
      return localData ? JSON.parse(localData) : initialProducts;
    } catch (error) {
      console.error("Could not parse product data from localStorage", error);
      return initialProducts;
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-products', JSON.stringify(products));
  }, [products]);

  const getProduct = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }

  const addProduct = (productData: Omit<Product, 'id'>) => {
    setProducts(prevProducts => {
      const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
      const newProduct: Product = { ...productData, id: newId };
      return [...prevProducts, newProduct];
    });
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prevProducts =>
      prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: number) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  return (
    <ProductContext.Provider value={{ products, getProduct, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
