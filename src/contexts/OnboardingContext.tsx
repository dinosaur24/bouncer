'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { CompanyProfile, OnboardingState, ScoringThresholds } from '@/lib/types';
import { OAUTH_PROVIDERS, connectOAuthProvider } from '@/lib/nango-connect';

const DEFAULT_THRESHOLDS: ScoringThresholds = {
  passedMin: 70,
  borderlineMin: 40,
  blockRejected: false,
  rejectionMessage: 'Sorry, we could not verify your submission. Please try again or contact support.',
};

interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  saveCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  verifySnippet: () => Promise<boolean>;
  connectCRM: (provider: string) => Promise<void>;
  skipCRM: () => void;
  saveThresholds: (thresholds: ScoringThresholds) => Promise<void>;
  completeStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, updateUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const state: OnboardingState = {
    currentStep: user?.onboarding_step ?? 1,
    completedSteps: Array.from({ length: (user?.onboarding_step ?? 1) - 1 }, (_, i) => i + 1),
    companyProfile: user?.company_name ? {
      companyName: user.company_name,
      website: user.company_website || '',
      teamSize: user.team_size || '',
      crm: '',
    } : null,
    snippetVerified: (user?.onboarding_step ?? 1) > 2,
    crmConnected: (user?.onboarding_step ?? 1) > 3 ? 'connected' : null,
    thresholds: user?.scoring_thresholds ?? DEFAULT_THRESHOLDS,
  };

  const completeStep = useCallback((step: number) => {
    const nextStep = step + 1;
    fetch('/api/user/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_step: nextStep }),
    }).then(() => {
      updateUser({ onboarding_step: nextStep });
    });
  }, [updateUser]);

  const saveCompanyProfile = useCallback(async (profile: CompanyProfile) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: profile.companyName,
          company_website: profile.website,
          team_size: profile.teamSize,
          onboarding_step: 2,
        }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const verifySnippet = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Add real snippet verification endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      completeStep(2);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const connectCRM = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      if (OAUTH_PROVIDERS.includes(provider) && user?.id) {
        await connectOAuthProvider(provider, user.id, []);
      } else {
        await fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, name: provider, field_mappings: [] }),
        });
      }
      completeStep(3);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep, user?.id]);

  const skipCRM = useCallback(() => {
    completeStep(3);
  }, [completeStep]);

  const saveThresholds = useCallback(async (thresholds: ScoringThresholds) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoring_thresholds: thresholds, onboarding_step: 5 }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_completed: true }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  return (
    <OnboardingContext.Provider value={{
      state, isLoading, saveCompanyProfile, verifySnippet,
      connectCRM, skipCRM, saveThresholds, completeStep, completeOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
