
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product, Review } from '../types';

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
  addReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

const SEED_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Zenith X Pro Titanium",
    category: "Electronics",
    price: 124999,
    originalPrice: 139999,
    rating: 4.9,
    reviewCount: 1240,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"],
    description: "The ultimate flagship experience. Featuring an aerospace-grade titanium frame and the all-new A17 Pro Bionic chip for unparalleled performance and efficiency.",
    reviews: [],
    highlights: ["Titanium Frame", "A17 Pro Bionic Chip", "48MP Triple Camera", "ProMotion Display"],
    stock: 25,
    specifications: { "Display": "6.7-inch OLED", "Battery": "4422 mAh", "Weight": "221g", "Storage": "256GB / 512GB / 1TB" },
    vendorId: "vexokart_internal",
    status: "approved"
  },
  {
    id: 102,
    name: "Nova Buds Gen-3",
    category: "Audio",
    price: 24990,
    originalPrice: 29990,
    rating: 4.7,
    reviewCount: 856,
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80"],
    description: "Immerse yourself in pure sound with intelligent active noise cancellation and spatial audio technology that tracks your head movements.",
    reviews: [],
    highlights: ["Active Noise Cancellation", "Spatial Audio", "30H Battery Life", "IPX4 Sweat Resistance"],
    stock: 150,
    specifications: { "Driver": "11mm Dynamic", "Connectivity": "Bluetooth 5.3", "Charging": "USB-C & Wireless", "Sensors": "Skin-detecting sensors" },
    vendorId: "vexokart_internal",
    status: "approved"
  }
];

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-products');
      let parsedData = localData ? JSON.parse(localData) : SEED_PRODUCTS;
      
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map((p: any) => {
          if (p.features && !p.highlights) p.highlights = p.features;
          if (!p.vendorId) p.vendorId = 'vexokart_internal';
          if (!p.reviews) p.reviews = [];
          if (!p.status) p.status = 'approved';
          return p;
        });
      }
      return parsedData;
    } catch (error) {
      return SEED_PRODUCTS;
    }
  });

  const saveProducts = (updatedProducts: Product[]) => {
    localStorage.setItem('vexokart-products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const getProduct = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  }

  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews' | 'status'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct: Product = { 
      ...productData, 
      id: newId,
      rating: 0,
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
    saveProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    saveProducts(updated);
  };

  const deleteProduct = (productId: number) => {
    const updated = products.filter(p => p.id !== productId);
    saveProducts(updated);
  };

  const toggleProductStatus = (productId: number) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return { ...p, status: p.status === 'approved' ? 'disabled' as const : 'approved' as const };
      }
      return p;
    });
    saveProducts(updated);
  };

  const approveProduct = (productId: number, approvedBy?: string) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'approved' as const, approved_by: approvedBy, approved_at: new Date().toISOString(), rejectionReason: undefined } 
        : p
    );
    saveProducts(updated);
  };

  const rejectProduct = (productId: number, reason: string) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'rejected' as const, rejectionReason: reason } 
        : p
    );
    saveProducts(updated);
  };

  const disableProduct = (productId: number) => {
    const updated = products.map(p => 
      p.id === productId 
        ? { ...p, status: 'disabled' as const } 
        : p
    );
    saveProducts(updated);
  };

  const addReview = (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        const newReview: Review = {
          ...reviewData,
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString()
        };
        const updatedReviews = [newReview, ...p.reviews];
        const newReviewCount = updatedReviews.length;
        const newRating = ((p.rating * p.reviewCount) + reviewData.rating) / newReviewCount;
        return {
          ...p,
          reviews: updatedReviews,
          reviewCount: newReviewCount,
          rating: Number(newRating.toFixed(1))
        };
      }
      return p;
    });
    saveProducts(updated);
  };

  return (
    <ProductContext.Provider value={{ 
      products, getProduct, addProduct, updateProduct, deleteProduct, toggleProductStatus,
      approveProduct, rejectProduct, disableProduct, addReview
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
