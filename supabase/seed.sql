-- Dev seed only. Do not run in production.
-- Usage: apply manually after migrations when you need sample data.

insert into public.leads (
  type, name, salon_name, email, phone, website, message, package,
  source, source_detail, status, score, notes
) values
(
  'inbound',
  'Test Lead',
  'Studio Test',
  'test@example.com',
  '+420777000111',
  'instagram.com/studio-test',
  'Zajímá mě PRO web.',
  'pro',
  'landing',
  'hero',
  'new',
  70,
  'Dev seed lead'
),
(
  'outbound',
  'Prospect',
  'Barber Room Praha',
  'info@barber-room-example.cz',
  null,
  'https://barber-room-example.cz',
  null,
  null,
  'manual',
  null,
  'new',
  50,
  'Dev outbound prospect'
);
