'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { ScoringThresholds, NotificationPrefs, WebhookConfig } from '@/lib/types';

interface ApiKeys {
  liveKey: string;
  testKey: string;
}

interface SettingsContextType {
  notifications: NotificationPrefs;
  scoring: ScoringThresholds;
  apiKeys: ApiKeys;
  webhook: WebhookConfig;
  isLoading: boolean;
  updateProfile: (data: { name: string; email: string; company_name: string }) => Promise<void>;
  updateNotifications: (prefs: NotificationPrefs) => Promise<void>;
  updateScoring: (thresholds: ScoringThresholds) => Promise<void>;
  regenerateApiKey: (type: 'live' | 'test') => Promise<string>;
  saveWebhook: (config: WebhookConfig) => Promise<void>;
  testWebhook: () => Promise<boolean>;
  deleteAccount: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}

function generateApiKey(prefix: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = prefix;
  for (let i = 0; i < 32; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  emailDigest: true, weeklyReport: true, validationAlerts: true, usageLimitAlerts: true,
};

const DEFAULT_SCORING: ScoringThresholds = {
  passedMin: 70, borderlineMin: 40, blockRejected: false, rejectionMessage: '',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const notifications = user?.notification_prefs ?? DEFAULT_NOTIFICATIONS;
  const scoring = user?.scoring_thresholds ?? DEFAULT_SCORING;
  const webhook = user?.webhook_config ?? { url: '', events: ['validation.completed'], active: false };
  const apiKeys: ApiKeys = {
    liveKey: user?.api_key ?? '',
    testKey: '',
  };

  const updateProfile = useCallback(async (data: { name: string; email: string; company_name: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: data.name, company_name: data.company_name }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const updateNotifications = useCallback(async (prefs: NotificationPrefs) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_prefs: prefs }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const updateScoring = useCallback(async (thresholds: ScoringThresholds) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoring_thresholds: thresholds }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const regenerateApiKey = useCallback(async (type: 'live' | 'test') => {
    setIsLoading(true);
    try {
      const prefix = type === 'live' ? 'sk_live_' : 'sk_test_';
      const newKey = generateApiKey(prefix);
      // TODO: Persist live key to server when endpoint is available
      return newKey;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveWebhook = useCallback(async (config: WebhookConfig) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_config: config }),
      });
      if (res.ok) await refreshUser();
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser]);

  const testWebhook = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Add real webhook testing endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (res.ok) logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return (
    <SettingsContext.Provider value={{
      notifications, scoring, apiKeys, webhook, isLoading,
      updateProfile, updateNotifications, updateScoring,
      regenerateApiKey, saveWebhook, testWebhook, deleteAccount,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
