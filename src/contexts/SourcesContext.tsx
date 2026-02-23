'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { FormSource } from '@/lib/types';

interface SourcesContextType {
  sources: FormSource[];
  isLoading: boolean;
  addSource: (data: { title: string; domain: string; description: string }) => Promise<void>;
  updateSource: (id: string, data: Partial<FormSource>) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  toggleSourceStatus: (id: string) => Promise<void>;
}

const SourcesContext = createContext<SourcesContextType | null>(null);

export function useSources() {
  const context = useContext(SourcesContext);
  if (!context) throw new Error('useSources must be used within SourcesProvider');
  return context;
}

export function SourcesProvider({ children }: { children: ReactNode }) {
  const [sources, setSources] = useState<FormSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await fetch('/api/forms');
        if (res.ok) {
          const data = await res.json();
          setSources(data.map((f: Record<string, unknown>) => ({
            id: f.id,
            title: f.name,
            domain: f.domain,
            status: f.is_active ? 'Active' : 'Paused',
            description: f.description || '',
            submissions: 0,
            passRate: 0,
            avgScore: 0,
            lastSubmission: 'Never',
            snippetId: f.form_key,
          })));
        }
      } catch {
        // silently fail
      }
    }
    loadSources();
  }, []);

  const addSource = useCallback(async (data: { title: string; domain: string; description: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.title, domain: data.domain, description: data.description }),
      });
      if (res.ok) {
        const f = await res.json();
        setSources(prev => [...prev, {
          id: f.id,
          title: f.name,
          domain: f.domain,
          status: f.is_active ? 'Active' : 'Paused',
          description: f.description || '',
          submissions: 0,
          passRate: 0,
          avgScore: 0,
          lastSubmission: 'Never',
          snippetId: f.form_key,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSource = useCallback(async (id: string, data: Partial<FormSource>) => {
    setIsLoading(true);
    try {
      const apiData: Record<string, unknown> = {};
      if (data.title !== undefined) apiData.name = data.title;
      if (data.domain !== undefined) apiData.domain = data.domain;
      if (data.description !== undefined) apiData.description = data.description;
      if (data.status !== undefined) apiData.is_active = data.status === 'Active';

      const res = await fetch(`/api/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      if (res.ok) {
        setSources(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSource = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(prev => prev.filter(s => s.id !== id));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSourceStatus = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const source = sources.find(s => s.id === id);
      if (!source) return;
      const newActive = source.status !== 'Active';
      const res = await fetch(`/api/forms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive }),
      });
      if (res.ok) {
        setSources(prev => prev.map(s =>
          s.id === id ? { ...s, status: newActive ? 'Active' as const : 'Paused' as const } : s
        ));
      }
    } finally {
      setIsLoading(false);
    }
  }, [sources]);

  return (
    <SourcesContext.Provider value={{ sources, isLoading, addSource, updateSource, deleteSource, toggleSourceStatus }}>
      {children}
    </SourcesContext.Provider>
  );
}
