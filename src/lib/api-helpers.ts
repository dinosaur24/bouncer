import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from './supabase';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Look up existing Supabase user
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (data) return data;

  // Auto-create on first visit (just-in-time provisioning)
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      clerk_id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name,
      avatar_url: clerkUser.imageUrl ?? null,
    })
    .select()
    .single();

  if (error || !newUser) return null;
  return newUser;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
