
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';

interface VendorContextType {
  vendors: Vendor[];
  addVendor: (vendorData: { userId: string; storeName: string }) => void;
  updateVendorStatus: (vendorId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => void;
  updateVendorProfile: (vendorId: string, profileData: { storeName: string; storeLogo: string }) => void;
  getVendorByUserId: (userId: string) => Vendor | undefined;
  getVendorById: (vendorId: string) => Vendor | undefined;
}

export const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const VendorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-vendors');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse vendor data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-vendors', JSON.stringify(vendors));
  }, [vendors]);

  const addVendor = (vendorData: { userId: string; storeName: string }) => {
    const newVendor: Vendor = {
      id: new Date().getTime().toString(),
      userId: vendorData.userId,
      storeName: vendorData.storeName,
      storeLogo: `https://picsum.photos/seed/${vendorData.storeName}/200`,
      status: 'pending',
      kycDetails: {
        pan: '',
        gst: '',
        addressProofUrl: '',
        status: 'pending'
      },
      createdAt: new Date().toISOString()
    };
    setVendors(prev => [...prev, newVendor]);
  };

  const updateVendorStatus = (vendorId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => {
    setVendors(prev => prev.map(v => {
      if (v.id !== vendorId) {
        return v;
      }

      // This is the vendor to update.
      if (status === 'rejected' && reason) {
        // Return a new object with the rejection reason.
        return {
          ...v,
          status: 'rejected',
          rejectionReason: reason,
        };
      } else {
        // For any other status, return a new object *without* the rejection reason.
        // We do this by destructuring it out and then spreading the rest.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rejectionReason, ...vendorWithoutReason } = v;
        return {
          ...vendorWithoutReason,
          status: status,
        };
      }
    }));
  };

  const updateVendorProfile = (vendorId: string, profileData: { storeName: string; storeLogo: string }) => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, ...profileData } : v));
  };
  
  const getVendorByUserId = (userId: string) => {
    return vendors.find(v => v.userId === userId);
  };
  
  const getVendorById = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId);
  }

  return (
    <VendorContext.Provider value={{ vendors, addVendor, updateVendorStatus, getVendorByUserId, getVendorById, updateVendorProfile }}>
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