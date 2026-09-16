# PLPE Game — Final Test Deploy Candidate

## Final flow
WELCOME -> LOGIN/REGISTER -> CLASS SELECT (new account only) -> PROLOGUE -> HUB -> CAMPAIGN / BUILDINGS / ARENA

## Player classes
- Warrior — sword/shield, durability, Shield Wall, Polish Fury.
- Ranger / Crossbowman — speed, piercing shot, bleed, PLPE Volley.
- Mage — magic damage, Runic Frost, control/stun, PLPE Storm.

Class selection is persisted on the server profile. Existing accounts with a selected class keep it after a game-progress reset.

## Dialogue voice pack
79 dialogue lines have prerecorded OGG files in Polish and English (158 files total):
- PolishPepe: younger/faster energetic voice
- Bocian: lower/slower mentor voice
- Narrator: low/calm narration voice

Files: `frontend/public/audio/game/dialogue/{pl,en}/`
Manifest: `frontend/public/audio/game/dialogue/manifest.json`
The prologue and world-story dialogue automatically select the matching file. Music is ducked while dialogue plays. Voice can be toggled in the dialogue UI.

## Story/game content checked
- 7 main HUB buildings: Monastery, Training Hall, Card Forge, Comic Archive, Vault, Arena, Expeditions.
- 3 bonus loot zones in Expeditions.
- 41 world-map locations.
- 35 campaign missions.
- 14 world story scenes with 48 spoken lines.
- 8-scene prologue with 31 spoken lines.
- Arena training + online players + challenges + server-authoritative PvP + ranking + match history.
- Progression syncs to the server profile after logged-in character stat changes.
- RESET GAME is in the Monastery and asks for confirmation before erasing local game progress.

## Supabase before deploy
You already ran migrations 001 and 002. Run **003** now:
`backend/supabase/003_game_classes_pvp.sql`

Supabase -> SQL Editor -> New query -> paste entire file -> Run.
Expected: `Success. No rows returned`.

## Install/update local project
Back up/commit the current repository first.
Extract this package into the PLPE-Control-Center root so `frontend` and `backend` overwrite matching source files.
The package intentionally contains NO backend `.env` and NO node_modules.

### Backend
```powershell
cd C:\Users\Sacha\Desktop\PLPE-Control-Center\backend
npm install
npm start
```
Verify:
```powershell
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3001/api/game/ranking
```

### Frontend
```powershell
cd C:\Users\Sacha\Desktop\PLPE-Control-Center\frontend
npm install
npm run build
npm run dev
```

## Pre-deploy smoke test
1. Register/login account A.
2. New account: choose a class, finish prologue, reach HUB.
3. Open every building and return to HUB.
4. Enter Expeditions -> Bonus Zones and World Map.
5. Trigger at least one map story dialogue and confirm correct voice.
6. Fight several rounds in Campaign and Arena Training without refreshing.
7. Account B in second browser/profile: choose a different class.
8. Both players visible Online.
9. A challenges B, B accepts.
10. Both enter same Match ID; play to completion.
11. Confirm W/L/rating and Match History update.
12. Monastery -> RESET GAME -> confirmation -> login -> same server class -> prologue/start-over progression.

## Static verification completed in preparation environment
- 116 TS/TSX files parsed: 0 syntax errors.
- 33 backend JS files checked with Node: 0 syntax errors.
- 357 local frontend imports checked: 0 missing paths.
- 79 dialogue keys x PL+EN: 158 audio files, 0 missing/tiny files.
- PvP stress simulation: 5,000 fights per class matchup (15,000 total), 0 deadlocks.

## Important final local check
A full `npm run build` must be run on the target Windows project before deployment. The preparation container could not restore the complete frontend npm dependency tree offline, so its final check was parser/import/static validation rather than a production Vite bundle.
