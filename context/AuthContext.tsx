

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types.ts';
import { supabase } from '../supabase.ts';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  updateUserSession: (userData: User) => void;
  // Fix: Add missing OTP methods for compatibility
  verifyOtp: (phone: string, code: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to ensure user object has default arrays
const sanitizeUser = (u: any): User => ({
  ...u,
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for initial session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from('users')
          .select('*')
          .eq('auth_uid', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (data) setUser(sanitizeUser(data));
            if (error) console.error("Error fetching initial profile:", error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth state changes (SIGN_IN, SIGN_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_uid', session.user.id)
            .single();
          if (data) setUser(sanitizeUser(data));
          if (error) console.error("Error fetching profile on sign in:", error);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    // onAuthStateChange will handle setting the user state
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: name, // This metadata will be used by the trigger
        },
      },
    });
    if (error) throw error;
    // onAuthStateChange will handle setting the user state
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Eagerly clear user state
  };
  
  // The following functions are kept for compatibility with other components
  const updateUserSession = (userData: User) => setUser(sanitizeUser(userData));

  const modifyUserJson = async (column: keyof User, data: any) => {
    if (!user) throw new Error("User not authenticated");
    const { error } = await supabase
      .from('users')
      .update({ [column]: data })
      .eq('id', user.id);
    if (error) throw error;
    setUser(prevUser => prevUser ? sanitizeUser({ ...prevUser, [column]: data }) : null);
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Date.now().toString() };
    const updated = [...user.addresses, newAddress];
    await modifyUserJson('addresses', updated);
  };

  const updateAddress = async (address: Address) => {
    if (!user) return;
    const updated = user.addresses.map(a => a.id === address.id ? address : a);
    await modifyUserJson('addresses', updated);
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    const updated = user.addresses.filter(a => a.id !== addressId);
    await modifyUserJson('addresses', updated);
  };

  const addToWishlist = async (productId: number) => {
    if (!user || user.wishlist.includes(productId)) return;
    const updated = [...user.wishlist, productId];
    await modifyUserJson('wishlist', updated);
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const updated = user.wishlist.filter(id => id !== productId);
    await modifyUserJson('wishlist', updated);
  };

  const isInWishlist = (productId: number) => user?.wishlist.includes(productId) || false;

  // Fix: Add dummy implementations for OTP methods
  const verifyOtp = async (phone: string, code: string) => {
    console.warn("OTP verification is not implemented in this demo.", { phone, code });
    // In a real app, you would call supabase.auth.verifyOtp()
    return Promise.resolve();
  };
  
  const sendOtp = async (phone: string) => {
    console.warn("Send OTP is not implemented in this demo.", { phone });
    // In a real app, you would call supabase.auth.signInWithOtp()
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: !!user, 
      login, 
      signup, 
      logout, 
      addAddress, 
      updateAddress, 
      deleteAddress, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist, 
      updateUserSession,
      verifyOtp,
      sendOtp
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
