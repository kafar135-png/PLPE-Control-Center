-- PLPE Monthly Trading Challenge Phase #03
create table if not exists public.challenge_registrations (
  phase_id text not null,
  wallet text not null,
  registered_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active','blocked','withdrawn')),
  created_at timestamptz not null default now(),
  primary key (phase_id, wallet)
);
create index if not exists challenge_registrations_phase_status_idx on public.challenge_registrations (phase_id, status);

create table if not exists public.challenge_registration_nonces (
  phase_id text not null,
  wallet text not null,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (phase_id, wallet)
);

create table if not exists public.challenge_excluded_wallets (
  wallet text primary key,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Phase #03 needs token amounts for the Holder Bonus.
alter table public.challenge_ledger add column if not exists plpe_amount numeric;

-- IMPORTANT: insert official operational wallets here in lowercase before Phase #03 starts.
-- Example only (DO NOT use this placeholder):
-- insert into public.challenge_excluded_wallets(wallet,label) values ('0x...','PLPE Marketing');
