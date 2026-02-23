# Backend Logic & User Journeys Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire up all Bouncer pages with mock backend state, realistic user journeys, loading states, and interactions — transforming the static prototype into a fully interactive application.

**Architecture:** React Context providers with custom hooks simulate a real backend. Each provider manages a domain (auth, validations, billing, etc.) with async operations (500-800ms delays), localStorage persistence, and error states. Route guards protect authenticated pages.

**Tech Stack:** Next.js 16 App Router, React 19 Context API, TypeScript, localStorage for persistence, existing Tailwind CSS + Toast system.

---

### Task 1: Shared Types & Utilities

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/api.ts`
- Create: `src/lib/storage.ts`
- Create: `src/lib/mock-data.ts`

**Step 1: Create shared TypeScript types**

Create `src/lib/types.ts` with all shared types used across contexts:

```typescript
// User & Auth
export type PlanTier = 'free' | 'starter' | 'growth' | 'scale';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  website?: string;
  teamSize?: string;
  avatar?: string;
  plan: PlanTier;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  createdAt: string;
}

// Onboarding
export interface CompanyProfile {
  companyName: string;
  website: string;
  teamSize: string;
  crm: string;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  companyProfile: CompanyProfile | null;
  snippetVerified: boolean;
  crmConnected: string | null;
  thresholds: ScoringThresholds;
}

// Validations
export type ValidationStatus = 'Passed' | 'Borderline' | 'Rejected';
export type SignalType = 'email' | 'phone' | 'ip' | 'company';
export type SignalStatus = 'pass' | 'warn' | 'fail';

export interface SignalResult {
  type: SignalType;
  name: string;
  score: number;
  status: SignalStatus;
  label: string;
  detail: string;
}

export interface Validation {
  id: string;
  email: string;
  score: number;
  status: ValidationStatus;
  signals: SignalResult[];
  source: string;
  timestamp: string;
  ip: string;
  phone: string;
  company: string;
  overridden?: boolean;
}

export interface DashboardStats {
  validationsToday: number;
  validationsMonth: number;
  passRate: number;
  avgScore: number;
  todayChange: number;
  monthChange: number;
  passRateChange: number;
  avgScoreChange: number;
}

export interface ChartDataPoint {
  day: string;
  passed: number;
  borderline: number;
  rejected: number;
}

// Billing
export interface PlanDetails {
  name: string;
  tier: PlanTier;
  price: number;
  validationLimit: number;
  features: string[];
  annualPrice?: number;
}

export interface UsageData {
  used: number;
  limit: number;
  percentage: number;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  planName: string;
}

// Integrations
export type CRMProvider = 'hubspot' | 'salesforce' | 'pipedrive' | 'webhook' | 'zapier' | 'slack';

export interface CRMConnection {
  id: string;
  provider: CRMProvider;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncAt?: string;
}

export interface FieldMapping {
  bouncerField: string;
  crmField: string;
  enabled: boolean;
}

// Team
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Pending';
  joinedAt: string;
}

// Settings
export interface ScoringThresholds {
  passedMin: number;
  borderlineMin: number;
  blockRejected: boolean;
  rejectionMessage: string;
}

export interface NotificationPrefs {
  emailDigest: boolean;
  weeklyReport: boolean;
  validationAlerts: boolean;
  usageLimitAlerts: boolean;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  active: boolean;
}

// Sources
export interface FormSource {
  id: string;
  title: string;
  domain: string;
  status: 'Active' | 'Paused' | 'Error';
  description: string;
  submissions: number;
  passRate: number;
  avgScore: number;
  lastSubmission: string;
  snippetId: string;
}
```

**Step 2: Create API simulation helper**

Create `src/lib/api.ts`:

```typescript
export class APIError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'APIError';
  }
}

export async function simulateAPI<T>(
  data: T,
  options?: { delay?: number; failRate?: number; errorMessage?: string }
): Promise<T> {
  const delay = options?.delay ?? 500 + Math.random() * 300;
  const failRate = options?.failRate ?? 0.05;
  const errorMessage = options?.errorMessage ?? 'Something went wrong. Please try again.';

  await new Promise(resolve => setTimeout(resolve, delay));

  if (Math.random() < failRate) {
    throw new APIError(errorMessage);
  }

  return data;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
```

**Step 3: Create localStorage helpers**

Create `src/lib/storage.ts`:

```typescript
const PREFIX = 'bouncer_';

export function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function removeStored(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + key);
}

export function clearAll(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}
```

**Step 4: Create mock data generators**

Create `src/lib/mock-data.ts` with realistic data generators:

```typescript
import { generateId } from './api';
import type {
  User, Validation, ValidationStatus, SignalResult, SignalStatus,
  DashboardStats, ChartDataPoint, Invoice, TeamMember, FormSource,
  PlanDetails, PlanTier, CRMConnection, ScoringThresholds
} from './types';

// Demo user
export const DEMO_USER: User = {
  id: 'usr_demo_001',
  email: 'sara@techcorp.io',
  firstName: 'Sara',
  lastName: 'Martinez',
  company: 'TechCorp Inc.',
  website: 'techcorp.io',
  teamSize: '51-200',
  plan: 'growth',
  onboardingCompleted: true,
  emailVerified: true,
  createdAt: '2026-01-15T10:00:00Z',
};

export const DEMO_PASSWORD = 'password123';

