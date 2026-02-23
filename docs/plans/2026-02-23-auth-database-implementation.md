# Auth + Database Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace localStorage mock data with Clerk authentication and Supabase Postgres database, keeping the app functional throughout.

**Architecture:** Clerk handles auth UI/sessions/OAuth. A Clerk webhook syncs users to Supabase. All data access goes through Next.js API routes using Supabase service role key. Frontend contexts keep the same interface but swap localStorage internals for `fetch()` calls.

**Tech Stack:** Clerk (`@clerk/nextjs`), Supabase (`@supabase/supabase-js`), `svix` (webhook verification), Next.js App Router API routes

---

## Pre-requisites (manual)

Before starting, the developer needs to:

1. **Create a Supabase project** at https://supabase.com/dashboard — note the project URL and service role key
2. **Create a Clerk application** at https://dashboard.clerk.com — enable Email + Google OAuth sign-in methods
3. **Create `.env.local`** at project root with these values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> The `CLERK_WEBHOOK_SECRET` can be set up later when configuring the webhook endpoint in Clerk dashboard. Use a placeholder for now.

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Clerk, Supabase, and svix**

```bash
npm install @clerk/nextjs @supabase/supabase-js svix
```

**Step 2: Verify the app still builds**

```bash
npm run build
```

Expected: Build succeeds (Clerk/Supabase are installed but not yet used)

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install clerk, supabase-js, and svix"
```

---

### Task 2: Set up Supabase server client

**Files:**
- Create: `src/lib/supabase.ts`

**Step 1: Create the Supabase service-role client**

```typescript
import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

This is a server-only module — it uses the service role key which bypasses RLS. Only import it in API routes and server code, never in client components.

**Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase service-role client"
```

---

### Task 3: Create database schema in Supabase

**Files:**
- Create: `supabase/schema.sql`

**Step 1: Write the full schema SQL**

```sql
-- Users (synced from Clerk)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text,
  avatar_url text,
  company_name text,
  company_website text,
  team_size text,
  plan text not null default 'free',
  validations_used int not null default 0,
  onboarding_completed boolean not null default false,
  onboarding_step int not null default 1,
  scoring_thresholds jsonb not null default '{"passedMin": 70, "borderlineMin": 40, "blockRejected": false, "rejectionMessage": ""}'::jsonb,
  notification_prefs jsonb not null default '{"emailDigest": true, "weeklyReport": true, "validationAlerts": true, "usageLimitAlerts": true}'::jsonb,
  webhook_config jsonb not null default '{"url": "", "events": ["validation.completed"], "active": false}'::jsonb,
  api_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Forms / Sources
create table forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  domain text,
  description text,
  form_key text unique not null,
  is_active boolean not null default true,
  validations_count int not null default 0,
  pass_rate numeric(5,2) not null default 0,
  avg_score numeric(5,2) not null default 0,
  last_submission timestamptz,
  created_at timestamptz not null default now()
);

-- Validations
create table validations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  form_id uuid references forms(id) on delete set null,
  email text not null,
  phone text,
  ip text,
  company text,
  score int not null,
  status text not null,
  signals jsonb not null default '[]'::jsonb,
  override_status text,
  override_at timestamptz,
  created_at timestamptz not null default now()
);

-- Integrations
create table integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  name text not null,
  nango_connection_id text,
  status text not null default 'disconnected',
  field_mappings jsonb not null default '[]'::jsonb,
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now()
);

-- Integration logs
create table integration_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references integrations(id) on delete cascade,
  validation_id uuid references validations(id) on delete set null,
  status text not null,
  error text,
  created_at timestamptz not null default now()
);

