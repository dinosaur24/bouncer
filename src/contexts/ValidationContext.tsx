'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateValidations, generateValidation, generateDashboardStats, generateChartData } from '@/lib/mock-data';
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = getStored<Validation[]>('validations', []);
    const data = stored.length > 0 ? stored : generateValidations(50);
    setValidations(data);
    setStats(generateDashboardStats(data));
    setChartData(generateChartData(7));
    setIsLoading(false);
    if (stored.length === 0) setStored('validations', data);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const newValidation = generateValidation();
      setValidations(prev => {
        const updated = [newValidation, ...prev].slice(0, 100);
        setStored('validations', updated);
        setStats(generateDashboardStats(updated));
        return updated;
      });
    }, 15000 + Math.random() * 15000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fetchValidations = useCallback(async (filters?: ValidationFilters) => {
    setIsLoading(true);
    try {
      let filtered = [...validations];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(v =>
          v.email.toLowerCase().includes(q) || v.company.toLowerCase().includes(q) || v.source.toLowerCase().includes(q)
        );
      }
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter(v => v.status === filters.status);
      }
      return await simulateAPI(filtered, { failRate: 0, delay: 300 });
    } finally {
      setIsLoading(false);
    }
  }, [validations]);

  const getValidation = useCallback((id: string) => {
    return validations.find(v => v.id === id);
  }, [validations]);

  const overrideValidation = useCallback(async (id: string) => {
    await simulateAPI(true);
    setValidations(prev => {
      const updated = prev.map(v =>
        v.id === id ? { ...v, status: 'Passed' as ValidationStatus, overridden: true } : v
      );
      setStored('validations', updated);
      return updated;
    });
  }, []);

  const exportCSV = useCallback(() => {
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

  const addValidation = useCallback(() => {
    const newValidation = generateValidation();
    setValidations(prev => {
      const updated = [newValidation, ...prev].slice(0, 100);
      setStored('validations', updated);
      setStats(generateDashboardStats(updated));
      return updated;
    });
  }, []);

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
