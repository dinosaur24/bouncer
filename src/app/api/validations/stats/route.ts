import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count: todayCount } = await supabase
    .from('validations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart);

  const { data: monthValidations } = await supabase
    .from('validations')
    .select('score, status')
    .eq('user_id', user.id)
    .gte('created_at', monthStart);

  const monthCount = monthValidations?.length || 0;
  const passedCount = monthValidations?.filter(v => v.status === 'Passed').length || 0;
  const passRate = monthCount > 0 ? Math.round((passedCount / monthCount) * 100) : 0;
  const avgScore = monthCount > 0
    ? Math.round(monthValidations!.reduce((sum, v) => sum + v.score, 0) / monthCount)
    : 0;

  return jsonResponse({
    validationsToday: todayCount || 0,
    validationsMonth: monthCount,
    passRate,
    avgScore,
    todayChange: 0,
    monthChange: 0,
    passRateChange: 0,
    avgScoreChange: 0,
  });
}
