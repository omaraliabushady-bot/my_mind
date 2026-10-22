-- ============================================================================
-- My Mind (دِماغ مبرمِج) - Supabase Production Schema & Policies
-- ============================================================================

-- 1. Create Profiles Table (Extended user statistics & levels)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  xp integer default 0,
  level integer default 1,
  streak_days integer default 0,
  longest_streak integer default 0,
  last_active_date text,
  total_tasks_completed integer default 0,
  total_focus_minutes integer default 0,
  daily_stats jsonb default '{}'::jsonb,
  settings jsonb default '{}'::jsonb,
  badges jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. Create Projects Table
create table if not exists public.projects (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text default '',
  color text default '#00f2fe',
  icon text default 'FolderKanban',
  target_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Projects
alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);


-- 3. Create Tasks Table
create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false not null,
  completed_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  priority text default 'medium' not null,
  project_id text references public.projects(id) on delete set null,
  energy text default 'deep' not null,
  due_date text,
  archived boolean default false not null,
  archived_at text,
  cycle_tag text,
  subtasks jsonb default '[]'::jsonb
);

-- Enable RLS on Tasks
alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);


-- 4. Create Pomodoro Sessions Log Table
create table if not exists public.pomodoro_sessions (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  duration_minutes integer not null,
  mode text default 'work' not null,
  project_id text references public.projects(id) on delete set null,
  task_title text,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Pomodoro Sessions
alter table public.pomodoro_sessions enable row level security;

create policy "Users can view their own sessions"
  on public.pomodoro_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own sessions"
  on public.pomodoro_sessions for insert
  with check (auth.uid() = user_id);


-- 5. Automatic Profile Creation Trigger on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, xp, level, streak_days, total_tasks_completed, total_focus_minutes)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    0,
    1,
    0,
    0,
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Realtime on Tasks and Projects
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.projects;
