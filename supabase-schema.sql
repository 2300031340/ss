create extension if not exists pgcrypto;

create table if not exists public.experience_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id text not null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  user_agent text,
  page_url text
);

alter table public.experience_responses enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on table public.experience_responses to anon, authenticated;

drop policy if exists "allow anon insert experience responses" on public.experience_responses;
create policy "allow anon insert experience responses"
on public.experience_responses
for insert
to anon, authenticated
with check (true);

drop policy if exists "deny client reads experience responses" on public.experience_responses;
create policy "deny client reads experience responses"
on public.experience_responses
for select
to anon, authenticated
using (false);
