'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import type { PlanTier } from '@/lib/types';

export interface BouncerUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  team_size: string | null;
  plan: PlanTier;
  validations_used: number;
  onboarding_completed: boolean;
  onboarding_step: number;
  scoring_thresholds: {
    passedMin: number;
    borderlineMin: number;
    blockRejected: boolean;
    rejectionMessage: string;
  };
  notification_prefs: {
    emailDigest: boolean;
    weeklyReport: boolean;
    validationAlerts: boolean;
    usageLimitAlerts: boolean;
  };
  webhook_config: {
    url: string;
    events: string[];
    active: boolean;
  };
  api_key: string | null;
  created_at: string;
}

interface AuthContextType {
  user: BouncerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<BouncerUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [bouncerUser, setBouncerUser] = useState<BouncerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBouncerUser = useCallback(async () => {
    if (!isSignedIn) {
      setBouncerUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setBouncerUser(data);
      } else {
        setBouncerUser(null);
      }
    } catch {
      setBouncerUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchBouncerUser();
    }
  }, [isLoaded, isSignedIn, fetchBouncerUser]);

  const logout = useCallback(() => {
    signOut();
    setBouncerUser(null);
  }, [signOut]);

  const updateUser = useCallback((updates: Partial<BouncerUser>) => {
    setBouncerUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user: bouncerUser,
      isLoading: !isLoaded || isLoading,
      isAuthenticated: !!bouncerUser,
      logout,
      refreshUser: fetchBouncerUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
