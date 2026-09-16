import { useCallback, useEffect, useState } from "react";
import {
  LEGACY_CLASS_STARTING_STATS,
  PREVIOUS_CLASS_STARTING_STATS_V2,
  PEPE_CLASSES,
  isPepeClass,
  type PepeClass,
} from "./CharacterClasses";

export const GAME_REWARD_EVENT = "plpe-game-reward";
export const GAME_DISCOVERY_EVENT = "plpe-game-discovery";
export const GAME_RESCUE_NPC_EVENT = "plpe-game-rescue-npc";
export const PLPE_PROGRESS_SYNC_EVENT = "plpe-progress-sync-v3";

const STORAGE_KEY = "plpe-arena-progress-v3";
const OLD_KEYS = ["plpe-arena-progress-v2", "plpe-arena-progress-v1"];
let rewardListenerInstalled = false;

export type BuildingKey =
  | "trainingHall"
  | "cardForge"
  | "comicArchive"
  | "plpeVault"
  | "arena"
  | "expeditions";

export interface ResourceCost {
  memeEnergy?: number;
  relics?: number;
  intel?: number;
  bearFragments?: number;
  comicFragments?: number;
  cardFragments?: number;
  crowns?: number;
}

export interface GameReward extends ResourceCost {
  xp?: number;
  bocianXp?: number;
}

export interface PolishPepeProgress {
  specialization: PepeClass | null;
  level: number;
  xp: number;
  xpRequired: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  skillPoints: number;
  balanceVersion: number;
}

export interface BocianProgress {
  rank: number;
  xp: number;
  xpRequired: number;
  supportLevel: number;
  hp: number;
  magic: number;
  defense: number;
  speed: number;
  skillPoints: number;
}

export interface GameProgress {
  season: number;
  chapter: number;
  chapterStarted: boolean;
  currentQuest: number;
  quest1Completed: boolean;
  quest2Completed: boolean;
  chapter1Completed: boolean;
  memeEnergy: number;
  relics: number;
  intel: number;
  bearFragments: number;
  comicFragments: number;
  cardFragments: number;
  crowns: number;
  polishPepe: PolishPepeProgress;
  bocian: BocianProgress;
  monastery: { level: number };
  buildings: Record<BuildingKey, number>;
  world: { region: number; unlockedRegions: number[] };
}

export const DEFAULT_GAME_PROGRESS: GameProgress = {
  season: 1,
  chapter: 1,
  chapterStarted: false,
  currentQuest: 1,
  quest1Completed: false,
  quest2Completed: false,
  chapter1Completed: false,
  memeEnergy: 0,
  relics: 0,
  intel: 0,
  bearFragments: 0,
  comicFragments: 0,
  cardFragments: 0,
  crowns: 0,
  polishPepe: {
    specialization: null,
    level: 1,
    xp: 0,
    xpRequired: 100,
    hp: 100,
    attack: 20,
    defense: 15,
    speed: 20,
    skillPoints: 0,
    balanceVersion: 3,
  },
  bocian: {
    rank: 1,
    xp: 0,
    xpRequired: 100,
    supportLevel: 1,
    hp: 105,
    magic: 18,
    defense: 19,
    speed: 14,
    skillPoints: 0,
  },
  monastery: { level: 1 },
  buildings: {
    trainingHall: 1,
    cardForge: 0,
    comicArchive: 1,
    plpeVault: 0,
    arena: 1,
    expeditions: 1,
  },
  world: { region: 1, unlockedRegions: [1] },
};


