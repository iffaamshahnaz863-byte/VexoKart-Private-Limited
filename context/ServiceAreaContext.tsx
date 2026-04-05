
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ServiceArea } from '../types.ts'; // Keep type for compatibility, but logic simplifies
import { supabase } from '../supabase.ts';

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
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        setServiceAreas(Array.isArray(data) ? data : []);
      } else {
        setServiceAreas([]);
      }
    } catch (e: any) {
      console.warn("[ServiceAreaContext] Pincode Sync Failed:", e.message);
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
        created_by: area.created_by,
        country: area.country || 'India',
        state: area.state || '',
        city: area.city || '',
        area_name: area.area_name || ''
    };
    try {
      const { error } = await supabase
        .from('service_areas')
        .insert([payload]);
      
      if (error) throw error;
      await refreshServiceAreas();
    } catch (e: any) {
      console.error("[ServiceAreaContext] Failed to add pincode:", e.message);
    }
  };

  const updateServiceArea = async (id: number, updates: Partial<ServiceArea>) => {
    const payload = { is_active: updates.is_active };
    try {
      const { error } = await supabase
        .from('service_areas')
        .update(payload)
        .eq('id', id);
      
      if (error) throw error;
      await refreshServiceAreas();
    } catch (e: any) {
      console.error("[ServiceAreaContext] Failed to update pincode:", e.message);
    }
  };

  const deleteServiceArea = async (id: number) => {
    try {
      const { error } = await supabase
        .from('service_areas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setServiceAreas(prev => prev.filter(a => a.id !== id));
    } catch (e: any) {
      console.error("[ServiceAreaContext] Failed to delete pincode:", e.message);
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
