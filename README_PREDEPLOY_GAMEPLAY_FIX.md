# PLPE PRE-DEPLOY GAMEPLAY FIX — FINAL

Apply this patch AFTER `PLPE_FINAL_TEST_DEPLOY_PATCH.zip` and `PLPE_FINAL_BALANCE_SYNC_PATCH.zip`.
No additional Supabase SQL is required.

## Fixes included

1. Battle visuals
- PolishPepe uses a transparent full-body battle sprite instead of a square class-selection portrait.
- Warrior / Ranger / Mage get class aura, badge and visible class equipment overlay.
- Harpy and Harpy Matriarch now have dedicated battle sprites.
- Added combat floating text, stronger hit feedback and battle SFX hooks.

2. Battle deadlock protection
- synchronous action lock against double-clicks
- latest battle state ref for enemy reaction resolution
- ghost-turn recovery when an already-used unit remains active
- 4.5 s action watchdog
- pending enemy-defense fallback so combat does not require page refresh
- existing Sleep / Freeze -> no block tactical combo is preserved

3. Bocian progression
- Monastery rank cap no longer makes XP useless.
- At the current rank cap, every full XP bar converts to one Bocian training point.
- Legacy saves are normalized on load.
- Example: rank 2, 649/175 XP at rank cap -> 124/175 XP + 3 training points.
- Training Hall displays current Bocian rank cap and explains the overflow rule.

4. PLPE Vault exchange UX
- shows current exchange resources live
- shows predicted post-exchange amount
- success/error confirmation after exchange

5. Dialogue voice
- keeps pre-rendered OGG dialogue audio already included in the main final patch
- reliable playback from explicit user gesture (DALEJ / keyboard / Lektor button)
- fixes audio being immediately cancelled when dialogue key changes
- music ducking and speaker separation remain active

## Validation performed
- 117 TS/TSX files transpile-parse with 0 syntax errors
- 33 backend JS files: 0 syntax errors
- 313 local imports/URLs checked: 0 missing
- dialogue manifest: 79 lines, 158 PL+EN OGG files, 0 missing/empty
- battle-engine stress: Bear Command Group + Harpy groups, 15,000 fights total, 0 engine deadlocks

## Apply
From `C:\Users\Sacha\Desktop\PLPE-Control-Center`:

```powershell
Expand-Archive `
-Path "C:\Users\Sacha\Desktop\PLPE_Arena_Game_Assets\PLPE_PREDEPLOY_GAMEPLAY_FIX_FINAL.zip" `
-DestinationPath . `
-Force
```

Then:

```powershell
cd frontend
npm run build
```

If build succeeds, run local smoke test before deploy.
