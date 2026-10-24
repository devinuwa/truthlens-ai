-- TruthLens AI schema
-- Private rows are scoped to auth.uid(). Public catalogue rows are readable by anyone.
-- There is intentionally no client write policy on opportunities. Admin writes use the service role.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analysis_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('message', 'url')),
  label text not null check (char_length(label) between 1 and 80),
  category text not null,
  assessment text not null check (
    assessment in ('suspicious_indicators_found', 'no_major_indicators', 'insufficient_evidence')
  ),
  assessment_label text not null,
  confidence_level text check (confidence_level in ('low', 'medium', 'high')),
  indicators jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  limitations text not null,
  store_source boolean not null default false,
  source_excerpt text check (source_excerpt is null or char_length(source_excerpt) <= 280),
  created_at timestamptz not null default now()
);

create index analysis_reports_user_created_idx
  on public.analysis_reports (user_id, created_at desc);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  provider text not null,
  opportunity_type text not null check (opportunity_type in ('scholarship', 'grant', 'competition', 'internship')),
  region text not null,
  eligibility text not null,
  summary text not null,
  deadline date,
  application_url text not null,
  source_url text not null,
  last_verified date,
  verification_status text not null check (
    verification_status in ('official_checked', 'not_yet_checked', 'demonstration')
  ),
  is_sample boolean not null default true,
  created_at timestamptz not null default now(),
  constraint sample_not_marked_official check (not (is_sample and verification_status = 'official_checked'))
);

create index opportunities_type_idx on public.opportunities (opportunity_type);
create index opportunities_region_idx on public.opportunities (region);

create table public.saved_opportunities (
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, opportunity_id)
);

create table public.lessons (
  slug text primary key,
  title text not null,
  summary text not null,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_slug text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  completed_at timestamptz not null default now()
);

create index quiz_attempts_user_idx on public.quiz_attempts (user_id, lesson_slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1), 'Student'),
      40
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.analysis_reports enable row level security;
alter table public.opportunities enable row level security;
alter table public.saved_opportunities enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_attempts enable row level security;

create policy "read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "read own reports"
  on public.analysis_reports for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert own reports"
  on public.analysis_reports for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "delete own reports"
  on public.analysis_reports for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "public read opportunities"
  on public.opportunities for select
  to anon, authenticated
  using (true);

create policy "read own saves"
  on public.saved_opportunities for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert own saves"
  on public.saved_opportunities for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "delete own saves"
  on public.saved_opportunities for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "public read lessons"
  on public.lessons for select
  to anon, authenticated
  using (true);

create policy "read own quiz attempts"
  on public.quiz_attempts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "insert own quiz attempts"
  on public.quiz_attempts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on public.profiles from anon;
revoke all on public.analysis_reports from anon;
revoke all on public.saved_opportunities from anon;
revoke all on public.quiz_attempts from anon;

grant select on public.opportunities, public.lessons to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.analysis_reports to authenticated;
grant select, insert, delete on public.saved_opportunities to authenticated;
grant select, insert on public.quiz_attempts to authenticated;