// Plan definitions
export const PLANS: Record<PlanTier, PlanDetails> = {
  free: {
    name: 'Free', tier: 'free', price: 0, validationLimit: 250,
    features: ['250 validations/mo', 'Email validation only', '1 CRM (webhook only)', 'Community support'],
  },
  starter: {
    name: 'Starter', tier: 'starter', price: 49, validationLimit: 2500,
    features: ['2,500 validations/mo', 'All 4 signals', '2 CRM integrations', 'Email support'],
  },
  growth: {
    name: 'Growth', tier: 'growth', price: 149, validationLimit: 15000,
    features: ['15,000 validations/mo', 'All 4 signals', 'Unlimited CRM integrations', 'Priority email support'],
  },
  scale: {
    name: 'Scale', tier: 'scale', price: 349, validationLimit: Infinity,
    features: ['Unlimited validations', 'All 4 signals + custom weights', 'Unlimited + API access', 'Priority + Slack support'],
  },
};

// Email domains and names for realistic data
const firstNames = ['Sarah', 'James', 'Maria', 'David', 'Emma', 'John', 'Lisa', 'Mike', 'Anna', 'Tom', 'Kate', 'Alex', 'Nina', 'Chris', 'Laura'];
const lastNames = ['Chen', 'Smith', 'Garcia', 'Johnson', 'Lee', 'Wilson', 'Brown', 'Davis', 'Anderson', 'Taylor'];
const domains = ['techcorp.io', 'acmeinc.com', 'startup.co', 'bigco.com', 'growth.io', 'saas.dev', 'agency.com', 'corp.net', 'digital.co', 'labs.io'];
const sources = ['Main Website', 'Landing Page', 'Blog CTA', 'Webinar', 'Product Hunt', 'LinkedIn Ad'];
const companies = ['TechCorp', 'Acme Inc', 'GrowthLabs', 'DataSync', 'CloudBase', 'InnoTech', 'ScaleUp', 'FlowSoft', 'ByteForge', 'NexGen'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStatus(score: number, thresholds: ScoringThresholds): ValidationStatus {
  if (score >= thresholds.passedMin) return 'Passed';
  if (score >= thresholds.borderlineMin) return 'Borderline';
  return 'Rejected';
}

function generateSignals(score: number): SignalResult[] {
  const emailScore = Math.min(100, Math.max(0, score + randomBetween(-15, 15)));
  const phoneScore = Math.min(100, Math.max(0, score + randomBetween(-20, 20)));
  const ipScore = Math.min(100, Math.max(0, score + randomBetween(-10, 10)));
  const companyScore = Math.min(100, Math.max(0, score + randomBetween(-15, 15)));

  const signalStatus = (s: number): SignalStatus => s >= 70 ? 'pass' : s >= 40 ? 'warn' : 'fail';
  const signalLabel = (s: number): string => s >= 70 ? 'Valid' : s >= 40 ? 'Suspicious' : 'Invalid';

  return [
    {
      type: 'email', name: 'Email Verification', score: emailScore,
      status: signalStatus(emailScore), label: signalLabel(emailScore),
      detail: emailScore >= 70 ? 'Valid mailbox, no disposable domain' : emailScore >= 40 ? 'Mailbox exists but domain has low reputation' : 'Disposable email or invalid mailbox',
    },
    {
      type: 'phone', name: 'Phone Validation', score: phoneScore,
      status: signalStatus(phoneScore), label: signalLabel(phoneScore),
      detail: phoneScore >= 70 ? 'Valid mobile number, carrier confirmed' : phoneScore >= 40 ? 'Number exists but carrier unverified' : 'Invalid or disconnected number',
    },
    {
      type: 'ip', name: 'IP Risk Analysis', score: ipScore,
      status: signalStatus(ipScore), label: signalLabel(ipScore),
      detail: ipScore >= 70 ? 'Clean IP, no VPN/proxy detected' : ipScore >= 40 ? 'IP from shared hosting or datacenter' : 'VPN/proxy detected, high-risk IP',
    },
    {
      type: 'company', name: 'Company Domain', score: companyScore,
      status: signalStatus(companyScore), label: signalLabel(companyScore),
      detail: companyScore >= 70 ? 'Active domain with business presence' : companyScore >= 40 ? 'Domain exists but limited business info' : 'Domain not found or parked',
    },
  ];
}

export function generateValidation(thresholds?: ScoringThresholds): Validation {
  const t = thresholds ?? { passedMin: 70, borderlineMin: 40, blockRejected: false, rejectionMessage: '' };
  // Weighted random: 60% high score, 25% medium, 15% low
  const rand = Math.random();
  const score = rand < 0.60 ? randomBetween(70, 98) : rand < 0.85 ? randomBetween(40, 69) : randomBetween(5, 39);
  const firstName = randomFrom(firstNames);
  const lastName = randomFrom(lastNames);
  const domain = randomFrom(domains);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  const now = new Date();
  const minutesAgo = randomBetween(1, 1440);
  const timestamp = new Date(now.getTime() - minutesAgo * 60 * 1000);

  return {
    id: generateId(),
    email,
    score,
    status: getStatus(score, t),
    signals: generateSignals(score),
    source: randomFrom(sources),
    timestamp: timestamp.toISOString(),
    ip: `${randomBetween(10, 200)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(1, 254)}`,
    phone: `+1 (${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`,
    company: randomFrom(companies),
  };
}

export function generateValidations(count: number, thresholds?: ScoringThresholds): Validation[] {
  return Array.from({ length: count }, () => generateValidation(thresholds))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateDashboardStats(validations: Validation[]): DashboardStats {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const today = validations.filter(v => new Date(v.timestamp) >= todayStart);
  const month = validations.filter(v => new Date(v.timestamp) >= monthStart);
  const passed = month.filter(v => v.status === 'Passed');
  const avgScore = month.length > 0 ? Math.round(month.reduce((s, v) => s + v.score, 0) / month.length) : 0;

  return {
    validationsToday: today.length,
    validationsMonth: month.length,
    passRate: month.length > 0 ? Math.round((passed.length / month.length) * 100) : 0,
    avgScore,
    todayChange: randomBetween(-5, 15),
    monthChange: randomBetween(5, 25),
    passRateChange: randomBetween(-3, 5),
    avgScoreChange: randomBetween(-2, 4),
  };
}

export function generateChartData(days: number = 7): ChartDataPoint[] {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      day: dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1],
      passed: randomBetween(20, 60),
      borderline: randomBetween(5, 20),
      rejected: randomBetween(2, 12),
    };
  });
}

