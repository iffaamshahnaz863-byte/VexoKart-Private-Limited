
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ServiceArea } from '../types.ts'; // Keep type for compatibility, but logic simplifies
import { BASE_API_URL, API_HEADERS } from '../constants.ts';

interface ServiceAreaContextType {
  serviceAreas: ServiceArea[];
  activePincodes: string[];
  isLoading: boolean;
  addServiceArea: (area: Partial<ServiceArea>) => Promise<void>;
  updateServiceArea: (id: number, updates: Partial<ServiceArea>) => Promise<void>;
  deleteServiceArea: (id: number) => Promise<void>;
  refreshServiceAreas: () => Promise<void>;
}

const ServiceAreaContext = createContext<ServiceAreaContextType | undefined>(undefined);

export const ServiceAreaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activePincodes = serviceAreas
    .filter(a => a.is_active)
    .map(a => String(a.pincode).trim());

  const refreshServiceAreas = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/daily_needs_pincodes?order=created_at.desc`, {
        headers: API_HEADERS
      });
      if (res.ok) {
        const data = await res.json();
        // Adapt the simpler pincode data to the ServiceArea structure for compatibility
        const adaptedData = data.map((p: any) => ({
          id: p.id,
          pincode: p.pincode,
          is_active: p.is_active,
          created_at: p.created_at,
          country: 'India',
          state: '',
          city: '',
          area_name: ''
        }));
        setServiceAreas(Array.isArray(adaptedData) ? adaptedData : []);
      } else {
        setServiceAreas([]);
      }
    } catch (e) {
      console.warn("Pincode Sync Failed.", e);
      setServiceAreas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshServiceAreas();
  }, []);

  const addServiceArea = async (area: Partial<ServiceArea>) => {
    const payload = {
        pincode: String(area.pincode).trim(),
        is_active: area.is_active,
        created_by: area.created_by
    };
    try {
      const res = await fetch(`${BASE_API_URL}/daily_needs_pincodes`, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("DB Error");
      await refreshServiceAreas();
    } catch (e) {
      console.error("Failed to add pincode", e);
    }
  };

  const updateServiceArea = async (id: number, updates: Partial<ServiceArea>) => {
    const payload = { is_active: updates.is_active };
    try {
      await fetch(`${BASE_API_URL}/daily_needs_pincodes?id=eq.${id}`, {
        method: 'PATCH',
        headers: API_HEADERS,
        body: JSON.stringify(payload)
      });
      await refreshServiceAreas();
    } catch (e) {
      console.error("Failed to update pincode", e);
    }
  };

  const deleteServiceArea = async (id: number) => {
    try {
      await fetch(`${BASE_API_URL}/daily_needs_pincodes?id=eq.${id}`, {
        method: 'DELETE',
        headers: API_HEADERS
      });
      setServiceAreas(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Failed to delete pincode", e);
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
