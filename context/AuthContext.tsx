
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const sanitizeUser = (u: any): User => ({
  ...u,
  addresses: Array.isArray(u.addresses) ? u.addresses : [],
  wishlist: Array.isArray(u.wishlist) ? u.wishlist : [],
  recentlyViewed: Array.isArray(u.recentlyViewed) ? u.recentlyViewed : [],
});

const getUserProfile = async (sessionUser: any): Promise<User | null> => {
    let { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', sessionUser.id)
        .single();
    
    if (error && !profile) {
        console.warn('User profile not found. Creating a new one as a fallback.');
        const { data: newProfile, error: upsertError } = await supabase
            .from('users')
            .upsert({
                auth_uid: sessionUser.id,
                email: sessionUser.email,
                name: sessionUser.user_metadata?.name || sessionUser.email,
                role: 'user',
                status: 'active'
            }, { onConflict: 'auth_uid' })
            .select()
            .single();
        
        if (upsertError) {
            console.error("CRITICAL: Failed to create missing user profile on login.", upsertError);
            return null;
        }
        profile = newProfile;
    }
    
    return profile ? sanitizeUser(profile) : null;
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
        if (event === 'SIGNED_IN' && session) {
          setIsLoading(true);
          const profile = await getUserProfile(session.user);
          if (profile) {
            setUser(profile);
          } else {
            await supabase.auth.signOut();
          }
          setIsLoading(false);
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

    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        auth_uid: authData.user.id,
        email: email,
        name: name,
        role: 'user',
        status: 'active'
      }, { onConflict: 'auth_uid' });

    if (profileError) {
      console.error("CRITICAL: User profile upsert failed after auth signup. The login handler will fix this.", profileError);
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
