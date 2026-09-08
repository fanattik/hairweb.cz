-- Follow-up sequence fields + activity log for CRM outbound.

alter table public.leads
  add column if not exists followup_count integer not null default 0,
  add column if not exists last_contact_type text
    check (
      last_contact_type is null
      or last_contact_type in (
        'email',
        'phone',
        'sms',
        'whatsapp',
        'instagram',
        'other'
      )
    ),
  add column if not exists last_followup_at timestamptz,
  add column if not exists followup_paused boolean not null default false,
  add column if not exists followup_stopped boolean not null default false;

comment on column public.leads.followup_count is
  'How many follow-ups have been completed (0 = only initial contact scheduled).';
comment on column public.leads.followup_paused is
  'When true, lead is hidden from due queues until resumed.';
comment on column public.leads.followup_stopped is
  'When true, automatic follow-up sequence is stopped (reply / won / lost / skip).';

create index if not exists leads_followup_due_idx
  on public.leads (next_followup_at)
  where followup_paused = false
    and followup_stopped = false
    and next_followup_at is not null;

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  activity_type text not null
    check (
      activity_type in (
        'contact',
        'followup',
        'snooze',
        'manual_schedule',
        'cancel',
        'pause',
        'resume',
        'reply',
        'stop',
        'note'
      )
    ),
  summary text not null,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists lead_activities_lead_id_idx
  on public.lead_activities (lead_id, created_at desc);

alter table public.lead_activities enable row level security;

create policy "admins can select lead activities"
  on public.lead_activities for select to authenticated using (true);
create policy "admins can insert lead activities"
  on public.lead_activities for insert to authenticated with check (true);

revoke all on public.lead_activities from anon;
grant select, insert on public.lead_activities to authenticated;
grant all on public.lead_activities to service_role;
