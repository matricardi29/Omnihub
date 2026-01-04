-- Supabase schema for OmniHub core features
-- Generated to cover authentication profiles, multiplayer games, creative artifacts, and travel itineraries.

create extension if not exists "pgcrypto";

-- Basic user profile data linked to Supabase auth
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text,
  avatar_url text,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can manage their own profile"
  on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Multiplayer game session metadata for realtime updates
create table if not exists games (
  id text primary key,
  game_type text not null,
  host_user uuid references auth.users on delete set null,
  status text not null default 'waiting',
  state jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table games enable row level security;

create policy "Players can view games they participate in"
  on games
  for select
  using (
    auth.uid() = host_user
    or exists(
      select 1 from game_players gp
      where gp.game_id = games.id and gp.user_id = auth.uid()
    )
  );

create policy "Hosts can create and update games"
  on games
  for insert
  with check (auth.uid() = host_user);

create policy "Hosts can update their games"
  on games
  for update
  using (auth.uid() = host_user)
  with check (auth.uid() = host_user);

-- Player membership for each game
create table if not exists game_players (
  id uuid primary key default gen_random_uuid(),
  game_id text references games(id) on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text,
  score integer default 0,
  joined_at timestamptz default now(),
  unique (game_id, user_id)
);

alter table game_players enable row level security;

create policy "Players manage their own membership"
  on game_players
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Hosts can view all players in their games"
  on game_players
  for select
  using (
    exists(
      select 1 from games g where g.id = game_players.game_id and g.host_user = auth.uid()
    )
  );

-- Optional event feed per game to sync actions or chat
create table if not exists game_events (
  id uuid primary key default gen_random_uuid(),
  game_id text references games(id) on delete cascade,
  user_id uuid references auth.users on delete set null,
  event_type text not null,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table game_events enable row level security;

create policy "Players and hosts can read game events"
  on game_events
  for select
  using (
    exists(
      select 1 from games g
      where g.id = game_events.game_id
        and (
          g.host_user = auth.uid()
          or exists(
            select 1 from game_players gp where gp.game_id = g.id and gp.user_id = auth.uid()
          )
        )
    )
  );

create policy "Authenticated users can emit events for their games"
  on game_events
  for insert
  with check (
    exists(
      select 1 from games g
      where g.id = game_events.game_id
        and (
          g.host_user = auth.uid()
          or exists(
            select 1 from game_players gp where gp.game_id = g.id and gp.user_id = auth.uid()
          )
        )
    )
  );

-- Creative assets and prompts from the Omni Studio flows (text or image)
create table if not exists creative_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  project_type text not null,
  prompt text,
  output jsonb,
  created_at timestamptz default now()
);

alter table creative_projects enable row level security;

create policy "Users manage their own creative projects"
  on creative_projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Travel assistant itineraries saved per user
create table if not exists travel_itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  origin text,
  destination text,
  days integer,
  plan jsonb,
  created_at timestamptz default now()
);

alter table travel_itineraries enable row level security;

create policy "Users manage their itineraries"
  on travel_itineraries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Enable realtime on tables that need live updates
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.game_players;
alter publication supabase_realtime add table public.game_events;
