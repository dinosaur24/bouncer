import { supabase } from '@/lib/supabase';
import { hubspotAdapter } from './hubspot';
import { salesforceAdapter } from './salesforce';
import { pipedriveAdapter } from './pipedrive';
import { pushToWebhook } from './webhook';
import { slackAdapter } from './slack';
import { applyFieldMappings } from './types';
import type { LeadPayload, CRMAdapter, PushResult } from './types';
import type { FieldMapping } from '@/lib/types';

const OAUTH_ADAPTERS: Record<string, CRMAdapter> = {
  hubspot: hubspotAdapter,
  salesforce: salesforceAdapter,
  pipedrive: pipedriveAdapter,
  slack: slackAdapter,
};

export async function pushLeadToAllCRMs(
  userId: string,
  lead: LeadPayload,
  blockRejected: boolean,
): Promise<void> {
  if (blockRejected && lead.status === 'Rejected') return;

  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'connected');

  if (!integrations || integrations.length === 0) return;

  const pushPromises = integrations.map(async (integration) => {
    const fieldMappings: FieldMapping[] = integration.field_mappings || [];
    const mappedLead = applyFieldMappings(lead, fieldMappings);

    let result: PushResult;

    try {
      if (integration.provider === 'webhook' || integration.provider === 'zapier') {
        const webhookUrl = integration.nango_connection_id;
        if (!webhookUrl) {
          result = { success: false, error: 'No webhook URL configured' };
        } else {
          result = await pushToWebhook(webhookUrl, mappedLead, lead);
        }
      } else {
        const adapter = OAUTH_ADAPTERS[integration.provider];
        if (!adapter) {
          result = { success: false, error: `Unknown provider: ${integration.provider}` };
        } else if (!integration.nango_connection_id) {
          result = { success: false, error: 'No Nango connection ID' };
        } else {
          result = await adapter.push(integration.nango_connection_id, mappedLead, lead);
        }
      }
    } catch (err) {
      result = { success: false, error: err instanceof Error ? err.message : 'Unknown push error' };
    }

    // Log the attempt
    await logPush(integration.id, lead.validationId, result);

    // Update last_sync_at on success
    if (result.success) {
      await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integration.id);
    }
  });

  await Promise.allSettled(pushPromises);
}

async function logPush(
  integrationId: string,
  validationId: string,
  result: PushResult,
): Promise<void> {
  try {
    await supabase.from('integration_logs').insert({
      integration_id: integrationId,
      validation_id: validationId,
      status: result.success ? 'success' : 'error',
      error: result.error || null,
    });
  } catch {
    // Logging failures should never propagate
  }
}
