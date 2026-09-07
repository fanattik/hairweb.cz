-- Lead map coordinates + persisted Lighthouse category scores (0-100)
alter table public.leads
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists lighthouse_performance integer,
  add column if not exists lighthouse_accessibility integer,
  add column if not exists lighthouse_seo integer,
  add column if not exists lighthouse_best_practices integer;

comment on column public.leads.latitude is 'WGS84 latitude for dashboard map';
comment on column public.leads.longitude is 'WGS84 longitude for dashboard map';
