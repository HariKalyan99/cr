-- Authenticator setup is only for the household emails already listed in admin_emails.

create or replace function public.is_household()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_household() from public, anon;
grant execute on function public.is_household() to authenticated;

create or replace function public.may_request_login(target text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where email = lower(trim(target))
  );
$$;

revoke all on function public.may_request_login(text) from public;
grant execute on function public.may_request_login(text) to anon, authenticated;

create or replace function public.enforce_admin_mfa()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from auth.users as u
    join public.admin_emails as a on a.email = lower(u.email)
    where u.id = new.user_id
  ) then
    raise exception 'This login cannot set up an authenticator';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_admin_mfa() from public, anon, authenticated;

drop trigger if exists mfa_factors_admin_only on auth.mfa_factors;
create trigger mfa_factors_admin_only
before insert on auth.mfa_factors
for each row
execute function public.enforce_admin_mfa();