function normalizePepeProgress(saved?: Partial<PolishPepeProgress> | null): PolishPepeProgress {
  const base = structuredClone(DEFAULT_GAME_PROGRESS.polishPepe);
  if (!saved) return base;

  const specialization = isPepeClass(saved.specialization) ? saved.specialization : null;
  const merged: PolishPepeProgress = {
    ...base,
    ...saved,
    specialization,
    balanceVersion: typeof saved.balanceVersion === "number" ? saved.balanceVersion : 1,
  };

  // Preserve already-spent stat points when migrating the pre-deploy class balance.
  // Example: an old Warrior 130 HP + one HP point (140) becomes the new
  // Warrior 115 HP + the same one HP point (125), not a free +25 HP advantage.
  if (specialization && merged.balanceVersion < 2) {
    const oldStats = LEGACY_CLASS_STARTING_STATS[specialization];
    const v2Stats = PREVIOUS_CLASS_STARTING_STATS_V2[specialization];
    merged.hp = v2Stats.hp + Math.max(0, Number(merged.hp || oldStats.hp) - oldStats.hp);
    merged.attack = v2Stats.attack + Math.max(0, Number(merged.attack || oldStats.attack) - oldStats.attack);
    merged.defense = v2Stats.defense + Math.max(0, Number(merged.defense || oldStats.defense) - oldStats.defense);
    merged.speed = v2Stats.speed + Math.max(0, Number(merged.speed || oldStats.speed) - oldStats.speed);
    merged.balanceVersion = 2;
  }

  if (specialization && merged.balanceVersion < 3) {
    const oldStats = PREVIOUS_CLASS_STARTING_STATS_V2[specialization];
    const nextStats = PEPE_CLASSES[specialization].startingStats;
    merged.hp = nextStats.hp + Math.max(0, Number(merged.hp || oldStats.hp) - oldStats.hp);
    merged.attack = nextStats.attack + Math.max(0, Number(merged.attack || oldStats.attack) - oldStats.attack);
    merged.defense = nextStats.defense + Math.max(0, Number(merged.defense || oldStats.defense) - oldStats.defense);
    merged.speed = nextStats.speed + Math.max(0, Number(merged.speed || oldStats.speed) - oldStats.speed);
    merged.balanceVersion = 3;
  }

  return merged;
}

function normalize(saved?: Partial<GameProgress> | null): GameProgress {
  const base = structuredClone(DEFAULT_GAME_PROGRESS);
  if (!saved) return base;

  const monastery = { ...base.monastery, ...(saved.monastery ?? {}) };
  const mergedBocian: BocianProgress = { ...base.bocian, ...(saved.bocian ?? {}) };
  const normalizedBocian = applyBocianXp(mergedBocian, 0, getMonasteryRankCap(monastery.level));

  return {
    ...base,
    ...saved,
    polishPepe: normalizePepeProgress(saved.polishPepe),
    bocian: normalizedBocian,
    monastery,
    buildings: { ...base.buildings, ...(saved.buildings ?? {}) },
    world: { ...base.world, ...(saved.world ?? {}) },
  };
}

export function loadGameProgress(): GameProgress {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return normalize(JSON.parse(current));
    for (const key of OLD_KEYS) {
      const old = localStorage.getItem(key);
      if (old) return normalize(JSON.parse(old));
    }
  } catch (error) {
    console.error("[PLPE] progress load failed", error);
  }
  return structuredClone(DEFAULT_GAME_PROGRESS);
}

function emitSync(progress: GameProgress) {
  window.dispatchEvent(new CustomEvent(PLPE_PROGRESS_SYNC_EVENT, { detail: progress }));
}

export function saveGameProgress(progress: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  emitSync(progress);
  return progress;
}

function calculateXpRequired(level: number) {
  return 100 + Math.max(0, level - 1) * 50;
}

function applyPepeXp(pepe: PolishPepeProgress, amount: number) {
  let xp = pepe.xp + Math.max(0, amount);
  let level = pepe.level;
  let required = pepe.xpRequired;
  let gained = 0;
  while (xp >= required) {
    xp -= required;
    level += 1;
    gained += 1;
    required = calculateXpRequired(level);
  }
  return { ...pepe, xp, level, xpRequired: required, skillPoints: pepe.skillPoints + gained };
}

