import { getNangoServer } from '@/lib/nango';
import type { CRMAdapter, MappedLead, PushResult } from './types';

export const pipedriveAdapter: CRMAdapter = {
  async push(connectionId, lead, _rawLead): Promise<PushResult> {
    const nango = getNangoServer();
    try {
      const personData: Record<string, unknown> = {
        name: lead['company'] ? `${lead['email']} (${lead['company']})` : String(lead['email'] || ''),
        email: lead['email'] ? [{ value: String(lead['email']), primary: true }] : undefined,
        phone: lead['phone'] ? [{ value: String(lead['phone']), primary: true }] : undefined,
      };

      const response = await nango.post({
        providerConfigKey: 'pipedrive',
        connectionId,
        endpoint: '/v1/persons',
        data: personData,
      });

      return { success: true, externalId: response?.data?.data?.id?.toString() };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Pipedrive push failed' };
    }
  },
};
