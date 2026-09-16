-- PLPE Game Multiplayer - Stage 1.1
-- Email/password game accounts + nickname login.
-- Run once AFTER 001_game_multiplayer.sql.

alter table public.game_players
  add column if not exists auth_user_id uuid null,
  add column if not exists login_email text null,
  add column if not exists nickname_key text null;

update public.game_players
set nickname_key = lower(nickname)
where nickname is not null
  and nickname_key is null;

update public.game_players
set login_email = lower(login_email)
where login_email is not null;

create unique index if not exists game_players_auth_user_uidx
  on public.game_players (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists game_players_login_email_uidx
  on public.game_players (login_email)
  where login_email is not null;

create unique index if not exists game_players_nickname_key_uidx
  on public.game_players (nickname_key)
  where nickname_key is not null;

grant usage on schema public to service_role;

grant select, insert, update, delete
on table public.game_players,
         public.game_auth_nonces,
         public.game_sessions,
         public.game_challenges,
         public.game_matches
to service_role;

-- Direct browser access remains closed. Backend uses the Supabase secret/service-role key.
alter table public.game_players enable row level security;
