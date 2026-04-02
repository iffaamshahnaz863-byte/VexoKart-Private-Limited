import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Banner } from '../types';
import { supabase } from '../supabase';

interface BannerContextType {
  banners: Banner[];
  isLoading: boolean;
  addBanner: (imageUrl: string, title: string) => Promise<void>;
  deleteBanner: (id: number) => Promise<void>;
  toggleBannerStatus: (id: number, currentStatus: boolean) => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching banners from Supabase...");
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error("[BannerContext] Supabase error:", error);
        throw error;
      }
      console.log("Banners fetched successfully:", data?.length || 0);
      setBanners(data || []);
    } catch (error: any) {
      console.error("[BannerContext] Error fetching banners:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async (url: string, title: string) => {
    try {
      const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) + 1 : 0;
      const { error } = await supabase
        .from('banners')
        .insert([{ 
          image_url: url, 
          title: title,
          status: true, 
          display_order: nextOrder 
        }]);
      
      if (error) throw error;
      await fetchBanners();
    } catch (err) {
      console.error("[BannerContext] Error adding banner:", err);
      throw err;
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error("[BannerContext] Error deleting banner:", err);
    }
  };

  const toggleBannerStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ status: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setBanners(prev => prev.map(b => b.id === id ? { ...b, status: !currentStatus } : b));
    } catch (err) {
      console.error("[BannerContext] Error toggling banner status:", err);
    }
  };

  return (
    <BannerContext.Provider value={{ banners, isLoading, addBanner, deleteBanner, toggleBannerStatus, refreshBanners: fetchBanners }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) throw new Error('useBanners must be used within a BannerProvider');
  return context;
};
