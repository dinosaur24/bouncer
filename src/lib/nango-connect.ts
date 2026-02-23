import Nango from '@nangohq/frontend';

export const OAUTH_PROVIDERS = ['hubspot', 'salesforce', 'pipedrive', 'slack'];

export const PROVIDER_NAMES: Record<string, string> = {
  hubspot: 'HubSpot',
  salesforce: 'Salesforce',
  pipedrive: 'Pipedrive',
  webhook: 'Webhook',
  zapier: 'Zapier',
  slack: 'Slack',
};

/**
 * Fetches a short-lived Connect session token from our backend,
 * then initiates the Nango OAuth flow for a provider.
 */
export async function nangoAuth(
  provider: string,
): Promise<{ connectionId: string }> {
  const res = await fetch('/api/nango/session', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create Nango session');
  const { token } = await res.json();

  const nango = new Nango({ connectSessionToken: token });
  const result = await nango.auth(provider);
  return { connectionId: result.connectionId };
}

/**
 * Creates or reconnects an integration via Nango OAuth + API call.
 * Returns the integration data from the API.
 */
export async function connectOAuthProvider(
  provider: string,
  _userId: string,
  fieldMappings: unknown[],
  existingId?: string,
): Promise<Record<string, unknown>> {
  const { connectionId } = await nangoAuth(provider);

  if (existingId) {
    const res = await fetch(`/api/integrations/${existingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'connected',
        nango_connection_id: connectionId,
      }),
    });
    if (!res.ok) throw new Error('Failed to reconnect integration');
    return await res.json();
  }

  const res = await fetch('/api/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider,
      name: PROVIDER_NAMES[provider] || provider,
      field_mappings: fieldMappings,
      nango_connection_id: connectionId,
    }),
  });
  if (!res.ok) throw new Error('Failed to create integration');
  return await res.json();
}
