'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateDefaultConnections } from '@/lib/mock-data';
import type { CRMConnection, FieldMapping } from '@/lib/types';

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { bouncerField: 'Email', crmField: 'email', enabled: true },
  { bouncerField: 'Phone', crmField: 'phone', enabled: true },
  { bouncerField: 'Lead Score', crmField: 'lead_score', enabled: true },
  { bouncerField: 'Company', crmField: 'company', enabled: true },
  { bouncerField: 'Validation Status', crmField: 'validation_status', enabled: false },
];

interface IntegrationContextType {
  connections: CRMConnection[];
  fieldMappings: FieldMapping[];
  isLoading: boolean;
  connectCRM: (provider: string) => Promise<void>;
  disconnectCRM: (id: string) => Promise<void>;
  saveFieldMappings: (mappings: FieldMapping[]) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
}

const IntegrationContext = createContext<IntegrationContextType | null>(null);

export function useIntegrations() {
  const context = useContext(IntegrationContext);
  if (!context) throw new Error('useIntegrations must be used within IntegrationProvider');
  return context;
}

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<CRMConnection[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(DEFAULT_MAPPINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setConnections(getStored('integrations', generateDefaultConnections()));
    setFieldMappings(getStored('fieldMappings', DEFAULT_MAPPINGS));
  }, []);

  const connectCRM = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 1500, failRate: 0 });
      setConnections(prev => {
        const updated = prev.map(c =>
          c.provider === provider
            ? { ...c, status: 'connected' as const, connectedAt: new Date().toISOString(), lastSyncAt: new Date().toISOString() }
            : c
        );
        setStored('integrations', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectCRM = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setConnections(prev => {
        const updated = prev.map(c =>
          c.id === id ? { ...c, status: 'disconnected' as const, connectedAt: undefined, lastSyncAt: undefined } : c
        );
        setStored('integrations', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFieldMappings = useCallback(async (mappings: FieldMapping[]) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setFieldMappings(mappings);
      setStored('fieldMappings', mappings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (id: string) => {
    await simulateAPI(true, { delay: 2000, failRate: 0.1 });
    return true;
  }, []);

  return (
    <IntegrationContext.Provider value={{
      connections, fieldMappings, isLoading,
      connectCRM, disconnectCRM, saveFieldMappings, testConnection,
    }}>
      {children}
    </IntegrationContext.Provider>
  );
}
