alter table public.rsvps
  add column phone text not null;

alter table public.rsvps
  add constraint rsvps_phone_digits check (phone ~ '^[6-9][0-9]{9}$');
