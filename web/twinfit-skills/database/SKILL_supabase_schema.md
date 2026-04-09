# SKILL: Supabase Database Schema
> TwinFit — Full SQL schema with RLS policies

## Migration: 001_initial_schema.sql
```sql
create extension if not exists "uuid-ossp";

create table public.users (
  id             uuid references auth.users(id) on delete cascade primary key,
  email          text not null unique,
  name           text not null default '',
  avatar         text not null default 'lion',
  age            integer,
  height_cm      integer,
  weight_kg      numeric(5,1),
  sex            text check (sex in ('male','female','other')),
  diet_type      text not null default 'standard',
  fitness_goal   text not null default 'build_muscle',
  duo_id         uuid,
  invite_code    text not null unique,
  is_premium     boolean not null default false,
  streak_freezes integer not null default 2,
  push_token     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.duos (
  id                  uuid default uuid_generate_v4() primary key,
  user_a_id           uuid not null references public.users(id),
  user_b_id           uuid not null references public.users(id),
  mode                text not null default 'couple',
  current_streak      integer not null default 0,
  longest_streak      integer not null default 0,
  total_sessions      integer not null default 0,
  evolution_tier      text not null default 'bronze',
  last_activity_date  date,
  created_at          timestamptz not null default now()
);

alter table public.users add constraint fk_duo foreign key (duo_id) references public.duos(id);

create table public.sessions (
  id          uuid default uuid_generate_v4() primary key,
  duo_id      uuid not null references public.duos(id) on delete cascade,
  user_id     uuid not null references public.users(id),
  photo_url   text,
  pose_type   text not null default 'gym_checkin',
  logged_date date not null default current_date,
  logged_at   timestamptz not null default now(),
  unique(user_id, logged_date)
);

create table public.nutrition_logs (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid not null references public.users(id),
  type       text not null check (type in ('recipe','scan')),
  meal_name  text not null,
  calories   integer,
  protein_g  numeric(6,1),
  carbs_g    numeric(6,1),
  fat_g      numeric(6,1),
  logged_at  timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.duos enable row level security;
alter table public.sessions enable row level security;
alter table public.nutrition_logs enable row level security;

create policy "users_self" on public.users using (auth.uid() = id);
create policy "duos_members" on public.duos using (auth.uid() = user_a_id or auth.uid() = user_b_id);
create policy "sessions_duo" on public.sessions using (
  duo_id in (select id from public.duos where user_a_id = auth.uid() or user_b_id = auth.uid())
);
create policy "nutrition_self" on public.nutrition_logs using (auth.uid() = user_id);

create index sessions_duo_date on public.sessions(duo_id, logged_date desc);
create index users_invite_code on public.users(invite_code);
```
