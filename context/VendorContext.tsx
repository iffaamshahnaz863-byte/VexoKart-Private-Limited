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
  fetchCurrentVendor: (email: string) => Promise<void>;
  refreshVendors: () => Promise<void>;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
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
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors list:", error);
      setVendors([]);
    }
  };

  /**
   * WORLD-CLASS VENDOR SYNC
   * Uses case-insensitive 'ilike' to ensure profiles are found regardless of email casing.
   */
  const fetchCurrentVendor = async (email: string) => {
    if (!email) {
      setIsVendorLoading(false);
      return;
    }
    
    setIsVendorLoading(true);
    setVendorError(null);
    
    try {
      // Critical Fix: Using ilike instead of eq for robust email matching
      const res = await fetch(`${BASE_API_URL}/vendors?email=ilike.${encodeURIComponent(email)}&select=*`, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      
      if (!res.ok) throw new Error(`Network authentication error (${res.status})`);
      
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCurrentVendor(data[0]);
        setVendorError(null);
      } else {
        setCurrentVendor(null);
        setVendorError("Vendor profile record not found in system. Please contact site administrator.");
      }
    } catch (error: any) {
      console.error("Error syncing current vendor:", error);
      setVendorError(error.message || "Connection error. Please try again.");
    } finally {
      setIsVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const getVendorByEmailDirect = async (email: string): Promise<Vendor | null> => {
    if (!email) return null;
    try {
      // Also using ilike here for security
      const res = await fetch(`${BASE_API_URL}/vendors?select=*&email=ilike.${encodeURIComponent(email)}&status=eq.approved`, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (error) {
      console.error("Error verifying vendor directly:", error);
      return null;
    }
  };

  const addVendorRecord = async (data: Omit<Vendor, 'id' | 'created_at'>) => {
    const res = await fetch(`${BASE_API_URL}/vendors`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        ...data,
        email: data.email.toLowerCase(), // Force lowercase for consistency
        created_at: new Date().toISOString()
      })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create vendor record');
    }
    
    await fetchVendors();
  };

  const updateVendorStatus = async (id: number, status: Vendor['status'], reason?: string) => {
    const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status, rejection_reason: reason })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update vendor status');
    }
    await fetchVendors();
  };

  const updateVendorProfile = async (id: number, updates: Partial<Vendor>) => {
    const url = `${BASE_API_URL}/vendors?id=eq.${id}`;
    
    // Ensure email is lowercase if it's being updated
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.email) sanitizedUpdates.email = sanitizedUpdates.email.toLowerCase();

    const res = await fetch(url, {
      method: 'PATCH',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(sanitizedUpdates)
    });

    const result = await res.json();

    if (!res.ok && result.code === 'PGRST204' && sanitizedUpdates.store_address !== undefined) {
        console.warn("[VendorContext] Column missing. Retrying fallback update.");
        const { store_address, ...fallbackUpdates } = sanitizedUpdates;
        
        const fallbackRes = await fetch(url, {
            method: 'PATCH',
            headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
            body: JSON.stringify(fallbackUpdates)
        });

        if (!fallbackRes.ok) throw new Error('Profile update failed');
        
        if (currentVendor && currentVendor.id === id) {
            setCurrentVendor({ ...currentVendor, ...fallbackUpdates });
        }
        await fetchVendors();
        return;
    }

    if (!res.ok) throw new Error(result.message || 'Failed to update profile');
    
    if (currentVendor && currentVendor.id === id) {
        setCurrentVendor({ ...currentVendor, ...sanitizedUpdates });
    }
    await fetchVendors();
  };

  const getVendorByUserId = (uid: string) => vendors.find(v => v.user_id === uid);
  const getVendorById = (id: string) => vendors.find(v => v.id.toString() === id);

  return (
    <VendorContext.Provider value={{ 
      vendors, 
      currentVendor,
      isVendorLoading,
      vendorError,
      addVendorRecord, 
      updateVendorStatus, 
      updateVendorProfile,
      getVendorByUserId, 
      getVendorById, 
      getVendorByEmailDirect,
      fetchCurrentVendor,
      refreshVendors: fetchVendors 
    }}>
      {children}
    </VendorContext.Provider>
  );
};

export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};