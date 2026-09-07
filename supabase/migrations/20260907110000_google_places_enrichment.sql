-- Google Places enrichment metadata for leads.

alter table public.leads
  add column if not exists google_place_id text,
  add column if not exists enrichment_status text
    check (
      enrichment_status is null
      or enrichment_status in ('idle', 'running', 'done', 'error')
    ),
  add column if not exists enrichment_error text;

create index if not exists leads_google_place_id_idx
  on public.leads (google_place_id)
  where google_place_id is not null;
