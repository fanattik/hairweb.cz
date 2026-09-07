-- Outbound CRM emails sent from lead detail.

create table if not exists public.lead_emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  to_email text not null,
  subject text not null,
  body_text text not null,
  template_key text,
  resend_id text,
  status text not null default 'sent'
    check (status in ('sent', 'failed')),
  error text
);

create index if not exists lead_emails_lead_id_idx
  on public.lead_emails (lead_id, created_at desc);

alter table public.lead_emails enable row level security;

create policy "admins can select lead emails"
  on public.lead_emails for select to authenticated using (true);
create policy "admins can insert lead emails"
  on public.lead_emails for insert to authenticated with check (true);

revoke all on public.lead_emails from anon;
grant select, insert on public.lead_emails to authenticated;
grant all on public.lead_emails to service_role;
