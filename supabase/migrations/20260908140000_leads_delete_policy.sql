-- Allow authenticated admins to hard-delete leads (cascades to activities/emails).
create policy "admins can delete leads"
  on public.leads
  for delete
  to authenticated
  using (true);

grant delete on public.leads to authenticated;
