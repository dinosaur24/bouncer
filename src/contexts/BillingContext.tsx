'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { PLANS, generateInvoices } from '@/lib/mock-data';
import { useAuth } from './AuthContext';
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
  const { user, updateUser } = useAuth();
  const plan = user?.plan ?? 'free';
  const currentPlan = PLANS[plan];

  const [usage, setUsage] = useState<UsageData>({ used: 0, limit: 250, percentage: 0 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsage = getStored<UsageData>('usage', {
      used: plan === 'growth' ? 8432 : plan === 'starter' ? 1847 : 198,
      limit: currentPlan.validationLimit === Infinity ? 999999 : currentPlan.validationLimit,
      percentage: 0,
    });
    storedUsage.percentage = storedUsage.limit > 0 ? Math.round((storedUsage.used / storedUsage.limit) * 1000) / 10 : 0;
    setUsage(storedUsage);
    setInvoices(getStored<Invoice[]>('invoices', generateInvoices()));
  }, [plan, currentPlan.validationLimit]);

  const isNearLimit = usage.percentage > 90;

  const upgradePlan = useCallback(async (tier: PlanTier) => {
    setIsLoading(true);
    try {
      await simulateAPI(tier, { delay: 1500, failRate: 0 });
      updateUser({ plan: tier });
      const newPlan = PLANS[tier];
      const newLimit = newPlan.validationLimit === Infinity ? 999999 : newPlan.validationLimit;
      const newUsage = { used: usage.used, limit: newLimit, percentage: Math.round((usage.used / newLimit) * 1000) / 10 };
      setUsage(newUsage);
      setStored('usage', newUsage);
      const newInvoice: Invoice = {
        id: Math.random().toString(36).substring(7),
        date: new Date().toISOString(),
        amount: newPlan.price,
        status: 'Paid',
        planName: newPlan.name,
      };
      const updatedInvoices = [newInvoice, ...invoices];
      setInvoices(updatedInvoices);
      setStored('invoices', updatedInvoices);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser, usage.used, invoices]);

  const cancelPlan = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 1000, failRate: 0 });
      updateUser({ plan: 'free' });
      const newUsage = { used: usage.used, limit: 250, percentage: Math.round((usage.used / 250) * 1000) / 10 };
      setUsage(newUsage);
      setStored('usage', newUsage);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser, usage.used]);

  return (
    <BillingContext.Provider value={{ currentPlan, usage, invoices, isLoading, isNearLimit, upgradePlan, cancelPlan }}>
      {children}
    </BillingContext.Provider>
  );
}
