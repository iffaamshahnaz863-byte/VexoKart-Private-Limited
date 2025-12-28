
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

  const fetchCurrentVendor = async (email: string) => {
    // GUARD: Prevents 'vendors?email=eq.' queries
    if (!email || email.trim() === '') {
      console.warn("[VendorSync] Fetch blocked: Email is empty.");
      setIsVendorLoading(false);
      return;
    }
    
    console.log(`[VendorSync] Initializing profile fetch for: ${email}`);
    setIsVendorLoading(true);
    setVendorError(null);
    
    try {
      const url = `${BASE_API_URL}/vendors?email=eq.${encodeURIComponent(email)}&select=*`;
      const res = await fetch(url, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      
      const data = await res.json();
      console.log(`[VendorSync] Response for ${email}:`, data);

      if (!res.ok) {
        throw new Error(data.message || `Supabase error (${res.status})`);
      }

      if (Array.isArray(data) && data.length > 0) {
        setCurrentVendor(data[0]);
      } else {
        console.warn(`[VendorSync] No record found for: ${email}`);
        setCurrentVendor(null);
        setVendorError("Vendor profile not found. Please contact admin.");
      }
    } catch (error: any) {
      console.error("[VendorSync] Critical fetch error:", error);
      setVendorError(`Sync Failed: ${error.message || 'Check your connection and try again.'}`);
    } finally {
      // ALWAYS stop loading, no matter what
      setIsVendorLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch the full list if we are an admin or it's needed for public view.
    // For specific vendor sync, we use fetchCurrentVendor.
    fetchVendors();
  }, []);

  const getVendorByEmailDirect = async (email: string): Promise<Vendor | null> => {
    if (!email) return null;
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?select=*&email=eq.${encodeURIComponent(email)}&status=eq.approved`, {
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
        created_at: new Date().toISOString()
      })
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create vendor business profile');
    }
    
    await fetchVendors();
  };

  const updateVendorStatus = async (id: number, status: Vendor['status'], reason?: string) => {
    const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status, rejection_reason: reason })
    });
    if (!res.ok) throw new Error('Failed to update vendor status');
    await fetchVendors();
  };

  const updateVendorProfile = async (id: number, updates: Partial<Vendor>) => {
    const res = await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    
    if (currentVendor && currentVendor.id === id) {
        setCurrentVendor({ ...currentVendor, ...updates });
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
