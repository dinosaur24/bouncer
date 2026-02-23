import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

function computeStats(validations: { score: number; status: string }[]) {
  const total = validations.length;
  const passed = validations.filter(v => v.status === 'Passed').length;
  const rejected = validations.filter(v => v.status === 'Rejected').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const avgScore = total > 0
    ? Math.round(validations.reduce((sum, v) => sum + v.score, 0) / total)
    : 0;
  return { total, passed, rejected, passRate, avgScore };
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  const startParam = url.searchParams.get('start');
  const endParam = url.searchParams.get('end');
  const days = parseInt(url.searchParams.get('days') || '30');

  let periodStart: Date;
  let periodEnd: Date;
  let spanDays: number;

  if (startParam && endParam) {
    periodStart = new Date(startParam + 'T00:00:00Z');
    periodEnd = new Date(endParam + 'T23:59:59Z');
    spanDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    periodEnd = new Date();
    periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);
    spanDays = days;
  }

  const prevStart = new Date(periodStart);
  prevStart.setDate(prevStart.getDate() - spanDays);

  // Fetch current period
  const { data: currentData } = await supabase
    .from('validations')
    .select('score, status')
    .eq('user_id', user.id)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString());

  // Fetch previous period for comparison
  const { data: prevData } = await supabase
    .from('validations')
    .select('score, status')
    .eq('user_id', user.id)
    .gte('created_at', prevStart.toISOString())
    .lt('created_at', periodStart.toISOString());

  const current = computeStats(currentData ?? []);
  const prev = computeStats(prevData ?? []);

  function pctChange(curr: number, previous: number) {
    if (previous === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - previous) / previous) * 100);
  }

  return jsonResponse({
    totalValidations: current.total,
    passRate: current.passRate,
    avgScore: current.avgScore,
    rejected: current.rejected,
    totalChange: pctChange(current.total, prev.total),
    passRateChange: pctChange(current.passRate, prev.passRate),
    avgScoreChange: pctChange(current.avgScore, prev.avgScore),
    rejectedChange: pctChange(current.rejected, prev.rejected),
  });
}
