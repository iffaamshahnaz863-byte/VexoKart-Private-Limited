
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get users from localStorage
const getUsersFromStorage = () => {
    try {
        const users = localStorage.getItem('vexokart-users');
        const parsedUsers = users ? JSON.parse(users) : {};
        // Ensure admin user exists
        if (!parsedUsers['admin@vexokart.com']) {
            parsedUsers['admin@vexokart.com'] = { name: 'Admin', password: 'admin123', role: 'ADMIN', addresses: [] };
        }
        return parsedUsers;
    } catch (error) {
        return { 'admin@vexokart.com': { name: 'Admin', password: 'admin123', role: 'ADMIN', addresses: [] } };
    }
};

const saveUsersToStorage = (users: any) => {
    localStorage.setItem('vexokart-users', JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('vexokart-session');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user session data from localStorage", error);
      localStorage.removeItem('vexokart-session');
    }
  }, []);

  const updateUserSession = (userData: User) => {
    localStorage.setItem('vexokart-session', JSON.stringify(userData));
    setUser(userData);
    
    // Also update the user in the main user list
    const users = getUsersFromStorage();
    const existingUser = users[userData.email];
    if (existingUser) {
        users[userData.email] = { ...existingUser, ...userData, password: existingUser.password };
        saveUsersToStorage(users);
    }
  }

  const login = async (email: string, pass: string) => {
    const users = getUsersFromStorage();
    const existingUser = users[email];

    if (existingUser && existingUser.password === pass) {
      const userData: User = { 
        name: existingUser.name, 
        email: email,
        role: existingUser.role || 'USER',
        addresses: existingUser.addresses || []
      };
      updateUserSession(userData);
      return Promise.resolve();
    }
    return Promise.reject(new Error('Invalid email or password'));
  };

  const signup = async (name: string, email: string, pass: string) => {
    const users = getUsersFromStorage();
    if (users[email]) {
        return Promise.reject(new Error('An account with this email already exists.'));
    }

    users[email] = { name, password: pass, role: 'USER', addresses: [] };
    saveUsersToStorage(users);

    const userData: User = { name, email, role: 'USER', addresses: [] };
    updateUserSession(userData);
    return Promise.resolve();
  };

  const logout = () => {
    localStorage.removeItem('vexokart-session');
    setUser(null);
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
      if (!user) return;
      const newAddress = { ...address, id: new Date().getTime().toString() };
      const updatedUser = { ...user, addresses: [...user.addresses, newAddress]};
      updateUserSession(updatedUser);
  };
  
  const updateAddress = (address: Address) => {
      if (!user) return;
      const updatedAddresses = user.addresses.map(a => a.id === address.id ? address : a);
      const updatedUser = { ...user, addresses: updatedAddresses };
      updateUserSession(updatedUser);
  };

  const deleteAddress = (addressId: string) => {
      if (!user) return;
      const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
      const updatedUser = { ...user, addresses: updatedAddresses };
      updateUserSession(updatedUser);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, addAddress, updateAddress, deleteAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
