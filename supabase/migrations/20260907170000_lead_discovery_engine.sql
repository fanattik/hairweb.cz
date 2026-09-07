-- Lead Discovery Engine (Phase 1) + Phase 2 schema stubs

-- ---------------------------------------------------------------------------
-- Leads: discovery / opportunity fields (backward compatible)
-- ---------------------------------------------------------------------------

alter table public.leads
  add column if not exists discovery_status text,
  add column if not exists discovery_source text,
  add column if not exists discovery_job_id uuid,
  add column if not exists discovery_run_id uuid,
  add column if not exists business_status text,
  add column if not exists primary_type text,
  add column if not exists google_types jsonb,
  add column if not exists opening_hours jsonb,
  add column if not exists cover_photo_url text,
  add column if not exists opportunity_score integer
    check (
      opportunity_score is null
      or (opportunity_score >= 0 and opportunity_score <= 100)
    ),
  add column if not exists opportunity_grade text
    check (
      opportunity_grade is null
      or opportunity_grade in ('A', 'B', 'C', 'D')
    ),
  add column if not exists opportunity_summary text,
  add column if not exists recommended_pitch text,
  add column if not exists recommended_channel text,
  add column if not exists suggested_service text,
  add column if not exists opportunity_reasons jsonb;

-- Expand enrichment_status for discovery pipeline (keep legacy values).
alter table public.leads drop constraint if exists leads_enrichment_status_check;
alter table public.leads
  add constraint leads_enrichment_status_check
  check (
    enrichment_status is null
    or enrichment_status in (
      'idle',
      'running',
      'done',
      'error',
      'pending',
      'processing',
      'completed',
      'partial',
      'failed'
    )
  );

alter table public.leads drop constraint if exists leads_discovery_status_check;
alter table public.leads
  add constraint leads_discovery_status_check
  check (
    discovery_status is null
    or discovery_status in (
      'discovered',
      'enriching',
      'ready',
      'needs_review',
      'rejected'
    )
  );

alter table public.leads drop constraint if exists leads_source_type_check;
alter table public.leads
  add constraint leads_source_type_check
  check (
    source_type is null
    or source_type in (
      'google_maps',
      'google_places',
      'firmy_cz',
      'instagram',
      'facebook',
      'mapy_cz',
      'manual',
      'csv',
      'xlsx',
      'discovery',
      'other'
    )
  );

create index if not exists leads_opportunity_score_idx
  on public.leads (opportunity_score desc nulls last);
create index if not exists leads_opportunity_grade_idx
  on public.leads (opportunity_grade);
create index if not exists leads_discovery_status_idx
  on public.leads (discovery_status);
create index if not exists leads_discovery_source_idx
  on public.leads (discovery_source);
create index if not exists leads_primary_type_idx
  on public.leads (primary_type);

-- ---------------------------------------------------------------------------
-- Settings (singleton row id = 1)
-- ---------------------------------------------------------------------------

create table if not exists public.lead_discovery_settings (
  id integer primary key default 1 check (id = 1),
  automatic_discovery boolean not null default false,
  default_radius_m integer not null default 15000
    check (default_radius_m > 0 and default_radius_m <= 50000),
  default_max_results integer not null default 20
    check (default_max_results > 0 and default_max_results <= 60),
  daily_api_limit integer not null default 200
    check (daily_api_limit > 0),
  monthly_budget_limit integer,
  ai_enrichment_enabled boolean not null default false,
  website_audit_enabled boolean not null default false,
  google_places_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.lead_discovery_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.lead_discovery_settings enable row level security;

create policy "admins can select discovery settings"
  on public.lead_discovery_settings for select to authenticated using (true);
create policy "admins can update discovery settings"
  on public.lead_discovery_settings for update to authenticated
  using (true) with check (true);

revoke all on public.lead_discovery_settings from anon;
grant select, update on public.lead_discovery_settings to authenticated;
grant all on public.lead_discovery_settings to service_role;

-- ---------------------------------------------------------------------------
-- Discovery jobs
-- ---------------------------------------------------------------------------

create table if not exists public.lead_discovery_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  enabled boolean not null default true,
  city text,
  region text,
  location_query text,
  latitude numeric,
  longitude numeric,
  radius_m integer not null default 15000
    check (radius_m > 0 and radius_m <= 50000),
  business_types jsonb not null default '[]'::jsonb,
  max_results integer not null default 20
    check (max_results > 0 and max_results <= 60),
  provider text not null default 'google_places',
  schedule text not null default 'manual'
    check (schedule in ('manual', 'daily', 'weekly', 'monthly')),
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_by uuid references auth.users (id) on delete set null
);