export function generateInvoices(): Invoice[] {
  const now = new Date();
  return [
    { id: generateId(), date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(), amount: 149, status: 'Paid', planName: 'Growth' },
    { id: generateId(), date: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(), amount: 149, status: 'Paid', planName: 'Growth' },
    { id: generateId(), date: new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString(), amount: 49, status: 'Paid', planName: 'Starter' },
  ];
}

export function generateTeamMembers(): TeamMember[] {
  return [
    { id: 'tm_1', name: 'Sara Martinez', email: 'sara@techcorp.io', initials: 'SM', role: 'Owner', status: 'Active', joinedAt: '2026-01-15' },
    { id: 'tm_2', name: 'James Chen', email: 'james@techcorp.io', initials: 'JC', role: 'Admin', status: 'Active', joinedAt: '2026-01-20' },
    { id: 'tm_3', name: 'Maria Lopez', email: 'maria@techcorp.io', initials: 'ML', role: 'Member', status: 'Pending', joinedAt: '2026-02-10' },
  ];
}

export function generateSources(): FormSource[] {
  return [
    { id: 'src_1', title: 'Main Website', domain: 'techcorp.io', status: 'Active', description: 'Primary marketing site contact form', submissions: 1247, passRate: 78, avgScore: 72, lastSubmission: '2 min ago', snippetId: 'snp_main' },
    { id: 'src_2', title: 'Landing Page', domain: 'techcorp.io/demo', status: 'Active', description: 'Product demo request form', submissions: 834, passRate: 85, avgScore: 81, lastSubmission: '15 min ago', snippetId: 'snp_demo' },
    { id: 'src_3', title: 'Blog CTA', domain: 'blog.techcorp.io', status: 'Active', description: 'Newsletter signup on blog', submissions: 2156, passRate: 62, avgScore: 58, lastSubmission: '1 hour ago', snippetId: 'snp_blog' },
    { id: 'src_4', title: 'Webinar Registration', domain: 'events.techcorp.io', status: 'Paused', description: 'Webinar signup form', submissions: 412, passRate: 91, avgScore: 88, lastSubmission: '3 days ago', snippetId: 'snp_webinar' },
  ];
}

export function generateDefaultConnections(): CRMConnection[] {
  return [
    { id: 'crm_1', provider: 'hubspot', name: 'HubSpot', status: 'connected', connectedAt: '2026-01-20T10:00:00Z', lastSyncAt: '2026-02-23T09:30:00Z' },
    { id: 'crm_2', provider: 'salesforce', name: 'Salesforce', status: 'disconnected' },
    { id: 'crm_3', provider: 'pipedrive', name: 'Pipedrive', status: 'disconnected' },
    { id: 'crm_4', provider: 'webhook', name: 'Webhook', status: 'disconnected' },
    { id: 'crm_5', provider: 'zapier', name: 'Zapier', status: 'disconnected' },
  ];
}
```

**Step 5: Verify build**

Run: `cd /Users/dinosakoman/Documents/bouncer && npm run build`
Expected: Build succeeds (new files have no imports yet, tree-shaking removes them)

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/api.ts src/lib/storage.ts src/lib/mock-data.ts
git commit -m "feat: add shared types, mock data engine, and API helpers"
```

---

