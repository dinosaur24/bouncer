import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('team_members')
    .update({ role: body.role })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to update member', 500);
  return jsonResponse(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return errorResponse('Failed to remove member', 500);
  return jsonResponse({ success: true });
}
