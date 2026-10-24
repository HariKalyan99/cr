create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  attending boolean not null,
  guests integer not null check (guests >= 0 and guests <= 6),
  events text[] not null default '{}',
  message text not null default '',
  submitted_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

comment on table public.rsvps is
  'Wedding RSVPs. No policies: only the rsvp edge function (service role) can read or write.';


-- should add phone numbers.