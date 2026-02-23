import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  const startParam = url.searchParams.get('start');
  const endParam = url.searchParams.get('end');

  let startDate: Date;
  let endDate: Date;
  let dayCount: number;

  if (startParam && endParam) {
    startDate = new Date(startParam + 'T00:00:00Z');
    endDate = new Date(endParam + 'T23:59:59Z');
    dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } else {
    const days = parseInt(url.searchParams.get('days') || '7');
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    dayCount = days;
  }

  const { data } = await supabase
    .from('validations')
    .select('status, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chart: Record<string, { passed: number; borderline: number; rejected: number }> = {};

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    chart[key] = { passed: 0, borderline: 0, rejected: 0 };
  }

  for (const v of data || []) {
    const key = v.created_at.split('T')[0];
    if (chart[key]) {
      const status = v.status.toLowerCase() as 'passed' | 'borderline' | 'rejected';
      if (chart[key][status] !== undefined) chart[key][status]++;
    }
  }

  const chartData = Object.entries(chart).map(([date, counts]) => ({
    date,
    day: dayNames[new Date(date).getDay()],
    ...counts,
  }));

  return jsonResponse(chartData);
}
