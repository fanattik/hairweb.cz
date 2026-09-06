-- Hairweb leads CRM
-- Public has no access; inserts/updates go through server (service role) or authenticated admin.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  type text not null default 'inbound'
    check (type in ('inbound', 'outbound')),
  name text not null,
  salon_name text,
  email text not null,
  phone text,
  website text not null,
  message text,
  package text
    check (package is null or package in ('start', 'pro')),
  source text,
  source_detail text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'interested', 'meeting', 'proposal', 'won', 'lost')),
  score integer
    check (score is null or (score >= 0 and score <= 100)),
  notes text,
  last_contact_at timestamptz,
  next_followup_at timestamptz,
  won_value numeric(12, 2),
  lost_reason text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_next_followup_at_idx on public.leads (next_followup_at);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_utm_campaign_idx on public.leads (utm_campaign);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.leads enable row level security;

-- Authenticated admins (manually created accounts) can manage leads.
create policy "admins can select leads"
  on public.leads
  for select
  to authenticated
  using (true);

create policy "admins can insert leads"
  on public.leads
  for insert
  to authenticated
  with check (true);

create policy "admins can update leads"
  on public.leads
  for update
  to authenticated
  using (true)
  with check (true);

-- No anon policies: public submissions use service role on the server only.
revoke all on public.leads from anon;
grant select, insert, update on public.leads to authenticated;
grant all on public.leads to service_role;