-- Team members
create table team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  clerk_id text,
  email text not null,
  name text,
  role text not null default 'member',
  status text not null default 'pending',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  amount int not null,
  status text not null default 'pending',
  polar_invoice_id text,
  plan_name text,
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_validations_user_created on validations(user_id, created_at desc);
create index idx_validations_form_created on validations(form_id, created_at desc);
create index idx_validations_user_status on validations(user_id, status);
create index idx_forms_user on forms(user_id);
create index idx_integrations_user on integrations(user_id);
create index idx_team_members_user on team_members(user_id);
create index idx_invoices_user on invoices(user_id);
```

**Step 2: Run this SQL in Supabase**

Go to Supabase Dashboard → SQL Editor → paste and run the schema.

Alternatively, use the Supabase MCP tool `run_sql` if available.

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add database schema for all tables"
```

---

### Task 4: Add Clerk middleware for route protection

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create Clerk middleware**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/login(.*)',
  '/signup(.*)',
  '/docs(.*)',
  '/blog(.*)',
  '/api/webhooks/(.*)',
  '/api/validate',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

This replaces the client-side `RouteGuard` for auth protection. Unauthenticated users hitting `/dashboard/*` or `/onboarding/*` get redirected to Clerk's sign-in page.

**Step 2: Verify the app still starts**

```bash
npm run dev
```

Expected: App starts. Public routes (/, /pricing) work. Protected routes redirect to Clerk sign-in.

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add clerk middleware for route protection"
```

---

### Task 5: Wire Clerk into the root layout

**Files:**
- Modify: `src/app/layout.tsx`

**Step 1: Replace AuthProvider with ClerkProvider**

The root layout currently wraps children in `<AuthProvider>` → `<RouteGuard>`. Replace with Clerk's `<ClerkProvider>`.

```typescript
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bouncer — Stop junk leads before they hit your CRM",
  description:
    "Real-time multi-signal lead validation via JavaScript snippet. Catch fake emails, invalid phones, risky IPs, and ghost companies — all in under 800ms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

Key changes:
- Remove `AuthProvider` and `RouteGuard` imports
- Add `ClerkProvider` wrapping `<html>`
- `RouteGuard` is no longer needed — Clerk middleware handles protection

**Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: replace AuthProvider with ClerkProvider in root layout"
```

---

### Task 6: Create Clerk custom sign-in and sign-up pages

**Files:**
- Create: `src/app/login/[[...login]]/page.tsx`
- Create: `src/app/signup/[[...signup]]/page.tsx`
- Delete: `src/app/login/page.tsx` (old mock login)
- Delete: `src/app/signup/page.tsx` (old mock signup)

**Step 1: Create Clerk sign-in page**

Move existing `src/app/login/page.tsx` to a backup (or delete) and create the Clerk catch-all route.

```typescript
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-dark flex-col justify-between p-10 md:p-16">
        <div className="max-w-[420px] flex flex-col gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand rounded-md" />
            <span className="font-heading text-lg font-semibold text-white">
              Bouncer
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
              Stop junk leads before they hit your CRM
            </h1>
            <p className="text-base text-white/60 leading-relaxed">
              Real-time multi-signal lead validation. Catch fake emails, invalid phones, risky IPs, and ghost companies.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 Bouncer. All rights reserved.</p>
      </div>

      {/* Right — Clerk sign in */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full max-w-[400px]',
              card: 'shadow-none border-0',
            }
          }}
        />
      </div>
    </div>
  );
}
```

**Step 2: Create Clerk sign-up page**

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-dark flex-col justify-between p-10 md:p-16">
        <div className="max-w-[420px] flex flex-col gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand rounded-md" />
            <span className="font-heading text-lg font-semibold text-white">
              Bouncer
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white leading-tight">
              Start validating leads in minutes
            </h1>
            <p className="text-base text-white/60 leading-relaxed">
              250 free validations per month. No credit card required.
            </p>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2026 Bouncer. All rights reserved.</p>
      </div>

      {/* Right — Clerk sign up */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full max-w-[400px]',
              card: 'shadow-none border-0',
            }
          }}
        />
      </div>
    </div>
  );
}
```

**Step 3: Delete old login/signup pages**

Delete `src/app/login/page.tsx` and `src/app/signup/page.tsx` (the ones with mock auth logic).

**Step 4: Verify sign-in flow works**

```bash
npm run dev
```

Navigate to `/login` — should see Clerk's sign-in component. Sign up a test user.

