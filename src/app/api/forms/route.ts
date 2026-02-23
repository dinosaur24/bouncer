import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch forms', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const formKey = `bnc_${randomBytes(16).toString('hex')}`;

  const { data, error } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      name: body.name,
      domain: body.domain,
      description: body.description || '',
      form_key: formKey,
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create form', 500);
  return jsonResponse(data, 201);
}
