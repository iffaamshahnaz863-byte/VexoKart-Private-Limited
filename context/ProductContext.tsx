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
          const cat = currentCats.find(c => Number(c.id) === Number(item.category_id));
          
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
        const freshCats = await fetchCategories();
        await refreshProducts(freshCats);
    };
    init();
  }, []);

  const getProduct = (id: number) => products.find(p => p.id === id);

  /**
   * AUTONOMOUS SCHEMA ADAPTER
   * Resolves PGRST204 errors by identifying and stripping missing columns from the payload.
   */
  const safeSupabaseSave = async (url: string, method: string, payload: any) => {
    console.log(`[ProductContext] Adaptive Save Initiated (${method})`);
    
    let currentPayload = { ...payload };
    
    // Safety check: Never send 'id' in a PATCH/POST body as Supabase Primary Keys are immutable
    if (currentPayload.id) delete currentPayload.id;

    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          method,
          headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
          body: JSON.stringify(currentPayload)
        });

        const result = await response.json();

        if (response.ok) {
          console.log("[ProductContext] Save Success!");
          return result;
        }

        // PGRST204: Missing Column. Dynamically strip and retry.
        if (result.code === 'PGRST204') {
          console.warn(`[ProductContext] DB error: ${result.message}`);
          
          // Match 'column_name' from messages like "Could not find the 'xyz' column..."
          const match = result.message.match(/column ['"](.+?)['"]/i);
          const missingColumn = match ? match[1] : null;

          if (missingColumn && currentPayload.hasOwnProperty(missingColumn)) {
            console.warn(`[ProductContext] Removing unsupported column '${missingColumn}' and retrying...`);
            delete currentPayload[missingColumn];
            attempts++;
            continue;
          }

          // Emergency strip of likely non-standard columns if regex fails
          const suspects = ['category', 'category_id', 'images', 'allow_online', 'allow_cod', 'vendor_id', 'status', 'approved_by', 'approved_at', 'original_price'];
          let stripped = false;
          for (const key of suspects) {
              if (currentPayload.hasOwnProperty(key)) {
                  console.warn(`[ProductContext] Emergency stripping suspect column: ${key}`);
                  delete currentPayload[key];
                  stripped = true;
                  break; 
              }
          }

          if (!stripped) {
            console.error("[ProductContext] No more columns can be safely stripped. Aborting.");
            throw new Error(`Fatal Database Mismatch: ${JSON.stringify(result)}`);
          }
          attempts++;
        } else {
          console.error("[ProductContext] Database Logic Error:", JSON.stringify(result));
          throw new Error(result.message || 'Database rejected the request.');
        }
      } catch (err: any) {
        console.error("[ProductContext] Request Exception:", err.message || JSON.stringify(err));
        throw err;
      }
    }
    
    throw new Error("Maximum schema adaptation attempts reached.");
  };

  const addProduct = async (productData: any) => {
    // Correctly resolve Category ID/Name for sync
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
      price: productData.price,
      stock: productData.stock || 0,
      image: productData.images?.[0] || '', 
      images: productData.images || [], 
      status: 'approved',
      vendor_id: productData.vendor_id, 
      created_at: new Date().toISOString(),
      allow_online: productData.allow_online ?? true,
      allow_cod: productData.allow_cod ?? true,
      category_id: selectedCategoryId,
      category: matchedCategoryName
    };
    
    await safeSupabaseSave(`${BASE_API_URL}/products`, 'POST', supabasePayload);
    await refreshProducts();
  };

  const updateProduct = async (product: Product) => {
    let selectedCategoryId = null;
    let matchedCategoryName = 'General';

    if (!isNaN(Number(product.category))) {
        selectedCategoryId = Number(product.category);
        matchedCategoryName = categories.find(c => Number(c.id) === selectedCategoryId)?.name || 'General';
    } else {
        const found = categories.find(c => c.name === product.category);
        selectedCategoryId = found ? Number(found.id) : null;
        matchedCategoryName = product.category || 'General';
    }

    const supabaseUpdate: any = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      status: 'approved',
      image: product.images?.[0] || '',
      images: product.images || [],
      allow_online: product.allow_online,
      allow_cod: product.allow_cod,
      category_id: selectedCategoryId,
      category: matchedCategoryName
    };

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
        console.warn("Review storage failed.");
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

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProducts must be used within ProductProvider");
  return context;
};