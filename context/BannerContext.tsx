
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

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = async () => {
    try {
      // Fetching all banners for management, Home page will filter for status=true
      const res = await fetch(`${BASE_API_URL}/banners?select=*&order=display_order.asc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async (url: string, title: string) => {
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
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add banner');
    }
    
    await fetchBanners(); // Immediate sync
  };

  const deleteBanner = async (id: number) => {
    await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    await fetchBanners(); // Immediate sync
  };

  const toggleBannerStatus = async (id: number, currentStatus: boolean) => {
    await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: !currentStatus })
    });
    await fetchBanners(); // Immediate sync
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
