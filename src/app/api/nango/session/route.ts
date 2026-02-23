import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getNangoServer } from '@/lib/nango';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('clerk_id', userId)
    .single();

  try {
    const nango = getNangoServer();
    const response = await nango.createConnectSession({
      tags: {
        end_user_id: userId,
        end_user_email: user?.email || '',
        organization_id: userId,
      },
      allowed_integrations: ['hubspot', 'salesforce', 'pipedrive', 'slack'],
    });

    return NextResponse.json({ token: response.data.token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create session' },
      { status: 500 },
    );
  }
}
