'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return; // Clerk middleware handles unauthenticated redirects

    const isOnboarding = pathname.startsWith('/onboarding');
    const isDashboard = pathname.startsWith('/dashboard');

    // Authenticated but onboarding not complete → redirect to onboarding
    if (isDashboard && user && !user.onboarding_completed) {
      router.replace('/onboarding/1');
      return;
    }

    // Authenticated with onboarding complete on onboarding routes → redirect to dashboard
    if (isOnboarding && user && user.onboarding_completed) {
      router.replace('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  if (isLoading) {
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding');
    if (isProtected) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
