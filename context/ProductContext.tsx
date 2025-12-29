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
  refreshProducts: (providedCategories?: Category[]) => Promise<void>;
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
      console.error("Failed to fetch categories:", e);
      return [];
    }
  };

  const refreshProducts = async (providedCategories?: Category[]) => {
    try {
      const response = await fetch(`${BASE_API_URL}/products?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      const currentCats = providedCategories || categories;
      
      if (Array.isArray(data)) {
        const mappedProducts: Product[] = data.map((item: any) => {
          const catId = item.category_id || (item.category && !isNaN(Number(item.category)) ? Number(item.category) : null);
          const cat = currentCats.find(c => Number(c.id) === Number(catId));
          
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
          }

          return {
            id: item.id,
            name: item.name || 'Untitled Product',
            description: item.description || '',
            price: Number(item.price) || 0,
            originalPrice: Number(item.original_price || item.price || 0),
            stock: Number(item.stock) || 0,
            images: productImages,
            category: cat ? cat.name : (typeof item.category === 'string' ? item.category : 'General'),
            vendorId: item.vendor_id ? item.vendor_id.toString() : 'internal',
            status: item.status || 'approved',
            rating: Number(item.rating) || 0,
            reviewCount: Number(item.review_count) || 0,
            reviews: item.reviews || [],
            highlights: item.highlights || [],
            specifications: item.specifications || {},
            sellerInfo: item.seller_info || 'VexoKart Partner',
            returnPolicy: item.return_policy || '7 Day Replacement',
            warranty: item.warranty || 'No Warranty',
            videoUrl: item.video_url || '',
            approved_at: item.approved_at,
            approved_by: item.approved_by,
            rejectionReason: item.rejection_reason,
            allow_online: item.allow_online ?? true,
            allow_cod: item.allow_cod ?? true,
            colors: Array.isArray(item.colors) ? item.colors : [],
            sizes: Array.isArray(item.sizes) ? item.sizes : []
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
        const freshCats = await fetchCategories();
        await refreshProducts(freshCats);
    };
    init();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  const safeSupabaseSave = async (url: string, method: string, payload: any) => {
    let currentPayload = { ...payload };
    if (currentPayload.id) delete currentPayload.id;

    let attempts = 0;
    const maxAttempts = 12;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          method,
          headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
          body: JSON.stringify(currentPayload)
        });

        const result = await response.json();

        if (response.ok) return result;

        if (result.code === 'PGRST204') {
          const match = result.message.match(/column ['"](.+?)['"]/i);
          const missingColumn = match ? match[1] : null;

          if (missingColumn && currentPayload.hasOwnProperty(missingColumn)) {
            console.warn(`[Adapter] Dropping column: ${missingColumn}`);
            delete currentPayload[missingColumn];
            attempts++;
            continue;
          }

          const suspects = ['colors', 'sizes', 'category', 'original_price', 'allow_online', 'allow_cod', 'vendor_id', 'images'];
          let stripped = false;
          for (const key of suspects) {
              if (currentPayload.hasOwnProperty(key)) {
                  delete currentPayload[key];
                  stripped = true;
                  break; 
              }
          }
          if (!stripped) throw new Error(`Schema mismatch: ${JSON.stringify(result)}`);
          attempts++;
        } else {
          throw new Error(result.message || 'Database error');
        }
      } catch (err: any) {
        throw err;
      }
    }
    throw new Error("Unable to synchronize with database schema.");
  };

  const addProduct = async (productData: any) => {
    // Determine category ID accurately
    let selectedCategoryId = null;
    let matchedCategoryName = 'General';

    if (!isNaN(Number(productData.category))) {
        selectedCategoryId = Number(productData.category);
        matchedCategoryName = categories.find(c => Number(c.id) === selectedCategoryId)?.name || 'General';
    } else {
        const found = categories.find(c => c.name === productData.category);
        selectedCategoryId = found ? Number(found.id) : null;
        matchedCategoryName = productData.category || 'General';
    }

    const supabasePayload: any = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      original_price: Number(productData.originalPrice || productData.price),
      stock: Number(productData.stock || 0),
      image: productData.images?.[0] || '', 
      images: productData.images || [], 
      status: 'approved', // Requirement: AUTO-APPROVE
      vendor_id: Number(productData.vendor_id) || null, 
      created_at: new Date().toISOString(),
      allow_online: productData.allow_online ?? true,
      allow_cod: productData.allow_cod ?? true,
      category_id: selectedCategoryId,
      category: matchedCategoryName,
      colors: productData.colors || [],
      sizes: productData.sizes || [],
      highlights: productData.highlights || [],
      specifications: productData.specifications || {}
    };
    
    await safeSupabaseSave(`${BASE_API_URL}/products`, 'POST', supabasePayload);
    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    let selectedCategoryId = null;
    let matchedCategoryName = 'General';

    const cat = categories.find(c => c.name === product.category || c.id === Number(product.category));
    selectedCategoryId = cat ? cat.id : null;
    matchedCategoryName = cat ? cat.name : product.category;

    const supabaseUpdate: any = {
      name: product.name,
      description: product.description,
      price: Number(product.price),
      original_price: Number(product.originalPrice || product.price),
      stock: Number(product.stock),
      image: product.images?.[0] || '',
      images: product.images || [],
      allow_online: product.allow_online,
      allow_cod: product.allow_cod,
      category_id: selectedCategoryId,
      category: matchedCategoryName,
      colors: product.colors,
      sizes: product.sizes,
      highlights: product.highlights,
      specifications: product.specifications
    };

    await safeSupabaseSave(`${BASE_API_URL}/products?id=eq.${product.id}`, 'PATCH', supabaseUpdate);
    await refreshProducts();
  };

  const deleteProduct = async (productId: number) => {
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, { method: 'DELETE', headers: API_HEADERS });
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
      body: JSON.stringify({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString() })
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
    
    await fetch(`${BASE_API_URL}/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify({ reviews: updatedReviews, review_count: newCount, rating: newRating })
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

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within ProductProvider");
  return context;
};