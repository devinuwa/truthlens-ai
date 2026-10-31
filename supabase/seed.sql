-- Demonstration rows only. These organisations are fictional.
-- A sample row is not allowed to claim an official source check.

insert into public.opportunities (
  slug, title, provider, opportunity_type, region, eligibility, summary,
  deadline, application_url, source_url, last_verified, verification_status, is_sample
) values
(
  'demo-harbour-research',
  'Harbour Youth Research Award',
  'Harbour Youth Lab (fictional)',
  'scholarship',
  'Nigeria',
  'Demonstration record for secondary-school students aged 15 to 18. Not a real award.',
  'A sample card showing how a scholarship with a future deadline and a demonstration label should look.',
  '2027-04-30',
  'https://example.com/truthlens-demo/harbour-research',
  'https://example.com/truthlens-demo/harbour-research-source',
  '2026-10-24',
  'demonstration',
  true
),
(
  'demo-cedar-internship',
  'Cedar Campus Design Internship',
  'Cedar Campus Network (fictional)',
  'internship',
  'Online',
  'Sample eligibility: a student who can share a small portfolio. This organisation does not exist.',
  'Use this card to practise reading the provider, the deadline, and the source link before you apply anywhere.',
  '2027-01-15',
  'https://example.com/truthlens-demo/cedar-internship',
  'https://example.com/truthlens-demo/cedar-internship-source',
  '2026-10-24',
  'demonstration',
  true
),
(
  'demo-lakeside-fair',
  'Lakeside Schools Science Fair',
  'Lakeside Schools Alliance (fictional)',
  'competition',
  'West Africa',
  'Sample team of up to three secondary-school students. The fair is not a real event.',
  'The deadline is in the past so the expired label can be demonstrated. Do not try to apply.',
  '2026-03-01',
  'https://example.com/truthlens-demo/lakeside-fair',
  'https://example.com/truthlens-demo/lakeside-fair-source',
  '2026-10-24',
  'demonstration',
  true
),
(
  'demo-northwind-grant',
  'Northwind Community Coding Grant',
  'Northwind Learning Circle (fictional)',
  'grant',
  'International',
  'Sample text for a student club that needs equipment. The provider has not been checked because it is fictional.',
  'This row shows the not-yet-checked status. It is still demonstration data, not a live grant.',
  '2027-06-30',
  'https://example.com/truthlens-demo/northwind-grant',
  'https://example.com/truthlens-demo/northwind-grant-source',
  null,
  'not_yet_checked',
  true
),
(
  'demo-saffron-essay',
  'Saffron Essay Prize',
  'Saffron Reading Room (fictional)',
  'competition',
  'Nigeria',
  'Sample: one original essay from a secondary-school student. There is no prize to claim.',
  'A second open demonstration competition so search and region filters have more than one match.',
  '2027-02-20',
  'https://example.com/truthlens-demo/saffron-essay',
  'https://example.com/truthlens-demo/saffron-essay-source',
  '2026-10-24',
  'demonstration',
  true
),
(
  'demo-kiln-internship',
  'Kiln Studio Weekend Internship',
  'Kiln Studio (fictional)',
  'internship',
  'Nigeria',
  'Sample weekend placement for students aged 16 or older. The studio is not real.',
  'Included so the internship filter and the Nigeria filter can be shown together.',
  '2026-08-12',
  'https://example.com/truthlens-demo/kiln-internship',
  'https://example.com/truthlens-demo/kiln-internship-source',
  '2026-10-24',
  'demonstration',
  true
)
on conflict (slug) do nothing;

insert into public.lessons (slug, title, summary, sort_order) values
  ('pressure-tactics', 'Recognising pressure and manipulation', 'Secrecy, flattery, and fake deadlines are tactics.', 1),
  ('spotting-phishing', 'Spotting phishing messages', 'Signs of a message that wants a password or login code.', 2),
  ('suspicious-links', 'Recognising suspicious links', 'How to read a web address before opening it.', 3),
  ('passwords-and-accounts', 'Protecting passwords and accounts', 'Keep passwords and login codes to yourself.', 4),
  ('scholarship-job-scams', 'Avoiding scholarship and job scams', 'How to slow down when an offer asks for a fee or secrecy.', 5),
  ('cyberbullying', 'Cyberbullying and reporting abuse', 'Leave a cruel conversation and ask for help.', 6),
  ('verify-before-sharing', 'Verifying claims before you share them', 'Check the source before you pass a story on.', 7),
  ('personal-information', 'Protecting personal information online', 'Your school, address, identity numbers, and photos are worth protecting.', 8)
on conflict (slug) do nothing;
