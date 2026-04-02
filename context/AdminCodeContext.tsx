

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AdminCode } from '../types';
import { supabase } from '../supabase.ts';

interface AdminCodeContextType {
  adminCodes: AdminCode[];
  generateCode: (note: string, expiresAt: string | null) => Promise<void>;
  revokeCode: (codeId: string) => Promise<void>;
  validateAndUseCode: (code: string, userId: string) => { isValid: boolean; message: string };
}

export const AdminCodeContext = createContext<AdminCodeContextType | undefined>(undefined);

export const AdminCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminCodes, setAdminCodes] = useState<AdminCode[]>([]);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_codes')
        .select('*');
      
      if (error) throw error;
      if (Array.isArray(data)) {
        setAdminCodes(data);
      }
    } catch (error: any) {
      console.error("Error fetching admin codes:", error.message || error);
      setAdminCodes([]);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const generateCode = async (note: string, expiresAt: string | null) => {
    const code = 'ADMIN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newCode = {
      code,
      status: 'unused',
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      note,
      max_usage: 1,
      usage_count: 0
    };
    
    const { error } = await supabase
      .from('admin_codes')
      .insert([newCode]);
    
    if (error) {
        console.error("Failed to generate code:", error.message);
    }
    await fetchCodes();
  };

  const revokeCode = async (id: string) => {
    const { error } = await supabase
      .from('admin_codes')
      .update({ status: 'revoked' })
      .eq('id', id);
    
    if (error) {
      console.error("Failed to revoke code:", error.message);
    }
    await fetchCodes();
  };

  const validateAndUseCode = (code: string, userId: string) => {
    const target = adminCodes.find(c => c.code === code);
    if (!target || target.status !== 'unused') return { isValid: false, message: 'Invalid code' };
    
    supabase
      .from('admin_codes')
      .update({ 
        status: 'used', 
        used_by: userId, 
        usage_count: (target.usage_count || 0) + 1 
      })
      .eq('id', target.id)
      .then(() => fetchCodes());

    return { isValid: true, message: 'Code accepted' };
  };

  return (
    <AdminCodeContext.Provider value={{ adminCodes, generateCode, revokeCode, validateAndUseCode }}>
      {children}
    </AdminCodeContext.Provider>
  );
};

export const useAdminCodes = () => {
  const context = useContext(AdminCodeContext);
  if (context === undefined) {
    throw new Error('useAdminCodes must be used within an AdminCodeProvider');
  }
  return context;
};

