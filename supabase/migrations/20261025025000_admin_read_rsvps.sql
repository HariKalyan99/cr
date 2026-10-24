-- Who may read RSVPs after a password and their own authenticator.
-- Adding a person is a new row here. The app never ships this list to guests.

create table public.admin_emails (
  email text primary key check (email = lower(email) and position('@' in email) > 1)
);

-- Household addresses are added in the Supabase dashboard, not in this repository.

alter table public.admin_emails enable row level security;

revoke all on table public.admin_emails from anon, authenticated;

create or replace function public.is_rsvp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1
      from public.admin_emails
      where email = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

revoke all on function public.is_rsvp_admin() from public, anon;
grant execute on function public.is_rsvp_admin() to authenticated;

create policy rsvps_admin_read
on public.rsvps
for select
to authenticated
using (public.is_rsvp_admin());
