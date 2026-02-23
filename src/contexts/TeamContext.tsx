'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { simulateAPI, generateId } from '@/lib/api';
import { getStored, setStored } from '@/lib/storage';
import { generateTeamMembers } from '@/lib/mock-data';
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
    setMembers(getStored('team', generateTeamMembers()));
  }, []);

  const inviteMember = useCallback(async (email: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      const newMember: TeamMember = {
        id: generateId(), name, email, initials, role,
        status: 'Pending', joinedAt: new Date().toISOString().split('T')[0],
      };
      setMembers(prev => {
        const updated = [...prev, newMember];
        setStored('team', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setMembers(prev => {
        const updated = prev.filter(m => m.id !== id);
        setStored('team', updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, role: TeamMember['role']) => {
    setIsLoading(true);
    try {
      await simulateAPI(true);
      setMembers(prev => {
        const updated = prev.map(m => m.id === id ? { ...m, role } : m);
        setStored('team', updated);
        return updated;
      });
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
