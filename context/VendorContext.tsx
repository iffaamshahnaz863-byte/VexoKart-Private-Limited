
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Vendor } from '../types';

interface VendorContextType {
  vendors: Vendor[];
  addVendor: (vendorData: { userId: string; storeName: string }) => void;
  updateVendorStatus: (vendorId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => void;
  updateVendorProfile: (vendorId: string, profileData: Partial<Vendor>) => void;
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
      return [];
    }
  });

  const saveVendors = (updatedVendors: Vendor[]) => {
    localStorage.setItem('vexokart-vendors', JSON.stringify(updatedVendors));
    setVendors(updatedVendors);
  };

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
    saveVendors([...vendors, newVendor]);
  };

  const updateVendorStatus = (vendorId: string, status: 'approved' | 'rejected' | 'suspended', reason?: string) => {
    const updated = vendors.map(v => {
      if (v.id !== vendorId) return v;
      if (status === 'rejected' && reason) {
        return { ...v, status: 'rejected' as const, rejectionReason: reason };
      } else {
        const { rejectionReason, ...vendorWithoutReason } = v;
        return { ...vendorWithoutReason, status };
      }
    });
    saveVendors(updated);
  };

  const updateVendorProfile = (vendorId: string, profileData: Partial<Vendor>) => {
    const updated = vendors.map(v => v.id === vendorId ? { ...v, ...profileData } : v);
    saveVendors(updated);
  };
  
  const getVendorByUserId = (userId: string) => vendors.find(v => v.userId === userId);
  const getVendorById = (vendorId: string) => vendors.find(v => v.id === vendorId);

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
