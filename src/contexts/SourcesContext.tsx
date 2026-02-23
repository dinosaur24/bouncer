'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateSources } from '@/lib/mock-data';
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
    setSources(getStored('sources', generateSources()));
  }, []);

  const addSource = useCallback(async (data: { title: string; domain: string; description: string }) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      const newSource: FormSource = {
        id: generateId(),
        title: data.title,
        domain: data.domain,
        status: 'Active',
        description: data.description,
        submissions: 0,
        passRate: 0,
        avgScore: 0,
        lastSubmission: 'Never',
        snippetId: 'snp_' + generateId(),
      };
      setSources(prev => {
        const updated = [...prev, newSource];
        setStored('sources', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSource = useCallback(async (id: string, data: Partial<FormSource>) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setSources(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
        setStored('sources', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSource = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setSources(prev => {
        const updated = prev.filter(s => s.id !== id);
        setStored('sources', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleSourceStatus = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setSources(prev => {
        const updated = prev.map(s =>
          s.id === id ? { ...s, status: (s.status === 'Active' ? 'Paused' : 'Active') as FormSource['status'] } : s
        );
        setStored('sources', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <SourcesContext.Provider value={{ sources, isLoading, addSource, updateSource, deleteSource, toggleSourceStatus }}>
      {children}
    </SourcesContext.Provider>
  );
}
