'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PLANS } from '@/lib/mock-data';
import type { PlanTier, PlanDetails, UsageData, Invoice } from '@/lib/types';

interface BillingContextType {
  currentPlan: PlanDetails;
  usage: UsageData;
  invoices: Invoice[];
  isLoading: boolean;
  isNearLimit: boolean;
  upgradePlan: (tier: PlanTier) => Promise<void>;
  cancelPlan: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | null>(null);

export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) throw new Error('useBilling must be used within BillingProvider');
  return context;
}

export function BillingProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const plan = user?.plan ?? 'free';
  const currentPlan = PLANS[plan];

  const [invoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validationLimit = currentPlan.validationLimit === Infinity ? 999999 : currentPlan.validationLimit;
  const used = user?.validations_used ?? 0;
  const usage: UsageData = {
    used,
    limit: validationLimit,
    percentage: validationLimit > 0 ? Math.round((used / validationLimit) * 1000) / 10 : 0,
  };

  const isNearLimit = usage.percentage > 90;

  const upgradePlan = useCallback(async (tier: PlanTier) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const cancelPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'free' }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  return (
    <BillingContext.Provider value={{ currentPlan, usage, invoices, isLoading, isNearLimit, upgradePlan, cancelPlan }}>
      {children}
    </BillingContext.Provider>
  );
}
