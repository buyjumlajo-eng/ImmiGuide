import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, SubscriptionTier } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock User Data - Default to Annual (Full Access)
const MOCK_USER: User = {
  id: 'user_123',
  name: 'Mateo',
  email: 'mateo@example.com',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200&h=200',
  subscriptionTier: 'annual'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking local storage for session
    const storedAuth = localStorage.getItem('immi_auth_token');
    // Check if we have a stored subscription state for the demo
    const storedTier = localStorage.getItem('immi_sub_tier') as SubscriptionTier;

    if (storedAuth) {
      setUser({
          ...MOCK_USER,
          // Force upgrade to annual if stored tier is free, to satisfy user request
          subscriptionTier: (storedTier && storedTier !== 'free') ? storedTier : 'annual'
      });
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      localStorage.setItem('immi_auth_token', 'mock_token_123');
      // Reset to annual on new login for demo purposes
      const storedTier = localStorage.getItem('immi_sub_tier') as SubscriptionTier;
      setUser({
          ...MOCK_USER,
          subscriptionTier: (storedTier && storedTier !== 'free') ? storedTier : 'annual'
      });
      setIsLoading(false);
    }, 800);
  };

  const logout = () => {
    localStorage.removeItem('immi_auth_token');
    setUser(null);
  };

  const upgradeSubscription = async (tier: SubscriptionTier) => {
      // Simulate API call
      return new Promise<void>((resolve) => {
          setTimeout(() => {
              if (user) {
                  const updatedUser = { ...user, subscriptionTier: tier };
                  setUser(updatedUser);
                  localStorage.setItem('immi_sub_tier', tier);
              }
              resolve();
          }, 1500);
      });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, upgradeSubscription, isLoading }}>
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
