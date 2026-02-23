'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { useAuth } from './AuthContext';
import type { CompanyProfile, OnboardingState, ScoringThresholds } from '@/lib/types';

const DEFAULT_THRESHOLDS: ScoringThresholds = {
  passedMin: 70,
  borderlineMin: 40,
  blockRejected: false,
  rejectionMessage: 'Sorry, we could not verify your submission. Please try again or contact support.',
};

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  companyProfile: null,
  snippetVerified: false,
  crmConnected: null,
  thresholds: DEFAULT_THRESHOLDS,
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
  const { updateUser } = useAuth();
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = getStored<OnboardingState>('onboarding', DEFAULT_STATE);
    setState(stored);
  }, []);

  useEffect(() => {
    setStored('onboarding', state);
  }, [state]);

  const completeStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step) ? prev.completedSteps : [...prev.completedSteps, step],
      currentStep: Math.max(prev.currentStep, step + 1),
    }));
  }, []);

  const saveCompanyProfile = useCallback(async (profile: CompanyProfile) => {
    setIsLoading(true);
    try {
      await simulateAPI(profile, { failRate: 0 });
      setState(prev => ({ ...prev, companyProfile: profile }));
      completeStep(1);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const verifySnippet = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 1500, failRate: 0 });
      setState(prev => ({ ...prev, snippetVerified: true }));
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectCRM = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(provider, { delay: 1500, failRate: 0 });
      setState(prev => ({ ...prev, crmConnected: provider }));
      completeStep(3);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const skipCRM = useCallback(() => {
    completeStep(3);
  }, [completeStep]);

  const saveThresholds = useCallback(async (thresholds: ScoringThresholds) => {
    setIsLoading(true);
    try {
      await simulateAPI(thresholds, { failRate: 0 });
      setState(prev => ({ ...prev, thresholds }));
      completeStep(4);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { failRate: 0 });
      updateUser({ onboardingCompleted: true });
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return (
    <OnboardingContext.Provider value={{
      state, isLoading, saveCompanyProfile, verifySnippet,
      connectCRM, skipCRM, saveThresholds, completeStep, completeOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
