
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types.ts';
import { supabase } from '../supabase.ts';
import { useNotifications } from './NotificationContext.tsx';
import { BASE_API_URL, API_HEADERS } from '../constants.ts';

interface AuthContextType {
  user: User | null;
  users: User[];
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
  fetchUsers: () => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  signupAsVendor: (name: string, email: string, pass: string, storeName: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeUser = (u: any): User => ({
  ...u,
  id: u.id ? String(u.id) : '',
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
  role: u.role || 'user'
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { notifyLogin, fetchInbox } = useNotifications();

  // Fetch all profiles (for Admin usage)
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (Array.isArray(data)) {
        setAllUsers(data.map(sanitizeUser));
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const appUser = sanitizeUser(data);
        setUser(appUser);
        localStorage.setItem('vexokart-user', JSON.stringify(appUser));
        
        if (appUser.role === 'admin') fetchUsers();
        fetchInbox(appUser);
      } else {
        // Fallback or critical error if profile missing for auth user
        console.warn("Profile missing for authenticated user");
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  };

  useEffect(() => {
    // 1. Check active session
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        await fetchProfile(session.user.id, session.user.email!);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('vexokart-user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    if (data.user) {
        // notifyLogin handled via effect or we can trigger here
        // Profile fetch handled by onAuthStateChange
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: { name }
        }
    });
    if (error) throw error;

    if (data.user) {
        // Create Profile immediately
        const newProfile = {
            id: data.user.id,
            email: email,
            name: name,
            role: 'user',
            created_at: new Date().toISOString(),
            addresses: [],
            wishlist: [],
            recentlyViewed: []
        };
        
        const { error: profileError } = await supabase.from('profiles').insert([newProfile]);
        if (profileError) {
            console.error("Error creating profile:", profileError);
            // If profile creation fails, we might want to alert, but auth is successful.
        } else {
            setUser(sanitizeUser(newProfile));
        }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('vexokart-user');
  };

  const updateUserSession = (userData: User) => {
    setUser(userData);
    localStorage.setItem('vexokart-user', JSON.stringify(userData));
  };

  // --- Profile Management Helpers ---

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    try {
        const newAddress = { ...address, id: Date.now().toString() };
        const updatedAddresses = [...user.addresses, newAddress];
        
        const { error } = await supabase
            .from('profiles')
            .update({ addresses: updatedAddresses })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, addresses: updatedAddresses });
    } catch(e) { console.error(e); }
  };

  const updateAddress = async (address: Address) => {
    if (!user) return;
    try {
        const updatedAddresses = user.addresses.map(a => a.id === address.id ? address : a);
        const { error } = await supabase
            .from('profiles')
            .update({ addresses: updatedAddresses })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, addresses: updatedAddresses });
    } catch(e) { console.error(e); }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;
    try {
        const updatedAddresses = user.addresses.filter(a => a.id !== addressId);
        const { error } = await supabase
            .from('profiles')
            .update({ addresses: updatedAddresses })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, addresses: updatedAddresses });
    } catch(e) { console.error(e); }
  };

  const addToWishlist = async (productId: number) => {
    if (!user) return;
    if (user.wishlist.includes(productId)) return;
    try {
        const updated = [...user.wishlist, productId];
        const { error } = await supabase
            .from('profiles')
            .update({ wishlist: updated })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, wishlist: updated });
    } catch(e) { console.error(e); }
  };

  const removeFromWishlist = async (productId: number) => {
    if (!user) return;
    try {
        const updated = user.wishlist.filter(id => id !== productId);
        const { error } = await supabase
            .from('profiles')
            .update({ wishlist: updated })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, wishlist: updated });
    } catch(e) { console.error(e); }
  };

  const isInWishlist = (productId: number) => {
    return user ? user.wishlist.includes(productId) : false;
  };

  const deleteUser = async (email: string) => {
      // Admin only: Logic would likely involve edge functions for Auth deletion
      console.warn("User deletion requires admin privileges via backend.");
  };

  const addUser = async (userData: any) => {
      // Legacy / Admin add user
      await signup(userData.name, userData.email, userData.pass || '123456');
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, code: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name } }
      });
      if (error) throw error;

      if (data.user) {
          const newProfile = {
              id: data.user.id,
              email,
              name,
              role: 'vendor',
              created_at: new Date().toISOString(),
              addresses: [],
              wishlist: []
          };
          
          await supabase.from('profiles').insert([newProfile]);
          await supabase.from('vendors').insert([{
              user_id: data.user.id,
              store_name: storeName,
              owner_name: name,
              email: email,
              status: 'pending',
              phone: ''
          }]);
          
          setUser(sanitizeUser(newProfile));
      }
  };

  return (
    <AuthContext.Provider value={{ 
      user, users: allUsers, isLoading, isAuthenticated: !!user, 
      login, signup, logout, addUser, addAddress, updateAddress, 
      deleteAddress, deleteUser, addToWishlist, removeFromWishlist, 
      isInWishlist, updateUserSession, fetchUsers, signupAsVendor
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
