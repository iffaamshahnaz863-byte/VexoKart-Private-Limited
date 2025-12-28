
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types';
import { VendorContext } from './VendorContext';
import { BASE_API_URL, API_HEADERS } from '../constants';

interface AuthContextType {
  user: User | null;
  users: User[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, pass: string) => Promise<void>;
  signupAsVendor: (name: string, email: string, pass: string, storeName: string, code: string) => Promise<void>;
  logout: () => void;
  addUser: (userData: { name: string; email: string; phone: string; pass: string; role: User['role']; storeName?: string }) => Promise<void>;
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

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/users?select=*`, { 
        headers: { ...API_HEADERS, 'Cache-Control': 'no-cache' } 
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else {
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
          const res = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(sessionEmail)}&select=*`, { headers: API_HEADERS });
          const userData = await res.json();
          if (Array.isArray(userData) && userData.length > 0) {
            setUser(userData[0]);
          } else {
            localStorage.removeItem('vexokart-session-email');
          }
        } catch (e) {
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

  const signup = async (name: string, email: string, phone: string, pass: string) => {
    const checkRes = await fetch(`${BASE_API_URL}/users?email=eq.${encodeURIComponent(email)}&select=email`, { headers: API_HEADERS });
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) throw new Error('Email already registered');

    const newUser = {
      name, email, phone, password: pass, role: 'user',
      addresses: [], wishlist: [], recentlyViewed: [], created_at: new Date().toISOString()
    };

    const res = await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(newUser)
    });
    
    if (!res.ok) throw new Error('Signup failed');
    await fetchUsers();
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, code: string) => {
     throw new Error("Direct vendor signup is disabled. Please contact an administrator.");
  };

  const logout = () => {
    localStorage.removeItem('vexokart-session-email');
    setUser(null);
  };

  const addUser = async (userData: { name: string; email: string; phone: string; pass: string; role: User['role']; storeName?: string }) => {
    // 1. Create User in users table
    const newUser = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.pass,
      role: userData.role,
      addresses: [],
      wishlist: [],
      recentlyViewed: [],
      created_at: new Date().toISOString()
    };

    const res = await fetch(`${BASE_API_URL}/users`, {
      method: 'POST',
      headers: { ...API_HEADERS, 'Prefer': 'return=representation' },
      body: JSON.stringify(newUser)
    });

    const createdUsers = await res.json();
    if (!res.ok) {
        throw new Error(createdUsers.message || 'Failed to create user record');
    }

    const createdUser = createdUsers[0];

    // 2. If Role is Vendor, create the business profile in vendors table
    if (userData.role === 'vendor' && vendorContext) {
        try {
            await vendorContext.addVendorRecord({
                user_id: createdUser.id.toString(), // Linking using the returned ID from the first insert
                store_name: userData.storeName || `${userData.name}'s Store`,
                owner_name: userData.name,
                email: userData.email,
                phone: userData.phone,
                profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.storeName || userData.name)}&background=FF8A00&color=fff`,
                status: 'pending'
            });
            // Refresh vendors so they appear in the Vendors tab instantly
            await vendorContext.refreshVendors();
        } catch (vendorError: any) {
            // If vendor profile fails, we might want to alert the admin even though the user was created
            console.error("User created but vendor profile failed:", vendorError);
            throw new Error(`User created but Vendor profile failed: ${vendorError.message}`);
        }
    }

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
      login, signup, signupAsVendor, logout, addUser, addAddress, updateAddress, 
      deleteAddress, deleteUser, addToWishlist, removeFromWishlist, 
      isInWishlist, updateUserSession, fetchUsers 
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
