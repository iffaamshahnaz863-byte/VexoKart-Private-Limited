
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Banner } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface BannerContextType {
  banners: Banner[];
  addBanner: (imageUrl: string) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleBannerStatus: (id: string) => Promise<void>;
  updateBannerOrder: (id: string, newOrder: number) => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/banners?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      } else {
        console.error("Banners fetch failed: API response is not an array", data);
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

  const addBanner = async (url: string) => {
    await fetch(`${BASE_API_URL}/banners`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ imageUrl: url, status: 'active', displayOrder: banners.length, createdAt: new Date().toISOString() })
    });
    await fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, { method: 'DELETE', headers: API_HEADERS });
    await fetchBanners();
  };

  const toggleBannerStatus = async (id: string) => {
    const b = banners.find(x => x.id === id);
    if (!b) return;
    await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: b.status === 'active' ? 'inactive' : 'active' })
    });
    await fetchBanners();
  };

  const updateBannerOrder = async (id: string, order: number) => {
    await fetch(`${BASE_API_URL}/banners?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ displayOrder: order })
    });
    await fetchBanners();
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, deleteBanner, toggleBannerStatus, updateBannerOrder }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error('useBanners error');
  return context;
};
