
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
    if (!email) return;
    
    console.log(`[VendorSync] Initializing profile fetch for: ${email}`);
    setIsVendorLoading(true);
    setVendorError(null);
    
    try {
      // Step 2: Fetch vendor profile ONLY by email as requested
      const url = `${BASE_API_URL}/vendors?email=eq.${encodeURIComponent(email)}&select=*`;
      const res = await fetch(url, {
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' }
      });
      
      const data = await res.json();
      console.log(`[VendorSync] Response received:`, data);

      if (!res.ok) {
        throw new Error(data.message || 'Supabase API error');
      }

      if (Array.isArray(data) && data.length > 0) {
        const vendor = data[0];
        console.log(`[VendorSync] Profile found. Status: ${vendor.status}`);
        
        // We save the vendor data regardless of status so we can show appropriate status pages
        setCurrentVendor(vendor);
        
        if (vendor.status !== 'approved') {
          setVendorError(`Access Restricted: Your store status is currently '${vendor.status}'.`);
        }
      } else {
        console.warn(`[VendorSync] No vendor record found for email: ${email}`);
        setCurrentVendor(null);
        setVendorError("Vendor profile not found. Please contact admin.");
      }
    } catch (error: any) {
      console.error("[VendorSync] Critical fetch error:", error);
      setVendorError(`Connection Error: ${error.message || 'Failed to connect to fulfillment services.'}`);
    } finally {
      setIsVendorLoading(false);
      console.log(`[VendorSync] Fetch operation completed. Loading: false`);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const getVendorByEmailDirect = async (email: string): Promise<Vendor | null> => {
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
