# Backend Logic & User Journeys Design

**Date:** 2026-02-23
**Status:** Approved
**Scope:** Wire up all pages with mock backend, real user journeys, interactions, and state management

## Goal

Transform the static frontend prototype into a fully interactive application with realistic user journeys, mock backend state, loading states, and page-to-page flows — ready for real Supabase integration later.

## Architecture: Context-based State Layer

Seven React Context providers, each with a custom hook, simulating async API operations with localStorage persistence.

### Providers

| Context | Hook | Responsibility |
|---------|------|----------------|
| AuthContext | `useAuth()` | User auth state, login/signup/logout, session persistence |
| OnboardingContext | `useOnboarding()` | Onboarding step tracking, company profile, snippet verification |
| ValidationContext | `useValidations()` | Validation data, stats, filtering, CSV export, realtime simulation |
| BillingContext | `useBilling()` | Plan tier, usage tracking, upgrade/downgrade, invoices |
| IntegrationContext | `useIntegrations()` | CRM connection status, field mappings, sync logs |
| TeamContext | `useTeam()` | Team members, invites, role management |
| SettingsContext | `useSettings()` | Profile, notifications, scoring thresholds, API keys, webhooks |

### Data Types

```typescript
type User = {
  id: string; email: string; firstName: string; lastName: string;
  company: string; avatar?: string; plan: PlanTier;
  onboardingCompleted: boolean; emailVerified: boolean;
}

type PlanTier = 'free' | 'starter' | 'growth' | 'scale'

type Validation = {
  id: string; email: string; score: number;
  status: 'Passed' | 'Borderline' | 'Rejected';
  signals: SignalResult[]; source: string;
  timestamp: Date; overridden?: boolean;
}

type SignalResult = {
  type: 'email' | 'phone' | 'ip' | 'company';
  score: number; status: 'pass' | 'warn' | 'fail';
  details: Record<string, string>;
}

type CRMConnection = {
  id: string; provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'webhook';
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: Date; lastSyncAt?: Date;
  fieldMappings: FieldMapping[];
}

type TeamMember = {
  id: string; name: string; email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Pending'; joinedAt: Date;
}

type Invoice = {
  id: string; date: Date; amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  planName: string;
}
```

### localStorage Keys

| Key | Data |
|-----|------|
| `bouncer_user` | Auth state + user profile |
| `bouncer_onboarding` | Onboarding progress |
| `bouncer_validations` | Validation log (last 100) |
| `bouncer_settings` | All settings data |
| `bouncer_plan` | Plan + usage + invoices |
| `bouncer_integrations` | CRM connections |
| `bouncer_team` | Team members + invites |

## User Journey Flows

### Flow 1: Signup → Onboarding → Dashboard

```
/signup → (submit) → "verification email sent" screen
  ↓ (auto-verify in mock)
/onboarding/1 → company profile → "Continue"
/onboarding/2 → copy snippet → "Test Installation" → green check → "Continue"
/onboarding/3 → click CRM card or "Skip" → "Continue"
/onboarding/4 → adjust thresholds → "Finish Setup"
  ↓
/dashboard → first-time state with sample data
```

### Flow 2: Login → Dashboard (returning user)

```
/login → (submit) → loading → success → /dashboard
                              → error → toast + stay on page
```

### Flow 3: Dashboard Daily Loop

```
/dashboard → click row → drawer → signal breakdown
           → "View All" → /dashboard/validations
           → "Add Source" → /dashboard/sources
           → sidebar nav → any dashboard page
```

### Flow 4: Validation Override

```
/dashboard/validations → click row → drawer
  → "Override: Accept" → confirmation toast → "Overridden" badge
  → CRM sync status shown if integration active
```

### Flow 5: Upgrade

```
Dashboard usage banner (240/250) → "Upgrade" → pricing modal
  → select plan → "Upgrade Now" → simulated checkout → success toast
  → dashboard refreshes with new limits
```

### Flow 6: Settings

```
Settings pages → edit fields → "Save" → loading → success toast
Scoring → drag thresholds → live preview → "Save"
Team → invite email → loading → member as "Pending"
API → "Regenerate" → confirm modal → new key
```

### Route Protection

| Route Pattern | Rule |
|--------------|------|
| `/login`, `/signup` | Redirect to `/dashboard` if authenticated |
| `/onboarding/*` | Redirect to `/login` if not auth'd; to `/dashboard` if onboarding done |
| `/dashboard/*` | Redirect to `/login` if not auth'd; to `/onboarding/1` if onboarding not done |

