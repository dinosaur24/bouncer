import { Nango } from '@nangohq/node';

let _nango: Nango | null = null;

export function getNangoServer(): Nango {
  if (!_nango) {
    if (!process.env.NANGO_SECRET_KEY) {
      throw new Error('Missing NANGO_SECRET_KEY environment variable');
    }
    _nango = new Nango({ secretKey: process.env.NANGO_SECRET_KEY });
  }
  return _nango;
}

export async function checkConnectionHealth(
  providerConfigKey: string,
  connectionId: string,
): Promise<{ healthy: boolean; error?: string }> {
  try {
    const nango = getNangoServer();
    await nango.getConnection(providerConfigKey, connectionId);
    return { healthy: true };
  } catch (err) {
    return { healthy: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
