
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

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

// FIXED: Removed 'rejection_reason', 'wallet_balance', 'store_address', 'pending_balance' to match DB schema
const VENDOR_COLUMNS = 'id,user_id,store_name,status,owner_name,email,phone,profile_image';

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(() => {
    const cached = sessionStorage.getItem('vxk_vendor_cache');
    return cached ? JSON.parse(cached) : null;
  });
  const [isVendorLoading, setIsVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Fetch failed (${res.status})`);
      }
      
      if (Array.isArray(data)) {
          setVendors(data);
      } else {
          console.error("[VendorSync] Response not an array:", data);
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
      const res = await fetch(`${BASE_API_URL}/vendors?user_id=eq.${userId}&select=${VENDOR_COLUMNS}`, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Connection to vendor service failed.");
      }
      
      if (Array.isArray(data) && data.length > 0) {
        const profile = data[0];
        if (JSON.stringify(profile) !== JSON.stringify(currentVendor)) {
            setCurrentVendor(profile);
            sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(profile));
        }
      } else {
        setCurrentVendor(null);
        setVendorError("Vendor profile not found. Access denied.");
        sessionStorage.removeItem('vxk_vendor_cache');
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
                const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${currentVendor.id}&select=${VENDOR_COLUMNS}`, {
                    headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        const fresh = data[0];
                        if (JSON.stringify(fresh) !== JSON.stringify(currentVendor)) {
                            setCurrentVendor(fresh);
                            sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(fresh));
                        }
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
      const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify(safeUpdates)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Update failed');
      }
      
      const updatedData = await res.json();
      if (Array.isArray(updatedData) && updatedData.length > 0) {
          const updatedVendor = updatedData[0];
          if (currentVendor && currentVendor.id === id) {
            setCurrentVendor(updatedVendor);
            sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(updatedVendor));
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

      const res = await fetch(`${BASE_API_URL}/vendors`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Record creation failed');
      }
      await fetchVendors();
    } catch (err: any) {
      console.error("[VendorSync] Create Error:", err.message);
      throw err;
    }
  };

  const updateVendorStatus = async (id: number, status: Vendor['status'], reason?: string) => {
    try {
      const payload: any = { status };
      // 'rejection_reason' column is missing in DB, skipping to avoid error
      const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error("Status update failed:", err?.message);
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
