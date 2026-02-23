'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored, removeStored } from '@/lib/storage';
import { DEMO_USER, DEMO_PASSWORD } from '@/lib/mock-data';
import type { User, PlanTier } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = getStored<User | null>('user', null);
    setUser(stored);
    setIsLoading(false);
  }, []);

  // Persist user changes
  useEffect(() => {
    if (user) {
      setStored('user', user);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
        const userData = await simulateAPI(DEMO_USER, { failRate: 0 });
        setUser(userData);
        return;
      }
      const stored = getStored<User | null>('user', null);
      if (stored && stored.email === email) {
        const userData = await simulateAPI(stored, { failRate: 0 });
        setUser(userData);
        return;
      }
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser: User = await simulateAPI({
        id: generateId(),
        email,
        firstName: '',
        lastName: '',
        company: '',
        plan: 'free' as PlanTier,
        onboardingCompleted: false,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      }, { failRate: 0 });
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await simulateAPI({
        ...DEMO_USER,
        id: generateId(),
        onboardingCompleted: false,
      }, { delay: 1000, failRate: 0 });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStored('user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
