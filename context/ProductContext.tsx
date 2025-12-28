
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product, Review } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  getProduct: (id: number) => Product | undefined;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  toggleProductStatus: (productId: number) => Promise<void>;
  approveProduct: (productId: number, approvedBy?: string) => Promise<void>;
  rejectProduct: (productId: number, reason: string) => Promise<void>;
  disableProduct: (productId: number) => Promise<void>;
  addReview: (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
  refreshProducts: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/products?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error("Products sync failed: API response is not an array", data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fire the initial fetch once
    refreshProducts();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
    const discountAmount = productData.originalPrice ? Math.max(0, productData.originalPrice - productData.price) : 0;
    
    // Mapping frontend model to requested Supabase schema columns
    const supabasePayload = {
      vendor_id: productData.vendor_id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      discount: discountAmount,
      stock: productData.stock,
      image: productData.images?.[0] || '', // Using first image as requested 'image' column
      category: productData.category,
      status: 'pending',
      created_at: new Date().toISOString(),
      // Optional/Extended fields
      highlights: productData.highlights || [],
      specifications: productData.specifications || {},
      original_price: productData.originalPrice || productData.price,
      images: productData.images || []
    };

    const response = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(supabasePayload)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Database insert failed');
    }

    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(product)
    });
    await refreshProducts();
  };

  const deleteProduct = async (productId: number) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'DELETE',
      headers: API_HEADERS
    });
    await refreshProducts();
  };

  const toggleProductStatus = async (productId: number) => {
    const p = getProduct(productId);
    if (!p) return;
    const newStatus = p.status === 'approved' ? 'disabled' : 'approved';
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: newStatus })
    });
    await refreshProducts();
  };

  const approveProduct = async (productId: number, approvedBy?: string) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ 
        status: 'approved', 
        approved_by: approvedBy, 
        approved_at: new Date().toISOString() 
      })
    });
    await refreshProducts();
  };

  const rejectProduct = async (productId: number, reason: string) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: 'rejected', rejectionReason: reason })
    });
    await refreshProducts();
  };

  const disableProduct = async (productId: number) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: 'disabled' })
    });
    await refreshProducts();
  };

  const addReview = async (productId: number, reviewData: any) => {
    const p = getProduct(productId);
    if (!p) return;
    const newReview = { ...reviewData, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    const updatedReviews = [newReview, ...p.reviews];
    const newCount = updatedReviews.length;
    const newRating = Number(((p.rating * p.reviewCount + reviewData.rating) / newCount).toFixed(1));
    
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ reviews: updatedReviews, reviewCount: newCount, rating: newRating })
    });
    await refreshProducts();
  };

  return (
    <ProductContext.Provider value={{ 
      products, isLoading, getProduct, addProduct, updateProduct, 
      deleteProduct, toggleProductStatus, approveProduct, rejectProduct, 
      disableProduct, addReview, refreshProducts 
    }}>
      {children}
    </ProductContext.Provider>
  );
};
