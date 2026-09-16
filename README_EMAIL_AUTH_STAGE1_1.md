# PLPE Game Stage 1.1 — Email/Nickname/Password Auth

This patch replaces wallet-signature game login with a normal player account.

## New flow

Welcome -> Login/Register -> Prologue -> Hub

### Register
- email
- nickname
- password + repeat password
- current PLPE OS wallet is linked automatically to the account (no wallet signature)

### Login
- nickname OR email
- password

Passwords are handled by Supabase Auth. The game tables do not store plaintext passwords.

## Apply

Extract this ZIP into the PLPE-Control-Center root folder with overwrite enabled.

Then run `backend/supabase/migrations/002_game_email_auth.sql` once in Supabase SQL Editor.

Restart backend:

```powershell
cd backend
npm start
```

Build frontend:

```powershell
cd ../frontend
npm run build
```

## Important

- Run only migration 002 now; migration 001 was already run.
- Existing multiplayer tables are kept.
- The old wallet nonce table remains in the database but is no longer used by the frontend/game login.
- The wallet remains linked to the game profile for holder/reward features.
- Email confirmation and password-reset UI can be added as the next auth hardening step.
