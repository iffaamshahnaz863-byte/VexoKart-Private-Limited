
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

const MAX_RECENTLY_VIEWED = 10;

interface RecentlyViewedContextType {
  addRecentlyViewed: (productId: number) => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export const RecentlyViewedProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUserSession, isAuthenticated } = useAuth();

  const addRecentlyViewed = (productId: number) => {
    if (!isAuthenticated || !user) return;
    
    // Remove if it exists to move it to the front
    const filtered = user.recentlyViewed.filter(id => id !== productId);
    
    // Add to the front
    const updated = [productId, ...filtered];
    
    // Limit the list size
    const final = updated.slice(0, MAX_RECENTLY_VIEWED);

    updateUserSession({ ...user, recentlyViewed: final });
  };

  return (
    <RecentlyViewedContext.Provider value={{ addRecentlyViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};
