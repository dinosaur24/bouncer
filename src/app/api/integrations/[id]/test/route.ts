import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';
import { checkConnectionHealth } from '@/lib/nango';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !integration) return errorResponse('Integration not found', 404);

  // Non-OAuth providers: ping the webhook URL
  if (['webhook', 'zapier'].includes(integration.provider)) {
    const webhookUrl = integration.nango_connection_id;
    if (!webhookUrl) return jsonResponse({ healthy: false, error: 'No webhook URL configured' });

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() }),
      });
      return jsonResponse({ healthy: response.ok });
    } catch {
      return jsonResponse({ healthy: false, error: 'Webhook unreachable' });
    }
  }

  // OAuth providers: Nango health check
  if (!integration.nango_connection_id) {
    return jsonResponse({ healthy: false, error: 'No Nango connection' });
  }

  const result = await checkConnectionHealth(integration.provider, integration.nango_connection_id);
  return jsonResponse(result);
}
