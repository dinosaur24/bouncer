import type { SignalResult, SignalType, ScoringThresholds, ValidationStatus } from './types';
import type { PlanTier } from './types';
import { scoreEmail, scorePhone, scoreIp, scoreCompany, neutralSignal } from './signal-scoring';

const ABSTRACT_API_TIMEOUT_MS = 3000;

const SIGNAL_WEIGHTS: Record<SignalType, number> = {
  email: 0.40,
  company: 0.25,
  phone: 0.20,
  ip: 0.15,
};

const SIGNAL_NAMES: Record<SignalType, string> = {
  email: 'Email Verification',
  phone: 'Phone Validation',
  ip: 'IP Risk Analysis',
  company: 'Company Domain',
};

function getAvailableSignals(plan: PlanTier): SignalType[] {
  if (plan === 'free') return ['email'];
  return ['email', 'phone', 'ip', 'company'];
}

async function callAbstractAPI(
  endpoint: string,
  apiKey: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const url = new URL(endpoint);
  url.searchParams.set('api_key', apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ABSTRACT_API_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

async function safeCallAndScore(
  type: SignalType,
  apiCall: () => Promise<Record<string, unknown>>,
  scoreFn: (data: Record<string, unknown>) => SignalResult,
): Promise<SignalResult> {
  try {
    const data = await apiCall();
    return scoreFn(data);
  } catch {
    return neutralSignal(type, SIGNAL_NAMES[type]);
  }
}

function computeOverallScore(signals: SignalResult[]): number {
  if (signals.length === 0) return 50;

  let totalWeight = 0;
  for (const s of signals) {
    totalWeight += SIGNAL_WEIGHTS[s.type];
  }

  let weightedSum = 0;
  for (const s of signals) {
    weightedSum += s.score * (SIGNAL_WEIGHTS[s.type] / totalWeight);
  }

  return Math.round(weightedSum);
}

export function determineStatus(
  score: number,
  thresholds: ScoringThresholds,
): ValidationStatus {
  if (score >= thresholds.passedMin) return 'Passed';
  if (score >= thresholds.borderlineMin) return 'Borderline';
  return 'Rejected';
}

const API_KEYS: Record<SignalType, string> = {
  email: 'ABSTRACT_EMAIL_API_KEY',
  phone: 'ABSTRACT_PHONE_API_KEY',
  ip: 'ABSTRACT_IP_API_KEY',
  company: 'ABSTRACT_COMPANY_API_KEY',
};

export async function runValidation(
  input: { email: string; phone?: string; ip?: string; companyDomain?: string },
  plan: PlanTier,
): Promise<{ overallScore: number; signals: SignalResult[] }> {
  const availableSignals = getAvailableSignals(plan);
  const signalPromises: Promise<SignalResult>[] = [];

  if (availableSignals.includes('email') && input.email) {
    const key = process.env[API_KEYS.email];
    if (key) {
      signalPromises.push(
        safeCallAndScore(
          'email',
          () => callAbstractAPI('https://emailvalidation.abstractapi.com/v1/', key, { email: input.email }),
          scoreEmail,
        ),
      );
    }
  }

  if (availableSignals.includes('phone') && input.phone) {
    const key = process.env[API_KEYS.phone];
    if (key) {
      signalPromises.push(
        safeCallAndScore(
          'phone',
          () => callAbstractAPI('https://phonevalidation.abstractapi.com/v1/', key, { phone: input.phone! }),
          scorePhone,
        ),
      );
    }
  }

  if (availableSignals.includes('ip') && input.ip) {
    const key = process.env[API_KEYS.ip];
    if (key) {
      signalPromises.push(
        safeCallAndScore(
          'ip',
          () => callAbstractAPI('https://ipgeolocation.abstractapi.com/v1/', key, { ip_address: input.ip! }),
          scoreIp,
        ),
      );
    }
  }

  if (availableSignals.includes('company') && input.companyDomain) {
    const key = process.env[API_KEYS.company];
    if (key) {
      signalPromises.push(
        safeCallAndScore(
          'company',
          () => callAbstractAPI('https://companyenrichment.abstractapi.com/v1/', key, { domain: input.companyDomain! }),
          scoreCompany,
        ),
      );
    }
  }

  const signals = await Promise.all(signalPromises);
  const overallScore = computeOverallScore(signals);

  return { overallScore, signals };
}
