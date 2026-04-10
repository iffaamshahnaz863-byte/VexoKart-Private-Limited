
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Address } from '../types.ts';
import { supabase } from '../supabase';

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
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
});

const getUserProfile = async (sessionUser: any): Promise<User | null> => {
    try {
        // Fetch user profile
        let { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error("[AuthContext] Error fetching user profile:", error.message);
        }

        if (!profile) {
            console.warn('[AuthContext] User profile not found. Creating a new one using upsert.');
            const { data: newProfile, error: upsertError } = await supabase
                .from('users')
                .upsert({
                    id: sessionUser.id,
                    email: sessionUser.email,
                    name: sessionUser.user_metadata?.name || sessionUser.email,
                    role: 'customer',
                    status: 'active'
                }, { onConflict: 'id' })
                .select()
                .single();
            
            if (upsertError) {
                console.error("[AuthContext] Failed to auto-create user profile:", upsertError.message);
                // Return a basic user object so the app doesn't break
                return sanitizeUser({
                    id: sessionUser.id,
                    email: sessionUser.email,
                    name: sessionUser.user_metadata?.name || sessionUser.email,
                    role: 'customer',
                    addresses: [],
                    wishlist: [],
                    recentlyViewed: []
                });
            }
            profile = newProfile;
        }

        // Fetch user addresses from the dedicated addresses table
        const { data: addresses, error: addressesError } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', sessionUser.id);
        
        if (addressesError) {
            console.error("[AuthContext] Failed to fetch user addresses:", addressesError.message);
        }
        
        return sanitizeUser({ ...profile, addresses: addresses || [] });
    } catch (err: any) {
        console.error("[AuthContext] Unexpected error in getUserProfile:", err.message);
        return null;
    }
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const profile = await getUserProfile(session.user);
        if (profile) setUser(profile);
      }
      setIsLoading(false);
    };

    fetchUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          setIsLoading(true);
          try {
            const profile = await getUserProfile(session.user);
            if (profile) {
              setUser(profile);
            }
          } catch (err) {
            console.error("[AuthContext] Auth state change error:", err);
          } finally {
            setIsLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, pass: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { name: name }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Signup failed: No user data returned from auth service.");

    // Manual upsert into users table as requested to ensure profile exists
    const { error: profileError } = await supabase
      .from('users')
      .upsert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          role: 'customer',
          status: 'active'
        }
      ], { onConflict: 'id' });

    if (profileError) {
      console.error("[AuthContext] User profile upsert failed after auth signup:", profileError.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
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

  const addAddress = async (address: Omit<Address, 'id' | 'user_id'>) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('addresses')
      .insert([
        {
          ...address,
          user_id: user.id
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      setUser(prevUser => prevUser ? {
        ...prevUser,
        addresses: [...prevUser.addresses, data]
      } : null);
    }
  };

  const updateAddress = async (address: Address) => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', address.id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (data) {
      setUser(prevUser => prevUser ? {
        ...prevUser,
        addresses: prevUser.addresses.map(a => a.id === address.id ? data : a)
      } : null);
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    setUser(prevUser => prevUser ? {
      ...prevUser,
      addresses: prevUser.addresses.filter(a => a.id !== addressId)
    } : null);
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
