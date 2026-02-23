import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.onboarding_step !== undefined) updates.onboarding_step = body.onboarding_step;
  if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed;
  if (body.company_name !== undefined) updates.company_name = body.company_name;
  if (body.company_website !== undefined) updates.company_website = body.company_website;
  if (body.team_size !== undefined) updates.team_size = body.team_size;
  if (body.scoring_thresholds !== undefined) updates.scoring_thresholds = body.scoring_thresholds;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return errorResponse('Failed to update onboarding', 500);
  return jsonResponse(data);
}
