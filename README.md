# Hairweb.cz

Landing page + lead generation systém pro weby kadeřnictví a barbershopů.

Stack: **Next.js 16 (App Router) · TypeScript · Tailwind · Supabase · Resend · Zod**

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Environment variables

See `.env.example`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser + SSR auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for lead inserts (never expose) |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL (admin e-mail links) |
| `RESEND_API_KEY` | Resend API key |
| `HAIRWEB_NOTIFICATION_EMAIL` | Admin inbox for new leads |
| `HAIRWEB_FROM_EMAIL` | Verified sender, e.g. `Hairweb <hello@lukasptacnik.cz>` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 ID |

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy URL + anon key + service role key into `.env.local`.
3. Apply migrations:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste SQL from `supabase/migrations/20260906140759_create_leads.sql` into the SQL editor.

4. Optional dev seed: `supabase/seed.sql` (never on production).

### Auth (admin user)

1. In Supabase Dashboard → Authentication → Users → **Add user**.
2. Create e-mail + password (no public signup UI exists).
3. Disable public signup in Auth settings if available.
4. Log in at `/admin/login`.

RLS is enabled on `leads`:

- `anon` has **no** access
- `authenticated` can select / insert / update
- public form inserts use **service role** on the server

## Resend setup

1. Create account at [resend.com](https://resend.com).
2. Verify sending domain.
3. Set `RESEND_API_KEY`, `HAIRWEB_FROM_EMAIL`, `HAIRWEB_NOTIFICATION_EMAIL`.

If Resend is not configured, leads still save — e-mails are logged and skipped.

## GA4

1. Create a GA4 property.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXX`.
3. Events: `hero_cta_click`, `pricing_*`, `final_cta_click`, `mobile_cta_click`, `lead_form_start`, `generate_lead`.

**TODO:** cookie consent banner before enabling GA in production if required for your jurisdiction.

## Lead flow

Visitor → form → `POST /api/leads` → validation + spam checks → Supabase → admin e-mail → customer confirmation → `generate_lead` event → success UI.

Admin CRM: `/admin` · `/admin/leads` · `/admin/leads/[id]` · `/admin/leads/new`

## Scripts

```bash
npm run lint
npm run build
npx tsc --noEmit
```
