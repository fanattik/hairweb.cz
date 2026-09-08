-- First/last-touch marketing attribution for inbound leads.
-- Legacy utm_* / referrer / landing_page stay as first-touch aliases for compatibility.

alter table public.leads
  add column if not exists fbclid text,
  add column if not exists first_touch_at timestamptz,
  add column if not exists first_touch_source text,
  add column if not exists first_touch_medium text,
  add column if not exists first_touch_campaign text,
  add column if not exists first_touch_content text,
  add column if not exists first_touch_term text,
  add column if not exists first_touch_landing_page text,
  add column if not exists first_touch_referrer text,
  add column if not exists last_touch_at timestamptz,
  add column if not exists last_touch_source text,
  add column if not exists last_touch_medium text,
  add column if not exists last_touch_campaign text,
  add column if not exists last_touch_content text,
  add column if not exists last_touch_term text,
  add column if not exists last_touch_landing_page text,
  add column if not exists last_touch_referrer text,
  add column if not exists last_touch_fbclid text;

comment on column public.leads.fbclid is
  'Facebook click id from first attributed visit (nullable).';
comment on column public.leads.first_touch_at is
  'When first marketing attribution was captured in the visitor browser.';

-- Backfill first-touch from existing inbound UTM snapshot.
update public.leads
set
  first_touch_source = coalesce(first_touch_source, utm_source),
  first_touch_medium = coalesce(first_touch_medium, utm_medium),
  first_touch_campaign = coalesce(first_touch_campaign, utm_campaign),
  first_touch_content = coalesce(first_touch_content, utm_content),
  first_touch_term = coalesce(first_touch_term, utm_term),
  first_touch_landing_page = coalesce(first_touch_landing_page, landing_page),
  first_touch_referrer = coalesce(first_touch_referrer, referrer),
  first_touch_at = coalesce(first_touch_at, created_at),
  last_touch_source = coalesce(last_touch_source, utm_source),
  last_touch_medium = coalesce(last_touch_medium, utm_medium),
  last_touch_campaign = coalesce(last_touch_campaign, utm_campaign),
  last_touch_content = coalesce(last_touch_content, utm_content),
  last_touch_term = coalesce(last_touch_term, utm_term),
  last_touch_landing_page = coalesce(last_touch_landing_page, landing_page),
  last_touch_referrer = coalesce(last_touch_referrer, referrer),
  last_touch_at = coalesce(last_touch_at, created_at)
where type = 'inbound'
  and (
    utm_source is not null
    or utm_medium is not null
    or utm_campaign is not null
    or landing_page is not null
    or referrer is not null
  );

create index if not exists leads_first_touch_campaign_idx
  on public.leads (first_touch_campaign)
  where first_touch_campaign is not null;

create index if not exists leads_first_touch_source_idx
  on public.leads (first_touch_source)
  where first_touch_source is not null;
