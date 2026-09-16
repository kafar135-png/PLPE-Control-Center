-- PLPE Game Multiplayer - Stage 1
-- Run this once in Supabase SQL Editor before deploying the new /api/game routes.

create extension if not exists pgcrypto;

create table if not exists public.game_players (
  wallet_address text primary key,
  nickname text null,
  level integer not null default 1 check (level >= 1),
  xp bigint not null default 0 check (xp >= 0),
  rating integer not null default 1000,
  highest_rating integer not null default 1000,
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  pvp_battles integer not null default 0 check (pvp_battles >= 0),
  current_win_streak integer not null default 0 check (current_win_streak >= 0),
  best_win_streak integer not null default 0 check (best_win_streak >= 0),
  damage_dealt bigint not null default 0 check (damage_dealt >= 0),
  damage_received bigint not null default 0 check (damage_received >= 0),
  healing_done bigint not null default 0 check (healing_done >= 0),
  blocks bigint not null default 0 check (blocks >= 0),
  spirit_uses bigint not null default 0 check (spirit_uses >= 0),
  presence_status text not null default 'offline'
    check (presence_status in ('offline', 'online', 'in_battle')),
  last_seen timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_players_wallet_format
    check (wallet_address ~ '^0x[a-f0-9]{40}$')
);

create unique index if not exists game_players_nickname_lower_uidx
  on public.game_players (lower(nickname))
  where nickname is not null;

create index if not exists game_players_presence_idx
  on public.game_players (presence_status, last_seen desc);

create index if not exists game_players_rating_idx
  on public.game_players (rating desc, wins desc);

create table if not exists public.game_auth_nonces (
  wallet_address text primary key,
  nonce text not null,
  message text not null,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  constraint game_auth_nonces_wallet_format
    check (wallet_address ~ '^0x[a-f0-9]{40}$')
);

create table if not exists public.game_sessions (
  token_hash text primary key,
  wallet_address text not null references public.game_players(wallet_address) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen timestamptz not null default now()
);

create index if not exists game_sessions_wallet_idx
  on public.game_sessions (wallet_address, expires_at desc);

create index if not exists game_sessions_expiry_idx
  on public.game_sessions (expires_at);

create table if not exists public.game_matches (
  id uuid primary key default gen_random_uuid(),
  player_a_wallet text not null references public.game_players(wallet_address),
  player_b_wallet text not null references public.game_players(wallet_address),
  status text not null default 'lobby'
    check (status in ('lobby', 'active', 'completed', 'cancelled')),
  player_a_rating_before integer not null default 1000,
  player_b_rating_before integer not null default 1000,
  winner_wallet text null references public.game_players(wallet_address),
  loser_wallet text null references public.game_players(wallet_address),
  rating_delta integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz null,
  ended_at timestamptz null,
  constraint game_matches_different_players
    check (player_a_wallet <> player_b_wallet)
);

create index if not exists game_matches_player_a_idx
  on public.game_matches (player_a_wallet, created_at desc);

create index if not exists game_matches_player_b_idx
  on public.game_matches (player_b_wallet, created_at desc);

create index if not exists game_matches_status_idx
  on public.game_matches (status, created_at desc);

create table if not exists public.game_challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_wallet text not null references public.game_players(wallet_address) on delete cascade,
  challenged_wallet text not null references public.game_players(wallet_address) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  responded_at timestamptz null,
  match_id uuid null references public.game_matches(id) on delete set null,
  constraint game_challenges_different_players
    check (challenger_wallet <> challenged_wallet)
);

create index if not exists game_challenges_incoming_idx
  on public.game_challenges (challenged_wallet, status, created_at desc);

create index if not exists game_challenges_outgoing_idx
  on public.game_challenges (challenger_wallet, status, created_at desc);

create index if not exists game_challenges_expiry_idx
  on public.game_challenges (status, expires_at);

-- Backend uses SUPABASE_SECRET_KEY (service role). Keep direct browser access closed.
alter table public.game_players enable row level security;
alter table public.game_auth_nonces enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_challenges enable row level security;
alter table public.game_matches enable row level security;
