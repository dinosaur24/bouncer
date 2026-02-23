import { after } from 'next/server';
import { supabase } from '@/lib/supabase';
import { runValidation, determineStatus } from '@/lib/validation-engine';
import { PLAN_VALIDATION_LIMITS } from '@/lib/plan-limits';
import { pushLeadToAllCRMs } from '@/lib/crm';
import type { PlanTier, ScoringThresholds } from '@/lib/types';
import type { LeadPayload } from '@/lib/crm/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function corsJson(data: unknown, status = 200) {
  return Response.json(data, { status, headers: corsHeaders });
}

function corsError(message: string, status = 400) {
  return Response.json({ error: message }, { status, headers: corsHeaders });
}

async function updateFormStats(formId: string, newScore: number, newStatus: string) {
  const { data: form } = await supabase
    .from('forms')
    .select('validations_count, pass_rate, avg_score')
    .eq('id', formId)
    .single();

  if (!form) return;

  const oldCount = form.validations_count;
  const newCount = oldCount + 1;
  const newAvgScore = Math.round(((form.avg_score * oldCount) + newScore) / newCount * 100) / 100;
  const oldPassedCount = Math.round((form.pass_rate / 100) * oldCount);
  const newPassedCount = oldPassedCount + (newStatus === 'Passed' ? 1 : 0);
  const newPassRate = newCount > 0 ? Math.round((newPassedCount / newCount) * 10000) / 100 : 0;

  await supabase
    .from('forms')
    .update({
      validations_count: newCount,
      avg_score: newAvgScore,
      pass_rate: newPassRate,
      last_submission: new Date().toISOString(),
    })
    .eq('id', formId);
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
  // Parse body defensively
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return corsError('Invalid request body', 400);
  }

  const { form_key, email, phone, company } = body;

  // Validate required fields
  if (!form_key || !email) {
    return corsError('Missing form_key or email', 400);
  }

  // Look up form by form_key (must be active)
  const { data: form } = await supabase
    .from('forms')
    .select('*')
    .eq('form_key', form_key)
    .eq('is_active', true)
    .single();

  if (!form) return corsError('Invalid or inactive form key', 403);

  // Look up user who owns the form
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', form.user_id)
    .single();

  if (!user) return corsError('Account not found', 403);

  // Check plan validation limit
  const plan = user.plan as PlanTier;
  const limit = PLAN_VALIDATION_LIMITS[plan] ?? 250;
  if (user.validations_used >= limit) {
    return corsError('Validation limit reached for current plan', 429);
  }

  // Auto-extract IP from headers if not provided
  const clientIp = body.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';

  // Derive company domain from email if not provided
  const companyDomain = company || email.split('@')[1] || '';

  // Run validation engine (parallel Abstract API calls + scoring)
  let result;
  try {
    result = await runValidation({ email, phone, ip: clientIp, companyDomain }, plan);
  } catch {
    return corsError('Validation service not configured', 500);
  }

  // Apply user's scoring thresholds
  const thresholds = user.scoring_thresholds as ScoringThresholds;
  const status = determineStatus(result.overallScore, thresholds);

  // Insert validation record
  const { data: validation, error: insertError } = await supabase
    .from('validations')
    .insert({
      user_id: user.id,
      form_id: form.id,
      email,
      phone: phone || null,
      ip: clientIp || null,
      company: companyDomain || null,
      score: result.overallScore,
      status,
      signals: result.signals,
    })
    .select('id')
    .single();

  if (insertError) return corsError('Failed to record validation', 500);

  // Update form stats + user counter in parallel
  await Promise.all([
    updateFormStats(form.id, result.overallScore, status),
    supabase
      .from('users')
      .update({ validations_used: user.validations_used + 1 })
      .eq('id', user.id),
  ]);

  // Push to connected CRMs asynchronously (after response is sent)
  const leadPayload: LeadPayload = {
    validationId: validation?.id ?? '',
    email,
    phone: phone || null,
    company: companyDomain || null,
    ip: clientIp || null,
    score: result.overallScore,
    status,
    signals: result.signals,
    timestamp: new Date().toISOString(),
  };

  after(async () => {
    await pushLeadToAllCRMs(user.id, leadPayload, thresholds.blockRejected);
  });

  // Return response
  if (status === 'Rejected' && thresholds.blockRejected) {
    return corsJson({
      status: 'Rejected',
      blocked: true,
      message: thresholds.rejectionMessage || 'This submission has been rejected.',
    });
  }

  return corsJson({
    id: validation?.id,
    score: result.overallScore,
    status,
    signals: result.signals,
    blocked: false,
  });
}
