-- Instagram enrichment metadata for leads.

alter table public.leads
  add column if not exists instagram_media_count integer
    check (instagram_media_count is null or instagram_media_count >= 0),
  add column if not exists instagram_name text,
  add column if not exists instagram_biography text,
  add column if not exists instagram_suggested_quality text
    check (
      instagram_suggested_quality is null
      or instagram_suggested_quality in ('poor', 'average', 'good', 'excellent')
    );
