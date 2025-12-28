
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types';
import { VendorContext } from './VendorContext';
import { AdminCodeContext } from './AdminCodeContext';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  signupAsVendor: (name: string, email: string, pass: string, storeName: string, adminCode: string) => Promise<void>;
  logout: () => void;
  addUser: (userData: { name: string; email: string; pass: string; role: User['role'] }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  updateUserSession: (userData: User) => void;
  fetchUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const vendorContext = useContext(VendorContext);
  const adminCodeContext = useContext(AdminCodeContext);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/users?select=*`, { headers: API_HEADERS });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else {
        console.error("Users fetch failed: API response is not an array", data);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchUsers();
      const sessionEmail = localStorage.getItem('vexokart-session-email');
      if (sessionEmail) {
        try {
          // Encoded URI component to prevent 400 errors from '@' characters
          const res = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(sessionEmail)}&select=*`, { headers: API_HEADERS });
          const userData = await res.json();
          if (Array.isArray(userData) && userData.length > 0) {
            setUser(userData[0]);
          } else {
            localStorage.removeItem('vexokart-session-email');
          }
        } catch (e) {
          console.error("Session restore failed", e);
          localStorage.removeItem('vexokart-session-email');
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const updateUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vexokart-session-email', userData.email);
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(pass)}&select=*`, { headers: API_HEADERS });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        updateUserSession(data[0]);
        return;
      }
      throw new Error('Invalid email or password');
    } catch (err) {
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const check = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}`, { headers: API_HEADERS });
    const existing = await check.json();
    if (Array.isArray(existing) && existing.length > 0) throw new Error('Account already exists');

    const newUser = {
      name,
      email,
      password: pass,
      role: 'user',
      addresses: [],
      wishlist: [],
      recentlyViewed: [],
      phone: ''
    };

    const res = await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newUser)
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create account');
    }
    
    const verifyRes = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}&select=*`, { headers: API_HEADERS });
    const verifyData = await verifyRes.json();
    if (Array.isArray(verifyData) && verifyData.length > 0) {
      updateUserSession(verifyData[0]);
    }
    await fetchUsers();
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, adminCode: string) => {
    const validation = adminCodeContext?.validateAndUseCode(adminCode, email);
    if (!validation || !validation.isValid) throw new Error(validation?.message || 'Invalid code');

    const newUser = {
      name,
      email,
      password: pass,
      role: 'user',
      addresses: [],
      wishlist: [],
      recentlyViewed: [],
      phone: ''
    };

    const res = await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newUser)
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create account');
    }
    
    await vendorContext?.addVendor({ userId: email, storeName });
    
    const verifyRes = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}&select=*`, { headers: API_HEADERS });
    const verifyData = await verifyRes.json();
    if (Array.isArray(verifyData) && verifyData.length > 0) {
      updateUserSession(verifyData[0]);
    }
    await fetchUsers();
  };

  const logout = () => {
    localStorage.removeItem('vexokart-session-email');
    setUser(null);
  };

  const addUser = async (userData: any) => {
    await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({ ...userData, addresses: [], wishlist: [], recentlyViewed: [] })
    });
    await fetchUsers();
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Date.now().toString() };
    const updatedAddresses = [...user.addresses, newAddress];
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ addresses: updatedAddresses })
    });
    setUser({ ...user, addresses: updatedAddresses });
  };

  const updateAddress = async (address: Address) => {
    if (!user) return;
    const updatedAddresses = user.addresses.map(a => a.id === address.id ? address : a);
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ addresses: updatedAddresses })
    });
    setUser({ ...user, addresses: updatedAddresses });
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ addresses: updatedAddresses })
    });
    setUser({ ...user, addresses: updatedAddresses });
  };

  const deleteUser = async (email: string) => {
    if (email === 'admin@vexokart.com') return;
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE', headers: API_HEADERS });
    await fetchUsers();
  };

  const addToWishlist = async (productId: number) => {
    if (!user || user.wishlist.includes(productId)) return;
    const updated = [...user.wishlist, productId];
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ wishlist: updated })
    });
    setUser({ ...user, wishlist: updated });
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const updated = user.wishlist.filter(id => id !== productId);
    await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ wishlist: updated })
    });
    setUser({ ...user, wishlist: updated });
  };

  const isInWishlist = (productId: number) => user?.wishlist.includes(productId) || false;

  return (
    <AuthContext.Provider value={{ 
      user, users: allUsers, isLoading, isAuthenticated: !!user, 
      login, signup, logout, addUser, addAddress, updateAddress, 
      deleteAddress, deleteUser, addToWishlist, removeFromWishlist, 
      isInWishlist, updateUserSession, signupAsVendor, fetchUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
