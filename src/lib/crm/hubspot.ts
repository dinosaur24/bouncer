import { getNangoServer } from '@/lib/nango';
import type { CRMAdapter, MappedLead, PushResult } from './types';

export const hubspotAdapter: CRMAdapter = {
  async push(connectionId, lead, _rawLead): Promise<PushResult> {
    const nango = getNangoServer();
    try {
      const properties: Record<string, string> = {};
      for (const [key, value] of Object.entries(lead)) {
        if (value !== null && value !== undefined) {
          properties[key] = String(value);
        }
      }

      const response = await nango.post({
        providerConfigKey: 'hubspot',
        connectionId,
        endpoint: '/crm/v3/objects/contacts',
        data: { properties },
      });

      return { success: true, externalId: response?.data?.id };
    } catch (err: unknown) {
      // 409 conflict = contact already exists, try update
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        return updateExistingContact(connectionId, lead);
      }
      return { success: false, error: err instanceof Error ? err.message : 'HubSpot push failed' };
    }
  },
};

async function updateExistingContact(connectionId: string, lead: MappedLead): Promise<PushResult> {
  const nango = getNangoServer();
  try {
    const email = lead['email'];
    if (!email) return { success: false, error: 'No email for contact lookup' };

    const searchResponse = await nango.post({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: '/crm/v3/objects/contacts/search',
      data: {
        filterGroups: [{
          filters: [{ propertyName: 'email', operator: 'EQ', value: String(email) }],
        }],
      },
    });

    const contactId = searchResponse?.data?.results?.[0]?.id;
    if (!contactId) return { success: false, error: 'Contact not found for update' };

    const properties: Record<string, string> = {};
    for (const [key, value] of Object.entries(lead)) {
      if (value !== null && value !== undefined && key !== 'email') {
        properties[key] = String(value);
      }
    }

    await nango.patch({
      providerConfigKey: 'hubspot',
      connectionId,
      endpoint: `/crm/v3/objects/contacts/${contactId}`,
      data: { properties },
    });

    return { success: true, externalId: contactId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'HubSpot update failed' };
  }
}
