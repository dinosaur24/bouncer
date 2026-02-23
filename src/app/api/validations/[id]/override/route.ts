import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { data, error } = await supabase
    .from('validations')
    .update({
      override_status: 'Passed',
      override_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to override', 500);
  return jsonResponse(data);
}
