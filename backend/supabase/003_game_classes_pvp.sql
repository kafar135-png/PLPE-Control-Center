-- PLPE Game Stage 1.2 - classes, synced progression and server-authoritative PvP
-- Run once AFTER 001 + 002.

alter table public.game_players
  add column if not exists specialization text null,
  add column if not exists hp integer not null default 100,
  add column if not exists attack integer not null default 20,
  add column if not exists defense integer not null default 15,
  add column if not exists speed integer not null default 20;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'game_players_specialization_check') then
    alter table public.game_players
      add constraint game_players_specialization_check
      check (specialization is null or specialization in ('warrior','ranger','mage'));
  end if;
end $$;

alter table public.game_matches
  add column if not exists battle_state jsonb null,
  add column if not exists turn_version integer not null default 0;

-- updated_at is useful for polling/debugging. Add only if it does not exist.
alter table public.game_matches
  add column if not exists updated_at timestamptz not null default now();

create index if not exists game_matches_active_turn_idx
  on public.game_matches (status, turn_version, updated_at)
  where status = 'active';

grant select, insert, update, delete
on table public.game_players, public.game_matches, public.game_challenges, public.game_sessions
to service_role;
