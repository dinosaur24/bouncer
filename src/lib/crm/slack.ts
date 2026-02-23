import { getNangoServer } from '@/lib/nango';
import type { CRMAdapter, PushResult } from './types';

export const slackAdapter: CRMAdapter = {
  async push(connectionId, _lead, rawLead): Promise<PushResult> {
    const nango = getNangoServer();
    try {
      const statusEmoji =
        rawLead.status === 'Passed' ? ':white_check_mark:'
        : rawLead.status === 'Borderline' ? ':warning:'
        : ':x:';

      await nango.post({
        providerConfigKey: 'slack',
        connectionId,
        endpoint: '/api/chat.postMessage',
        data: {
          channel: '#leads',
          text: `${statusEmoji} New lead validated: ${rawLead.email} (Score: ${rawLead.score}, Status: ${rawLead.status})`,
        },
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Slack push failed' };
    }
  },
};
