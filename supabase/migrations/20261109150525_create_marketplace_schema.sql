create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) >= 2),
  role text not null default 'owner'
    check (role in ('owner', 'freelancer', 'admin')),
  title text,
  service text,
  category text,
  subcategories text[] not null default '{}',
  price numeric(12, 2) check (price is null or price >= 0),
  rating numeric(3, 2) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  location text,
  languages text[] not null default '{}',
  verified boolean not null default false,
  experience text check (experience is null or experience in ('new', 'established', 'expert')),
  availability text check (availability is null or availability in ('this week', 'this month', 'flexible')),
  accepts_mpesa boolean not null default false,
  online boolean not null default false,
  bio text,
  avatar_url text,
  portfolio jsonb not null default '[]'::jsonb
    check (jsonb_typeof(portfolio) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  client_name text not null,
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  freelancer_name text not null,
  service text not null check (length(trim(service)) > 0),
  description text not null check (length(trim(description)) >= 12),
  budget numeric(12, 2) not null check (budget > 0),
  deadline date not null,
  location text not null check (length(trim(location)) > 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_requests_distinct_parties check (client_id <> freelancer_id)
);

create table public.saved_profiles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id),
  constraint saved_profiles_distinct_users check (user_id <> profile_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.job_requests (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  client_name text not null,
  freelancer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (length(trim(comment)) >= 10),
  created_at timestamptz not null default now()
);

create index profiles_category_idx on public.profiles (category);
create index profiles_location_idx on public.profiles (location);
create index profiles_availability_idx on public.profiles (availability);
create index profiles_price_idx on public.profiles (price);
create index profiles_languages_gin_idx on public.profiles using gin (languages);
create index profiles_subcategories_gin_idx on public.profiles using gin (subcategories);
create index job_requests_client_created_idx
  on public.job_requests (client_id, created_at desc);
create index job_requests_freelancer_created_idx
  on public.job_requests (freelancer_id, created_at desc);
create index reviews_freelancer_created_idx
  on public.reviews (freelancer_id, created_at desc);
create index saved_profiles_profile_idx on public.saved_profiles (profile_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_admin() from public, anon;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  profile_name text := nullif(trim(new.raw_user_meta_data ->> 'name'), '');
  is_freelancer boolean := requested_role = 'freelancer';
begin
  insert into public.profiles (
    id, name, role, title, service, category, price, location, languages,
    experience, availability, accepts_mpesa, bio
  )
  values (
    new.id,
    coalesce(
      profile_name,
      nullif(split_part(coalesce(new.email, new.phone, ''), '@', 1), ''),
      'KaziLink member'
    ),
    case when is_freelancer then 'freelancer' else 'owner' end,
    case when is_freelancer then 'Digital freelancer' end,
    case when is_freelancer then 'Digital services' end,
    case when is_freelancer then 'Design and Creative' end,
    case when is_freelancer then 2500 end,
    case when is_freelancer then 'Nairobi' end,
    case when is_freelancer then array['English', 'Kiswahili'] else '{}' end,
    case when is_freelancer then 'new' end,
    case when is_freelancer then 'flexible' end,
    coalesce(is_freelancer, false),
    case
      when is_freelancer
        then 'Tell local businesses a little about what you do and how you can help.'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null
    and current_user not in ('postgres', 'service_role')
    and not public.is_admin()
    and (
      new.role is distinct from old.role
      or new.verified is distinct from old.verified
      or new.rating is distinct from old.rating
      or new.review_count is distinct from old.review_count
    )
  then
    raise exception 'Role, verification, and review totals are managed by KaziLink.';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger job_requests_set_updated_at
  before update on public.job_requests
  for each row execute function public.set_updated_at();

create or replace function public.populate_job_request_names()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select name into new.client_name
  from public.profiles
  where id = new.client_id;
  select name into new.freelancer_name
  from public.profiles
  where id = new.freelancer_id;

  if new.client_name is null or new.freelancer_name is null then
    raise exception 'Both job request participants must have profiles.';
  end if;
  return new;
end;
$$;

create trigger job_requests_populate_names
  before insert on public.job_requests
  for each row execute function public.populate_job_request_names();

create or replace function public.validate_job_request_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if row(
      new.id,
      new.client_id,
      new.client_name,
      new.freelancer_id,
      new.freelancer_name,
      new.service,
      new.description,
      new.budget,
      new.deadline,
      new.location,
      new.created_at
    ) is distinct from row(
      old.id,
      old.client_id,
      old.client_name,
      old.freelancer_id,
      old.freelancer_name,
      old.service,
      old.description,
      old.budget,
      old.deadline,
      old.location,
      old.created_at
    ) then
      raise exception 'Job request details cannot be changed after submission.';
    end if;

    if auth.uid() <> old.freelancer_id
      or not (
        (old.status = 'pending' and new.status in ('accepted', 'declined'))
        or (old.status = 'accepted' and new.status = 'completed')
        or (old.status = new.status)
      )
    then
      raise exception 'Invalid job request status transition.';
    end if;
  end if;
  return new;
end;
$$;

create trigger job_requests_validate_update
  before update on public.job_requests
  for each row execute function public.validate_job_request_update();

create or replace function public.validate_review()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  related_request public.job_requests%rowtype;
begin
  select *
  into related_request
  from public.job_requests
  where id = new.request_id;

  if not found
    or related_request.status <> 'completed'
    or new.client_id <> related_request.client_id
    or new.freelancer_id <> related_request.freelancer_id
  then
    raise exception 'Reviews must belong to a completed request and its participants.';
  end if;
  new.client_name = related_request.client_name;

  if auth.uid() is not null
    and not public.is_admin()
    and auth.uid() <> related_request.client_id
  then
    raise exception 'Only the client who sent the request can review it.';
  end if;

  return new;
end;
$$;

create trigger reviews_validate
  before insert or update on public.reviews
  for each row execute function public.validate_review();

create or replace function public.refresh_profile_review_stats(profile_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles as profile
  set
    rating = coalesce(stats.average_rating, 0),
    review_count = coalesce(stats.review_count, 0)
  from (
    select
      round(avg(rating)::numeric, 2) as average_rating,
      count(*)::integer as review_count
    from public.reviews
    where freelancer_id = profile_id
  ) as stats
  where profile.id = profile_id;
$$;

create or replace function public.update_profile_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_profile_review_stats(old.freelancer_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.freelancer_id is distinct from new.freelancer_id then
    perform public.refresh_profile_review_stats(old.freelancer_id);
  end if;
  perform public.refresh_profile_review_stats(new.freelancer_id);
  return new;
end;
$$;

create trigger reviews_refresh_profile_stats
  after insert or update or delete on public.reviews
  for each row execute function public.update_profile_review_stats();

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.populate_job_request_names() from public, anon, authenticated;
revoke execute on function public.validate_job_request_update() from public, anon, authenticated;
revoke execute on function public.validate_review() from public, anon, authenticated;
revoke execute on function public.refresh_profile_review_stats(uuid) from public, anon, authenticated;
revoke execute on function public.update_profile_review_stats() from public, anon, authenticated;

alter table public.profiles enable row level security;
alter table public.job_requests enable row level security;
alter table public.saved_profiles enable row level security;
alter table public.reviews enable row level security;

create policy profiles_public_freelancers_read
  on public.profiles for select to anon, authenticated
  using (role = 'freelancer');
create policy profiles_own_read
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_own_update
  on public.profiles for update to authenticated
  using (id = (select auth.uid()) and role = 'freelancer')
  with check (id = (select auth.uid()) and role = 'freelancer');
create policy profiles_admin_all
  on public.profiles for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy job_requests_participant_read
  on public.job_requests for select to authenticated
  using (
    client_id = (select auth.uid())
    or freelancer_id = (select auth.uid())
    or (select public.is_admin())
  );
create policy job_requests_owner_insert
  on public.job_requests for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and status = 'pending'
    and exists (
      select 1
      from public.profiles as client_profile
      where client_profile.id = client_id
        and client_profile.role = 'owner'
    )
    and exists (
      select 1
      from public.profiles as freelancer_profile
      where freelancer_profile.id = freelancer_id
        and freelancer_profile.role = 'freelancer'
    )
  );
create policy job_requests_freelancer_update
  on public.job_requests for update to authenticated
  using (freelancer_id = (select auth.uid()))
  with check (freelancer_id = (select auth.uid()));
create policy job_requests_admin_all
  on public.job_requests for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy saved_profiles_own_read
  on public.saved_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy saved_profiles_own_insert
  on public.saved_profiles for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.profiles as freelancer_profile
      where freelancer_profile.id = profile_id
        and freelancer_profile.role = 'freelancer'
    )
  );
create policy saved_profiles_own_delete
  on public.saved_profiles for delete to authenticated
  using (user_id = (select auth.uid()));
create policy saved_profiles_admin_all
  on public.saved_profiles for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy reviews_public_read
  on public.reviews for select to anon, authenticated
  using (true);
create policy reviews_completed_request_insert
  on public.reviews for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and exists (
      select 1
      from public.job_requests as request
      where request.id = request_id
        and request.client_id = (select auth.uid())
        and request.freelancer_id = reviews.freelancer_id
        and request.status = 'completed'
    )
  );
create policy reviews_admin_all
  on public.reviews for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant usage on schema public to anon, authenticated;
revoke all on public.profiles, public.job_requests, public.saved_profiles, public.reviews
  from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.job_requests to authenticated;
grant select, insert, update, delete on public.saved_profiles to authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;