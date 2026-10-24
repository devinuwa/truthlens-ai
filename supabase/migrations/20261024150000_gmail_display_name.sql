-- Gmail sign-in stores the account name as full_name or name, not display_name.
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
      coalesce(
        nullif(new.raw_user_meta_data->>'display_name', ''),
        nullif(new.raw_user_meta_data->>'full_name', ''),
        nullif(new.raw_user_meta_data->>'name', ''),
        split_part(new.email, '@', 1),
        'Student'
      ),
      40
    )
  );
  return new;
end;
$$;
