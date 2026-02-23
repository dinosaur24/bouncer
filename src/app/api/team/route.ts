import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .order('invited_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch team', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      email: body.email,
      name: body.name || body.email.split('@')[0],
      role: body.role || 'member',
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to invite member', 500);
  return jsonResponse(data, 201);
}
