
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product } from '../types';

interface ProductContextType {
  products: Product[];
  getProduct: (id: number) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: number) => void;
  toggleProductStatus: (productId: number) => void;
  approveProduct: (productId: number, approvedBy?: string) => void;
  rejectProduct: (productId: number, reason: string) => void;
  disableProduct: (productId: number) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-products');
      let parsedData = localData ? JSON.parse(localData) : [];
      
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map((p: any) => {
          if (p.features && !p.highlights) p.highlights = p.features;
          if (!p.vendorId) p.vendorId = 'vexokart_internal';
          
          // Migration: Since we removed the approval gating, we ensure 
          // ALL existing products are set to 'approved' so they are visible to users.
          if (!p.status || p.status === 'pending' || p.status === 'rejected' || p.status === 'live') {
            p.status = 'approved';
          }
          return p;
        });
      }
      return parsedData;

    } catch (error) {
      console.error("Could not parse product data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-products', JSON.stringify(products));
  }, [products]);

  const getProduct = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }

  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => {
    setProducts(prevProducts => {
      const newId = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.id)) + 1 : 1;
      const newProduct: Product = { 
        ...productData, 
        id: newId,
        rating: 4.5,
        reviewCount: 0,
        reviews: [],
        status: 'approved',
        stock: productData.stock || 0,
        highlights: productData.highlights || [],
        specifications: productData.specifications || {},
        sellerInfo: productData.sellerInfo || 'VexoKart Direct',
        returnPolicy: productData.returnPolicy || '30-Day Returns',
        warranty: productData.warranty || '1 Year Manufacturer Warranty',
        videoUrl: productData.videoUrl || '',
      };
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

  const toggleProductStatus = (productId: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, status: p.status === 'approved' ? 'disabled' : 'approved' };
      }
      return p;
    }));
  };

  const approveProduct = (productId: number, approvedBy?: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString(), rejectionReason: undefined } 
        : p
    ));
  };

  const rejectProduct = (productId: number, reason: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'rejected', rejectionReason: reason } 
        : p
    ));
  };

  const disableProduct = (productId: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: 'disabled' } 
        : p
    ));
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      getProduct, 
      addProduct, 
      updateProduct, 
      deleteProduct, 
      toggleProductStatus,
      approveProduct,
      rejectProduct,
      disableProduct
    }}>
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
