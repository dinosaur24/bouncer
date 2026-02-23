import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  return jsonResponse(user);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();

  const allowedFields = [
    'full_name', 'company_name', 'company_website', 'team_size',
    'scoring_thresholds', 'notification_prefs', 'webhook_config', 'plan',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return errorResponse('Failed to update user', 500);
  return jsonResponse(data);
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', user.id);

  if (error) return errorResponse('Failed to delete account', 500);
  return jsonResponse({ success: true });
}
