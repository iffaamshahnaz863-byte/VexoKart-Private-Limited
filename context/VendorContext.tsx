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
      const res = await fetch(`${BASE_API_URL}/vendors?select=*&order=created_at.desc`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setVendors(data);
      }
    } catch (error) {
      console.error("Error fetching vendors list:", error);
    }
  };

  const fetchCurrentVendor = async (userId: string, force = false) => {
    if (!userId) return;
    
    // If we have cached data and aren't forcing a refresh, don't trigger loading state
    if (currentVendor && currentVendor.user_id === userId && !force) {
      // Still fetch in background to keep data fresh (Stale-While-Revalidate)
      backgroundSync(userId);
      return;
    }
    
    setIsVendorLoading(true);
    setVendorError(null);
    
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?user_id=eq.${userId}&select=*`, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) throw new Error(`Server connection failed`);
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const profile = data[0];
        setCurrentVendor(profile);
        sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(profile));
      } else {
        setVendorError("Authorized profile not found.");
      }
    } catch (error: any) {
      setVendorError(error.message || "Connection failed.");
    } finally {
      setIsVendorLoading(false);
    }
  };

  const backgroundSync = async (userId: string) => {
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?user_id=eq.${userId}&select=*`, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCurrentVendor(data[0]);
        sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(data[0]));
      }
    } catch (e) { /* Silent fail for background sync */ }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const updateVendorProfile = async (id: number, updates: Partial<Vendor>) => {
    const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(updates)
    });

    if (!res.ok) throw new Error('Update failed');
    
    if (currentVendor && currentVendor.id === id) {
        const updated = { ...currentVendor, ...updates };
        setCurrentVendor(updated);
        sessionStorage.setItem('vxk_vendor_cache', JSON.stringify(updated));
    }
    await fetchVendors();
  };

  // Rest of methods... (addVendorRecord, updateVendorStatus etc)
  const addVendorRecord = async (data: Omit<Vendor, 'id' | 'created_at'>) => {
    const res = await fetch(`${BASE_API_URL}/vendors`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ ...data, created_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('Record creation failed');
    await fetchVendors();
  };

  const updateVendorStatus = async (id: number, status: Vendor['status'], reason?: string) => {
    await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status, rejection_reason: reason })
    });
    await fetchVendors();
  };

  const getVendorByEmailDirect = async (email: string): Promise<Vendor | null> => {
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?select=*&email=ilike.${encodeURIComponent(email)}&status=eq.approved`, {
        headers: API_HEADERS
      });
      const data = await res.json();
      return (Array.isArray(data) && data.length > 0) ? data[0] : null;
    } catch (e) { return null; }
  };

  const getVendorByUserId = (uid: string) => vendors.find(v => v.user_id === uid);
  const getVendorById = (id: string) => vendors.find(v => v.id.toString() === id);

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