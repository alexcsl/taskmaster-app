-- Run this in your Supabase SQL editor to set up the database

-- User preferences
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  accent_color text not null default '#8b5cf6',
  editor_mode text not null default 'block',
  notification_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Tasks (including subtasks via parent_id)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date timestamptz,
  is_recurring boolean not null default false,
  recurrence_pattern text check (recurrence_pattern in ('daily', 'weekly', 'monthly')),
  parent_id uuid references public.tasks(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Calendar events
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  all_day boolean not null default false,
  color text,
  source text not null default 'manual' check (source in ('manual', 'ical', 'google')),
  external_id text,
  created_at timestamptz not null default now()
);

-- Unique constraint for dedup on ical import
create unique index if not exists calendar_events_external_id_user_idx
  on public.calendar_events(user_id, external_id)
  where external_id is not null;

-- Notes / pages (supports nesting via parent_id)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  content jsonb,
  parent_id uuid references public.notes(id) on delete cascade,
  icon text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.user_settings enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.notes enable row level security;

-- Policies: users can only access their own rows
create policy "user_settings_self" on public.user_settings
  for all using (auth.uid() = user_id);

create policy "tasks_self" on public.tasks
  for all using (auth.uid() = user_id);

create policy "calendar_events_self" on public.calendar_events
  for all using (auth.uid() = user_id);

create policy "notes_self" on public.notes
  for all using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();

create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function public.handle_updated_at();
