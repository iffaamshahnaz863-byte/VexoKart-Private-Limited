
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Banner } from '../types';

interface BannerContextType {
  banners: Banner[];
  addBanner: (imageUrl: string) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;
  updateBannerOrder: (id: string, newOrder: number) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-banners');
      return localData ? JSON.parse(localData) : [
        { id: '1', imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1200&q=80', status: 'active', displayOrder: 0, createdAt: new Date().toISOString() },
        { id: '2', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80', status: 'active', displayOrder: 1, createdAt: new Date().toISOString() }
      ];
    } catch (error) {
      console.error("Error loading banners", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-banners', JSON.stringify(banners));
  }, [banners]);

  const addBanner = (imageUrl: string) => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      imageUrl,
      status: 'active',
      displayOrder: banners.length,
      createdAt: new Date().toISOString()
    };
    setBanners(prev => [...prev, newBanner]);
  };

  const deleteBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const toggleBannerStatus = (id: string) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b));
  };

  const updateBannerOrder = (id: string, newOrder: number) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, displayOrder: newOrder } : b));
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, deleteBanner, toggleBannerStatus, updateBannerOrder }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
};
