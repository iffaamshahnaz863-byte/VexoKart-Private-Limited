

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
// Fix: Import newly defined AdminCode type
import { AdminCode } from '../types';
import { BASE_API_URL, API_HEADERS } from '../constants';

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
      const res = await fetch(`${BASE_API_URL}/admin_codes?select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data)) {
        setAdminCodes(data);
      } else {
        console.error("Admin codes fetch failed:", data?.message || data?.error || JSON.stringify(data));
        setAdminCodes([]);
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
      createdAt: new Date().toISOString(),
      expiresAt,
      note,
      maxUsage: 1,
      usageCount: 0
    };
    const res = await fetch(`${BASE_API_URL}/admin_codes`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newCode)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Failed to generate code:", err?.message || res.statusText);
    }
    await fetchCodes();
  };

  const revokeCode = async (id: string) => {
    await fetch(`${BASE_API_URL}/admin_codes?id=eq.${id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: 'revoked' })
    });
    await fetchCodes();
  };

  const validateAndUseCode = (code: string, userId: string) => {
    const target = adminCodes.find(c => c.code === code);
    if (!target || target.status !== 'unused') return { isValid: false, message: 'Invalid code' };
    
    fetch(`${BASE_API_URL}/admin_codes?id=eq.${target.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ status: 'used', usedBy: userId, usageCount: target.usageCount + 1 })
    }).then(fetchCodes);

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
