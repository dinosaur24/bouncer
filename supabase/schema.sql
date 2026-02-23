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
