import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch integrations', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const { data, error } = await supabase
    .from('integrations')
    .insert({
      user_id: user.id,
      provider: body.provider,
      name: body.name,
      status: 'connected',
      field_mappings: body.field_mappings || [],
      connected_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create integration', 500);
  return jsonResponse(data, 201);
}
