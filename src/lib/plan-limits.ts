import type { PlanTier } from './types';

export const PLAN_VALIDATION_LIMITS: Record<PlanTier, number> = {
  free: 250,
  starter: 2500,
  growth: 15000,
  scale: Infinity,
};
