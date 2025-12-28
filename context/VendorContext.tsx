
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface VendorContextType {
  vendors: Vendor[];
  addVendorRecord: (vendorData: Omit<Vendor, 'id' | 'created_at'>) => Promise<void>;
  updateVendorStatus: (vendorId: number, status: Vendor['status'], reason?: string) => Promise<void>;
  getVendorByUserId: (userId: string) => Vendor | undefined;
  getVendorById: (vendorId: string) => Vendor | undefined;
  refreshVendors: () => Promise<void>;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);

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
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

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

  const getVendorByUserId = (uid: string) => vendors.find(v => v.user_id === uid);
  const getVendorById = (id: string) => vendors.find(v => v.id.toString() === id);

  return (
    <VendorContext.Provider value={{ 
      vendors, 
      addVendorRecord, 
      updateVendorStatus, 
      getVendorByUserId, 
      getVendorById, 
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
