-- HAIRWEB Online Audit: dedicated audit records + lead score columns

create table if not exists public.salon_audits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'analyzing', 'completed', 'error')),
  lead_id uuid references public.leads (id) on delete set null,

  name text,
  email text,
  phone text,
  salon_name text not null,
  city text not null,
  address text,
  google_place_id text,

  answers jsonb not null default '{}'::jsonb,
  checks jsonb not null default '[]'::jsonb,
  scores jsonb not null default '{}'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  quick_wins jsonb not null default '[]'::jsonb,
  summary text,
  overall_score integer,

  score_web integer,
  score_google integer,
  score_reviews integer,
  score_booking integer,
  score_social integer,
  score_customers integer,
  score_marketing integer,

  relevant_services jsonb not null default '[]'::jsonb,
  attribution jsonb
);

create index if not exists salon_audits_lead_id_idx
  on public.salon_audits (lead_id);
create index if not exists salon_audits_email_idx
  on public.salon_audits (email);
create index if not exists salon_audits_completed_idx
  on public.salon_audits (completed_at desc);

alter table public.salon_audits enable row level security;

create policy "admins can select salon audits"
  on public.salon_audits for select to authenticated using (true);

revoke all on public.salon_audits from anon;
grant select on public.salon_audits to authenticated;
grant all on public.salon_audits to service_role;

alter table public.leads
  add column if not exists online_audit_id uuid,
  add column if not exists audit_score integer,
  add column if not exists audit_completed_at timestamptz,
  add column if not exists audit_web_score integer,
  add column if not exists audit_google_score integer,
  add column if not exists audit_reviews_score integer,
  add column if not exists audit_social_score integer,
  add column if not exists audit_booking_score integer,
  add column if not exists audit_customers_score integer,
  add column if not exists audit_marketing_score integer,
  add column if not exists audit_result jsonb;

create index if not exists leads_online_audit_id_idx
  on public.leads (online_audit_id);
create index if not exists leads_audit_score_idx
  on public.leads (audit_score);
