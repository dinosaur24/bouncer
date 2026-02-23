import type { FieldMapping } from '@/lib/types';

export interface LeadPayload {
  validationId: string;
  email: string;
  phone: string | null;
  company: string | null;
  ip: string | null;
  score: number;
  status: string;
  signals: unknown[];
  timestamp: string;
}

export interface MappedLead {
  [crmField: string]: string | number | null;
}

export interface PushResult {
  success: boolean;
  error?: string;
  externalId?: string;
}

export interface CRMAdapter {
  push(
    connectionId: string,
    lead: MappedLead,
    rawLead: LeadPayload,
  ): Promise<PushResult>;
}

const BOUNCER_FIELD_MAP: Record<string, keyof LeadPayload> = {
  'Email': 'email',
  'Phone': 'phone',
  'Lead Score': 'score',
  'Company': 'company',
  'Validation Status': 'status',
};

export function applyFieldMappings(
  lead: LeadPayload,
  mappings: FieldMapping[],
): MappedLead {
  const mapped: MappedLead = {};
  for (const mapping of mappings) {
    if (!mapping.enabled) continue;
    const key = BOUNCER_FIELD_MAP[mapping.bouncerField];
    if (key && key in lead) {
      mapped[mapping.crmField] = lead[key] as string | number | null;
    }
  }
  return mapped;
}