### Task 2: AuthContext + Route Guard

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/components/RouteGuard.tsx`
- Modify: `src/app/layout.tsx` (wrap with AuthProvider)

**Step 1: Create AuthContext**

Create `src/contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored, removeStored, clearAll } from '@/lib/storage';
import { DEMO_USER, DEMO_PASSWORD } from '@/lib/mock-data';
import type { User, PlanTier } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const stored = getStored<User | null>('user', null);
    setUser(stored);
    setIsLoading(false);
  }, []);

  // Persist user changes
  useEffect(() => {
    if (user) {
      setStored('user', user);
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Check for demo account
      if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
        const userData = await simulateAPI(DEMO_USER, { failRate: 0 });
        setUser(userData);
        return;
      }
      // Check for previously signed-up accounts
      const stored = getStored<User | null>('user', null);
      if (stored && stored.email === email) {
        const userData = await simulateAPI(stored, { failRate: 0 });
        setUser(userData);
        return;
      }
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newUser: User = await simulateAPI({
        id: generateId(),
        email,
        firstName: '',
        lastName: '',
        company: '',
        plan: 'free' as PlanTier,
        onboardingCompleted: false,
        emailVerified: true, // auto-verify in mock
        createdAt: new Date().toISOString(),
      }, { failRate: 0 });
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate Google OAuth — creates new user or returns demo
      const userData = await simulateAPI({
        ...DEMO_USER,
        id: generateId(),
        onboardingCompleted: false,
      }, { delay: 1000, failRate: 0 });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeStored('user');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Step 2: Create RouteGuard component**

Create `src/components/RouteGuard.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/docs', '/blog'];
const AUTH_ROUTES = ['/login', '/signup'];
const ONBOARDING_ROUTES = ['/onboarding'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_ROUTES.some(r => pathname === r);
    const isAuthRoute = AUTH_ROUTES.some(r => pathname === r);
    const isOnboarding = pathname.startsWith('/onboarding');
    const isDashboard = pathname.startsWith('/dashboard');

    // Authenticated user on login/signup → redirect to dashboard
    if (isAuthenticated && isAuthRoute) {
      if (user && !user.onboardingCompleted) {
        router.replace('/onboarding/1');
      } else {
        router.replace('/dashboard');
      }
      return;
    }

    // Not authenticated on protected routes → redirect to login
    if (!isAuthenticated && (isOnboarding || isDashboard)) {
      router.replace('/login');
      return;
    }

    // Authenticated but onboarding not complete → redirect to onboarding
    if (isAuthenticated && isDashboard && user && !user.onboardingCompleted) {
      router.replace('/onboarding/1');
      return;
    }

    // Authenticated with onboarding complete on onboarding routes → redirect to dashboard
    if (isAuthenticated && isOnboarding && user && user.onboardingCompleted) {
      router.replace('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Show nothing while checking auth on protected routes
  if (isLoading) {
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
    if (isProtected) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
```

**Step 3: Wire AuthProvider into root layout**

Modify `src/app/layout.tsx`:
- Import `AuthProvider` from `@/contexts/AuthContext`
- Import `RouteGuard` from `@/components/RouteGuard`
- Wrap `{children}` with `<AuthProvider><RouteGuard>{children}</RouteGuard></AuthProvider>`

The body tag content should become:
```tsx
<body className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}>
  <AuthProvider>
    <RouteGuard>
      {children}
    </RouteGuard>
  </AuthProvider>
</body>
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/contexts/AuthContext.tsx src/components/RouteGuard.tsx src/app/layout.tsx
git commit -m "feat: add AuthContext, RouteGuard, and wire into root layout"
```

---

### Task 3: Wire Login & Signup Pages

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/signup/page.tsx`

**Step 1: Wire login page with AuthContext**

Modify `src/app/login/page.tsx`:

Key changes:
- Import `useAuth` from `@/contexts/AuthContext` and `useRouter` from `next/navigation`
- Add `isLoading`, `error` state variables
- Replace `e.preventDefault()` with actual login logic:
  ```typescript
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError('Google login failed');
    } finally {
      setIsLoading(false);
    }
  };
  ```
- Add error display above form (red text)
- Add loading state to submit button (spinner + "Signing in..." text, disabled while loading)
- Wire Google button onClick to `handleGoogle`

**Step 2: Wire signup page with AuthContext**

Modify `src/app/signup/page.tsx`:

Key changes — same pattern as login:
- Import `useAuth`, `useRouter`
- Add `isLoading`, `error` state
- Replace `e.preventDefault()` with signup logic:
  ```typescript
  const { signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup(email, password);
      router.push('/onboarding/1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };
  ```
- Signup goes to `/onboarding/1` instead of `/dashboard`
- Wire Google button, loading states, error display same as login

**Step 3: Verify in browser**

Run: `npm run dev`
Test:
1. Go to `/login` — submit with sara@techcorp.io / password123 → should redirect to `/dashboard`
2. Go to `/login` — submit with wrong password → should show error message
3. Go to `/signup` — submit with new email → should redirect to `/onboarding/1`
4. While logged in, visit `/login` → should redirect to `/dashboard`

**Step 4: Commit**

```bash
git add src/app/login/page.tsx src/app/signup/page.tsx
git commit -m "feat: wire login and signup pages with auth flow"
```

---

### Task 4: OnboardingContext + Onboarding Flow

**Files:**
- Create: `src/contexts/OnboardingContext.tsx`
- Modify: `src/app/onboarding/layout.tsx`
- Modify: `src/app/onboarding/1/page.tsx`
- Modify: `src/app/onboarding/2/page.tsx`
- Modify: `src/app/onboarding/3/page.tsx`
- Modify: `src/app/onboarding/4/page.tsx`

**Step 1: Create OnboardingContext**

Create `src/contexts/OnboardingContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { useAuth } from './AuthContext';
import type { CompanyProfile, OnboardingState, ScoringThresholds } from '@/lib/types';

const DEFAULT_THRESHOLDS: ScoringThresholds = {
  passedMin: 70,
  borderlineMin: 40,
  blockRejected: false,
  rejectionMessage: 'Sorry, we could not verify your submission. Please try again or contact support.',
};

const DEFAULT_STATE: OnboardingState = {
  currentStep: 1,
  completedSteps: [],
  companyProfile: null,
  snippetVerified: false,
  crmConnected: null,
  thresholds: DEFAULT_THRESHOLDS,
};

interface OnboardingContextType {
  state: OnboardingState;
  isLoading: boolean;
  saveCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  verifySnippet: () => Promise<boolean>;
  connectCRM: (provider: string) => Promise<void>;
  skipCRM: () => void;
  saveThresholds: (thresholds: ScoringThresholds) => Promise<void>;
  completeStep: (step: number) => void;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { updateUser } = useAuth();
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stored = getStored<OnboardingState>('onboarding', DEFAULT_STATE);
    setState(stored);
  }, []);

  useEffect(() => {
    setStored('onboarding', state);
  }, [state]);

  const completeStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(step) ? prev.completedSteps : [...prev.completedSteps, step],
      currentStep: Math.max(prev.currentStep, step + 1),
    }));
  }, []);

  const saveCompanyProfile = useCallback(async (profile: CompanyProfile) => {
    setIsLoading(true);
    try {
      await simulateAPI(profile, { failRate: 0 });
      setState(prev => ({ ...prev, companyProfile: profile }));
      completeStep(1);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const verifySnippet = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { delay: 1500, failRate: 0 });
      setState(prev => ({ ...prev, snippetVerified: true }));
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectCRM = useCallback(async (provider: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(provider, { delay: 1500, failRate: 0 });
      setState(prev => ({ ...prev, crmConnected: provider }));
      completeStep(3);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const skipCRM = useCallback(() => {
    completeStep(3);
  }, [completeStep]);

  const saveThresholds = useCallback(async (thresholds: ScoringThresholds) => {
    setIsLoading(true);
    try {
      await simulateAPI(thresholds, { failRate: 0 });
      setState(prev => ({ ...prev, thresholds }));
      completeStep(4);
    } finally {
      setIsLoading(false);
    }
  }, [completeStep]);

  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    try {
      await simulateAPI(true, { failRate: 0 });
      updateUser({ onboardingCompleted: true });
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  return (
    <OnboardingContext.Provider value={{
      state, isLoading, saveCompanyProfile, verifySnippet,
      connectCRM, skipCRM, saveThresholds, completeStep, completeOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}
```

**Step 2: Wire OnboardingProvider into onboarding layout**

Modify `src/app/onboarding/layout.tsx`:
- Import `OnboardingProvider`
- Wrap children with `<OnboardingProvider>{children}</OnboardingProvider>`
- Update step indicator to use onboarding context (show completed steps with checkmarks)

**Step 3: Wire onboarding step 1 (Company Profile)**

Modify `src/app/onboarding/1/page.tsx`:
- Import `useOnboarding` and `useRouter`
- Replace the static "Continue" link with a form submit handler:
  ```typescript
  const { saveCompanyProfile, isLoading } = useOnboarding();
  const router = useRouter();

  const handleContinue = async () => {
    await saveCompanyProfile({ companyName, website, teamSize, crm });
    router.push('/onboarding/2');
  };
  ```
- Add form validation (company name required, website required)
- Add loading state to Continue button
- Replace `<Link>` with `<button onClick={handleContinue}>`

**Step 4: Wire onboarding step 2 (Install Snippet)**

Modify `src/app/onboarding/2/page.tsx`:
- Import `useOnboarding`, `useRouter`
- Wire "Test Installation" button to `verifySnippet()`:
  ```typescript
  const { verifySnippet, state, isLoading, completeStep } = useOnboarding();
  const [verified, setVerified] = useState(state.snippetVerified);

  const handleTest = async () => {
    const result = await verifySnippet();
    setVerified(result);
  };

  const handleContinue = () => {
    completeStep(2);
    router.push('/onboarding/3');
  };
  ```
- Show green checkmark after verification
- "Continue" button enabled only after verification (or allow skip)

**Step 5: Wire onboarding step 3 (Connect CRM)**

Modify `src/app/onboarding/3/page.tsx`:
- Import `useOnboarding`, `useRouter`
- Wire CRM card clicks to `connectCRM(provider)`:
  ```typescript
  const { connectCRM, skipCRM, isLoading, state } = useOnboarding();

  const handleConnect = async (provider: string) => {
    await connectCRM(provider);
    router.push('/onboarding/4');
  };

  const handleSkip = () => {
    skipCRM();
    router.push('/onboarding/4');
  };
  ```
- Show loading state on the clicked CRM card
- Show "Connected" badge if already connected

**Step 6: Wire onboarding step 4 (Scoring Thresholds)**

Modify `src/app/onboarding/4/page.tsx`:
- Import `useOnboarding`, `useRouter`
- Wire "Finish Setup" to complete onboarding:
  ```typescript
  const { saveThresholds, completeOnboarding, isLoading, state } = useOnboarding();

  const handleFinish = async () => {
    await saveThresholds({
      passedMin: 70,
      borderlineMin: 40,
      blockRejected,
      rejectionMessage: '',
    });
    await completeOnboarding();
    router.push('/dashboard');
  };
  ```
- Add loading state to Finish button

**Step 7: Verify in browser**

Run: `npm run dev`
Test the complete flow:
1. Go to `/signup` → create account → redirected to `/onboarding/1`
2. Fill company profile → Continue → step 2
3. Click "Test Installation" → see verification animation → Continue → step 3
4. Click a CRM or Skip → step 4
5. Click "Finish Setup" → redirected to `/dashboard`
6. Refresh → should stay on `/dashboard` (onboarding marked complete)
7. Visit `/onboarding/1` while logged in with completed onboarding → redirected to `/dashboard`

**Step 8: Commit**

```bash
git add src/contexts/OnboardingContext.tsx src/app/onboarding/
git commit -m "feat: wire onboarding flow with context and step progression"
```

---

### Task 5: ValidationContext + Dashboard Wiring

**Files:**
- Create: `src/contexts/ValidationContext.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add provider, wire user info)
- Modify: `src/app/dashboard/page.tsx` (use context instead of hardcoded data)
- Modify: `src/app/dashboard/validations/page.tsx`
- Modify: `src/app/dashboard/analytics/page.tsx`
- Modify: `src/components/ValidationDrawer.tsx` (add override callback)

**Step 1: Create ValidationContext**

Create `src/contexts/ValidationContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { simulateAPI } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateValidations, generateValidation, generateDashboardStats, generateChartData } from '@/lib/mock-data';
import type { Validation, DashboardStats, ChartDataPoint, ValidationStatus, ScoringThresholds } from '@/lib/types';

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

  // Initialize data
  useEffect(() => {
    const stored = getStored<Validation[]>('validations', []);
    const data = stored.length > 0 ? stored : generateValidations(50);
    setValidations(data);
    setStats(generateDashboardStats(data));
    setChartData(generateChartData(7));
    setIsLoading(false);
    if (stored.length === 0) setStored('validations', data);
  }, []);

  // Realtime simulation: new validation every 15-30s
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

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fetchValidations = useCallback(async (filters?: ValidationFilters) => {
    setIsLoading(true);
    try {
      let filtered = [...validations];
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(v =>
          v.email.toLowerCase().includes(q) ||
          v.company.toLowerCase().includes(q) ||
          v.source.toLowerCase().includes(q)
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
```

**Step 2: Wire ValidationProvider into dashboard layout**

Modify `src/app/dashboard/layout.tsx`:
- Import `ValidationProvider` from `@/contexts/ValidationContext`
- Import `useAuth` from `@/contexts/AuthContext`
- Wrap content: `<ValidationProvider><ToastProvider>...content...</ToastProvider></ValidationProvider>`
- Replace hardcoded "Sara Martinez" and "Starter Plan" in the sidebar with `user?.firstName + ' ' + user?.lastName` and plan info from auth context
- Wire logout button in user menu

**Step 3: Refactor dashboard overview page**

Modify `src/app/dashboard/page.tsx`:
- Remove all hardcoded mock data (lines 12-173)
- Import `useValidations` hook
- Use `stats`, `chartData`, `validations` from context:
  ```typescript
  const { stats, chartData, validations, isLoading, overrideValidation, exportCSV } = useValidations();
  const recentValidations = validations.slice(0, 5);
  ```
- Wire "Export" button to `exportCSV()`
- Wire validation row clicks to open drawer with real data from context
- Wire override button in drawer to `overrideValidation(id)`
- Add loading skeleton while `isLoading` is true
- Keep existing chart rendering logic but use context data

**Step 4: Refactor validations page**

Modify `src/app/dashboard/validations/page.tsx`:
- Remove hardcoded mock data (lines 22-285)
- Import `useValidations`
- Use context data, wire filter controls to `fetchValidations(filters)`
- Wire row clicks to drawer with real validation detail from `getValidation(id)`
- Wire export button to `exportCSV()`
- Wire override in drawer to `overrideValidation(id)` + toast
- Keep existing table structure and pagination

**Step 5: Refactor analytics page**

Modify `src/app/dashboard/analytics/page.tsx`:
- Remove hardcoded data (lines 3-23)
- Import `useValidations`
- Use `stats`, `chartData`, `rejectionReasons` from context
- Calculate stat cards from `stats`:
  ```typescript
  const totalValidated = stats.validationsMonth;
  const passed = Math.round(totalValidated * stats.passRate / 100);
  const borderline = Math.round(totalValidated * 0.25);
  const rejected = totalValidated - passed - borderline;
  ```

**Step 6: Update ValidationDrawer override callback**

Modify `src/components/ValidationDrawer.tsx`:
- Add `onOverride?: (id: string) => void` to props interface
- Wire the "Override: Accept" button to call `onOverride?.(validation.id)` instead of being static
- After override, show "Overridden" badge with green styling
- Show loading spinner on override button during the async operation

**Step 7: Verify in browser**

Run: `npm run dev`
Test:
1. Login → dashboard shows real-ish data from context
2. Click a validation row → drawer opens with signal breakdown
3. Click "Override: Accept" on borderline → toast + badge update
4. Click "Export" → CSV downloads
5. Wait 15-30s → new validation appears at top of list
6. Navigate to Validations page → see full log with working filters
7. Navigate to Analytics → see charts and stats

**Step 8: Commit**

```bash
git add src/contexts/ValidationContext.tsx src/app/dashboard/ src/components/ValidationDrawer.tsx
git commit -m "feat: wire dashboard, validations, and analytics with ValidationContext"
```

---

### Task 6: BillingContext + Upgrade Flow

**Files:**
- Create: `src/contexts/BillingContext.tsx`
- Create: `src/components/UpgradeModal.tsx`
- Modify: `src/app/dashboard/settings/billing/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add BillingProvider, wire upgrade box)

**Step 1: Create BillingContext**

Create `src/contexts/BillingContext.tsx`:

```typescript
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
      const newUsage = {
        used: usage.used,
        limit: newPlan.validationLimit === Infinity ? 999999 : newPlan.validationLimit,
        percentage: 0,
      };
      newUsage.percentage = Math.round((newUsage.used / newUsage.limit) * 1000) / 10;
      setUsage(newUsage);
      setStored('usage', newUsage);

      // Add new invoice
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
```

**Step 2: Create UpgradeModal component**

Create `src/components/UpgradeModal.tsx`:

A modal that shows pricing tiers within the dashboard. Features:
- Shows all 4 plan tiers with pricing
- Current plan highlighted with "Current" badge
- "Upgrade" button on higher tiers, "Downgrade" on lower
- Simulated checkout: clicking "Upgrade" shows loading → success state
- Uses `useBilling().upgradePlan(tier)` for the actual upgrade
- Closes with success toast on completion

Key structure:
```typescript
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```
- Uses existing Modal component pattern
- Plan cards in a 2x2 or 4-column grid
- Each shows: name, price, feature list, CTA button
- Loading state on the selected plan's button during checkout

**Step 3: Wire billing page**

Modify `src/app/dashboard/settings/billing/page.tsx`:
- Remove hardcoded invoice data (lines 3-7)
- Import `useBilling`, `useAuth`
- Use `currentPlan`, `usage`, `invoices` from context
- Add state for upgrade modal: `const [showUpgrade, setShowUpgrade] = useState(false)`
- Wire "Change Plan" button to open UpgradeModal
- Wire "Cancel Subscription" to `cancelPlan()` with confirmation modal
- Display real plan name, price, usage percentage from context

**Step 4: Wire upgrade box in dashboard sidebar**

Modify `src/app/dashboard/layout.tsx`:
- Import `BillingProvider`, `useBilling`
- Add `BillingProvider` to provider stack
- In sidebar upgrade box (around line 140-151): show usage bar from `useBilling()`
- Show upgrade warning banner when `isNearLimit` is true
- Wire "Upgrade" link to open UpgradeModal

**Step 5: Verify in browser**

Test:
1. Dashboard sidebar shows usage bar with real numbers
2. Click "Upgrade" → modal opens with plan tiers
3. Select a plan → loading animation → success toast → modal closes
4. Billing page shows updated plan and new invoice
5. Click "Cancel Subscription" → confirm → downgraded to Free
6. Usage bar updates to reflect new limits

**Step 6: Commit**

```bash
git add src/contexts/BillingContext.tsx src/components/UpgradeModal.tsx src/app/dashboard/settings/billing/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: add billing context, upgrade modal, and wire billing page"
```

---

### Task 7: IntegrationContext + Integrations Page

**Files:**
- Create: `src/contexts/IntegrationContext.tsx`
- Modify: `src/app/dashboard/integrations/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add IntegrationProvider)

**Step 1: Create IntegrationContext**

Create `src/contexts/IntegrationContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
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
```

**Step 2: Wire integrations page**

Modify `src/app/dashboard/integrations/page.tsx`:
- Remove the hardcoded `initialIntegrations` data and inline state management
- Import `useIntegrations`
- Use `connections` from context to render CRM cards
- Wire "Connect" buttons to `connectCRM(provider)` — show loading spinner on the clicked card
- Wire "Disconnect" to `disconnectCRM(id)` with confirmation
- Wire "Configure" to open the field mapping modal using `fieldMappings` from context
- Wire "Save Mapping" to `saveFieldMappings()`
- Wire "Test Connection" to `testConnection(id)` — show result toast
- Keep existing card layout and styling

**Step 3: Add IntegrationProvider to dashboard layout**

Modify `src/app/dashboard/layout.tsx`:
- Import `IntegrationProvider`
- Add to provider stack

**Step 4: Verify in browser**

Test:
1. Go to Integrations → see CRM cards with HubSpot connected
2. Click "Connect" on Salesforce → loading → connected with green badge
3. Click "Configure" → field mapping modal → save mappings
4. Click "Disconnect" → confirm → disconnected
5. Refresh → state persisted

**Step 5: Commit**

```bash
git add src/contexts/IntegrationContext.tsx src/app/dashboard/integrations/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: wire integrations page with CRM connect/disconnect flow"
```

---

### Task 8: TeamContext + Team Page

**Files:**
- Create: `src/contexts/TeamContext.tsx`
- Modify: `src/app/dashboard/settings/team/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add TeamProvider)

**Step 1: Create TeamContext**

Create `src/contexts/TeamContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateTeamMembers } from '@/lib/mock-data';
import type { TeamMember } from '@/lib/types';

interface TeamContextType {
  members: TeamMember[];
  isLoading: boolean;
  inviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateRole: (id: string, role: TeamMember['role']) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | null>(null);

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMembers(getStored('team', generateTeamMembers()));
  }, []);

  const inviteMember = useCallback(async (email: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const newMember: TeamMember = {
        id: generateId(),
        name,
        email,
        initials,
        role,
        status: 'Pending',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      setMembers(prev => {
        const updated = [...prev, newMember];
        setStored('team', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setMembers(prev => {
        const updated = prev.filter(m => m.id !== id);
        setStored('team', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setMembers(prev => {
        const updated = prev.map(m => m.id === id ? { ...m, role } : m);
        setStored('team', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <TeamContext.Provider value={{ members, isLoading, inviteMember, removeMember, updateRole }}>
      {children}
    </TeamContext.Provider>
  );
}
```

**Step 2: Wire team page**

Modify `src/app/dashboard/settings/team/page.tsx`:
- Remove hardcoded members data (lines 5-30)
- Import `useTeam`, `useToast`
- Use `members` from context
- Wire invite form:
  ```typescript
  const { members, inviteMember, removeMember, isLoading } = useTeam();
  const { addToast } = useToast();

  const handleInvite = async () => {
    if (!inviteEmail) return;
    await inviteMember(inviteEmail, inviteRole as TeamMember['role']);
    addToast('Invite sent to ' + inviteEmail, 'success');
    setInviteEmail('');
  };
  ```
- Wire remove button on each member row (except Owner)
- Add loading state to "Send Invite" button
- Keep existing table layout

**Step 3: Add TeamProvider to dashboard layout**

**Step 4: Verify and commit**

```bash
git add src/contexts/TeamContext.tsx src/app/dashboard/settings/team/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: wire team management with invite, remove, and role update"
```

---

### Task 9: SettingsContext + Settings Pages

**Files:**
- Create: `src/contexts/SettingsContext.tsx`
- Modify: `src/app/dashboard/settings/page.tsx` (profile)
- Modify: `src/app/dashboard/settings/scoring/page.tsx`
- Modify: `src/app/dashboard/settings/api/page.tsx`
- Modify: `src/app/dashboard/settings/snippet/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add SettingsProvider)

**Step 1: Create SettingsContext**

Create `src/contexts/SettingsContext.tsx` managing:
- Profile data (firstName, lastName, email, company)
- Notification preferences
- Scoring thresholds (passedMin, borderlineMin, blockRejected, rejectionMessage)
- API keys (liveKey, testKey — masked display)
- Webhook config (URL, events, active)

Methods: `updateProfile`, `updateNotifications`, `updateScoring`, `regenerateApiKey`, `saveWebhook`, `testWebhook`, `deleteAccount`

All with `simulateAPI` wrappers and localStorage persistence.

**Step 2: Wire settings profile page**

Modify `src/app/dashboard/settings/page.tsx`:
- Remove hardcoded `initialForm` (lines 7-12)
- Import `useSettings`, `useAuth`, `useToast`
- Use profile data from context
- Wire Save button:
  ```typescript
  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile(form);
    addToast('Profile updated', 'success');
    setIsSaving(false);
  };
  ```
- Wire Delete Account → `deleteAccount()` → `logout()` → redirect to `/`
- Add loading spinner to Save button
- Show unsaved changes indicator

**Step 3: Wire scoring page**

Modify `src/app/dashboard/settings/scoring/page.tsx`:
- Import `useSettings`, `useToast`
- Use `scoring` from context for threshold values
- Make thresholds editable (range inputs or draggable)
- Wire live preview to recalculate based on current threshold values
- Wire Save button to `updateScoring(thresholds)` + toast

**Step 4: Wire API keys page**

Modify `src/app/dashboard/settings/api/page.tsx`:
- Import `useSettings`, `useToast`
- Use `apiKeys` and `webhookConfig` from context
- Wire copy buttons to clipboard API + toast
- Wire "Regenerate" to `regenerateApiKey()` with confirmation modal
- Wire webhook Save to `saveWebhook(config)` + toast
- Wire "Send Test Event" to `testWebhook()` + result toast

**Step 5: Wire snippet page**

Modify `src/app/dashboard/settings/snippet/page.tsx`:
- Import `useOnboarding` (for verifySnippet)
- Wire "Test Installation" to `verifySnippet()` — show loading then result
- Keep existing code block and platform tabs

**Step 6: Add SettingsProvider to dashboard layout**

**Step 7: Verify and commit**

```bash
git add src/contexts/SettingsContext.tsx src/app/dashboard/settings/
git commit -m "feat: wire all settings pages with context (profile, scoring, API, snippet)"
```

---

### Task 10: Sources Page Wiring

**Files:**
- Create: `src/contexts/SourcesContext.tsx`
- Modify: `src/app/dashboard/sources/page.tsx`
- Modify: `src/app/dashboard/layout.tsx` (add SourcesProvider)

**Step 1: Create SourcesContext**

Create `src/contexts/SourcesContext.tsx` managing:
- `sources: FormSource[]` list
- Methods: `addSource`, `updateSource`, `deleteSource`, `toggleSourceStatus`
- All with `simulateAPI` wrappers and localStorage persistence
- Uses `generateSources()` as default data

**Step 2: Wire sources page**

Modify `src/app/dashboard/sources/page.tsx`:
- Remove hardcoded `defaultSources` (lines 7-61)
- Import `useSources`, `useToast`
- Wire "Add Source" form to `addSource(data)` + toast
- Wire edit modal Save to `updateSource(id, data)` + toast
- Wire delete to `deleteSource(id)` with confirmation + toast
- Add loading states to buttons

**Step 3: Add provider and verify**

**Step 4: Commit**

```bash
git add src/contexts/SourcesContext.tsx src/app/dashboard/sources/page.tsx src/app/dashboard/layout.tsx
git commit -m "feat: wire sources page with add, edit, and delete flows"
```

---

### Task 11: Homepage CTA Wiring + Navigation Polish

**Files:**
- Modify: `src/app/page.tsx` (homepage)
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/Footer.tsx`

**Step 1: Wire homepage CTAs**

Modify `src/app/page.tsx`:
- "Start for free" buttons → link to `/signup`
- "See how it works" → smooth scroll to `#how-it-works`
- Pricing tier CTAs → link to `/signup`
- "Talk to sales" → link to `mailto:` or a contact form

**Step 2: Wire Nav component**

Modify `src/components/Nav.tsx`:
- Import `useAuth`
- If authenticated: show "Dashboard" link instead of "Login" / "Sign up"
- If authenticated: show user avatar/initial + logout option
- Mobile menu: same conditional rendering

**Step 3: Wire Footer links**

Modify `src/components/Footer.tsx`:
- Docs → `/dashboard/settings/docs`
- API → `/dashboard/settings/api`
- Pricing → `/pricing`
- All links use Next.js `Link` component

**Step 4: Verify all cross-page navigation**

Run through every link and button in the app to verify they navigate correctly.

**Step 5: Commit**

```bash
git add src/app/page.tsx src/components/Nav.tsx src/components/Footer.tsx
git commit -m "feat: wire homepage CTAs and navigation for authenticated/unauthenticated states"
```

---

### Task 12: Final Polish + Realtime Simulation

**Files:**
- Modify: `src/app/dashboard/page.tsx` (realtime animation)
- Modify: `src/app/dashboard/layout.tsx` (usage warning banner)
- Various pages (loading skeletons)

**Step 1: Add entry animation for new validations**

On the dashboard overview, when a new validation arrives via the interval:
- Slide-in animation from right (use existing `slideRight` keyframe from globals.css)
- Brief highlight glow on the new row
- Counter animations on stats cards

**Step 2: Add usage limit warning banner**

In dashboard layout, when `isNearLimit` from BillingContext:
- Show a dismissible banner at top of main content: "You've used 240 of 250 validations this month. Upgrade to keep validating."
- Banner has "Upgrade" button → opens UpgradeModal
- Banner can be dismissed for the session

**Step 3: Add loading skeletons**

For each page that loads data, add a pulse/skeleton animation while `isLoading`:
- Dashboard: 4 skeleton metric cards + skeleton chart
- Validations: skeleton table rows
- Analytics: skeleton stat cards + skeleton chart

Use Tailwind's `animate-pulse` with gray placeholder divs.

**Step 4: Final verification**

Run through the complete user journey:
1. `/` → "Start for free" → `/signup` → fill form → `/onboarding/1`
2. Complete all 4 onboarding steps → `/dashboard`
3. Explore dashboard, validations, analytics
4. Override a borderline validation
5. Export CSV
6. Connect a CRM
7. Invite a team member
8. Change scoring thresholds
9. Upgrade plan
10. Update profile
11. Logout → `/` → "Log in" → `/login` → login with same account → `/dashboard`

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add realtime simulation, loading skeletons, and final polish"
```
