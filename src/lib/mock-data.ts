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

  const rejected = month.filter(v => v.status === 'Rejected');

  return {
    totalValidations: month.length,
    passRate: month.length > 0 ? Math.round((passed.length / month.length) * 100) : 0,
    avgScore,
    rejected: rejected.length,
    totalChange: randomBetween(5, 25),
    passRateChange: randomBetween(-3, 5),
    avgScoreChange: randomBetween(-2, 4),
    rejectedChange: randomBetween(-10, 10),
  };
}

export function generateChartData(days: number = 7): ChartDataPoint[] {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      date: date.toISOString().split('T')[0],
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
    { id: 'src_1', title: 'Main Website', domain: 'techcorp.io', status: 'Active', description: 'Primary marketing site contact form', submissions: 1247, passRate: 78, avgScore: 72, lastSubmission: '2 min ago', snippetId: 'bnc_7f3a9e2b1d4c6f80' },
    { id: 'src_2', title: 'Landing Page', domain: 'techcorp.io/demo', status: 'Active', description: 'Product demo request form', submissions: 834, passRate: 85, avgScore: 81, lastSubmission: '15 min ago', snippetId: 'bnc_2e8b4a1c9d0f5e73' },
    { id: 'src_3', title: 'Blog CTA', domain: 'blog.techcorp.io', status: 'Active', description: 'Newsletter signup on blog', submissions: 2156, passRate: 62, avgScore: 58, lastSubmission: '1 hour ago', snippetId: 'bnc_5c1d8e4f2a7b0936' },
    { id: 'src_4', title: 'Webinar Registration', domain: 'events.techcorp.io', status: 'Paused', description: 'Webinar signup form', submissions: 412, passRate: 91, avgScore: 88, lastSubmission: '3 days ago', snippetId: 'bnc_9a0e3b7c6d2f1845' },
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