drop trigger if exists lead_discovery_jobs_set_updated_at on public.lead_discovery_jobs;
create trigger lead_discovery_jobs_set_updated_at
before update on public.lead_discovery_jobs
for each row execute function public.set_updated_at();

create index if not exists lead_discovery_jobs_enabled_idx
  on public.lead_discovery_jobs (enabled);
create index if not exists lead_discovery_jobs_next_run_at_idx
  on public.lead_discovery_jobs (next_run_at);

alter table public.lead_discovery_jobs enable row level security;

create policy "admins can select discovery jobs"
  on public.lead_discovery_jobs for select to authenticated using (true);
create policy "admins can insert discovery jobs"
  on public.lead_discovery_jobs for insert to authenticated with check (true);
create policy "admins can update discovery jobs"
  on public.lead_discovery_jobs for update to authenticated
  using (true) with check (true);
create policy "admins can delete discovery jobs"
  on public.lead_discovery_jobs for delete to authenticated using (true);

revoke all on public.lead_discovery_jobs from anon;
grant select, insert, update, delete on public.lead_discovery_jobs to authenticated;
grant all on public.lead_discovery_jobs to service_role;

-- ---------------------------------------------------------------------------
-- Discovery runs
-- ---------------------------------------------------------------------------

create table if not exists public.lead_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.lead_discovery_jobs (id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed', 'cancelled', 'limit_reached')),
  found_count integer not null default 0,
  new_leads_count integer not null default 0,
  duplicate_count integer not null default 0,
  review_count integer not null default 0,
  failed_count integer not null default 0,
  api_calls integer not null default 0,
  error text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists lead_discovery_runs_job_id_idx
  on public.lead_discovery_runs (job_id, started_at desc);
create index if not exists lead_discovery_runs_started_at_idx
  on public.lead_discovery_runs (started_at desc);

alter table public.lead_discovery_runs enable row level security;

create policy "admins can select discovery runs"
  on public.lead_discovery_runs for select to authenticated using (true);
create policy "admins can insert discovery runs"
  on public.lead_discovery_runs for insert to authenticated with check (true);
create policy "admins can update discovery runs"
  on public.lead_discovery_runs for update to authenticated
  using (true) with check (true);

revoke all on public.lead_discovery_runs from anon;
grant select, insert, update on public.lead_discovery_runs to authenticated;
grant all on public.lead_discovery_runs to service_role;

alter table public.leads
  drop constraint if exists leads_discovery_job_id_fkey;
alter table public.leads
  add constraint leads_discovery_job_id_fkey
  foreign key (discovery_job_id) references public.lead_discovery_jobs (id)
  on delete set null;

alter table public.leads
  drop constraint if exists leads_discovery_run_id_fkey;
alter table public.leads
  add constraint leads_discovery_run_id_fkey
  foreign key (discovery_run_id) references public.lead_discovery_runs (id)
  on delete set null;

-- ---------------------------------------------------------------------------
-- Review queue (probable duplicates)
-- ---------------------------------------------------------------------------

create table if not exists public.lead_discovery_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  run_id uuid references public.lead_discovery_runs (id) on delete set null,
  job_id uuid references public.lead_discovery_jobs (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'merged')),
  match_kind text not null default 'probable_match',
  matched_lead_id uuid references public.leads (id) on delete set null,
  match_reason text,
  candidate jsonb not null,
  resolved_at timestamptz,
  resolved_lead_id uuid references public.leads (id) on delete set null
);

create index if not exists lead_discovery_reviews_status_idx
  on public.lead_discovery_reviews (status, created_at desc);

alter table public.lead_discovery_reviews enable row level security;

