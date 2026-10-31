-- Quiz passes are stored per student. The answer key is not readable by the browser role.
-- A student cannot insert a score directly, and a later lesson is rejected until the previous one is passed.

create table if not exists public.academy_settings (
  id integer primary key,
  pass_ratio numeric not null,
  constraint academy_settings_one_row check (id = 1),
  constraint academy_settings_ratio check (pass_ratio > 0 and pass_ratio <= 1)
);

insert into public.academy_settings (id, pass_ratio)
values (1, 0.8)
on conflict (id) do nothing;

create table if not exists public.academy_path (
  slug text primary key,
  position integer not null unique,
  chapter_slug text not null,
  chapter_title text not null
);

create table if not exists public.lesson_keys (
  slug text primary key,
  correct_indexes integer[] not null
);

alter table public.academy_settings enable row level security;
alter table public.academy_path enable row level security;
alter table public.lesson_keys enable row level security;

drop policy if exists "read academy settings" on public.academy_settings;
create policy "read academy settings"
  on public.academy_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "read academy path" on public.academy_path;
create policy "read academy path"
  on public.academy_path for select
  to anon, authenticated
  using (true);

drop policy if exists "insert own quiz attempts" on public.quiz_attempts;

insert into public.academy_path (slug, position, chapter_slug, chapter_title) values
  ('pressure-tactics', 1, 'online-threats', 'Understanding Online Threats'),
  ('spotting-phishing', 2, 'phishing-messages', 'Phishing and Suspicious Messages'),
  ('suspicious-links', 3, 'phishing-messages', 'Phishing and Suspicious Messages'),
  ('passwords-and-accounts', 4, 'passwords', 'Passwords and Account Security'),
  ('scholarship-job-scams', 5, 'opportunity-scams', 'Scholarship and Job Scams'),
  ('cyberbullying', 6, 'social-media', 'Social Media Safety'),
  ('verify-before-sharing', 7, 'social-media', 'Social Media Safety'),
  ('personal-information', 8, 'staying-safe', 'Staying Safe Online')
on conflict (slug) do update
set position = excluded.position,
    chapter_slug = excluded.chapter_slug,
    chapter_title = excluded.chapter_title;

insert into public.lesson_keys (slug, correct_indexes) values
  ('pressure-tactics', array[1, 1, 1]),
  ('spotting-phishing', array[1, 0, 1]),
  ('suspicious-links', array[1, 1, 1]),
  ('passwords-and-accounts', array[1, 1, 1]),
  ('scholarship-job-scams', array[1, 1, 1]),
  ('cyberbullying', array[1, 1, 1]),
  ('verify-before-sharing', array[1, 1, 1]),
  ('personal-information', array[1, 1, 0])
on conflict (slug) do update
set correct_indexes = excluded.correct_indexes;

update public.lessons as lesson
set sort_order = path.position
from public.academy_path as path
where lesson.slug = path.slug;

create or replace function public.submit_academy_quiz(p_slug text, p_answers integer[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  keys integer[];
  total integer;
  score integer := 0;
  ratio numeric := 0.8;
  prev text;
  prev_ok boolean;
  passed boolean;
  index integer;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;

  select correct_indexes into keys from public.lesson_keys where slug = p_slug;
  if keys is null then
    raise exception 'unknown lesson';
  end if;

  total := cardinality(keys);
  if p_answers is null or cardinality(p_answers) <> total then
    raise exception 'answer count';
  end if;

  for index in 1..total loop
    if p_answers[index] = keys[index] then
      score := score + 1;
    end if;
  end loop;

  select pass_ratio into ratio from public.academy_settings where id = 1;
  if ratio is null then
    ratio := 0.8;
  end if;

  select slug into prev
  from public.academy_path
  where position < (select position from public.academy_path where slug = p_slug)
  order by position desc
  limit 1;

  if prev is not null then
    select exists (
      select 1
      from public.quiz_attempts
      where user_id = uid
        and lesson_slug = prev
        and (quiz_attempts.score::numeric / quiz_attempts.total) >= ratio
    ) into prev_ok;
    if not coalesce(prev_ok, false) then
      raise exception 'locked';
    end if;
  end if;

  passed := (score::numeric / total) >= ratio;

  insert into public.quiz_attempts (user_id, lesson_slug, score, total)
  values (uid, p_slug, score, total);

  return jsonb_build_object('score', score, 'total', total, 'passed', passed);
end;
$$;

revoke all on function public.submit_academy_quiz(text, integer[]) from public, anon;
grant execute on function public.submit_academy_quiz(text, integer[]) to authenticated;

revoke all on public.lesson_keys from anon, authenticated;
grant select on public.academy_settings, public.academy_path to anon, authenticated;
