import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Banner } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface BannerContextType {
  banners: Banner[];
  addBanner: (imageUrl: string, title: string) => Promise<void>;
  deleteBanner: (id: number) => Promise<void>;
  toggleBannerStatus: (id: number, currentStatus: boolean) => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

const FALLBACK_BANNERS: Banner[] = [
  {
    id: 101,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    title: 'Seasonal Essentials',
    status: true,
    display_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 102,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    title: 'Premium Tech Gear',
    status: true,
    display_order: 2,
    created_at: new Date().toISOString()
  }
];

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/banners?select=*&order=display_order.asc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      if (!res.ok) throw new Error("API status check failed");
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setBanners(data);
      } else {
        setBanners(FALLBACK_BANNERS);
      }
    } catch (error) {
      console.warn("[BannerContext] API unreachable. Using fallback banners.", error);
      setBanners(FALLBACK_BANNERS);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async (url: string, title: string) => {
    try {
      const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) + 1 : 0;
      const response = await fetch(`${BASE_API_URL}/banners`, {
        method: 'POST',
        headers: API_HEADERS,
        body: JSON.stringify({ 
          image_url: url, 
          title: title,
          status: true, 
          display_order: nextOrder 
        })
      });
      
      if (!response.ok) throw new Error("Database rejected the request");
      await fetchBanners();
    } catch (err) {
      // Local optimistic update for demo purposes if API fails
      const newB = { id: Date.now(), image_url: url, title, status: true, display_order: 0, created_at: new Date().toISOString() };
      setBanners(prev => [...prev, newB]);
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    } finally {
      setBanners(prev => prev.filter(b => b.id !== id));
    }
  };

  const toggleBannerStatus = async (id: number, currentStatus: boolean) => {
    try {
      await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify({ status: !currentStatus })
      });
    } finally {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, status: !currentStatus } : b));
    }
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, deleteBanner, toggleBannerStatus, refreshBanners: fetchBanners }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error('useBanners error');
  return context;
};