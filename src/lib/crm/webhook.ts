import type { MappedLead, PushResult, LeadPayload } from './types';

export async function pushToWebhook(
  webhookUrl: string,
  lead: MappedLead,
  rawLead: LeadPayload,
): Promise<PushResult> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'validation.completed',
        data: { ...lead, raw: rawLead },
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Webhook returned ${response.status}` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Webhook failed' };
  }
}
