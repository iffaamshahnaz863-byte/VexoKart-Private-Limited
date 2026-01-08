import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Review } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';
import { useAuth } from './AuthContext';

interface ReviewContextType {
  getReviewsByProduct: (productId: number) => Promise<Review[]>;
  addReview: (reviewData: Partial<Review>) => Promise<void>;
  hasUserReviewedOrder: (orderId: string) => Promise<boolean>;
  isSubmitting: boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

/**
 * Helper to validate if a string is a valid UUID format.
 */
const isValidUUID = (uuid: string): boolean => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

export const ReviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getReviewsByProduct = async (productId: number): Promise<Review[]> => {
    try {
      const res = await fetch(`${BASE_API_URL}/product_reviews?select=*,user:users(name)&product_id=eq.${productId}&order=created_at.desc`, {
        headers: API_HEADERS
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch reviews", e);
      return [];
    }
  };

  const hasUserReviewedOrder = async (orderId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // Use order_id as the primary filter for uniqueness check
      const res = await fetch(`${BASE_API_URL}/product_reviews?order_id=eq.${orderId}&select=id`, {
        headers: API_HEADERS
      });
      const data = await res.json();
      return Array.isArray(data) && data.length > 0;
    } catch (e) {
      return false;
    }
  };

  const addReview = async (reviewData: Partial<Review>) => {
    if (!user || !user.email) {
      throw new Error("You must be logged in to submit a review.");
    }
    
    setIsSubmitting(true);
    try {
      /**
       * ROBUST UUID DISCOVERY:
       * The database 'product_reviews' requires a UUID for 'user_id' which must exist in the 'users' table.
       * Our application's current user 'id' is numeric ("2"), which causes a 400 (22P02) error.
       * We fetch the full user record and look for any field that contains a valid UUID.
       */
      const userLookupRes = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}&select=*`, {
        headers: API_HEADERS
      });
      
      const userData = await userLookupRes.json();
      const dbUser = Array.isArray(userData) && userData.length > 0 ? userData[0] : null;

      if (!dbUser) {
        throw new Error("User record not found in the marketplace database.");
      }

      // Try to find a valid UUID in the record (checking common column names first)
      let resolvedUuid = null;
      const possibleColumns = ['uuid', 'auth_id', 'user_id', 'id'];
      
      for (const col of possibleColumns) {
        if (dbUser[col] && isValidUUID(String(dbUser[col]))) {
          resolvedUuid = String(dbUser[col]);
          break;
        }
      }

      // Fallback: search all columns for anything that matches a UUID pattern
      if (!resolvedUuid) {
        for (const key in dbUser) {
          if (isValidUUID(String(dbUser[key]))) {
            resolvedUuid = String(dbUser[key]);
            break;
          }
        }
      }

      // If we still can't find a UUID, we provide the numeric ID and hope the DB can cast it,
      // but as per previous errors, this likely results in a 400. 
      // We'll throw an error with guidance instead of failing at the DB level.
      if (!resolvedUuid) {
        console.error("[ReviewContext] Identity Conflict: No UUID found for user with numeric ID", dbUser.id);
        throw new Error("System Identity Mismatch: Your account is missing a required UUID identifier for reviews. Please contact support.");
      }

      const payload = {
        product_id: Number(reviewData.product_id),
        order_id: Number(reviewData.order_id), 
        rating: Number(reviewData.rating),
        review_text: reviewData.review_text || '',
        images: Array.isArray(reviewData.images) ? reviewData.images : [],
        video_url: reviewData.video_url || null, 
        user_id: resolvedUuid, // Guaranteed valid UUID format
        created_at: new Date().toISOString()
      };

      const res = await fetch(`${BASE_API_URL}/product_reviews`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error(`[ReviewContext] Database Rejection:`, res.status, JSON.stringify(errData, null, 2));
        
        if (res.status === 403 || res.status === 409) {
            throw new Error("Action restricted: You may have already reviewed this purchase.");
        }
        
        throw new Error(errData.message || "Failed to submit review. Database constraint violation.");
      }
    } catch (err: any) {
        console.error("[ReviewContext] Submit Fail:", err.message);
        throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ReviewContext.Provider value={{ getReviewsByProduct, addReview, hasUserReviewedOrder, isSubmitting }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) throw new Error("useReviews missing provider");
  return context;
};