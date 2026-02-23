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
    .from('integrations')
    .update({
      ...(body.status !== undefined && { status: body.status }),
      ...(body.field_mappings !== undefined && { field_mappings: body.field_mappings }),
      ...(body.status === 'connected' && { connected_at: new Date().toISOString() }),
      ...(body.status === 'disconnected' && { connected_at: null, last_sync_at: null }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to update integration', 500);
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
    .from('integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return errorResponse('Failed to delete integration', 500);
  return jsonResponse({ success: true });
}
