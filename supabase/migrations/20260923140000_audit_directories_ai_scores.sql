-- Optional score columns for directories + AI discoverability in online audit

alter table public.salon_audits
  add column if not exists score_directories integer,
  add column if not exists score_ai integer;

alter table public.leads
  add column if not exists audit_directories_score integer,
  add column if not exists audit_ai_score integer;
