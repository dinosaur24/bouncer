'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { CRMConnection, FieldMapping } from '@/lib/types';
import { useAuth } from './AuthContext';
import { OAUTH_PROVIDERS, connectOAuthProvider, PROVIDER_NAMES } from '@/lib/nango-connect';

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
  const { user } = useAuth();
  const [connections, setConnections] = useState<CRMConnection[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(DEFAULT_MAPPINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadIntegrations() {
      try {
        const res = await fetch('/api/integrations');
        if (res.ok) {
          const data = await res.json();
          setConnections(data.map((i: Record<string, unknown>) => ({
            id: i.id,
            provider: i.provider,
            name: i.name,
            status: i.status,
            connectedAt: i.connected_at,
            lastSyncAt: i.last_sync_at,
          })));
          const connected = data.find(
            (i: Record<string, unknown>) => i.status === 'connected' && Array.isArray(i.field_mappings) && (i.field_mappings as unknown[]).length > 0
          );
          if (connected) setFieldMappings(connected.field_mappings as FieldMapping[]);
        }
      } catch {
        // silently fail
      }
    }
    loadIntegrations();
  }, []);

  const connectCRM = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      const existing = connections.find(c => c.provider === provider);

      if (OAUTH_PROVIDERS.includes(provider) && user?.id) {
        // OAuth providers: open Nango popup
        const data = await connectOAuthProvider(
          provider,
          user.id,
          fieldMappings,
          existing?.id,
        ) as Record<string, unknown>;

        if (existing) {
          setConnections(prev => prev.map(c =>
            c.id === existing.id
              ? { ...c, status: 'connected' as const, connectedAt: data.connected_at as string }
              : c
          ));
        } else {
          setConnections(prev => [...prev, {
            id: data.id as string,
            provider: data.provider as CRMConnection['provider'],
            name: data.name as string,
            status: data.status as 'connected',
            connectedAt: data.connected_at as string,
            lastSyncAt: data.last_sync_at as string | undefined,
          }]);
        }
      } else if (existing) {
        // Non-OAuth: reconnect existing
        const res = await fetch(`/api/integrations/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'connected' }),
        });
        if (res.ok) {
          const updated = await res.json();
          setConnections(prev => prev.map(c =>
            c.id === existing.id
              ? { ...c, status: 'connected' as const, connectedAt: updated.connected_at, lastSyncAt: updated.last_sync_at }
              : c
          ));
        }
      } else {
        // Non-OAuth: create new
        const res = await fetch('/api/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            name: PROVIDER_NAMES[provider] || provider,
            field_mappings: fieldMappings,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setConnections(prev => [...prev, {
            id: data.id,
            provider: data.provider,
            name: data.name,
            status: data.status,
            connectedAt: data.connected_at,
            lastSyncAt: data.last_sync_at,
          }]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [connections, fieldMappings, user?.id]);

  const disconnectCRM = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'disconnected' }),
      });
      if (res.ok) {
        setConnections(prev => prev.map(c =>
          c.id === id ? { ...c, status: 'disconnected' as const, connectedAt: undefined, lastSyncAt: undefined } : c
        ));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFieldMappings = useCallback(async (mappings: FieldMapping[]) => {
    setIsLoading(true);
    try {
      const connected = connections.filter(c => c.status === 'connected');
      await Promise.all(connected.map(c =>
        fetch(`/api/integrations/${c.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field_mappings: mappings }),
        })
      ));
      setFieldMappings(mappings);
    } finally {
      setIsLoading(false);
    }
  }, [connections]);

  const testConnection = useCallback(async (id: string) => {
    const res = await fetch(`/api/integrations/${id}/test`, { method: 'POST' });
    if (!res.ok) return false;
    const data = await res.json();
    return data.healthy === true;
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