## Button & Interaction Inventory

| Page | Element | Action |
|------|---------|--------|
| Homepage | "Start for free" | → `/signup` |
| Homepage | "Log in" | → `/login` |
| Login | Submit form | → auth → `/dashboard` |
| Login | "Google" button | → simulated OAuth → `/dashboard` |
| Login | "Sign up" link | → `/signup` |
| Signup | Submit form | → create account → `/onboarding/1` |
| Signup | "Google" button | → simulated OAuth → `/onboarding/1` |
| Signup | "Log in" link | → `/login` |
| Onboarding 1-3 | "Continue" | → next step (with form validation) |
| Onboarding 3 | "Skip" | → step 4 |
| Onboarding 4 | "Finish Setup" | → `/dashboard` |
| Dashboard | Validation row | → open ValidationDrawer |
| Dashboard | "View All" | → `/dashboard/validations` |
| Dashboard | "Export" | → trigger CSV download |
| Dashboard | Date range picker | → filter stats |
| Validations | Search/filters | → re-filter data |
| Validations | Row click | → open detail drawer |
| Validations | "Override" in drawer | → update status + toast |
| Analytics | Date range | → update charts |
| Sources | "Add Source" submit | → create source + toast |
| Sources | Edit/Delete | → update/remove + toast |
| Integrations | "Connect" | → simulated OAuth → connected badge |
| Integrations | "Disconnect" | → confirm → disconnected |
| Settings/Profile | "Save" | → loading → success toast |
| Settings/Profile | "Delete Account" | → confirm modal → logout → `/` |
| Settings/Billing | "Change Plan" | → pricing modal → checkout flow |
| Settings/Billing | "Cancel" | → confirm modal → downgrade to free |
| Settings/Team | "Send Invite" | → add pending member |
| Settings/Team | Remove member | → confirm → remove |
| Settings/API | "Copy" | → copy to clipboard + toast |
| Settings/API | "Regenerate" | → confirm → new key |
| Settings/API | "Save Webhook" | → loading → success toast |
| Settings/API | "Test Webhook" | → simulated ping → result toast |
| Settings/Scoring | Threshold change | → live preview updates |
| Settings/Scoring | "Save" | → loading → success toast |
| Settings/Snippet | "Copy" | → copy to clipboard |
| Settings/Snippet | "Test Installation" | → simulated verification → status |

## Mock Data Strategy

### Data Engine (`src/lib/mock-data.ts`)

- Pre-seeded demo account: sara@techcorp.io / password123
- Validation generator: realistic score distributions (60% passed, 25% borderline, 15% rejected)
- Time-series data: natural variance for charts
- Usage counter: increments per validation, respects plan limits

### Async Simulation (`src/lib/api.ts`)

```typescript
async function simulateAPI<T>(data: T, delay = 500): Promise<T> {
  await new Promise(r => setTimeout(r, delay + Math.random() * 300));
  return data;
}
```

500-800ms delays on all operations. ~5% random failure rate for error handling.

### Realtime Simulation

Dashboard `setInterval` (15-30s) generates new validations with entry animation.

## File Structure

```
src/
├── contexts/
│   ├── AuthContext.tsx
│   ├── OnboardingContext.tsx
│   ├── ValidationContext.tsx
│   ├── BillingContext.tsx
│   ├── IntegrationContext.tsx
│   ├── TeamContext.tsx
│   └── SettingsContext.tsx
├── lib/
│   ├── mock-data.ts        (data generators)
│   ├── api.ts               (simulateAPI helper)
│   ├── types.ts             (shared TypeScript types)
│   └── storage.ts           (localStorage helpers)
├── components/
│   ├── (existing components)
│   ├── RouteGuard.tsx       (auth/onboarding route protection)
│   ├── LoadingSpinner.tsx   (reusable loading states)
│   └── UpgradeModal.tsx     (pricing/checkout modal)
├── app/
│   ├── layout.tsx           (wrap with providers)
│   └── (existing pages — updated to use contexts)
```

## Implementation Order

1. Shared types + mock data engine + API helpers
2. AuthContext + RouteGuard + login/signup page wiring
3. OnboardingContext + onboarding flow wiring
4. ValidationContext + dashboard/validations/analytics wiring
5. BillingContext + UpgradeModal + billing page wiring
6. IntegrationContext + integrations page wiring
7. TeamContext + team page wiring
8. SettingsContext + all settings pages wiring
9. Homepage CTA wiring + cross-page navigation polish
10. Realtime simulation + final polish
