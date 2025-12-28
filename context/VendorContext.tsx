
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface VendorContextType {
  vendors: Vendor[];
  addVendor: (vendorData: { userId: string; storeName: string }) => Promise<void>;
  updateVendorStatus: (vendorId: string, status: string, reason?: string) => Promise<void>;
  updateVendorProfile: (vendorId: string, profileData: Partial<Vendor>) => Promise<void>;
  getVendorByUserId: (userId: string) => Vendor | undefined;
  getVendorById: (vendorId: string) => Vendor | undefined;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/vendors?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data)) {
        setVendors(data);
      } else {
        console.error("Vendors fetch failed: API response is not an array", data);
        setVendors([]);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const addVendor = async (data: any) => {
    const newVendor = {
      userId: data.userId,
      storeName: data.storeName,
      storeLogo: `https://picsum.photos/seed/${data.storeName}/200`,
      status: 'pending',
      kycDetails: { pan: '', gst: '', status: 'pending' },
      createdAt: new Date().toISOString()
    };
    await fetch(`${BASE_API_URL}/vendors`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newVendor)
    });
    await fetchVendors();
  };

  const updateVendorStatus = async (id: string, status: string, reason?: string) => {
    await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status, rejectionReason: reason })
    });
    await fetchVendors();
  };

  const updateVendorProfile = async (id: string, profile: any) => {
    await fetch(`${BASE_API_URL}/vendors?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify(profile)
    });
    await fetchVendors();
  };

  const getVendorByUserId = (uid: string) => vendors.find(v => v.userId === uid);
  const getVendorById = (id: string) => vendors.find(v => v.id === id);

  return (
    <VendorContext.Provider value={{ vendors, addVendor, updateVendorStatus, updateVendorProfile, getVendorByUserId, getVendorById }}>
      {children}
    </VendorContext.Provider>
  );
};

// Export useVendors hook for accessing vendor context
export const useVendors = () => {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};
