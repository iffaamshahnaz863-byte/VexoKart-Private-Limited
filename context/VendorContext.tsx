

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';
import { supabase } from '../supabase.ts';

interface VendorContextType {
  vendors: Vendor[];
  currentVendor: Vendor | null;
  isVendorLoading: boolean;
  vendorError: string | null;
  addVendorRecord: (vendorData: Omit<Vendor, 'id' | 'created_at'>) => Promise<void>;
  updateVendorStatus: (vendorId: number, status: Vendor['status'], reason?: string) => Promise<void>;
  updateVendorProfile: (vendorId: number, updates: Partial<Vendor>) => Promise<void>;
  getVendorByUserId: (userId: string) => Vendor | undefined;
  getVendorById: (vendorId: string) => Vendor | undefined;
  getVendorByEmailDirect: (email: string) => Promise<Vendor | null>;
  fetchCurrentVendor: (userId: string, force?: boolean) => Promise<void>;
  refreshVendors: () => Promise<void>;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

const VENDOR_COLUMNS = 'id,user_id,store_name,status,owner_name,email,phone,profile_image';

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(() => {
    const cached = sessionStorage.getItem('vexokart_vendor_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [isVendorLoading, setIsVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*');
      
      if (error) throw error;
      if (Array.isArray(data)) {
          setVendors(data);
      }
    } catch (error: any) {
      console.error("[VendorSync] List Error:", error.message);
    }
  };

  const fetchCurrentVendor = async (userId: string, force = false) => {
    if (!userId) return;
    
    if (!currentVendor || force) {
        setIsVendorLoading(true);
    }
    setVendorError(null);
    
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(VENDOR_COLUMNS)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (Array.isArray(data) && data.length > 0) {
        const profile = data[0];
        if (JSON.stringify(profile) !== JSON.stringify(currentVendor)) {
            setCurrentVendor(profile);
            sessionStorage.setItem('vexokart_vendor_cache', JSON.stringify(profile));
        }
      } else {
        setCurrentVendor(null);
        setVendorError("Vendor profile not found. Access denied.");
        sessionStorage.removeItem('vexokart_vendor_cache');
      }
    } catch (error: any) {
      console.error("[VendorSync] Profile Fetch Error:", error.message);
      setVendorError(error.message || "Failed to sync vendor profile.");
    } finally {
      setIsVendorLoading(false);
    }
  };

  useEffect(() => {
    let intervalId: any;
    if (currentVendor) {
        const pollStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('vendors')
                    .select(VENDOR_COLUMNS)
                    .eq('id', currentVendor.id);
                
                if (!error && Array.isArray(data) && data.length > 0) {
                    const fresh = data[0];
                    if (JSON.stringify(fresh) !== JSON.stringify(currentVendor)) {
                        setCurrentVendor(fresh);
                        sessionStorage.setItem('vexokart_vendor_cache', JSON.stringify(fresh));
                    }
                }
            } catch (e) {
                // Silent failure on poll
            }
        };
        const interval = currentVendor.status === 'pending' ? 4000 : 15000;
        intervalId = setInterval(pollStatus, interval);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [currentVendor]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateVendorProfile = async (id: number, updates: Partial<Vendor>) => {
    const safeUpdates: any = {};
    if (updates.store_name) safeUpdates.store_name = updates.store_name;
    if (updates.status) safeUpdates.status = updates.status;
    if (updates.profile_image) safeUpdates.profile_image = updates.profile_image;
    if (updates.phone) safeUpdates.phone = updates.phone;

    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(safeUpdates)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (Array.isArray(data) && data.length > 0) {
          const updatedVendor = data[0];
          if (currentVendor && currentVendor.id === id) {
            setCurrentVendor(updatedVendor);
            sessionStorage.setItem('vexokart_vendor_cache', JSON.stringify(updatedVendor));
          }
      }
      await fetchVendors();
    } catch (err: any) {
      console.error("[VendorSync] Update Error:", err.message);
      throw err;
    }
  };

  const addVendorRecord = async (data: Omit<Vendor, 'id' | 'created_at'>) => {
    try {
      const payload = {
        user_id: data.user_id,
        store_name: data.store_name,
        status: data.status || 'pending',
        owner_name: data.owner_name,
        email: data.email,
        phone: data.phone,
        profile_image: data.profile_image
      };

      const { error } = await supabase
        .from('vendors')
        .insert([payload]);
      
      if (error) throw error;
      await fetchVendors();
    } catch (err: any) {
      console.error("[VendorSync] Create Error:", err.message);
      throw err;
    }
  };

  const updateVendorStatus = async (id: number, status: Vendor['status'], reason?: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('id', id);
      
      if (error) {
          console.error("Status update failed:", error.message);
      }
      await fetchVendors();
    } catch (err: any) {
      console.error("[VendorSync] Status Error:", err.message);
    }
  };

  const getVendorByEmailDirect = async (email: string): Promise<Vendor | null> => null;
  const getVendorByUserId = (uid: string) => vendors.find(v => String(v.user_id) === String(uid));
  const getVendorById = (id: string) => vendors.find(v => String(v.id) === String(id));

  return (
    <VendorContext.Provider value={{ 
      vendors, currentVendor, isVendorLoading, vendorError,
      addVendorRecord, updateVendorStatus, updateVendorProfile,
      getVendorByUserId, getVendorById, getVendorByEmailDirect,
      fetchCurrentVendor, refreshVendors: fetchVendors 
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (!context) throw new Error('useVendors missing');
  return context;
};

