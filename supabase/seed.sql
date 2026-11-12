-- Real secondary-school records checked against the organiser pages on 2026-11-12.
-- Fictional practice cards stay in lib/opportunities/sample-data.ts and are not inserted here.
-- A sample row is not allowed to claim an official source check.

insert into public.opportunities (
  slug, title, provider, opportunity_type, region, eligibility, summary,
  deadline, application_url, source_url, last_verified, verification_status, is_sample
) values
(
  'senator-mohammed-sani-musa-scholarship',
  'Senator Mohammed Sani Musa Scholarship',
  'Senator Mohammed Sani Musa Scholarship portal',
  'scholarship',
  'Nigeria',
  'Indigene of Niger East: Bosso, Chanchaga, Gurara, Munya, Paikoro, Rafi, Shiroro, Suleja, or Tafa. Age 22 or under. At least seven WAEC credits, including English and Mathematics, plus 2025/2026 WAEC results and a NIN. The portal also refers to Algeria application guidelines.',
  'The portal named for Senator Mohammed Sani Musa does not list a closing date. It asks for WAEC results, so it is for students who already have those results. Read that portal yourself. Do not pay anyone who offers to apply for you.',
  null,
  'https://www.senatorsanimusascholarship.com/',
  'https://www.senatorsanimusascholarship.com/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'zenith-bank-future-innovators-challenge',
  'Zenith Bank Future Innovators Challenge',
  'Zenith Bank with Beyond Limits',
  'competition',
  'Nigeria',
  'A team of 2 to 4 students in SS1, SS2, or SS3 at one registered secondary school in Nigeria, with a teacher as the contact. The idea must fit a priority area on the organiser page.',
  'Zenith Bank''s 2026 secondary-school competition. The page lists applications from 22 September to 13 October 2026, and school prizes of 5 million, 3 million, and 2 million naira. A separate Zenith essay competition was not on the pages checked. Do not pay to enter.',
  '2026-10-13',
  'https://beyondlimits.global/zecathonfutureinnovatorschallenge/',
  'https://beyondlimits.global/zecathonfutureinnovatorschallenge/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'cowbellpedia-secondary-school-quiz',
  'Cowbellpedia secondary school quiz',
  'Promasidor Nigeria (Cowbell)',
  'competition',
  'Nigeria',
  'Secondary-school students. Promasidor''s 2025 report says more than 5,000 students aged 11 to 17 sat a computer-based test, in junior and senior categories.',
  'Cowbellpedia is Promasidor''s secondary-school quiz. It began as a mathematics competition. The 2025 report describes STEM and general knowledge, and a prize-giving on 24 July 2025. No new registration page opened on 12 November 2026. Do not use a form that is not on Promasidor''s page.',
  '2025-07-24',
  'https://promasidor.com/en/blog/cowbellpedia-25-crowns-the-mega-minds/',
  'https://promasidor.com/en/blog/cowbellpedia-25-crowns-the-mega-minds/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'uba-foundation-national-essay-2026',
  'UBA Foundation National Essay Competition 2026',
  'UBA Foundation',
  'competition',
  'Nigeria',
  'A Nigerian student in senior secondary school. The 2026 page asks for a handwritten essay of at most 750 words, a passport photograph, and a birth certificate, national ID, or international passport.',
  'UBA Foundation''s 2026 essay competition for senior secondary students. The topic on the page is how Nigeria can deal with food security. The page says the deadline was 23 October 2026 and that applications are closed. Do not pay someone to submit an essay for you.',
  '2026-10-23',
  'https://www.ubagroup.com/our-impact/uba-foundation/national-essay-competition/',
  'https://www.ubagroup.com/our-impact/uba-foundation/national-essay-competition/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'interswitchspak-season-8',
  'InterswitchSPAK Season 8',
  'Interswitch',
  'competition',
  'Nigeria',
  'Year 11 (SS2) students in Nigeria. Interswitch said schools could register a group and parents could register a child. Registration for this season has closed.',
  'A STEM competition. Registration closed on 24 May 2026. Interswitch later said the top 81 students, from more than 21,700 entries, continue to a televised stage from November 2026 to January 2027. Stated top prizes are 15, 10, and 5 million naira in tertiary scholarships over five years.',
  '2026-05-24',
  'https://interswitchspak.com/',
  'https://interswitchgroup.com/news/top-81-students-emerge-in-interswitchspak-national-science-competition-from-over-21-700-entries-nationwide/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'akors-education-accessory-aide-2026',
  'Akors Education Accessory Aide 2026/2027',
  'Akors Foundation',
  'grant',
  'Nigeria',
  'Primary, secondary, and tertiary students use separate forms. The announcement limits grants to the first 40 qualified applications and does not list a cash amount.',
  'Akors Foundation says this aide opens on 1 December 2026 and closes on 31 January 2027. The form is not open yet. Use the foundation''s own page when it opens. Do not pay a third party to submit it.',
  '2027-01-31',
  'https://akorsfoundation.com/applications-open-1-december-2026/',
  'https://akorsfoundation.com/applications-open-1-december-2026/',
  '2026-11-12',
  'official_checked',
  false
),
(
  'ffj-memorial-exam-support-2026',
  'FFJ Memorial exam support 2026/2027',
  'Sheerah Verenda Full Life Initiative with the Felix Ibeanusi Family',
  'grant',
  'Nigeria',
  'Students preparing for Junior WAEC, SSCE/WAEC, or JAMB. The scheme requires membership of AME Zion Church, Oburo Ogwa, indigene status in Oburo Umuokparanyanwu, Ogwa, a top-three class rank, a recommendation, and a need for help with the exam fee.',
  'Exam-fee support for that named community. The deadline was extended to 31 December 2026. Forms are collected at the AME Zion Church office in Oburo Ogwa. If you are not in that church and community, this scheme is not for you.',
  '2026-12-31',
  'https://sheerahverenda.org/ffj-memorial-educational-support-scheme-deadline-extended/',
  'https://sheerahverenda.org/ffj-memorial-educational-support-scheme-deadline-extended/',
  '2026-11-12',
  'official_checked',
  false
)
on conflict (slug) do update set
  title = excluded.title,
  provider = excluded.provider,
  opportunity_type = excluded.opportunity_type,
  region = excluded.region,
  eligibility = excluded.eligibility,
  summary = excluded.summary,
  deadline = excluded.deadline,
  application_url = excluded.application_url,
  source_url = excluded.source_url,
  last_verified = excluded.last_verified,
  verification_status = excluded.verification_status,
  is_sample = excluded.is_sample;

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
