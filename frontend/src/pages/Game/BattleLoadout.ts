import { PEPE_TACTICAL_BASE_STATS } from "./CharacterClasses";
import type { BocianProgress, GameProgress } from "./Progress";
import type { EquipmentStats } from "./GameplayInventory";
import {
  buildEquipmentItems,
  calculateEquipmentBonuses,
  loadRpgInventoryState,
} from "./GameplayInventory";
import { readCampaign, readCampaignDiscoveries } from "./CampaignMapRepository";

export interface BattleStatBonuses {
  attack: number;
  defense: number;
  speed: number;
  maxHp: number;
  lootBonus?: number;
}

const BOCIAN_TACTICAL_BASE = {
  hp: 105,
  attack: 18,
  defense: 19,
  speed: 14,
};

export function pepeProgressBattleBonuses(
  progress: GameProgress,
  equipment: EquipmentStats = {}
): BattleStatBonuses {
  const pepe = progress.polishPepe;
  return {
    maxHp: pepe.hp - PEPE_TACTICAL_BASE_STATS.hp + (equipment.maxHp ?? 0),
    attack: pepe.attack - PEPE_TACTICAL_BASE_STATS.attack + (equipment.attack ?? 0),
    defense: pepe.defense - PEPE_TACTICAL_BASE_STATS.defense + (equipment.defense ?? 0),
    speed: pepe.speed - PEPE_TACTICAL_BASE_STATS.speed + (equipment.speed ?? 0),
    lootBonus: equipment.lootBonus ?? 0,
  };
}

export function bocianProgressBattleBonuses(bocian: BocianProgress): BattleStatBonuses {
  return {
    maxHp: bocian.hp - BOCIAN_TACTICAL_BASE.hp,
    attack: bocian.magic - BOCIAN_TACTICAL_BASE.attack,
    defense: bocian.defense - BOCIAN_TACTICAL_BASE.defense,
    speed: bocian.speed - BOCIAN_TACTICAL_BASE.speed,
  };
}

/**
 * Equipment is a PvE loadout in Season 1. Ranked PvP intentionally uses the
 * server-stored core character stats only, so browser-local relics cannot be
 * forged with devtools and used to cheat the ladder.
 */
export function loadCurrentPveLoadout(progress: GameProgress) {
  try {
    const campaign = readCampaign();
    const { discoveries, rescuedNPCs } = readCampaignDiscoveries(campaign);
    const rpg = loadRpgInventoryState();
    const equipment = buildEquipmentItems(
      discoveries,
      rescuedNPCs,
      progress,
      progress.polishPepe.specialization
    ).map((item) => ({
      ...item,
      unlocked: item.unlocked || rpg.equipped[item.slot] === item.id,
    }));
    const equipmentBonuses = calculateEquipmentBonuses(equipment, rpg);
    return {
      equipment,
      rpg,
      equipmentBonuses,
      pepeBonuses: pepeProgressBattleBonuses(progress, equipmentBonuses),
      bocianBonuses: bocianProgressBattleBonuses(progress.bocian),
    };
  } catch {
    return {
      equipment: [],
      rpg: loadRpgInventoryState(),
      equipmentBonuses: {},
      pepeBonuses: pepeProgressBattleBonuses(progress),
      bocianBonuses: bocianProgressBattleBonuses(progress.bocian),
    };
  }
}
