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
