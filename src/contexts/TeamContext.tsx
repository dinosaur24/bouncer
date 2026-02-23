'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { TeamMember } from '@/lib/types';

interface TeamContextType {
  members: TeamMember[];
  isLoading: boolean;
  inviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  updateRole: (id: string, role: TeamMember['role']) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | null>(null);

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}

export function TeamProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const data = await res.json();
          setMembers(data.map((m: Record<string, unknown>) => ({
            id: m.id,
            name: m.name as string,
            email: m.email as string,
            initials: ((m.name as string) || '').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || '??',
            role: m.role,
            status: m.status || 'Pending',
            joinedAt: ((m.invited_at as string) || '').split('T')[0],
          })));
        }
      } catch {
        // silently fail
      }
    }
    loadMembers();
  }, []);

  const inviteMember = useCallback(async (email: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (res.ok) {
        const m = await res.json();
        const name = m.name || email.split('@')[0];
        setMembers(prev => [...prev, {
          id: m.id,
          name,
          email: m.email,
          initials: name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
          role: m.role,
          status: 'Pending' as const,
          joinedAt: (m.invited_at || new Date().toISOString()).split('T')[0],
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <TeamContext.Provider value={{ members, isLoading, inviteMember, removeMember, updateRole }}>
      {children}
    </TeamContext.Provider>
  );
}
