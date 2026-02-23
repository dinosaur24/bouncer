'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Validation, DashboardStats, ChartDataPoint, ValidationStatus } from '@/lib/types';

interface ValidationFilters {
  search?: string;
  status?: ValidationStatus | 'all';
  dateRange?: string;
  source?: string;
}

interface ValidationContextType {
  validations: Validation[];
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  isLoading: boolean;
  fetchValidations: (filters?: ValidationFilters) => Promise<Validation[]>;
  getValidation: (id: string) => Validation | undefined;
  overrideValidation: (id: string) => Promise<void>;
  exportCSV: () => void;
  addValidation: () => void;
  rejectionReasons: { label: string; percentage: number }[];
}

const ValidationContext = createContext<ValidationContextType | null>(null);

export function useValidations() {
  const context = useContext(ValidationContext);
  if (!context) throw new Error('useValidations must be used within ValidationProvider');
  return context;
}

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    validationsToday: 0, validationsMonth: 0, passRate: 0, avgScore: 0,
    todayChange: 0, monthChange: 0, passRateChange: 0, avgScoreChange: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [validationsRes, statsRes, chartRes] = await Promise.all([
          fetch('/api/validations'),
          fetch('/api/validations/stats'),
          fetch('/api/validations/chart?days=7'),
        ]);
        if (validationsRes.ok) setValidations(await validationsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
      } catch {
        // silently fail — user may not be authenticated yet
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchValidations = useCallback(async (filters?: ValidationFilters) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters?.source) params.set('source', filters.source);
      const res = await fetch(`/api/validations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setValidations(data);
        return data;
      }
      return validations;
    } finally {
      setIsLoading(false);
    }
  }, [validations]);

  const getValidation = useCallback((id: string) => {
    return validations.find(v => v.id === id);
  }, [validations]);

  const overrideValidation = useCallback(async (id: string) => {
    const res = await fetch(`/api/validations/${id}/override`, { method: 'PATCH' });
    if (res.ok) {
      setValidations(prev =>
        prev.map(v => v.id === id ? { ...v, status: 'Passed' as ValidationStatus, overridden: true } : v)
      );
    }
  }, []);

  const exportCSV = useCallback(async () => {
    try {
      const res = await fetch('/api/validations/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bouncer-validations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // fall through to client-side export
    }
    const headers = 'Email,Score,Status,Source,Time,IP,Phone,Company\n';
    const rows = validations.map(v =>
      `${v.email},${v.score},${v.status},${v.source},${v.timestamp},${v.ip},${v.phone},${v.company}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bouncer-validations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [validations]);

  // No-op in production — was used for mock data simulation
  const addValidation = useCallback(() => {}, []);

  const rejectionReasons = [
    { label: 'Disposable email detected', percentage: 34 },
    { label: 'Invalid phone number', percentage: 26 },
    { label: 'VPN/Proxy IP detected', percentage: 19 },
    { label: 'Domain not found', percentage: 13 },
    { label: 'Multiple signals failed', percentage: 8 },
  ];

  return (
    <ValidationContext.Provider value={{
      validations, stats, chartData, isLoading,
      fetchValidations, getValidation, overrideValidation, exportCSV, addValidation,
      rejectionReasons,
    }}>
      {children}
    </ValidationContext.Provider>
  );
}
