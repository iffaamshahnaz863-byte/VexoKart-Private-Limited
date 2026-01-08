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
      // Use select join to fetch the reviewer's name dynamically from the users table
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
      const res = await fetch(`${BASE_API_URL}/product_reviews?order_id=eq.${orderId}&user_id=eq.${user.id}&select=id`, {
        headers: API_HEADERS
      });
      const data = await res.json();
      return Array.isArray(data) && data.length > 0;
    } catch (e) {
      return false;
    }
  };

  const addReview = async (reviewData: Partial<Review>) => {
    if (!user) throw new Error("Authentication required");
    
    setIsSubmitting(true);
    try {
      const payload = {
        product_id: reviewData.product_id,
        order_id: reviewData.order_id,
        rating: reviewData.rating,
        review_text: reviewData.review_text,
        images: reviewData.images,
        video_url: reviewData.video_url,
        user_id: user.id,
        // Removed 'author' column as it doesn't exist in the schema
        is_verified: true,
        created_at: new Date().toISOString()
      };

      const res = await fetch(`${BASE_API_URL}/product_reviews`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit review");
      }
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