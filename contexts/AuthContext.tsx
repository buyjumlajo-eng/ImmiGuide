import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SubscriptionTier } from '../types';
import { identifyUser, resetAnalytics, trackEvent } from '../services/analytics';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void; // Google Login
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fallback Mock User for Demo/Dev when Supabase is not connected
const MOCK_USER: User = {
  id: 'user_123',
  name: 'Mateo',
  email: 'mateo@example.com',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  subscriptionTier: 'free'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check Supabase Session
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Error getting session:", error);
                setIsLoading(false);
            } else if (session?.user) {
                mapSupabaseUser(session.user);
            } else {
                setIsLoading(false);
            }
        }).catch(err => {
            console.error("Unexpected error getting session:", err);
            setIsLoading(false);
        });

        // 2. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                mapSupabaseUser(session.user);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    } else {
        // Fallback to local storage auth if Supabase keys missing
        const storedAuth = localStorage.getItem('immi_auth_token');
        const storedTier = localStorage.getItem('immi_sub_tier') as SubscriptionTier;
        if (storedAuth) {
            setUser({ ...MOCK_USER, subscriptionTier: storedTier || 'free' });
        }
        setIsLoading(false);
    }
  }, []);

  const mapSupabaseUser = async (sbUser: any) => {
      try {
          // Check if we have a profile in 'users' table, if not create one
          // For this demo, we'll map directly from Auth metadata
          const { data: profile, error } = await supabase!
            .from('users')
            .select('*')
            .eq('id', sbUser.id)
            .single();

          if (error && error.code !== 'PGRST116') {
              console.error("Error fetching user profile:", error);
          }

          const newUser: User = {
              id: sbUser.id,
              email: sbUser.email || '',
              name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User',
              avatar: sbUser.user_metadata?.avatar_url || '',
              subscriptionTier: profile?.subscription_tier || 'free'
          };

          setUser(newUser);
          identifyUser(newUser.id, { email: newUser.email, subscription_tier: newUser.subscriptionTier });
      } catch (err) {
          console.error("Unexpected error mapping user:", err);
      } finally {
          setIsLoading(false);
      }
  };

  const login = async () => {
    setIsLoading(true);
    
    if (supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) {
            console.error("Login error:", error);
            setIsLoading(false);
            throw error;
        }
        // Redirect happens automatically
    } else {
        // Fallback Mock Login
        setTimeout(() => {
            localStorage.setItem('immi_auth_token', 'mock_token_123');
            const storedTier = localStorage.getItem('immi_sub_tier') as SubscriptionTier;
            const u = { ...MOCK_USER, subscriptionTier: storedTier || 'free' };
            setUser(u);
            identifyUser(u.id, { email: u.email, subscription_tier: u.subscriptionTier });
            trackEvent('login_success');
            setIsLoading(false);
        }, 800);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
      setIsLoading(true);
      try {
          if (supabase) {
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) {
                  throw error;
              }
          } else {
              // Mock Sign In
              await new Promise(resolve => setTimeout(resolve, 800));
              const u = { ...MOCK_USER, email, name: email.split('@')[0] };
              localStorage.setItem('immi_auth_token', 'mock_token_email');
              setUser(u);
          }
      } finally {
          setIsLoading(false);
      }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
          if (supabase) {
              const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                      data: {
                          full_name: name,
                      }
                  }
              });
              if (error) {
                  throw error;
              }
              if (data.user && !data.session) {
                  throw new Error("Please check your email to confirm your registration.");
              }
          } else {
              // Mock Sign Up
              await new Promise(resolve => setTimeout(resolve, 800));
              const u = { ...MOCK_USER, email, name };
              localStorage.setItem('immi_auth_token', 'mock_token_email');
              setUser(u);
          }
      } finally {
          setIsLoading(false);
      }
  };

  const logout = async () => {
    trackEvent('logout');
    if (supabase) {
        await supabase.auth.signOut();
    } else {
        localStorage.removeItem('immi_auth_token');
    }
    setUser(null);
    resetAnalytics();
  };

  const upgradeSubscription = async (tier: SubscriptionTier) => {
      // Simulate Payment Process
      setTimeout(async () => {
          if (user) {
              const updatedUser = { ...user, subscriptionTier: tier };
              setUser(updatedUser);
              
              if (supabase) {
                  // Update DB
                  await supabase.from('users').upsert({ 
                      id: user.id, 
                      email: user.email,
                      name: user.name,
                      subscription_tier: tier 
                  });
              } else {
                  localStorage.setItem('immi_sub_tier', tier);
              }
              
              trackEvent('subscription_upgrade', { new_tier: tier });
              identifyUser(user.id, { subscription_tier: tier });
          }
      }, 1500);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        signInWithEmail,
        signUpWithEmail,
        logout, 
        upgradeSubscription, 
        isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};