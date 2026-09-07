-- Bulk lead import V1: extra lead fields + import sessions

alter table public.leads
  add column if not exists facebook_url text,
  add column if not exists address text,
  add column if not exists postal_code text,
  add column if not exists country text,
  add column if not exists website_domain text,
  add column if not exists phone_normalized text,
  add column if not exists email_normalized text,
  add column if not exists salon_name_normalized text,
  add column if not exists raw_import_data jsonb,
  add column if not exists source_type text,
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists lead_grade text;

alter table public.leads
  drop constraint if exists leads_lead_grade_check;
alter table public.leads
  add constraint leads_lead_grade_check
  check (lead_grade is null or lead_grade in ('A', 'B', 'C', 'D'));

alter table public.leads
  drop constraint if exists leads_source_type_check;
alter table public.leads
  add constraint leads_source_type_check
  check (
    source_type is null
    or source_type in (
      'google_maps',
      'firmy_cz',
      'instagram',
      'manual',
      'csv',
      'xlsx',
      'other'
    )
  );

create index if not exists leads_website_domain_idx on public.leads (website_domain);
create index if not exists leads_phone_normalized_idx on public.leads (phone_normalized);
create index if not exists leads_email_normalized_idx on public.leads (email_normalized);
create index if not exists leads_lead_grade_idx on public.leads (lead_grade);
create index if not exists leads_source_type_idx on public.leads (source_type);
create index if not exists leads_salon_city_norm_idx
  on public.leads (salon_name_normalized, city);

create table if not exists public.lead_imports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  file_name text,
  import_method text not null
    check (import_method in ('csv', 'xlsx', 'paste')),
  source_type text
    check (
      source_type is null
      or source_type in (
        'google_maps',
        'firmy_cz',
        'instagram',
        'manual',
        'csv',
        'xlsx',
        'other'
      )
    ),
  source_name text,
  source_url text,
  total_rows integer not null default 0,
  new_count integer not null default 0,
  duplicate_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  invalid_count integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  error text,
  column_mapping jsonb,
  options jsonb
);

create index if not exists lead_imports_created_at_idx
  on public.lead_imports (created_at desc);

create table if not exists public.lead_import_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  import_id uuid not null references public.lead_imports (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  row_number integer not null,
  status text not null
    check (
      status in (
        'created',
        'updated',
        'duplicate',
        'skipped',
        'invalid',
        'failed'
      )
    ),
  match_reason text,
  action text
    check (
      action is null
      or action in ('create', 'skip', 'update', 'fill_blank')
    ),
  raw_data jsonb,
  normalized_data jsonb,
  error text
);

create index if not exists lead_import_items_import_idx
  on public.lead_import_items (import_id, row_number);
create index if not exists lead_import_items_lead_idx
  on public.lead_import_items (lead_id);

alter table public.lead_imports enable row level security;
alter table public.lead_import_items enable row level security;

drop policy if exists "Authenticated read lead_imports" on public.lead_imports;
create policy "Authenticated read lead_imports"
  on public.lead_imports for select to authenticated using (true);

drop policy if exists "Authenticated insert lead_imports" on public.lead_imports;
create policy "Authenticated insert lead_imports"
  on public.lead_imports for insert to authenticated with check (true);

drop policy if exists "Authenticated update lead_imports" on public.lead_imports;
create policy "Authenticated update lead_imports"
  on public.lead_imports for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated read lead_import_items" on public.lead_import_items;
create policy "Authenticated read lead_import_items"
  on public.lead_import_items for select to authenticated using (true);

drop policy if exists "Authenticated insert lead_import_items" on public.lead_import_items;
create policy "Authenticated insert lead_import_items"
  on public.lead_import_items for insert to authenticated with check (true);

drop policy if exists "Authenticated update lead_import_items" on public.lead_import_items;
create policy "Authenticated update lead_import_items"
  on public.lead_import_items for update to authenticated using (true) with check (true);

grant select, insert, update on public.lead_imports to authenticated;
grant select, insert, update on public.lead_import_items to authenticated;
grant all on public.lead_imports to service_role;
grant all on public.lead_import_items to service_role;
