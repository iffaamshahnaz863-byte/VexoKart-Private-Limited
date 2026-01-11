
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
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeUser = (u: any): User => ({
  ...u,
  id: u.id ? String(u.id) : '',
  auth_id: u.auth_id,
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
  role: u.role || 'user',
  has_seen_onboarding: u.has_seen_onboarding === true
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage to prevent flash of null user
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('vexokart-user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { notifyLogin, fetchInbox } = useNotifications();

  // Fetch all profiles (for Admin usage)
  const fetchUsers = async () => {
    try {
      // Changed 'profiles' to 'users' based on schema
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      if (Array.isArray(data)) {
        setAllUsers(data.map(sanitizeUser));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchProfile = async (authUserId: string) => {
    try {
      // Robust lookup: querying 'users' table via 'auth_id' column which stores the UUID
      // This avoids type mismatch errors if 'id' column is integer
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUserId)
        .maybeSingle();

      if (data) {
        const appUser = sanitizeUser(data);
        setUser(appUser);
        localStorage.setItem('vexokart-user', JSON.stringify(appUser));
        
        if (appUser.role === 'admin') fetchUsers();
        fetchInbox(appUser);
      } else {
        console.warn("User profile not found for Auth ID:", authUserId);
        // Optional: Attempt recovery if user exists in auth but not in table
        // This might happen if signup failed halfway
      }
    } catch (err) {
      console.error("Profile sync error:", err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          if (mounted) await fetchProfile(session.user.id);
        } else {
          if (mounted) {
            setUser(null);
            localStorage.removeItem('vexokart-user');
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('vexokart-user');
        setAllUsers([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });
    if (error) throw error;
    if (data.user) {
       await fetchProfile(data.user.id);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
            data: { name }
        }
    });
    if (error) throw error;

    if (data.user) {
        // Create Profile in 'users' table
        // We do NOT send 'id' if it's an integer primary key. We send 'auth_id'.
        const newProfilePayload = {
            auth_id: data.user.id,
            email: email.trim(),
            name: name,
            role: 'user',
            created_at: new Date().toISOString(),
            addresses: [],
            wishlist: [],
            recentlyViewed: [],
            has_seen_onboarding: false
        };
        
        const { error: insertError } = await supabase.from('users').insert([newProfilePayload]);
        
        if (!insertError) {
            // Fetch back the full user object (to get the generated ID)
            await fetchProfile(data.user.id);
        } else {
            console.error("Error creating profile:", JSON.stringify(insertError));
            // Check if profile already exists (race condition or trigger)
            if (insertError.code === '23505') { // Unique violation
                 await fetchProfile(data.user.id);
            } else {
                 throw new Error(`Profile creation failed: ${insertError.message}`);
            }
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

  const completeOnboarding = async () => {
    if (!user) return;
    try {
        // Update DB
        const { error } = await supabase
            .from('users')
            .update({ has_seen_onboarding: true })
            .eq('id', user.id); // Use ID here, assuming user.id is valid for updates
        
        if (!error) {
            const updated = { ...user, has_seen_onboarding: true };
            updateUserSession(updated);
        }
    } catch (e) {
        console.error("Failed to update onboarding status", e);
    }
  };

  // --- Profile Management Helpers (Updated table name to 'users') ---

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return;
    try {
        const newAddress = { ...address, id: Date.now().toString() };
        const updatedAddresses = [...user.addresses, newAddress];
        
        const { error } = await supabase
            .from('users')
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
            .from('users')
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
            .from('users')
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
            .from('users')
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
            .from('users')
            .update({ wishlist: updated })
            .eq('id', user.id);

        if (!error) updateUserSession({ ...user, wishlist: updated });
    } catch(e) { console.error(e); }
  };

  const isInWishlist = (productId: number) => {
    return user ? user.wishlist.includes(productId) : false;
  };

  const deleteUser = async (email: string) => {
      console.warn("User deletion requires admin privileges via backend.");
  };

  const addUser = async (userData: any) => {
      await signup(userData.name, userData.email, userData.pass || '123456');
  };

  const signupAsVendor = async (name: string, email: string, pass: string, storeName: string, code: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: { data: { name } }
      });
      if (error) throw error;

      if (data.user) {
          const newProfilePayload = {
              auth_id: data.user.id,
              email: email.trim(),
              name,
              role: 'vendor',
              created_at: new Date().toISOString(),
              addresses: [],
              wishlist: [],
              has_seen_onboarding: false
          };
          
          // Insert profile into 'users' table
          const { error: profileError } = await supabase.from('users').insert([newProfilePayload]);
          
          if (!profileError) {
              // Now insert into vendors table. Note: vendors table likely needs numeric ID from users table
              // We need to fetch the created user first to get the ID
              const { data: userData } = await supabase.from('users').select('id').eq('auth_id', data.user.id).single();
              
              if (userData) {
                  await supabase.from('vendors').insert([{
                      user_id: userData.id, // Linking via numeric ID
                      store_name: storeName,
                      owner_name: name,
                      email: email.trim(),
                      status: 'pending',
                      phone: ''
                  }]);
              }
              
              await fetchProfile(data.user.id);
          } else {
              console.error("Vendor profile creation failed:", profileError);
              throw new Error("Failed to create vendor profile.");
          }
      }
  };

  return (
    <AuthContext.Provider value={{ 
      user, users: allUsers, isLoading, isAuthenticated: !!user, 
      login, signup, logout, addUser, addAddress, updateAddress, 
      deleteAddress, deleteUser, addToWishlist, removeFromWishlist, 
      isInWishlist, updateUserSession, fetchUsers, signupAsVendor,
      completeOnboarding
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
