

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Review } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase.ts';

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
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*, user:users(name)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Failed to fetch reviews", e);
      return [];
    }
  };

  const hasUserReviewedOrder = async (orderId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('order_id', orderId);
      
      if (error) throw error;
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
      const resolvedUuid = user.auth_uid;

      const payload = {
        product_id: Number(reviewData.product_id),
        order_id: Number(reviewData.order_id), 
        rating: Number(reviewData.rating),
        review_text: reviewData.review_text || '',
        images: Array.isArray(reviewData.images) ? reviewData.images : [],
        video_url: reviewData.video_url || null, 
        user_id: resolvedUuid,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('product_reviews')
        .insert([payload]);

      if (error) {
        console.error(`[ReviewContext] Database Rejection:`, error.message);
        if (error.code === '42501' || error.code === '23505') {
            throw new Error("Action restricted: You may have already reviewed this purchase.");
        }
        throw new Error(error.message || "Failed to submit review. Database constraint violation.");
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

