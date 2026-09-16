# PLPE Tactical Battle Deadlock Fix

This patch updates the shared battle engine used by:
- ArenaHub
- ArenaTrainingHub
- WorldMapHub / campaign battles

## Fixed

1. Player-phase turn progression no longer follows a blind numeric turnOrder step.
   Pepe and Bocian may act in either order. The engine now stays in the player phase
   until every living hero has used exactly one action, then moves to the enemy phase.

2. Enemy phase skips dead/already-acted units safely and starts a clean next round.

3. Synchronous action lock prevents fast double-clicks from starting overlapping action
   timers before React can render aiBusy=true.

4. Action tokens invalidate stale delayed callbacks. Old timers cannot mutate a newer
   battle state after recovery.

5. Battle watchdog automatically recovers a stuck animation/action lock after 4.5s.
   - player turn: unlocks the controls without losing the turn
   - enemy turn: safely consumes the stuck enemy action and advances
   - defense reaction: makes the reaction buttons clickable again

6. Tactical combo preserved and made deterministic:
   a frozen or sleeping/stunned enemy CANNOT block an incoming attack.
   This intentionally rewards Bocian crowd-control -> Pepe attack combinations.

## Validation

- TypeScript syntax transpile: 0 diagnostics for both changed files.
- Engine stress simulation: 500 randomized battles, up to 30 rounds each,
  including hero actions taken in random order: no deadlock / invalid active unit.

## Files

- frontend/src/pages/Game/TacticalBattle.tsx
- frontend/src/pages/Game/TacticalBattleEngine.ts
