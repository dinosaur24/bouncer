'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Validation, DashboardStats, ChartDataPoint, ValidationStatus } from '@/lib/types';

interface ValidationFilters {
  search?: string;
  status?: ValidationStatus | 'all';
  dateRange?: string;
  source?: string;
}

export type DateFilter =
  | { type: 'preset'; days: number }
  | { type: 'custom'; startDate: string; endDate: string };

interface ValidationContextType {
  validations: Validation[];
  stats: DashboardStats;
  chartData: ChartDataPoint[];
  isLoading: boolean;
  days: number;
  setDays: (days: number) => void;
  dateFilter: DateFilter;
  setCustomDateRange: (start: Date, end: Date) => void;
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

const defaultStats: DashboardStats = {
  totalValidations: 0, passRate: 0, avgScore: 0, rejected: 0,
  totalChange: 0, passRateChange: 0, avgScoreChange: 0, rejectedChange: 0,
};

export function ValidationProvider({ children }: { children: ReactNode }) {
  const [validations, setValidations] = useState<Validation[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'preset', days: 30 });

  const days = dateFilter.type === 'preset' ? dateFilter.days : 0;
  const setDays = useCallback((d: number) => {
    setDateFilter({ type: 'preset', days: d });
  }, []);
  const setCustomDateRange = useCallback((start: Date, end: Date) => {
    setDateFilter({
      type: 'custom',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const statsParams = dateFilter.type === 'preset'
          ? `days=${dateFilter.days}`
          : `start=${dateFilter.startDate}&end=${dateFilter.endDate}`;
        const chartParams = dateFilter.type === 'preset'
          ? 'days=7'
          : `start=${dateFilter.startDate}&end=${dateFilter.endDate}`;

        const [validationsRes, statsRes, chartRes, reasonsRes] = await Promise.all([
          fetch('/api/validations'),
          fetch(`/api/validations/stats?${statsParams}`),
          fetch(`/api/validations/chart?${chartParams}`),
          fetch('/api/validations/rejection-reasons'),
        ]);
        if (validationsRes.ok) setValidations(await validationsRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (chartRes.ok) setChartData(await chartRes.json());
        if (reasonsRes.ok) setRejectionReasons(await reasonsRes.json());
      } catch {
        // silently fail — user may not be authenticated yet
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dateFilter]);

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

  const [rejectionReasons, setRejectionReasons] = useState<{ label: string; percentage: number }[]>([]);

  return (
    <ValidationContext.Provider value={{
      validations, stats, chartData, isLoading, days, setDays, dateFilter, setCustomDateRange,
      fetchValidations, getValidation, overrideValidation, exportCSV, addValidation,
      rejectionReasons,
    }}>
      {children}
    </ValidationContext.Provider>
  );
}
