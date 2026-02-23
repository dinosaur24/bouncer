import type { SignalResult, SignalType, SignalStatus } from './types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function statusFromScore(score: number): SignalStatus {
  if (score >= 70) return 'pass';
  if (score >= 40) return 'warn';
  return 'fail';
}

function labelFromScore(score: number): string {
  if (score >= 70) return 'Valid';
  if (score >= 40) return 'Suspicious';
  return 'Invalid';
}

export function neutralSignal(type: SignalType, name: string): SignalResult {
  return {
    type,
    name,
    score: 50,
    status: 'warn',
    label: 'Unknown',
    detail: 'Validation service unavailable — scored as neutral',
  };
}

// --- Email Validation ---
// Abstract API: deliverability, is_valid_format, is_disposable_email, is_role_email,
// is_free_email, is_mx_found, is_smtp_valid

export function scoreEmail(data: Record<string, unknown>): SignalResult {
  let score = 50;

  const deliverability = data.deliverability as string | undefined;
  if (deliverability === 'DELIVERABLE') score += 25;
  else if (deliverability === 'RISKY') score += 10;
  else if (deliverability === 'UNDELIVERABLE') score -= 25;

  if (data.is_smtp_valid === true) score += 10;
  else if (data.is_smtp_valid === false) score -= 15;

  if (data.is_mx_found === true) score += 5;
  else if (data.is_mx_found === false) score -= 20;

  if (data.is_disposable_email === true) score -= 20;
  if (data.is_role_email === true) score -= 5;
  if (data.is_free_email === true) score -= 3;

  score = clamp(score, 0, 100);

  let detail: string;
  if (data.is_disposable_email === true) detail = 'Disposable email address detected';
  else if (data.is_smtp_valid === false) detail = 'Mailbox could not be verified via SMTP';
  else if (score >= 70) detail = 'Valid mailbox, no disposable domain';
  else if (score >= 40) detail = 'Mailbox exists but domain has low reputation';
  else detail = 'Invalid or undeliverable email address';

  return {
    type: 'email',
    name: 'Email Verification',
    score,
    status: statusFromScore(score),
    label: labelFromScore(score),
    detail,
  };
}

// --- Phone Validation ---
// Abstract API: valid, type (mobile/landline/voip/toll_free), carrier, country

export function scorePhone(data: Record<string, unknown>): SignalResult {
  let score = 50;

  if (data.valid === true) score += 30;
  else if (data.valid === false) score -= 40;

  const phoneType = (data.type as string)?.toLowerCase();
  if (phoneType === 'mobile') score += 10;
  else if (phoneType === 'landline') score += 5;
  else if (phoneType === 'voip') score -= 10;
  else if (phoneType === 'toll_free') score -= 5;

  if (data.carrier && typeof data.carrier === 'string' && data.carrier.length > 0) score += 5;

  const country = data.country as Record<string, unknown> | undefined;
  if (country?.code) score += 5;

  score = clamp(score, 0, 100);

  let detail: string;
  if (data.valid === false) detail = 'Invalid or disconnected number';
  else if (phoneType === 'voip') detail = 'VoIP number detected — may be temporary';
  else if (score >= 70) detail = `Valid ${phoneType || 'phone'} number, carrier confirmed`;
  else if (score >= 40) detail = 'Number exists but carrier unverified';
  else detail = 'Invalid or disconnected number';

  return {
    type: 'phone',
    name: 'Phone Validation',
    score,
    status: statusFromScore(score),
    label: labelFromScore(score),
    detail,
  };
}

// --- IP Geolocation ---
// Abstract API: security.is_vpn, security.is_proxy, security.is_tor,
// security.is_known_attacker, security.is_known_abuser, connection.connection_type

export function scoreIp(data: Record<string, unknown>): SignalResult {
  let score = 70;

  const security = (data.security as Record<string, unknown>) || {};
  if (security.is_vpn === true) score -= 30;
  if (security.is_tor === true) score -= 35;
  if (security.is_proxy === true) score -= 25;
  if (security.is_known_attacker === true) score -= 30;
  if (security.is_known_abuser === true) score -= 20;

  const connection = (data.connection as Record<string, unknown>) || {};
  const connType = (connection.connection_type as string)?.toLowerCase() || '';
  if (connType.includes('corporate') || connType.includes('business')) score += 5;
  else if (connType.includes('hosting') || connType.includes('data center')) score -= 10;

  score = clamp(score, 0, 100);

  let detail: string;
  if (security.is_vpn === true || security.is_proxy === true) detail = 'VPN or proxy detected';
  else if (security.is_tor === true) detail = 'Tor exit node detected';
  else if (security.is_known_attacker === true) detail = 'IP flagged as known attacker';
  else if (score >= 70) detail = 'Clean IP, no VPN/proxy detected';
  else if (score >= 40) detail = 'IP from shared hosting or datacenter';
  else detail = 'High-risk IP: VPN/proxy/Tor detected';

  return {
    type: 'ip',
    name: 'IP Risk Analysis',
    score,
    status: statusFromScore(score),
    label: labelFromScore(score),
    detail,
  };
}

// --- Company Enrichment ---
// Abstract API: name, domain, year_founded, industry, employees_count,
// linkedin_url, locality, country

export function scoreCompany(data: Record<string, unknown>): SignalResult {
  let score = 30;

  if (data.name && typeof data.name === 'string' && data.name.length > 0) score += 20;
  if (data.domain && typeof data.domain === 'string' && data.domain.length > 0) score += 15;
  if (data.year_founded) score += 10;
  if (typeof data.employees_count === 'number' && data.employees_count > 0) score += 10;
  if (data.linkedin_url && typeof data.linkedin_url === 'string' && data.linkedin_url.length > 0) score += 5;
  if (data.industry && typeof data.industry === 'string' && data.industry.length > 0) score += 5;
  if (data.locality && typeof data.locality === 'string' && data.locality.length > 0) score += 5;

  score = clamp(score, 0, 100);

  let detail: string;
  if (score >= 70) detail = 'Active domain with business presence';
  else if (score >= 40) detail = 'Domain exists but limited business info';
  else detail = 'Domain not found or minimal company data';

  return {
    type: 'company',
    name: 'Company Domain',
    score,
    status: statusFromScore(score),
    label: labelFromScore(score),
    detail,
  };
}
