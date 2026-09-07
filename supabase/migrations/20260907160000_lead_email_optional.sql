-- Allow outbound CRM leads without an email address.
alter table public.leads
  alter column email drop not null;