function applyBocianXp(bocian: BocianProgress, amount: number, cap: number) {
  let xp = bocian.xp + Math.max(0, amount);
  let rank = bocian.rank;
  let req = Math.max(1, bocian.xpRequired);
  let support = bocian.supportLevel;
  let points = bocian.skillPoints;

  // Rank-ups are limited by the Monastery, but XP must never become dead
  // currency. Once Bocian reaches the current rank cap, every full XP bar
  // becomes a training point. This matches the UI expectation that 3x a full
  // bar means roughly three upgrades even before the next Monastery rank is
  // unlocked.
  while (xp >= req && rank < cap) {
    xp -= req;
    rank += 1;
    support += 1;
    points += 1;
    req = 100 + Math.max(0, rank - 1) * 75;
  }

  while (xp >= req && rank >= cap) {
    xp -= req;
    points += 1;
  }

  return { ...bocian, xp, rank, xpRequired: req, supportLevel: support, skillPoints: points };
}

export function getMonasteryRankCap(level: number) {
  if (level >= 3) return 4;
  if (level >= 2) return 3;
  return 2;
}

export function getAdventureXpBonus(level: number) {
  if (level >= 3) return 15;
  if (level >= 2) return 10;
  return 5;
}

export function canAfford(progress: GameProgress, cost: ResourceCost) {
  return (
    progress.memeEnergy >= (cost.memeEnergy ?? 0) &&
    progress.relics >= (cost.relics ?? 0) &&
    progress.intel >= (cost.intel ?? 0) &&
    progress.bearFragments >= (cost.bearFragments ?? 0) &&
    progress.comicFragments >= (cost.comicFragments ?? 0) &&
    progress.cardFragments >= (cost.cardFragments ?? 0) &&
    progress.crowns >= (cost.crowns ?? 0)
  );
}

export function spendGlobalResources(cost: ResourceCost) {
  const current = loadGameProgress();
  if (!canAfford(current, cost)) return false;
  saveGameProgress({
    ...current,
    memeEnergy: current.memeEnergy - (cost.memeEnergy ?? 0),
    relics: current.relics - (cost.relics ?? 0),
    intel: current.intel - (cost.intel ?? 0),
    bearFragments: current.bearFragments - (cost.bearFragments ?? 0),
    comicFragments: current.comicFragments - (cost.comicFragments ?? 0),
    cardFragments: current.cardFragments - (cost.cardFragments ?? 0),
    crowns: current.crowns - (cost.crowns ?? 0),
  });
  return true;
}

export function awardGlobalReward(reward: GameReward) {
  const current = loadGameProgress();
  const next = {
    ...current,
    memeEnergy: current.memeEnergy + (reward.memeEnergy ?? 0),
    relics: current.relics + (reward.relics ?? 0),
    intel: current.intel + (reward.intel ?? 0),
    bearFragments: current.bearFragments + (reward.bearFragments ?? 0),
    comicFragments: current.comicFragments + (reward.comicFragments ?? 0),
    cardFragments: current.cardFragments + (reward.cardFragments ?? 0),
    crowns: current.crowns + (reward.crowns ?? 0),
    polishPepe: applyPepeXp(current.polishPepe, reward.xp ?? 0),
    bocian: applyBocianXp(current.bocian, reward.bocianXp ?? 0, getMonasteryRankCap(current.monastery.level)),
  };
  return saveGameProgress(next);
}

export const BUILDING_UPGRADE_COSTS: Record<BuildingKey, ResourceCost[]> = {
  trainingHall: [
    { memeEnergy: 120, relics: 2 },
    { memeEnergy: 240, relics: 4, crowns: 120 },
    { memeEnergy: 420, relics: 7, crowns: 260 },
  ],
  cardForge: [
    { memeEnergy: 100, relics: 2, bearFragments: 2 },
    { memeEnergy: 220, relics: 4, cardFragments: 2 },
    { memeEnergy: 380, relics: 7, cardFragments: 5, crowns: 220 },
  ],
  comicArchive: [
    { memeEnergy: 90, intel: 2, comicFragments: 1 },
    { memeEnergy: 180, intel: 5, comicFragments: 3 },
    { memeEnergy: 300, intel: 8, comicFragments: 6 },
  ],
  plpeVault: [
    { memeEnergy: 120, relics: 3, crowns: 100 },
    { memeEnergy: 240, relics: 6, crowns: 240 },
    { memeEnergy: 420, relics: 10, crowns: 500 },
  ],
  arena: [
    { memeEnergy: 100, bearFragments: 4, crowns: 80 },
    { memeEnergy: 220, bearFragments: 8, crowns: 220 },
    { memeEnergy: 400, bearFragments: 14, relics: 4, crowns: 450 },
  ],
  expeditions: [
    { memeEnergy: 100, intel: 2, crowns: 60 },
    { memeEnergy: 220, intel: 5, relics: 2, crowns: 160 },
    { memeEnergy: 380, intel: 9, relics: 5, crowns: 350 },
  ],
};

