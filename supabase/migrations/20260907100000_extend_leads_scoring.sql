-- Extend leads with salon qualification, web audit, and Hairweb Lead Score fields.
-- Existing rows stay valid: all new columns are nullable / have safe defaults.

alter table public.leads
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists contact_person text,

  add column if not exists google_rating numeric(2,1)
    check (google_rating is null or (google_rating >= 0 and google_rating <= 5)),
  add column if not exists google_reviews_count integer
    check (google_reviews_count is null or google_reviews_count >= 0),
  add column if not exists google_maps_url text,

  add column if not exists instagram_url text,
  add column if not exists instagram_handle text,
  add column if not exists instagram_active boolean,
  add column if not exists instagram_followers integer
    check (instagram_followers is null or instagram_followers >= 0),
  add column if not exists instagram_quality text
    check (
      instagram_quality is null
      or instagram_quality in ('poor', 'average', 'good', 'excellent')
    ),

  add column if not exists has_online_booking boolean,
  add column if not exists booking_provider text,
  add column if not exists booking_url text,

  add column if not exists business_size text
    check (
      business_size is null
      or business_size in ('solo', 'small', 'medium', 'large', 'unknown')
    ),
  add column if not exists premium_impression boolean,
  add column if not exists professional_photos boolean,
  add column if not exists professional_branding boolean,
  add column if not exists paid_marketing boolean,

  add column if not exists has_website boolean,
  add column if not exists website_design_score integer
    check (website_design_score is null or (website_design_score >= 0 and website_design_score <= 20)),
  add column if not exists website_mobile_score integer
    check (website_mobile_score is null or (website_mobile_score >= 0 and website_mobile_score <= 15)),
  add column if not exists website_cta_score integer
    check (website_cta_score is null or (website_cta_score >= 0 and website_cta_score <= 15)),
  add column if not exists website_content_score integer
    check (website_content_score is null or (website_content_score >= 0 and website_content_score <= 15)),
  add column if not exists website_trust_score integer
    check (website_trust_score is null or (website_trust_score >= 0 and website_trust_score <= 10)),
  add column if not exists website_seo_score integer
    check (website_seo_score is null or (website_seo_score >= 0 and website_seo_score <= 15)),
  add column if not exists website_performance_score integer
    check (
      website_performance_score is null
      or (website_performance_score >= 0 and website_performance_score <= 10)
    ),
  add column if not exists web_score integer
    check (web_score is null or (web_score >= 0 and web_score <= 100)),

  add column if not exists website_outdated boolean,
  add column if not exists website_mobile_problem boolean,
  add column if not exists website_clear_booking_cta boolean,
  add column if not exists website_has_prices boolean,
  add column if not exists website_has_gallery boolean,
  add column if not exists website_has_team boolean,
  add column if not exists website_has_reviews boolean,

  add column if not exists website_audit text,
  add column if not exists opportunity_note text,

  add column if not exists business_score integer
    check (business_score is null or (business_score >= 0 and business_score <= 30)),
  add column if not exists web_opportunity_score integer
    check (
      web_opportunity_score is null
      or (web_opportunity_score >= 0 and web_opportunity_score <= 40)
    ),
  add column if not exists purchase_intent_score integer
    check (
      purchase_intent_score is null
      or (purchase_intent_score >= 0 and purchase_intent_score <= 20)
    ),
  add column if not exists contactability_score integer
    check (
      contactability_score is null
      or (contactability_score >= 0 and contactability_score <= 10)
    ),
  add column if not exists lead_score integer
    check (lead_score is null or (lead_score >= 0 and lead_score <= 100)),

  add column if not exists enrichment_source text default 'manual',
  add column if not exists last_enriched_at timestamptz;

create index if not exists leads_lead_score_idx on public.leads (lead_score desc nulls last);
create index if not exists leads_city_idx on public.leads (city);
create index if not exists leads_google_rating_idx on public.leads (google_rating desc nulls last);
create index if not exists leads_google_reviews_count_idx on public.leads (google_reviews_count desc nulls last);
create index if not exists leads_web_score_idx on public.leads (web_score);
