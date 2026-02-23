import { getNangoServer } from '@/lib/nango';
import type { CRMAdapter, MappedLead, PushResult } from './types';

const FIELD_MAP: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  lead_score: 'Lead_Score__c',
  validation_status: 'Validation_Status__c',
};

function toSalesforceFields(lead: MappedLead): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(lead)) {
    if (value === null || value === undefined) continue;
    const sfField = FIELD_MAP[key] || key;
    fields[sfField] = String(value);
  }
  return fields;
}

export const salesforceAdapter: CRMAdapter = {
  async push(connectionId, lead, _rawLead): Promise<PushResult> {
    const nango = getNangoServer();
    const fields = toSalesforceFields(lead);

    try {
      const response = await nango.post({
        providerConfigKey: 'salesforce',
        connectionId,
        endpoint: '/services/data/v59.0/sobjects/Lead',
        data: fields,
      });

      return { success: true, externalId: response?.data?.id };
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 400 || status === 409) {
        return updateExistingLead(connectionId, lead, fields);
      }
      return { success: false, error: err instanceof Error ? err.message : 'Salesforce push failed' };
    }
  },
};

async function updateExistingLead(
  connectionId: string,
  lead: MappedLead,
  fields: Record<string, string>,
): Promise<PushResult> {
  const nango = getNangoServer();
  try {
    const email = lead['email'];
    if (!email) return { success: false, error: 'No email for lead lookup' };

    const query = encodeURIComponent(`SELECT Id FROM Lead WHERE Email = '${String(email).replace(/'/g, "\\'")}'`);
    const searchResponse = await nango.get({
      providerConfigKey: 'salesforce',
      connectionId,
      endpoint: `/services/data/v59.0/query?q=${query}`,
    });

    const leadId = searchResponse?.data?.records?.[0]?.Id;
    if (!leadId) return { success: false, error: 'Lead not found for update' };

    const { Email: _email, ...updateFields } = fields;
    await nango.patch({
      providerConfigKey: 'salesforce',
      connectionId,
      endpoint: `/services/data/v59.0/sobjects/Lead/${leadId}`,
      data: updateFields,
    });

    return { success: true, externalId: leadId };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Salesforce update failed' };
  }
}
