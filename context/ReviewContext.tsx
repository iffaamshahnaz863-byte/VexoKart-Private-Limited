

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
    if (!user || !user.auth_uid) {
      throw new Error("You must be logged in to submit a review, and your account must have a valid security ID.");
    }
    
    setIsSubmitting(true);
    try {
      // CRITICAL FIX: Directly use the auth_uid from the user context.
      // This removes the inefficient and error-prone database lookup.
      const resolvedUuid = user.auth_uid;

      const payload = {
        product_id: Number(reviewData.product_id),
        order_id: Number(reviewData.order_id), 
        rating: Number(reviewData.rating),
        review_text: reviewData.review_text || '',
        images: Array.isArray(reviewData.images) ? reviewData.images : [],
        video_url: reviewData.video_url || null, 
        user_id: resolvedUuid, // Use the correct UUID from the authenticated session
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
