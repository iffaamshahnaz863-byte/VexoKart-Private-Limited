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
          
          let productImages: string[] = [];
          if (Array.isArray(item.images) && item.images.length > 0) {
            productImages = item.images;
          } else if (item.images && typeof item.images === 'string') {
             try {
                const parsed = JSON.parse(item.images);
                if (Array.isArray(parsed)) productImages = parsed;
             } catch(e) {
                productImages = [item.images];
             }
          } else if (item.image) {
            productImages = [item.image];
          } else if (item.image_url) {
            productImages = [item.image_url];
          }

          return {
            id: item.id,
            name: item.name || 'Untitled Product',
            description: item.description || '',
            price: Number(item.price) || 0,
            originalPrice: Number(item.original_price || item.price || 0),
            stock: Number(item.stock) || 0,
            images: productImages,
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
            rejectionReason: item.rejection_reason,
            allow_online: item.allow_online ?? true,
            allow_cod: item.allow_cod ?? true
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

  /**
   * Helper to perform Supabase operations with an automatic fallback 
   * for the 'images' jsonb column if it's missing in the schema.
   */
  const safeSupabaseSave = async (url: string, method: string, payload: any) => {
    const response = await fetch(url, {
      method,
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    // PGRST204: Column not found in schema cache
    if (!response.ok && result.code === 'PGRST204' && payload.images) {
        console.warn("[ProductContext] 'images' column missing. Falling back to legacy 'image' column.");
        const { images, ...fallbackPayload } = payload;
        
        const fallbackResponse = await fetch(url, {
            method,
            headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify(fallbackPayload)
        });
        
        if (!fallbackResponse.ok) {
            const fallbackErr = await fallbackResponse.json();
            throw new Error(fallbackErr.message || 'Legacy fallback failed');
        }
        return await fallbackResponse.json();
    }

    if (!response.ok) throw new Error(result.message || 'Request failed');
    return result;
  };

  const addProduct = async (productData: any) => {
    const matchedCategory = categories.find(c => c.name === productData.category);
    const categoryId = matchedCategory ? matchedCategory.id : null;
    
    const supabasePayload: any = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock || 0,
      image: productData.images?.[0] || '', 
      images: productData.images || [], 
      status: 'approved',
      vendor_id: productData.vendor_id, 
      created_at: new Date().toISOString(),
      allow_online: productData.allow_online ?? true,
      allow_cod: productData.allow_cod ?? true
    };

    if (categoryId) supabasePayload.category_id = categoryId;
    
    await safeSupabaseSave(`${BASE_API_URL}/products`, 'POST', supabasePayload);
    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    const matchedCategory = categories.find(c => c.name === product.category);
    const categoryId = matchedCategory ? matchedCategory.id : null;

    const supabaseUpdate: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: 'approved',
      image: product.images?.[0] || '',
      images: product.images || [],
      allow_online: product.allow_online,
      allow_cod: product.allow_cod
    };

    if (categoryId) supabaseUpdate.category_id = categoryId;

    await safeSupabaseSave(`${BASE_API_URL}/products?id=eq.${product.id}`, 'PATCH', supabaseUpdate);
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