import { getCurrentUser, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data } = await supabase
    .from('validations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10000);

  const csvHeaders = 'Email,Score,Status,IP,Phone,Company,Created At\n';
  const rows = (data || []).map((v: Record<string, unknown>) =>
    `${v.email},${v.score},${v.status},${v.ip},${v.phone},${v.company},${v.created_at}`
  ).join('\n');

  return new Response(csvHeaders + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bouncer-validations-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
