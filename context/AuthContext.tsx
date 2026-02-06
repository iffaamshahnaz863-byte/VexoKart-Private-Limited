
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User as Profile } from '../types.ts'; // Renamed to Profile for clarity
import { supabase } from '../supabase.ts';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start with loading true
    setIsLoading(true);

    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If a session exists, fetch the associated profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error) {
              console.error('Error fetching profile on initial load:', error);
              setUser(null);
            } else {
              setUser(data);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        // No session, not loading
        setIsLoading(false);
      }
    });

    // Set up the listener for auth state changes (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        if (event === 'SIGNED_IN' && session) {
          // When a user signs in, fetch their profile from the 'profiles' table
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile on SIGNED_IN:', error);
            setUser(null);
          } else {
            setUser(data);
          }
        } else if (event === 'SIGNED_OUT') {
          // When a user signs out, clear the user state
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // Instantly clear user state on logout call
  };

  const value = {
    user,
    isLoading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