create policy "admins can select discovery reviews"
  on public.lead_discovery_reviews for select to authenticated using (true);
create policy "admins can insert discovery reviews"
  on public.lead_discovery_reviews for insert to authenticated with check (true);
create policy "admins can update discovery reviews"
  on public.lead_discovery_reviews for update to authenticated
  using (true) with check (true);

revoke all on public.lead_discovery_reviews from anon;
grant select, insert, update on public.lead_discovery_reviews to authenticated;
grant all on public.lead_discovery_reviews to service_role;

-- ---------------------------------------------------------------------------
-- API usage log (rate limiting / cost control)
-- ---------------------------------------------------------------------------

create table if not exists public.lead_discovery_api_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  provider text not null,
  operation text not null,
  units integer not null default 1,
  job_id uuid references public.lead_discovery_jobs (id) on delete set null,
  run_id uuid references public.lead_discovery_runs (id) on delete set null,
  cache_hit boolean not null default false,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists lead_discovery_api_log_created_at_idx
  on public.lead_discovery_api_log (created_at desc);
create index if not exists lead_discovery_api_log_day_provider_idx
  on public.lead_discovery_api_log (provider, created_at);

alter table public.lead_discovery_api_log enable row level security;

create policy "admins can select discovery api log"
  on public.lead_discovery_api_log for select to authenticated using (true);
create policy "admins can insert discovery api log"
  on public.lead_discovery_api_log for insert to authenticated with check (true);

revoke all on public.lead_discovery_api_log from anon;
grant select, insert on public.lead_discovery_api_log to authenticated;
grant all on public.lead_discovery_api_log to service_role;

-- ---------------------------------------------------------------------------
-- Phase 2 stubs: website audits + opportunity signals
-- ---------------------------------------------------------------------------

create table if not exists public.lead_website_audits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  url text not null,
  http_status integer,
  https_enabled boolean,
  has_mobile_viewport boolean,
  title text,
  meta_description text,
  title_length integer,
  description_length integer,
  has_h1 boolean,
  h1_count integer,
  has_contact_page boolean,
  has_booking_link boolean,
  has_instagram_link boolean,
  has_facebook_link boolean,
  has_google_maps_link boolean,
  page_load_score integer,
  mobile_score integer,
  seo_score integer,
  design_opportunity_score integer,
  technical_opportunity_score integer,
  overall_website_score integer,
  audit_summary text,
  issues_json jsonb not null default '[]'::jsonb
);

create index if not exists lead_website_audits_lead_id_idx
  on public.lead_website_audits (lead_id, created_at desc);

alter table public.lead_website_audits enable row level security;

create policy "admins can select website audits"
  on public.lead_website_audits for select to authenticated using (true);
create policy "admins can insert website audits"
  on public.lead_website_audits for insert to authenticated with check (true);

revoke all on public.lead_website_audits from anon;
grant select, insert on public.lead_website_audits to authenticated;
grant all on public.lead_website_audits to service_role;

create table if not exists public.lead_opportunity_signals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_at timestamptz not null default now(),
  type text not null,
  severity text not null default 'medium'
    check (severity in ('low', 'medium', 'high')),
  score integer not null default 0,
  message text not null,
  source text not null default 'system',
  active boolean not null default true
);

create index if not exists lead_opportunity_signals_lead_id_idx
  on public.lead_opportunity_signals (lead_id, active);
create index if not exists lead_opportunity_signals_type_idx
  on public.lead_opportunity_signals (type);

alter table public.lead_opportunity_signals enable row level security;

create policy "admins can select opportunity signals"
  on public.lead_opportunity_signals for select to authenticated using (true);
create policy "admins can insert opportunity signals"
  on public.lead_opportunity_signals for insert to authenticated with check (true);
create policy "admins can update opportunity signals"
  on public.lead_opportunity_signals for update to authenticated
  using (true) with check (true);
create policy "admins can delete opportunity signals"
  on public.lead_opportunity_signals for delete to authenticated using (true);

revoke all on public.lead_opportunity_signals from anon;
grant select, insert, update, delete on public.lead_opportunity_signals to authenticated;
grant all on public.lead_opportunity_signals to service_role;
