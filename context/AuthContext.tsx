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

/**
 * Helper to ensure a user object has all required array properties
 * to prevent 'not iterable' errors and handle numeric IDs safely.
 */
const sanitizeUser = (u: any): User => ({
  ...u,
  id: u.id ? Number(u.id) : 0,
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : []
});

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
        setAllUsers(data.map(sanitizeUser));
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
      
      const sessionUser = localStorage.getItem('vexokart-user');
      if (sessionUser) {
        try {
          const parsed = JSON.parse(sessionUser);
          // Use ilike for robust session restoration
          const res = await fetch(`${BASE_API_URL}/users?email=ilike.${encodeURIComponent(parsed.email)}&select=*`, { headers: API_HEADERS });
          const userData = await res.json();
          if (Array.isArray(userData) && userData.length > 0) {
            setUser(sanitizeUser(userData[0]));
          }
        } catch (e) {
          console.error("Session restoration failed:", e);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const updateUserSession = (userData: User) => {
    const safeUser = sanitizeUser(userData);
    setUser(safeUser);
    localStorage.setItem('vexokart-user', JSON.stringify(safeUser));
  };

  const login = async (email: string, pass: string) => {
    try {
      // Use ilike for case-insensitive email matching to prevent "User not found" errors
      const query = `email=ilike.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(pass)}&select=*`;
      const res = await fetch(`${BASE_API_URL}/users?${query}`, { headers: API_HEADERS });
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const loggedUser = sanitizeUser(data[0]);
        updateUserSession(loggedUser);
        return;
      }
      
      // Secondary check to provide specific feedback
      const checkRes = await fetch(`${BASE_API_URL}/users?email=ilike.${encodeURIComponent(email)}&select=email`, { headers: API_HEADERS });
      const checkData = await checkRes.json();
      
      if (Array.isArray(checkData) && checkData.length === 0) {
          throw new Error('User not found. Please register first.');
      }
      
      throw new Error('Invalid email or password');
    } catch (err: any) {
      console.error("Login attempt failed:", err);
      throw new Error(err.message || 'Authentication service unreachable');
    }
  };

  const signup = async (name: string, email: string, phone: string, pass: string) => {
    // Check if user exists using case-insensitive lookup
    const checkRes = await fetch(`${BASE_API_URL}/users?email=ilike.${encodeURIComponent(email)}&select=email`, { headers: API_HEADERS });
    const existing = await checkRes.json();
    if (Array.isArray(existing) && existing.length > 0) throw new Error('Email already registered');

    // Payloads strictly exclude 'id' to let Postgres handle identity auto-generation
    const newUser = {
      name, 
      email: email.toLowerCase(), 
      phone, 
      password: pass, 
      role: 'user',
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
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Signup rejected by server.');
    }
    
    await fetchUsers();
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, code: string) => {
     throw new Error("Direct vendor signup is managed via admin panel.");
  };

  const logout = () => {
    localStorage.removeItem('vexokart-user');
    setUser(null);
  };

  const addUser = async (userData: { name: string; email: string; phone: string; pass: string; role: User['role']; storeName?: string }) => {
    const newUser = {
      name: userData.name,
      email: userData.email.toLowerCase(),
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
    if (!res.ok) throw new Error(createdUsers.message || 'Identity creation failed');

    const createdUser = sanitizeUser(createdUsers[0]);

    if (userData.role === 'vendor' && vendorContext) {
        try {
            await vendorContext.addVendorRecord({
                user_id: createdUser.id.toString(),
                store_name: userData.storeName || `${userData.name}'s Store`,
                owner_name: userData.name,
                email: userData.email.toLowerCase(),
                phone: userData.phone,
                profile_image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.storeName || userData.name)}&background=FF8A00&color=fff`,
                status: 'pending'
            });
            await vendorContext.refreshVendors();
        } catch (vErr) {
            console.error("Vendor profile link failed:", vErr);
        }
    }

    await fetchUsers();
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Date.now().toString() };
    const currentAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const updatedAddresses = [...currentAddresses, newAddress];
    
    await fetch(`${BASE_API_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ addresses: updatedAddresses })
    });
    setUser({ ...user, addresses: updatedAddresses });
  };

  const updateAddress = async (address: Address) => {
    if (!user) return;
    const currentAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const updatedAddresses = currentAddresses.map(a => a.id === address.id ? address : a);
    
    await fetch(`${BASE_API_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ addresses: updatedAddresses })
    });
    setUser({ ...user, addresses: updatedAddresses });
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    const currentAddresses = Array.isArray(user.addresses) ? user.addresses : [];
    const updatedAddresses = currentAddresses.filter(a => a.id !== addressId);
    
    await fetch(`${BASE_API_URL}/users?id=eq.${user.id}`, {
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
    if (!user) return;
    const currentWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
    if (currentWishlist.includes(productId)) return;
    
    const updated = [...currentWishlist, productId];
    await fetch(`${BASE_API_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ wishlist: updated })
    });
    setUser({ ...user, wishlist: updated });
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const currentWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
    const updated = currentWishlist.filter(id => id !== productId);
    
    await fetch(`${BASE_API_URL}/users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: API_HEADERS,
      body: JSON.stringify({ wishlist: updated })
    });
    setUser({ ...user, wishlist: updated });
  };

  const isInWishlist = (productId: number) => {
    if (!user) return false;
    const currentWishlist = Array.isArray(user.wishlist) ? user.wishlist : [];
    return currentWishlist.includes(productId);
  };

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