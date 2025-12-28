
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Product, Review, Category } from '../types';
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
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/categories?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      console.error("Failed to fetch categories:", e);
    }
  };

  const refreshProducts = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/products?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const cat = categories.find(c => c.id === item.category_id);
          // Standardizing Database response to Frontend Product model
          // providing safe defaults for columns that might be missing in your Supabase schema
          return {
            id: item.id,
            name: item.name || 'Untitled Product',
            description: item.description || '',
            price: Number(item.price) || 0,
            originalPrice: Number(item.original_price || item.price || 0),
            stock: Number(item.stock) || 0,
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            category: cat ? cat.name : (item.category || 'General'),
            vendorId: item.vendor_id ? item.vendor_id.toString() : 'internal',
            status: item.status || 'approved',
            rating: Number(item.rating) || 0,
            reviewCount: Number(item.review_count) || 0,
            reviews: item.reviews || [],
            highlights: item.highlights || [],
            specifications: item.specifications || {},
            sellerInfo: item.seller_info || 'VexoKart Partner',
            returnPolicy: item.return_policy || 'Standard Returns',
            warranty: item.warranty || 'No Warranty',
            videoUrl: item.video_url || '',
            approved_at: item.approved_at,
            approved_by: item.approved_by,
            rejectionReason: item.rejection_reason
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
    const init = async () => {
        await fetchCategories();
        await refreshProducts();
    };
    init();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const addProduct = async (productData: any) => {
    const matchedCategory = categories.find(c => c.name === productData.category);
    const categoryId = matchedCategory ? matchedCategory.id : null;
    
    /**
     * ULTRA SAFE PAYLOAD:
     * Stripping original_price, highlights, and specifications 
     * to avoid PGRST204 "Column not found" errors.
     */
    const supabasePayload: any = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock || 0,
      image: productData.images?.[0] || '', // Use primary 'image' column
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Only add relational ID if it's confirmed
    if (categoryId) supabasePayload.category_id = categoryId;
    
    const response = await fetch(`${BASE_API_URL}/products`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(supabasePayload)
    });

    if (!response.ok) {
        const err = await response.json();
        const errorDetail = JSON.stringify(err);
        console.error("Supabase Add Error:", errorDetail);
        throw new Error(`Database Error: ${errorDetail}`);
    }

    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    const matchedCategory = categories.find(c => c.name === product.category);
    const categoryId = matchedCategory ? matchedCategory.id : null;

    // Standardized minimal update payload
    const supabaseUpdate: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.images?.[0] || ''
    };

    if (categoryId) supabaseUpdate.category_id = categoryId;

    const response = await fetch(`${BASE_API_URL}/products?id=eq.${product.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(supabaseUpdate)
    });

    if (!response.ok) {
        const err = await response.json();
        const errorDetail = JSON.stringify(err);
        throw new Error(`Update Failed: ${errorDetail}`);
    }

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
      body: JSON.stringify({ status: 'rejected', rejection_reason: reason })
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
    const updatedReviews = [newReview, ...(p.reviews || [])];
    const newCount = updatedReviews.length;
    const newRating = Number(((p.rating * (p.reviewCount || 0) + reviewData.rating) / newCount).toFixed(1));
    
    try {
        await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
          method: 'PATCH',
          headers: API_HEADERS,
          body: JSON.stringify({ 
              reviews: updatedReviews, 
              review_count: newCount, 
              rating: newRating 
          })
        });
        await refreshProducts();
    } catch (e) {
        console.warn("Product schema does not support remote reviews storage.");
    }
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
