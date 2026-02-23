'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/pricing', '/docs', '/blog'];
const AUTH_ROUTES = ['/login', '/signup'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = AUTH_ROUTES.some(r => pathname === r);
    const isOnboarding = pathname.startsWith('/onboarding');
    const isDashboard = pathname.startsWith('/dashboard');

    // Authenticated user on login/signup → redirect to dashboard
    if (isAuthenticated && isAuthRoute) {
      if (user && !user.onboardingCompleted) {
        router.replace('/onboarding/1');
      } else {
        router.replace('/dashboard');
      }
      return;
    }

    // Not authenticated on protected routes → redirect to login
    if (!isAuthenticated && (isOnboarding || isDashboard)) {
      router.replace('/login');
      return;
    }

    // Authenticated but onboarding not complete → redirect to onboarding
    if (isAuthenticated && isDashboard && user && !user.onboardingCompleted) {
      router.replace('/onboarding/1');
      return;
    }

    // Authenticated with onboarding complete on onboarding routes → redirect to dashboard
    if (isAuthenticated && isOnboarding && user && user.onboardingCompleted) {
      router.replace('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Show loading spinner on protected routes while checking auth
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
