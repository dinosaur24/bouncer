'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored, clearAll } from '@/lib/storage';
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
  updateProfile: (data: { firstName: string; lastName: string; email: string; company: string }) => Promise<void>;
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
  const { user, updateUser, logout } = useAuth();

  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);
  const [scoring, setScoring] = useState<ScoringThresholds>(DEFAULT_SCORING);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ liveKey: '', testKey: '' });
  const [webhook, setWebhook] = useState<WebhookConfig>({ url: '', events: ['validation.completed'], active: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setNotifications(getStored('notifications', DEFAULT_NOTIFICATIONS));
    setScoring(getStored('scoring', DEFAULT_SCORING));
    setWebhook(getStored('webhook', { url: '', events: ['validation.completed'], active: false }));
    const storedKeys = getStored<ApiKeys>('apikeys', { liveKey: '', testKey: '' });
    if (!storedKeys.liveKey) {
      const keys = { liveKey: generateApiKey('sk_live_'), testKey: generateApiKey('sk_test_') };
      setApiKeys(keys);
      setStored('apikeys', keys);
    } else {
      setApiKeys(storedKeys);
    }
  }, []);

  const updateProfile = useCallback(async (data: { firstName: string; lastName: string; email: string; company: string }) => {
    setIsLoading(true);
    try {
      await simulateAPI(data);
      updateUser(data);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const updateNotifications = useCallback(async (prefs: NotificationPrefs) => {
    setIsLoading(true);
    try {
      await simulateAPI(prefs);
      setNotifications(prefs);
      setStored('notifications', prefs);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateScoring = useCallback(async (thresholds: ScoringThresholds) => {
    setIsLoading(true);
    try {
      await simulateAPI(thresholds);
      setScoring(thresholds);
      setStored('scoring', thresholds);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateApiKey = useCallback(async (type: 'live' | 'test') => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 800 });
      const prefix = type === 'live' ? 'sk_live_' : 'sk_test_';
      const newKey = generateApiKey(prefix);
      setApiKeys(prev => {
        const updated = type === 'live' ? { ...prev, liveKey: newKey } : { ...prev, testKey: newKey };
        setStored('apikeys', updated);
        return updated;
      });
      return newKey;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveWebhook = useCallback(async (config: WebhookConfig) => {
    setIsLoading(true);
    try {
      await simulateAPI(config);
      setWebhook(config);
      setStored('webhook', config);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testWebhook = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 2000, failRate: 0.1 });
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
      await simulateAPI(true, { delay: 1000, failRate: 0 });
      clearAll();
      logout();
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
