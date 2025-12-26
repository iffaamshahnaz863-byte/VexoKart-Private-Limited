
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { AdminCode } from '../types';

interface AdminCodeContextType {
  adminCodes: AdminCode[];
  generateCode: (note: string, expiresAt: string | null) => void;
  revokeCode: (codeId: string) => void;
  validateAndUseCode: (code: string, userId: string) => { isValid: boolean; message: string };
}

export const AdminCodeContext = createContext<AdminCodeContextType | undefined>(undefined);

const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ADMIN-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const AdminCodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [adminCodes, setAdminCodes] = useState<AdminCode[]>(() => {
    try {
      const localData = localStorage.getItem('vexokart-admin-codes');
      let parsedData = localData ? JSON.parse(localData) : [];
      // Backward compatibility for usage counts
      if (Array.isArray(parsedData)) {
          parsedData = parsedData.map((code: any) => ({
              ...code,
              maxUsage: code.maxUsage ?? 1,
              usageCount: code.usageCount ?? (code.status === 'used' ? 1 : 0),
          }));
      }
      return parsedData;
    } catch (error) {
      console.error("Could not parse admin code data from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vexokart-admin-codes', JSON.stringify(adminCodes));
  }, [adminCodes]);

  const generateCode = (note: string, expiresAt: string | null) => {
    const newCode: AdminCode = {
      id: new Date().getTime().toString(),
      code: generateRandomCode(),
      status: 'unused',
      createdAt: new Date().toISOString(),
      expiresAt,
      usedBy: null,
      note,
      maxUsage: 1,
      usageCount: 0,
    };
    setAdminCodes(prev => [newCode, ...prev]);
  };

  const revokeCode = (codeId: string) => {
    setAdminCodes(prev => prev.map(c => c.id === codeId ? { ...c, status: 'revoked' } : c));
  };
  
  const validateAndUseCode = (code: string, userId: string): { isValid: boolean; message: string } => {
    let isValid = false;
    let message = 'Invalid or expired admin code.';
    let codeToUpdate: AdminCode | null = null;
    
    const targetCode = adminCodes.find(c => c.code === code);

    if (!targetCode) {
        return { isValid: false, message: 'Admin code not found.' };
    }

    if (targetCode.status !== 'unused') {
        return { isValid: false, message: `This code has already been ${targetCode.status}.` };
    }

    if (targetCode.usageCount >= targetCode.maxUsage) {
        return { isValid: false, message: 'This admin code has reached its usage limit.' };
    }
    
    if (targetCode.expiresAt && new Date(targetCode.expiresAt) < new Date()) {
        return { isValid: false, message: 'This admin code has expired.' };
    }

    // If all checks pass, it's valid.
    isValid = true;
    message = 'Code is valid.';
    codeToUpdate = { ...targetCode, status: 'used', usedBy: userId, usageCount: targetCode.usageCount + 1 };

    if (isValid && codeToUpdate) {
        const finalCode = codeToUpdate; // To satisfy TypeScript's non-null check
        setAdminCodes(prev => prev.map(c => c.id === finalCode.id ? finalCode : c));
    }

    return { isValid, message };
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