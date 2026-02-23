# Auth + Database Design — Clerk & Supabase

**Date:** 2026-02-23
**Status:** Approved
**Stack:** Clerk (auth) + Supabase (Postgres database) + Next.js API routes

---

## Architecture

```
Browser → Clerk (auth UI/sessions) → Next.js App
                                        ↓
                               API Routes / Server Actions
                                        ↓
                               Supabase (Postgres via service role)
                                        ↑
                               Clerk Webhooks (user sync)
```

- Clerk handles all auth UI, sessions, and OAuth (Google)
- Clerk webhooks push user events to `/api/webhooks/clerk` → upserts `users` table in Supabase
- All data access goes through Next.js API routes using Supabase service role key
- No direct Supabase client on the frontend
- No Supabase RLS needed — API routes enforce access control via Clerk's `auth()`
- Clerk middleware protects `/dashboard/*` and `/onboarding/*` routes

---

## Database Schema

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk, default gen) | |
| clerk_id | text (unique, not null) | Synced from Clerk |
| email | text (not null) | |
| name | text | |
| avatar_url | text | |
| company_name | text | |
| company_website | text | |
| team_size | text | |
| plan | text (default 'free') | free / starter / growth / scale |
| validations_used | int (default 0) | Reset monthly |
| onboarding_completed | boolean (default false) | |
| onboarding_step | int (default 1) | Current step (1-4) |
| scoring_thresholds | jsonb | `{ passed: 70, borderline: 40, blockRejected: false, rejectionMessage: "..." }` |
| notification_prefs | jsonb | `{ emailDigest: "daily", slackWebhook: null }` |
| webhook_config | jsonb | `{ url: null, secret: null, events: [] }` |
| api_key | text | Generated on Scale tier |
| created_at | timestamptz (default now) | |
| updated_at | timestamptz (default now) | |

### `forms`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk → users.id) | |
| name | text (not null) | |
| domain | text | |
| form_key | text (unique, not null) | Public key in snippet |
| is_active | boolean (default true) | |
| validations_count | int (default 0) | |
| created_at | timestamptz | |

### `validations`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk → users.id) | Denormalized for fast queries |
| form_id | uuid (fk → forms.id) | |
| email | text (not null) | |
| phone | text | |
| ip | text | |
| company | text | |
| score | int (not null) | 0-100 |
| status | text (not null) | passed / borderline / rejected |
| signals | jsonb (not null) | Array of SignalResult objects |
| override_status | text | If manually overridden |
| override_at | timestamptz | |
| created_at | timestamptz | |

### `integrations`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk → users.id) | |
| provider | text (not null) | hubspot / salesforce / pipedrive / zoho / webhook |
| nango_connection_id | text | |
| status | text (default 'disconnected') | connected / disconnected / error |
| field_mappings | jsonb | `[{ bouncerField, crmField, enabled }]` |
| created_at | timestamptz | |

### `integration_logs`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| integration_id | uuid (fk → integrations.id) | |
| validation_id | uuid (fk → validations.id) | |
| status | text | success / failed |
| error | text | |
| created_at | timestamptz | |

### `team_members`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk → users.id) | Account owner |
| clerk_id | text | Populated when invite accepted |
| email | text (not null) | |
| role | text (default 'member') | admin / member / viewer |
| invited_at | timestamptz | |
| accepted_at | timestamptz | |

### `invoices`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk → users.id) | |
| amount | int | Cents |
| status | text | paid / pending / failed |
| polar_invoice_id | text | |
| period_start | timestamptz | |
| period_end | timestamptz | |
| created_at | timestamptz | |

### Indexes

- `validations(user_id, created_at DESC)` — dashboard queries
- `validations(form_id, created_at DESC)` — per-form queries
- `validations(user_id, status)` — filtered queries
- `forms(user_id)` — user's forms
- `forms(form_key)` — snippet authentication (unique already)
- `integrations(user_id)` — user's integrations
- `team_members(user_id)` — team listing

---

## API Routes

### Authenticated (Clerk session required)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user` | GET | Current user profile + settings |
| `/api/user` | PATCH | Update profile, thresholds, notifications |
| `/api/user/onboarding` | PATCH | Update onboarding step/state |
| `/api/validations` | GET | List with filters + pagination |
| `/api/validations/[id]` | GET | Single validation detail |
| `/api/validations/[id]/override` | PATCH | Override status |
| `/api/validations/stats` | GET | Dashboard stats |
| `/api/validations/chart` | GET | Analytics chart data |
| `/api/validations/export` | GET | CSV stream |
| `/api/forms` | GET / POST | List or create forms |
| `/api/forms/[id]` | PATCH / DELETE | Update or delete form |
| `/api/integrations` | GET / POST | List or connect CRM |
| `/api/integrations/[id]` | PATCH / DELETE | Update or disconnect |
| `/api/team` | GET / POST | List or invite members |
| `/api/team/[id]` | PATCH / DELETE | Update role or remove |

### Public (no Clerk session)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/clerk` | POST | Clerk user sync webhook |
| `/api/validate` | POST | Snippet validation endpoint (authenticates via form_key) |

---

## Frontend Migration Strategy

Migrate contexts one at a time, keeping the app working throughout. Each context keeps its same interface — only internals change from localStorage to API calls.

1. **AuthContext** → Clerk's `<ClerkProvider>`, `useUser()`, `useAuth()`. Thin wrapper fetches Supabase user profile.
2. **ValidationContext** → `fetch('/api/validations')` calls. Delete mock generators.
3. **SettingsContext** → Reads/writes hit `/api/user`.
4. **SourcesContext** → Backed by `/api/forms`.
5. **IntegrationContext** → Backed by `/api/integrations`.
6. **TeamContext** → Backed by `/api/team`.
7. **BillingContext** → Stays mostly mock (Polar later), reads plan from real user record.
8. **OnboardingContext** → Backed by `/api/user/onboarding`.

---

## Setup Requirements

- Create Supabase project → get `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Create Clerk application → get `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- Configure Clerk webhook endpoint pointing to deployed `/api/webhooks/clerk`
- Set `CLERK_WEBHOOK_SECRET` for webhook verification
