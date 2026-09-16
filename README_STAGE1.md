# PLPE Game Multiplayer — Stage 1

This patch is based on the uploaded `frontend_source.zip` and `backend_source.zip`.

## Included

- frontend asset/import audit fixes
- corrected Arena opponent artwork
- active 8-scene cinematic prologue
- PL/EN Main Hub overlay labels
- wallet-signed PLPE Game login
- persistent player profiles in Supabase
- online player presence
- nickname editing
- W/L, rating, streak and PvP profile fields
- online player list in Arena
- incoming/outgoing duel challenges
- accept/decline challenge flow
- PvP match lobby creation with Match ID
- global ranking endpoint and Arena ranking view
- Vercel preview CORS fix
- API-key logging hardening

## Required before testing multiplayer

1. Open Supabase SQL Editor.
2. Run `backend/supabase/migrations/001_game_multiplayer.sql` once.
3. In the project root install the backend dependency:

```powershell
cd backend
npm install
cd ..
```

4. Build frontend:

```powershell
cd frontend
npm install
npm run build
cd ..
```

5. Start locally as usual and test Arena > ONLINE PLAYERS with two wallets/browsers.

## Stage boundary

Stage 1 creates a real server-side Match ID when a challenge is accepted. The synchronized server-authoritative PvP battle itself is Stage 2; do not route accepted matches into the old local single-player battle engine.

## Security note

`backend/.env` is intentionally NOT included in any generated package. `src/services/etherscan.js` was changed so the API key value is no longer printed at startup.
