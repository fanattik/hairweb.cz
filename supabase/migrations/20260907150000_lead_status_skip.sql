-- Add lead status "skip" (Neřešit) and refresh check constraint
alter table public.leads drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check
  check (
    status in (
      'new',
      'contacted',
      'interested',
      'meeting',
      'proposal',
      'won',
      'lost',
      'skip'
    )
  );
