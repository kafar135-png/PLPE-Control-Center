# PLPE Game — Final Balance & Sync Patch

Apply this patch AFTER `PLPE_FINAL_TEST_DEPLOY_PATCH.zip` and SQL 003.
No new SQL migration is required.

## Included fixes
- Class selection no longer routes through nickname validation.
- Class stats display final values, not confusing +/- modifiers.
- Balanced starting stats:
  - Warrior: HP 110 / ATK 21 / DEF 18 / SPD 18
  - Ranger: HP 100 / ATK 21 / DEF 14 / SPD 23
  - Mage: HP 100 / ATK 21 / DEF 14 / SPD 22
- Existing local class saves migrate while preserving already spent stat points.
- PvE and server PvP use the same class baseline and class identity.
- Progression auto-sync remains server authoritative for Ranked PvP.
- Class-specific relics/equipment restrictions and loadout handling.
- Bonus Zones use the persistent PvE loadout.
- Bear Army neutral capture now requires pressure 2/2; successful player mission steps reduce pressure by 1.
- Tactical battle class skills/cooldowns/penetration tuned and deadlock protections preserved.
- PvP class balance tuned; 30,000 simulated LV4 matches completed with 0 deadlocks.

## Territory rules
- Player: 1 movement + 2 actions per turn.
- Bear Army: one strategic action on its turn.
- Neutral field: Bear pressure 1/2 first, 2/2 captures.
- Successful player mission step on pressured neutral field removes 1 pressure.
- Every third Bear turn prioritizes tower/garrison development instead of expansion.

## Ranked PvP integrity
Local relic equipment affects PvE only for now. Ranked PvP uses server-stored core stats so browser localStorage cannot be edited to cheat the ladder.

## Future mode (not included in first test deploy)
Arena Conquest: two players start from opposite sides, race for a central objective, earn hold bonuses and can push toward the opponent's territory/base. This should be implemented as a separate server-authoritative PvP mode after the first live test.