export function getBuildingUpgradeCost(key: BuildingKey, level: number) {
  const index = Math.max(0, level - 1);
  return BUILDING_UPGRADE_COSTS[key][index] ?? null;
}

export function upgradeGlobalBuilding(key: BuildingKey) {
  const current = loadGameProgress();
  const level = current.buildings[key];
  const cost = getBuildingUpgradeCost(key, level);
  if (!cost || !canAfford(current, cost)) return false;
  const next = {
    ...current,
    memeEnergy: current.memeEnergy - (cost.memeEnergy ?? 0),
    relics: current.relics - (cost.relics ?? 0),
    intel: current.intel - (cost.intel ?? 0),
    bearFragments: current.bearFragments - (cost.bearFragments ?? 0),
    comicFragments: current.comicFragments - (cost.comicFragments ?? 0),
    cardFragments: current.cardFragments - (cost.cardFragments ?? 0),
    crowns: current.crowns - (cost.crowns ?? 0),
    buildings: { ...current.buildings, [key]: level + 1 },
  };
  saveGameProgress(next);
  return true;
}

export function formatCost(cost?: ResourceCost | null) {
  if (!cost) return "MAX";
  const parts: string[] = [];
  if (cost.memeEnergy) parts.push(`⚡ ${cost.memeEnergy}`);
  if (cost.relics) parts.push(`💎 ${cost.relics}`);
  if (cost.intel) parts.push(`✦ ${cost.intel}`);
  if (cost.bearFragments) parts.push(`🐻 ${cost.bearFragments}`);
  if (cost.comicFragments) parts.push(`📜 ${cost.comicFragments}`);
  if (cost.cardFragments) parts.push(`🃏 ${cost.cardFragments}`);
  if (cost.crowns) parts.push(`🟡 ${cost.crowns} PLPEki`);
  return parts.join(" · ");
}

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(loadGameProgress);

  useEffect(() => {
    const sync = (event: Event) => {
      const custom = event as CustomEvent<GameProgress>;
      setProgress(custom.detail ? normalize(custom.detail) : loadGameProgress());
    };
    window.addEventListener(PLPE_PROGRESS_SYNC_EVENT, sync);
    if (!rewardListenerInstalled) {
      rewardListenerInstalled = true;
      window.addEventListener(GAME_REWARD_EVENT, (event: Event) => {
        const custom = event as CustomEvent<GameReward>;
        awardGlobalReward(custom.detail ?? {});
      });
    }
    return () => {
      window.removeEventListener(PLPE_PROGRESS_SYNC_EVENT, sync);
    };
  }, []);

  const commit = useCallback((fn: (current: GameProgress) => GameProgress) => {
    setProgress((current) => {
      const next = fn(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      queueMicrotask(() => emitSync(next));
      return next;
    });
  }, []);

  const startChapter = useCallback(() => commit(c => ({ ...c, chapterStarted: true, currentQuest: c.quest1Completed ? 2 : 1 })), [commit]);
  const completeQuest1 = useCallback(() => commit(c => c.quest1Completed ? c : ({ ...c, quest1Completed: true, currentQuest: 2, intel: c.intel + 1 })), [commit]);
  const completeQuest2 = useCallback(() => commit(c => c.quest2Completed ? c : ({ ...c, quest2Completed: true, chapter1Completed: true, currentQuest: 0, memeEnergy: c.memeEnergy + 80, bearFragments: c.bearFragments + 2, crowns: c.crowns + 50, polishPepe: applyPepeXp(c.polishPepe, 100), bocian: applyBocianXp(c.bocian, 70, getMonasteryRankCap(c.monastery.level)) })), [commit]);
  const addMemeEnergy = useCallback((amount:number)=>commit(c=>({...c,memeEnergy:c.memeEnergy+Math.max(0,amount)})),[commit]);
  const addRelics = useCallback((amount:number)=>commit(c=>({...c,relics:c.relics+Math.max(0,amount)})),[commit]);
  const addIntel = useCallback((amount:number)=>commit(c=>({...c,intel:c.intel+Math.max(0,amount)})),[commit]);
  const addPolishPepeXp = useCallback((amount:number)=>commit(c=>({...c,polishPepe:applyPepeXp(c.polishPepe,amount)})),[commit]);
  const addBocianXp = useCallback((amount:number)=>commit(c=>({...c,bocian:applyBocianXp(c.bocian,amount,getMonasteryRankCap(c.monastery.level))})),[commit]);

  const choosePepeClass = useCallback((specialization: PepeClass) => commit(c => {
    if (c.polishPepe.specialization) return c;
    const starting = PEPE_CLASSES[specialization].startingStats;
    return {
      ...c,
      polishPepe: {
        ...c.polishPepe,
        specialization,
        hp: starting.hp,
        attack: starting.attack,
        defense: starting.defense,
        speed: starting.speed,
        balanceVersion: 3,
      },
    };
  }), [commit]);

  const upgradePepeStat = useCallback((stat: keyof Pick<PolishPepeProgress,"hp"|"attack"|"defense"|"speed">) => commit(c => {
    if (c.polishPepe.skillPoints <= 0) return c;
    const bonus = stat === "hp" ? 10 : 2;
    return { ...c, polishPepe: { ...c.polishPepe, [stat]: c.polishPepe[stat] + bonus, skillPoints: c.polishPepe.skillPoints - 1 } };
  }), [commit]);

  const upgradeBocianStat = useCallback((stat: keyof Pick<BocianProgress,"hp"|"magic"|"defense"|"speed">) => commit(c => {
    if (c.bocian.skillPoints <= 0) return c;
    const bonus = stat === "hp" ? 10 : 2;
    return { ...c, bocian: { ...c.bocian, [stat]: c.bocian[stat] + bonus, skillPoints: c.bocian.skillPoints - 1 } };
  }), [commit]);

  const upgradeMonastery = useCallback(() => {
    const current = loadGameProgress();
    const cost: ResourceCost = current.monastery.level === 1 ? { memeEnergy: 200, relics: 5 } : { memeEnergy: 450, relics: 10, intel: 5, crowns: 300 };
    if (!current.chapter1Completed || !canAfford(current, cost)) return false;
    const regions = current.monastery.level === 1 && !current.world.unlockedRegions.includes(2) ? [...current.world.unlockedRegions, 2] : current.world.unlockedRegions;
    saveGameProgress({ ...current, memeEnergy: current.memeEnergy-(cost.memeEnergy??0), relics: current.relics-(cost.relics??0), intel: current.intel-(cost.intel??0), crowns: current.crowns-(cost.crowns??0), monastery:{level:current.monastery.level+1}, buildings:{...current.buildings,cardForge:Math.max(1,current.buildings.cardForge),plpeVault:Math.max(1,current.buildings.plpeVault)}, world:{...current.world,unlockedRegions:regions} });
    return true;
  }, []);

  const upgradeBuilding = useCallback((key: BuildingKey) => upgradeGlobalBuilding(key), []);
  const spendResources = useCallback((cost:ResourceCost)=>spendGlobalResources(cost),[]);
  const awardReward = useCallback((reward:GameReward)=>awardGlobalReward(reward),[]);

  const resetProgress = useCallback(() => {
    for (const key of [STORAGE_KEY, ...OLD_KEYS]) localStorage.removeItem(key);
    saveGameProgress(structuredClone(DEFAULT_GAME_PROGRESS));
  }, []);

  return { progress, startChapter, completeQuest1, completeQuest2, addMemeEnergy, addRelics, addIntel, addPolishPepeXp, addBocianXp, choosePepeClass, upgradePepeStat, upgradeBocianStat, upgradeMonastery, upgradeBuilding, spendResources, awardReward, resetProgress };
}
