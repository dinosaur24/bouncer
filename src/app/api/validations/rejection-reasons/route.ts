import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

const SIGNAL_LABELS: Record<string, string> = {
  email: 'Disposable email detected',
  phone: 'Invalid phone number',
  ip: 'VPN/Proxy IP detected',
  company: 'Domain not found',
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data } = await supabase
    .from('validations')
    .select('signals')
    .eq('user_id', user.id)
    .eq('status', 'Rejected')
    .order('created_at', { ascending: false })
    .limit(200);

  if (!data || data.length === 0) return jsonResponse([]);

  const counts: Record<string, number> = {};
  let multipleCount = 0;

  for (const row of data) {
    const signals = row.signals as { type: string; status: string }[] | null;
    if (!signals) continue;

    const failed = signals.filter(s => s.status === 'fail');
    if (failed.length > 1) {
      multipleCount++;
    }
    for (const s of failed) {
      counts[s.type] = (counts[s.type] || 0) + 1;
    }
  }

  const total = data.length;
  const reasons = Object.entries(SIGNAL_LABELS)
    .map(([type, label]) => ({
      label,
      percentage: total > 0 ? Math.round(((counts[type] || 0) / total) * 100) : 0,
    }))
    .filter(r => r.percentage > 0);

  if (multipleCount > 0) {
    reasons.push({
      label: 'Multiple signals failed',
      percentage: Math.round((multipleCount / total) * 100),
    });
  }

  reasons.sort((a, b) => b.percentage - a.percentage);

  return jsonResponse(reasons);
}