**Step 5: Commit**

```bash
git add -A src/app/login/ src/app/signup/
git commit -m "feat: replace mock login/signup with Clerk auth pages"
```

---

### Task 7: Create Clerk webhook handler

**Files:**
- Create: `src/app/api/webhooks/clerk/route.ts`

**Step 1: Create the webhook route**

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || null;

    const { error } = await supabase
      .from('users')
      .upsert({
        clerk_id: id,
        email: email,
        name: name,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'clerk_id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data;
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  return new Response('OK', { status: 200 });
}
```

**Step 2: Configure the webhook in Clerk Dashboard**

Once deployed (or using ngrok for local dev):
1. Go to Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`
4. Copy the signing secret → update `CLERK_WEBHOOK_SECRET` in `.env.local`

**Step 3: Commit**

```bash
git add src/app/api/webhooks/clerk/route.ts
git commit -m "feat: add clerk webhook handler for user sync to supabase"
```

---

### Task 8: Create API helper for authenticated routes

**Files:**
- Create: `src/lib/api-helpers.ts`

**Step 1: Create helper that gets the current user from Clerk + Supabase**

```typescript
import { auth } from '@clerk/nextjs/server';
import { supabase } from './supabase';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
```

**Step 2: Commit**

```bash
git add src/lib/api-helpers.ts
git commit -m "feat: add api helpers for authenticated route handlers"
```

---

### Task 9: Create user API routes

**Files:**
- Create: `src/app/api/user/route.ts`
- Create: `src/app/api/user/onboarding/route.ts`

**Step 1: Create GET and PATCH `/api/user`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  return jsonResponse(user);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();

  // Only allow updating specific fields
  const allowedFields = [
    'name', 'company_name', 'company_website', 'team_size',
    'scoring_thresholds', 'notification_prefs', 'webhook_config',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return errorResponse('Failed to update user', 500);
  return jsonResponse(data);
}
```

**Step 2: Create PATCH `/api/user/onboarding`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.onboarding_step !== undefined) updates.onboarding_step = body.onboarding_step;
  if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed;
  if (body.company_name !== undefined) updates.company_name = body.company_name;
  if (body.company_website !== undefined) updates.company_website = body.company_website;
  if (body.team_size !== undefined) updates.team_size = body.team_size;
  if (body.scoring_thresholds !== undefined) updates.scoring_thresholds = body.scoring_thresholds;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return errorResponse('Failed to update onboarding', 500);
  return jsonResponse(data);
}
```

**Step 3: Commit**

```bash
git add src/app/api/user/
git commit -m "feat: add user and onboarding API routes"
```

---

### Task 10: Create validations API routes

**Files:**
- Create: `src/app/api/validations/route.ts`
- Create: `src/app/api/validations/[id]/route.ts`
- Create: `src/app/api/validations/[id]/override/route.ts`
- Create: `src/app/api/validations/stats/route.ts`
- Create: `src/app/api/validations/chart/route.ts`
- Create: `src/app/api/validations/export/route.ts`

**Step 1: Create GET `/api/validations` with filters**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const source = url.searchParams.get('source');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('validations')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`email.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (source) {
    query = query.eq('form_id', source);
  }

  const { data, error, count } = await query;

  if (error) return errorResponse('Failed to fetch validations', 500);
  return jsonResponse({ validations: data, total: count, page, limit });
}
```

**Step 2: Create GET `/api/validations/[id]`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { data, error } = await supabase
    .from('validations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return errorResponse('Validation not found', 404);
  return jsonResponse(data);
}
```

**Step 3: Create PATCH `/api/validations/[id]/override`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { data, error } = await supabase
    .from('validations')
    .update({
      override_status: 'Passed',
      override_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to override', 500);
  return jsonResponse(data);
}
```

**Step 4: Create GET `/api/validations/stats`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Today's count
  const { count: todayCount } = await supabase
    .from('validations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart);

  // Month's validations
  const { data: monthValidations } = await supabase
    .from('validations')
    .select('score, status')
    .eq('user_id', user.id)
    .gte('created_at', monthStart);

  const monthCount = monthValidations?.length || 0;
  const passedCount = monthValidations?.filter(v => v.status === 'Passed').length || 0;
  const passRate = monthCount > 0 ? Math.round((passedCount / monthCount) * 100) : 0;
  const avgScore = monthCount > 0
    ? Math.round(monthValidations!.reduce((sum, v) => sum + v.score, 0) / monthCount)
    : 0;

  return jsonResponse({
    validationsToday: todayCount || 0,
    validationsMonth: monthCount,
    passRate,
    avgScore,
    todayChange: 0,
    monthChange: 0,
    passRateChange: 0,
    avgScoreChange: 0,
  });
}
```

**Step 5: Create GET `/api/validations/chart`**

```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get('days') || '7');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data } = await supabase
    .from('validations')
    .select('status, created_at')
    .eq('user_id', user.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chart: Record<string, { passed: number; borderline: number; rejected: number }> = {};

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split('T')[0];
    chart[key] = { passed: 0, borderline: 0, rejected: 0 };
  }

  for (const v of data || []) {
    const key = v.created_at.split('T')[0];
    if (chart[key]) {
      const status = v.status.toLowerCase() as 'passed' | 'borderline' | 'rejected';
      if (chart[key][status] !== undefined) chart[key][status]++;
    }
  }

  const chartData = Object.entries(chart).map(([date, counts]) => ({
    day: dayNames[new Date(date).getDay()],
    ...counts,
  }));

  return jsonResponse(chartData);
}
```

**Step 6: Create GET `/api/validations/export`**

```typescript
import { getCurrentUser, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data } = await supabase
    .from('validations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10000);

  const headers = 'Email,Score,Status,IP,Phone,Company,Created At\n';
  const rows = (data || []).map(v =>
    `${v.email},${v.score},${v.status},${v.ip},${v.phone},${v.company},${v.created_at}`
  ).join('\n');

  return new Response(headers + rows, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bouncer-validations-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
```

**Step 7: Commit**

```bash
git add src/app/api/validations/
git commit -m "feat: add validations API routes (list, detail, override, stats, chart, export)"
```

---

### Task 11: Create forms, integrations, and team API routes

**Files:**
- Create: `src/app/api/forms/route.ts`
- Create: `src/app/api/forms/[id]/route.ts`
- Create: `src/app/api/integrations/route.ts`
- Create: `src/app/api/integrations/[id]/route.ts`
- Create: `src/app/api/team/route.ts`
- Create: `src/app/api/team/[id]/route.ts`

**Step 1: Create forms routes**

`src/app/api/forms/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch forms', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const formKey = `bnc_${randomBytes(16).toString('hex')}`;

  const { data, error } = await supabase
    .from('forms')
    .insert({
      user_id: user.id,
      name: body.name,
      domain: body.domain,
      description: body.description || '',
      form_key: formKey,
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create form', 500);
  return jsonResponse(data, 201);
}
```

`src/app/api/forms/[id]/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('forms')
    .update({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.domain !== undefined && { domain: body.domain }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.is_active !== undefined && { is_active: body.is_active }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to update form', 500);
  return jsonResponse(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return errorResponse('Failed to delete form', 500);
  return jsonResponse({ success: true });
}
```

**Step 2: Create integrations routes**

`src/app/api/integrations/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch integrations', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const { data, error } = await supabase
    .from('integrations')
    .insert({
      user_id: user.id,
      provider: body.provider,
      name: body.name,
      status: 'connected',
      field_mappings: body.field_mappings || [],
      connected_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to create integration', 500);
  return jsonResponse(data, 201);
}
```

`src/app/api/integrations/[id]/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('integrations')
    .update({
      ...(body.status !== undefined && { status: body.status }),
      ...(body.field_mappings !== undefined && { field_mappings: body.field_mappings }),
      ...(body.status === 'connected' && { connected_at: new Date().toISOString() }),
      ...(body.status === 'disconnected' && { connected_at: null, last_sync_at: null }),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to update integration', 500);
  return jsonResponse(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { error } = await supabase
    .from('integrations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return errorResponse('Failed to delete integration', 500);
  return jsonResponse({ success: true });
}
```

**Step 3: Create team routes**

`src/app/api/team/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .order('invited_at', { ascending: false });

  if (error) return errorResponse('Failed to fetch team', 500);
  return jsonResponse(data);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await req.json();
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      user_id: user.id,
      email: body.email,
      name: body.name || body.email.split('@')[0],
      role: body.role || 'member',
    })
    .select()
    .single();

  if (error) return errorResponse('Failed to invite member', 500);
  return jsonResponse(data, 201);
}
```

`src/app/api/team/[id]/route.ts`:
```typescript
import { getCurrentUser, jsonResponse, errorResponse } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('team_members')
    .update({ role: body.role })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error || !data) return errorResponse('Failed to update member', 500);
  return jsonResponse(data);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse('Unauthorized', 401);

  const { id } = await params;
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return errorResponse('Failed to remove member', 500);
  return jsonResponse({ success: true });
}
```

**Step 4: Commit**

```bash
git add src/app/api/forms/ src/app/api/integrations/ src/app/api/team/
git commit -m "feat: add forms, integrations, and team API routes"
```

---

### Task 12: Rewrite AuthContext as a thin Clerk + Supabase wrapper

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

**Step 1: Rewrite AuthContext**

Replace the entire file. The new version uses Clerk's `useUser()` for auth state and fetches the Supabase user profile for app-specific data (plan, company, onboarding status, etc.).

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import type { PlanTier } from '@/lib/types';

interface BouncerUser {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  team_size: string | null;
  plan: PlanTier;
  validations_used: number;
  onboarding_completed: boolean;
  onboarding_step: number;
  scoring_thresholds: {
    passedMin: number;
    borderlineMin: number;
    blockRejected: boolean;
    rejectionMessage: string;
  };
  notification_prefs: {
    emailDigest: boolean;
    weeklyReport: boolean;
    validationAlerts: boolean;
    usageLimitAlerts: boolean;
  };
  webhook_config: {
    url: string;
    events: string[];
    active: boolean;
  };
  api_key: string | null;
  created_at: string;
}

interface AuthContextType {
  user: BouncerUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<BouncerUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [bouncerUser, setBouncerUser] = useState<BouncerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBouncerUser = useCallback(async () => {
    if (!isSignedIn) {
      setBouncerUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        setBouncerUser(data);
      } else {
        setBouncerUser(null);
      }
    } catch {
      setBouncerUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchBouncerUser();
    }
  }, [isLoaded, isSignedIn, fetchBouncerUser]);

  const logout = useCallback(() => {
    signOut();
    setBouncerUser(null);
  }, [signOut]);

  const updateUser = useCallback((updates: Partial<BouncerUser>) => {
    setBouncerUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user: bouncerUser,
      isLoading: !isLoaded || isLoading,
      isAuthenticated: !!bouncerUser,
      logout,
      refreshUser: fetchBouncerUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

Key changes:
- Clerk handles auth state (`useUser()`, `signOut()`)
- `login`, `signup`, `loginWithGoogle` are gone — Clerk handles those via its UI components
- `bouncerUser` is fetched from `/api/user` (Supabase data)
- `updateUser` still works for optimistic local updates
- `refreshUser` lets contexts re-fetch after mutations

**Step 2: Update RouteGuard for Clerk compatibility**

The `RouteGuard` component in `src/components/RouteGuard.tsx` still handles onboarding redirects (which Clerk middleware doesn't know about). Update it to only handle onboarding flow:

```typescript
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
```

**Step 3: Re-add RouteGuard to root layout**

Update `src/app/layout.tsx` to include both `AuthProvider` (the new thin one) and `RouteGuard` inside `ClerkProvider`:

```typescript
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthProvider } from "@/contexts/AuthContext";
import { RouteGuard } from "@/components/RouteGuard";
import "./globals.css";

// ... fonts and metadata unchanged ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
        >
          <AuthProvider>
            <RouteGuard>
              {children}
            </RouteGuard>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**Step 4: Verify auth flow works end-to-end**

```bash
npm run dev
```

1. Visit `/login` → Clerk sign-in UI appears
2. Sign up → Clerk webhook fires → user created in Supabase
3. `/api/user` returns the new user
4. Dashboard loads with user data from Supabase

**Step 5: Commit**

```bash
git add src/contexts/AuthContext.tsx src/components/RouteGuard.tsx src/app/layout.tsx
git commit -m "feat: rewrite AuthContext as Clerk + Supabase wrapper"
```

---

### Task 13: Migrate remaining contexts from localStorage to API

**Files:**
- Modify: `src/contexts/ValidationContext.tsx`
- Modify: `src/contexts/SettingsContext.tsx`
- Modify: `src/contexts/SourcesContext.tsx`
- Modify: `src/contexts/IntegrationContext.tsx`
- Modify: `src/contexts/TeamContext.tsx`
- Modify: `src/contexts/BillingContext.tsx`
- Modify: `src/contexts/OnboardingContext.tsx`

This is the largest task. Each context follows the same pattern: replace `getStored`/`setStored`/`simulateAPI` calls with real `fetch()` calls to the API routes created in Tasks 9-11.

**Step 1: Migrate ValidationContext**

Replace the body of `ValidationProvider`. Key changes:
- On mount: `fetch('/api/validations')` instead of `getStored('validations')`
- `fetchValidations`: Pass filters as query params to `/api/validations?status=...&search=...`
- `overrideValidation`: `fetch('/api/validations/{id}/override', { method: 'PATCH' })`
- `stats`: `fetch('/api/validations/stats')`
- `chartData`: `fetch('/api/validations/chart')`
- `exportCSV`: `window.location.href = '/api/validations/export'` (direct download)
- Remove the 15-30s interval that generates fake validations
- Remove all `getStored`/`setStored` calls and `generateValidations` import

**Step 2: Migrate SettingsContext**

- `updateProfile`: `fetch('/api/user', { method: 'PATCH', body: JSON.stringify(data) })`
- `updateScoring`: `fetch('/api/user', { method: 'PATCH', body: JSON.stringify({ scoring_thresholds }) })`
- `updateNotifications`: `fetch('/api/user', { method: 'PATCH', body: JSON.stringify({ notification_prefs }) })`
- `saveWebhook`: `fetch('/api/user', { method: 'PATCH', body: JSON.stringify({ webhook_config }) })`
- Read initial values from `useAuth().user` instead of localStorage
- Remove all `getStored`/`setStored` calls

**Step 3: Migrate SourcesContext**

- On mount: `fetch('/api/forms')`
- `addSource`: `fetch('/api/forms', { method: 'POST', body: ... })`
- `updateSource`: `fetch('/api/forms/{id}', { method: 'PATCH', body: ... })`
- `deleteSource`: `fetch('/api/forms/{id}', { method: 'DELETE' })`
- `toggleSourceStatus`: `fetch('/api/forms/{id}', { method: 'PATCH', body: { is_active: !current } })`
- Remove `generateSources` import and all localStorage

**Step 4: Migrate IntegrationContext**

- On mount: `fetch('/api/integrations')`
- `connectCRM`: `fetch('/api/integrations', { method: 'POST', body: ... })` or `PATCH` to update status
- `disconnectCRM`: `fetch('/api/integrations/{id}`, { method: 'PATCH', body: { status: 'disconnected' } })`
- `saveFieldMappings`: `fetch('/api/integrations/{id}', { method: 'PATCH', body: { field_mappings } })`
- Remove `generateDefaultConnections` and localStorage

**Step 5: Migrate TeamContext**

- On mount: `fetch('/api/team')`
- `inviteMember`: `fetch('/api/team', { method: 'POST', body: { email, role } })`
- `removeMember`: `fetch('/api/team/{id}', { method: 'DELETE' })`
- `updateRole`: `fetch('/api/team/{id}', { method: 'PATCH', body: { role } })`
- Remove `generateTeamMembers` and localStorage

**Step 6: Migrate OnboardingContext**

- Read initial state from `useAuth().user` (onboarding_step, onboarding_completed, company_name, etc.)
- `saveCompanyProfile`: `fetch('/api/user/onboarding', { method: 'PATCH', body: { company_name, company_website, team_size, onboarding_step: 2 } })`
- `completeOnboarding`: `fetch('/api/user/onboarding', { method: 'PATCH', body: { onboarding_completed: true } })`
- Remove localStorage

**Step 7: Migrate BillingContext**

- Read `plan` and `validations_used` from `useAuth().user`
- `upgradePlan` and `cancelPlan` remain mock for now (Polar integration is a separate phase) — but read the current plan from the real user record
- Remove `generateInvoices` and localStorage
- Invoices stay empty until Polar is wired up

**Step 8: Clean up unused files**

- Remove `src/lib/storage.ts` (no more localStorage)
- Remove `src/lib/mock-data.ts` (no more mock data generators)
- Update `src/lib/api.ts` — remove `simulateAPI` and `generateId` (no longer needed)

**Step 9: Verify the full app works**

```bash
npm run dev
```

Walk through the entire flow:
1. Sign up via Clerk
2. Complete onboarding (company profile, snippet, thresholds)
3. Dashboard loads with empty state (no validations yet — that's expected)
4. Settings pages read/write correctly
5. Sources, integrations, team pages work

```bash
npm run build
```

Expected: Build succeeds with no errors.

**Step 10: Commit**

```bash
git add src/contexts/ src/lib/ src/app/
git commit -m "feat: migrate all contexts from localStorage to Supabase API routes"
```

---

### Task 14: Update pages that directly reference old types/patterns

**Files:**
- Potentially modify: pages that reference `user.firstName`/`user.lastName` (now `user.name`)
- Potentially modify: pages that reference `user.company` (now `user.company_name`)
- Potentially modify: pages that reference `user.onboardingCompleted` (now `user.onboarding_completed`)

**Step 1: Search and update field name references**

The old `User` type had `firstName`, `lastName`, `company`, `onboardingCompleted`. The new Supabase user has `name`, `company_name`, `onboarding_completed`. Find and update all references.

Key files to check:
- `src/app/dashboard/layout.tsx` — uses `user.firstName`, `user.lastName`, `user.plan`
- `src/app/dashboard/settings/page.tsx` — profile form fields
- `src/app/onboarding/*/page.tsx` — onboarding steps
- `src/components/RouteGuard.tsx` — `onboardingCompleted`
- `src/components/Nav.tsx` — may use auth state

**Step 2: Update `src/lib/types.ts`**

Remove the old `User` type and update related interfaces to match the new Supabase column names. The `BouncerUser` type in AuthContext becomes the source of truth.

**Step 3: Verify everything compiles**

```bash
npm run build
```

Expected: No TypeScript errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: update all pages to use new supabase field names"
```

---

### Task 15: Add .env.example and update .gitignore

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`

**Step 1: Create `.env.example`**

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Step 2: Ensure `.gitignore` includes `.env.local`**

Check `.gitignore` has these entries (Next.js default usually includes them):
```
.env*.local
```

**Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example and verify gitignore"
```

---

## Summary

After completing all 15 tasks, the app will have:

- **Real auth** via Clerk (email + Google OAuth, session management)
- **Real database** in Supabase (all tables, indexes, proper schema)
- **User sync** via Clerk webhooks
- **API routes** for all CRUD operations
- **Migrated contexts** — same interface, backed by real data
- **No more localStorage** or mock data generators

Still mock/deferred:
- Billing (Polar) — reads real plan from DB but upgrade/cancel are still placeholders
- CRM integrations (Nango) — CRUD works but actual OAuth/sync not wired
- The `/api/validate` endpoint (snippet validation) — schema ready but Abstract API integration is a separate phase
- Email notifications
