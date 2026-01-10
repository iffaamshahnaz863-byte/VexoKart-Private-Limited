
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ServiceArea } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface ServiceAreaContextType {
  serviceAreas: ServiceArea[];
  activePincodes: string[];
  isLoading: boolean;
  addServiceArea: (area: Omit<ServiceArea, 'id' | 'created_at'>) => Promise<void>;
  updateServiceArea: (id: number, updates: Partial<ServiceArea>) => Promise<void>;
  deleteServiceArea: (id: number) => Promise<void>;
  refreshServiceAreas: () => Promise<void>;
}

const ServiceAreaContext = createContext<ServiceAreaContextType | undefined>(undefined);

// Initial Seed Data to ensure app works before DB is populated
const SEED_AREAS: ServiceArea[] = [
    { id: 101, country: 'India', state: 'Haryana', city: 'Gurgaon', area_name: 'DLF Phase 1-4', pincode: '122001', is_active: true },
    { id: 102, country: 'India', state: 'Haryana', city: 'Gurgaon', area_name: 'Cyber City', pincode: '122002', is_active: true },
    { id: 103, country: 'India', state: 'Delhi', city: 'New Delhi', area_name: 'Connaught Place', pincode: '110001', is_active: true },
    { id: 104, country: 'India', state: 'Maharashtra', city: 'Mumbai', area_name: 'Bandra West', pincode: '400050', is_active: true },
];

export const ServiceAreaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePincodes = serviceAreas.filter(a => a.is_active).map(a => a.pincode);

  const refreshServiceAreas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/service_areas?order=created_at.desc`, {
        headers: API_HEADERS
      });
      if (res.ok) {
        const data = await res.json();
        setServiceAreas(Array.isArray(data) && data.length > 0 ? data : SEED_AREAS);
      } else {
        // Fallback if table doesn't exist yet
        setServiceAreas(SEED_AREAS);
      }
    } catch (e) {
      console.warn("Service Area Sync Failed, using local seed.");
      setServiceAreas(SEED_AREAS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshServiceAreas();
  }, []);

  const addServiceArea = async (area: Omit<ServiceArea, 'id' | 'created_at'>) => {
    try {
      const res = await fetch(`${BASE_API_URL}/service_areas`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...area, created_at: new Date().toISOString() })
      });
      if (!res.ok) throw new Error("DB Error");
      await refreshServiceAreas();
    } catch (e) {
      // Optimistic update for demo
      const newArea = { ...area, id: Date.now(), created_at: new Date().toISOString() };
      setServiceAreas(prev => [newArea, ...prev]);
    }
  };

  const updateServiceArea = async (id: number, updates: Partial<ServiceArea>) => {
    try {
      await fetch(`${BASE_API_URL}/service_areas?id=eq.${id}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify(updates)
      });
      setServiceAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (e) {
      setServiceAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const deleteServiceArea = async (id: number) => {
    try {
      await fetch(`${BASE_API_URL}/service_areas?id=eq.${id}`, {
        method: 'DELETE',
        headers: API_HEADERS
      });
      setServiceAreas(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      setServiceAreas(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <ServiceAreaContext.Provider value={{ 
      serviceAreas, activePincodes, isLoading, 
      addServiceArea, updateServiceArea, deleteServiceArea, refreshServiceAreas 
    }}>
      {children}
    </ServiceAreaContext.Provider>
  );
};

export const useServiceAreas = () => {
  const context = useContext(ServiceAreaContext);
  if (!context) throw new Error('useServiceAreas must be used within ServiceAreaProvider');
  return context;
};
