
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types.ts';
import { supabase } from '../supabase.ts';
import { useNotifications } from './NotificationContext.tsx';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeUser = (u: any): User => ({
  ...u,
  id: u.id ? String(u.id) : '',
  auth_uid: u.auth_uid,
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
  role: u.role || 'user',
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchInbox } = useNotifications();

  /**
   * Fetches the profile from public.users using the auth.users.id
   */
  const fetchProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', authUserId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error.message);
        throw error;
      }

      if (data) {
        const appUser = sanitizeUser(data);
        setUser(appUser);
        fetchInbox(appUser);
      }
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Listen for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Signup: Supabase Auth -> public.users
   */
  const signup = async (name: string, email: string, pass: string) => {
    // 1. Create Auth Account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Signup successful, but no identity returned.");

    // 2. Create Public Profile record
    const { error: profileError } = await supabase.from('users').insert({
      auth_uid: authData.user.id,
      name,
      email,
      role: 'user',
      status: 'active'
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      // Even if profile fails here, onAuthStateChange/login will try to fetch it later
    }
  };

  /**
   * Login: Simple Supabase Auth call
   */
  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (error) throw error;
    // Success is handled by onAuthStateChange listener
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUserSession = (userData: User) => setUser(userData);

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress = { ...address, id: Date.now().toString() };
    const updated = [...user.addresses, newAddress];
    const { error } = await supabase.from('users').update({ addresses: updated }).eq('id', user.id);
    if (!error) setUser({ ...user, addresses: updated });
  };

  const updateAddress = async (address: Address) => {
    if (!user) return;
    const updated = user.addresses.map(a => a.id === address.id ? address : a);
    const { error } = await supabase.from('users').update({ addresses: updated }).eq('id', user.id);
    if (!error) setUser({ ...user, addresses: updated });
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    const updated = user.addresses.filter(a => a.id !== addressId);
    const { error } = await supabase.from('users').update({ addresses: updated }).eq('id', user.id);
    if (!error) setUser({ ...user, addresses: updated });
  };

  const addToWishlist = async (productId: number) => {
    if (!user || user.wishlist.includes(productId)) return;
    const updated = [...user.wishlist, productId];
    const { error } = await supabase.from('users').update({ wishlist: updated }).eq('id', user.id);
    if (!error) setUser({ ...user, wishlist: updated });
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    const updated = user.wishlist.filter(id => id !== productId);
    const { error } = await supabase.from('users').update({ wishlist: updated }).eq('id', user.id);
    if (!error) setUser({ ...user, wishlist: updated });
  };

  const isInWishlist = (productId: number) => user?.wishlist.includes(productId) || false;

  return (
    <AuthContext.Provider value={{ 
      user, isLoading, isAuthenticated: !!user, 
      login, signup, logout, addAddress, updateAddress, deleteAddress, 
      addToWishlist, removeFromWishlist, isInWishlist, updateUserSession 
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
