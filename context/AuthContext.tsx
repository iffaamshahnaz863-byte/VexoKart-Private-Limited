
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address, Vendor } from '../types';
// FIX: Replaced unused `useVendors` import with `VendorContext` to resolve type errors.
import { VendorContext } from './VendorContext';
import { AdminCodeContext } from './AdminCodeContext';

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  signupAsVendor: (name: string, email: string, pass: string, storeName: string, adminCode: string) => Promise<void>;
  logout: () => void;
  addUser: (userData: { name: string; email: string; pass: string; role: 'USER' | 'VENDOR' | 'SUPER_ADMIN' }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  deleteUser: (email: string) => void;
  addToWishlist: (productId: number) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  updateUserSession: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getUsersFromStorage = () => {
    try {
        const users = localStorage.getItem('vexokart-users');
        const parsedUsers = users ? JSON.parse(users) : {};
        if (!parsedUsers['admin@vexokart.com']) {
            parsedUsers['admin@vexokart.com'] = { name: 'Super Admin', password: 'admin123', role: 'SUPER_ADMIN', addresses: [], wishlist: [], recentlyViewed: [] };
        }
        return parsedUsers;
    } catch (error) {
        return { 'admin@vexokart.com': { name: 'Super Admin', password: 'admin123', role: 'SUPER_ADMIN', addresses: [], wishlist: [], recentlyViewed: [] } };
    }
};

const saveUsersToStorage = (users: any) => {
    localStorage.setItem('vexokart-users', JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  // We need vendor context to create a vendor profile on signup
  const vendorContext = useContext(VendorContext);
  const adminCodeContext = useContext(AdminCodeContext);

  const updateUserList = () => {
    const usersData = getUsersFromStorage();
    const usersArray = Object.entries(usersData).map(([email, data]: [string, any]) => ({
        email,
        name: data.name,
        role: data.role || 'USER',
        addresses: data.addresses || [],
        wishlist: data.wishlist || [],
        recentlyViewed: data.recentlyViewed || [],
    }));
    setAllUsers(usersArray);
  }

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
    updateUserList();
  }, []);

  const updateUserSession = (userData: User) => {
    localStorage.setItem('vexokart-session', JSON.stringify(userData));
    setUser(userData);
    
    const users = getUsersFromStorage();
    const existingUser = users[userData.email];
    if (existingUser) {
        users[userData.email] = { ...existingUser, ...userData, password: existingUser.password };
        saveUsersToStorage(users);
    }
    updateUserList();
  }

  const login = async (email: string, pass: string) => {
    const users = getUsersFromStorage();
    const existingUser = users[email];

    if (existingUser && existingUser.password === pass) {
      const userData: User = { 
        name: existingUser.name, 
        email: email,
        role: existingUser.role || 'USER',
        addresses: existingUser.addresses || [],
        wishlist: existingUser.wishlist || [],
        recentlyViewed: existingUser.recentlyViewed || []
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

    users[email] = { name, password: pass, role: 'USER', addresses: [], wishlist: [], recentlyViewed: [] };
    saveUsersToStorage(users);

    const userData: User = { name, email, role: 'USER', addresses: [], wishlist: [], recentlyViewed: [] };
    updateUserSession(userData);
    return Promise.resolve();
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, adminCode: string) => {
    const validationResult = adminCodeContext?.validateAndUseCode(adminCode, email);

    if (!validationResult || !validationResult.isValid) {
        return Promise.reject(new Error(validationResult?.message || 'Invalid Admin Code.'));
    }

    const users = getUsersFromStorage();
    if (users[email]) {
        // If user exists, we should probably revert the code usage, but for this simulation we'll just error out.
        // A real backend would use a transaction here.
        return Promise.reject(new Error('An account with this email already exists.'));
    }
    
    // Create the user with VENDOR role
    users[email] = { name, password: pass, role: 'VENDOR', addresses: [], wishlist: [], recentlyViewed: [] };
    saveUsersToStorage(users);

    // Create the corresponding vendor profile
    vendorContext?.addVendor({ userId: email, storeName });

    const userData: User = { name, email, role: 'VENDOR', addresses: [], wishlist: [], recentlyViewed: [] };
    updateUserSession(userData);
    return Promise.resolve();
  }

  const addUser = async (userData: { name: string; email: string; pass: string; role: 'USER' | 'VENDOR' | 'SUPER_ADMIN' }) => {
    const users = getUsersFromStorage();
    if (users[userData.email]) {
        return Promise.reject(new Error('An account with this email already exists.'));
    }
    users[userData.email] = { name: userData.name, password: userData.pass, role: userData.role, addresses: [], wishlist: [], recentlyViewed: [] };
    saveUsersToStorage(users);
    
    if (userData.role === 'VENDOR') {
        vendorContext?.addVendor({ userId: userData.email, storeName: `${userData.name}'s Store`});
    }

    updateUserList();
    return Promise.resolve();
  }

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

  const deleteUser = (email: string) => {
      if (email === 'admin@vexokart.com') {
          alert("Cannot delete the primary super admin account.");
          return;
      }
      const users = getUsersFromStorage();
      delete users[email];
      saveUsersToStorage(users);
      updateUserList();
  }
  
  const addToWishlist = (productId: number) => {
    if (!user) return;
    if (user.wishlist.includes(productId)) return;
    const updatedUser = { ...user, wishlist: [...user.wishlist, productId] };
    updateUserSession(updatedUser);
  };

  const removeFromWishlist = (productId: number) => {
    if (!user) return;
    const updatedUser = { ...user, wishlist: user.wishlist.filter(id => id !== productId) };
    updateUserSession(updatedUser);
  };

  const isInWishlist = (productId: number): boolean => {
    return user?.wishlist.includes(productId) || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, users: allUsers, isAuthenticated, login, signup, logout, addUser, addAddress, updateAddress, deleteAddress, deleteUser, addToWishlist, removeFromWishlist, isInWishlist, updateUserSession, signupAsVendor }}>
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