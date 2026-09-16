import type { PepeClass } from "./CharacterClasses";
export interface GameplayLootSnapshot {
  memeEnergy: number;
  relics: number;
  intel: number;
  bearFragments: number;
  comicFragments: number;
  cardFragments: number;
}

export type InventoryItemKind =
  | "resource"
  | "artifact"
  | "key"
  | "lore"
  | "currency";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  kind: InventoryItemKind;
  quantity: number;
  source?: string;
}

export type EquipmentSlot =
  | "head"
  | "body"
  | "gloves"
  | "boots"
  | "charm";

export type EquipmentRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export interface EquipmentStats {
  attack?: number;
  defense?: number;
  speed?: number;
  maxHp?: number;
  lootBonus?: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  icon: string;
  description: string;
  stats: EquipmentStats;
  source: string;
  unlocked: boolean;
  allowedClasses?: PepeClass[];
}

export interface RpgInventoryState {
  crowns: number;
  equipped: Partial<Record<EquipmentSlot, string>>;
}

export interface UpgradeHint {
  id: string;
  building: "Klasztor" | "Kuźnia Kart" | "Archiwum" | "Ekspedycje" | "Sala Treningowa";
  title: string;
  description: string;
  ready: boolean;
}

const RPG_STORAGE_KEY = "plpe-rpg-inventory-v1";

export const DEFAULT_RPG_INVENTORY: RpgInventoryState = {
  crowns: 0,
  equipped: {},
};

const DISCOVERY_ARTIFACTS: Record<string, Omit<InventoryItem, "quantity">> = {
  "hunter-map": {
    id: "hunter-map",
    name: "Mapa Myśliwego",
    description: "Stara mapa bocznych szlaków Gór Bociana.",
    icon: "🗺️",
    kind: "artifact",
    source: "Chata Myśliwego",
  },
  "waterfall-relic": {
    id: "waterfall-relic",
    name: "Relikt z Jaskini",
    description: "Stary relikt znaleziony za wodospadem.",
    icon: "🏺",
    kind: "artifact",
    source: "Jaskinia za Wodospadem",
  },
  "graveyard-key": {
    id: "graveyard-key",
    name: "Stary Klucz",
    description: "Klucz powiązany z dawnymi mieszkańcami doliny.",
    icon: "🗝️",
    kind: "key",
    source: "Stare Cmentarzysko",
  },
  "bear-orders": {
    id: "bear-orders",
    name: "Rozkazy Bear Army",
    description: "Dokumenty zawierające informacje o patrolach i pozycjach wroga.",
    icon: "📜",
    kind: "lore",
    source: "Ruiny Strażnicy",
  },
  "ridge-spyglass": {
    id: "ridge-spyglass",
    name: "Stara Luneta",
    description: "Pozwala obserwować ruch armii na dalekich szlakach.",
    icon: "🔭",
    kind: "artifact",
    source: "Północna Grań",
  },
  "bear-camp-map": {
    id: "bear-camp-map",
    name: "Mapa Ciemnej Doliny",
    description: "Mapa przejść, posterunków i dróg Ciemnej Doliny.",
    icon: "🗺️",
    kind: "key",
    source: "Obóz Niedźwiedzi",
  },
  "comic-symbol-01": {
    id: "comic-symbol-01",
    name: "Fragment Komiksu I",
    description: "Fragment związany z przeszłością PolishPepe.",
    icon: "📖",
    kind: "lore",
    source: "Kamienny Krąg",
  },
  "bocian-note": {
    id: "bocian-note",
    name: "Notatka Bociana",
    description: "Pierwsza wskazówka dotycząca dróg wokół Klasztoru.",
    icon: "🪶",
    kind: "lore",
    source: "Klasztor Bociana",
  },
};

const EQUIPMENT_CATALOG: Array<Omit<EquipmentItem, "unlocked"> & {
  unlock: (discoveries: string[], rescuedNPCs: string[], loot: GameplayLootSnapshot, pepeClass?: PepeClass | null) => boolean;
}> = [
  {
    id: "traveller-coat",
    name: "Płaszcz Wędrowca",
    slot: "body",
    rarity: "common",
    icon: "🧥",
    description: "Naprawiony czerwony płaszcz PolishPepe. Lekki i wygodny na długie wyprawy.",
    stats: { defense: 2, maxHp: 5 },
    source: "Start gry",
    unlock: () => true,
  },
  {
    id: "hunter-hood",
    name: "Kaptur Myśliwego",
    slot: "head",
    rarity: "uncommon",
    icon: "🥷",
    description: "Kaptur pozwalający lepiej poruszać się po lesie i zauważać ślady.",
    stats: { speed: 2, lootBonus: 3 },
    source: "Chata Myśliwego",
    unlock: (discoveries) => discoveries.includes("hunter-map"),
  },
  {
    id: "mistwalker-boots",
    name: "Buty Mgielnego Wędrowca",
    slot: "boots",
    rarity: "rare",
    icon: "🥾",
    description: "Buty znalezione na mokrych szlakach Jeziora Mgły. Zwiększają szybkość.",
    stats: { speed: 4, defense: 1 },
    source: "Jezioro Mgły",
    unlock: (discoveries) => discoveries.includes("mist-lake-cache"),
  },
  {
    id: "relic-mail",
    name: "Kamizela Reliktowa",
    slot: "body",
    rarity: "rare",
    icon: "🛡️",
    description: "Lekka warstwa pancerna wzmacniana starymi reliktami.",
    stats: { defense: 6, maxHp: 15 },
    source: "Relikty Gór Bociana",
    unlock: (discoveries, _npc, loot) => discoveries.includes("waterfall-relic") && loot.relics >= 2,
  },
  {
    id: "bearplate-vest",
    name: "Bearplate Vest",
    slot: "body",
    rarity: "epic",
    icon: "🥋",
    description: "Pancerz złożony z elementów zdobytych na Bear Army. Cięższy, ale bardzo odporny.",
    stats: { attack: 2, defense: 10, maxHp: 25, speed: -1 },
    source: "Bear Army",
    unlock: (discoveries, _npc, loot) => discoveries.includes("bear-orders") && loot.bearFragments >= 6,
  },
  {
    id: "scout-gloves",
    name: "Rękawice Zwiadowcy",
    slot: "gloves",
    rarity: "uncommon",
    icon: "🧤",
    description: "Rękawice poprawiające chwyt, szybkość i precyzję ataku.",
    stats: { attack: 3, speed: 1 },
    source: "Zwiadowca Klasztoru",
    unlock: (_discoveries, rescuedNPCs) => rescuedNPCs.includes("monastery-scout"),
  },
  {
    id: "stork-charm",
    name: "Amulet Bociana",
    slot: "charm",
    rarity: "epic",
    icon: "📿",
    description: "Amulet opatrzony znakiem Bociana. Wzmacnia życie i obronę PolishPepe.",
    stats: { defense: 3, maxHp: 20 },
    source: "Archiwum / Bocian",
    unlock: (discoveries, _npc, loot) => discoveries.includes("comic-symbol-01") && loot.comicFragments >= 1,
  },
  {
    id: "white-eagle-bulwark",
    name: "Tarcza Białego Orła",
    slot: "charm",
    rarity: "epic",
    icon: "🦅",
    description: "Relikt Wojownika. Wzmacnia frontową obronę bez robienia z klasy nieruchomego muru.",
    stats: { defense: 4, maxHp: 12, speed: -1 },
    source: "Jaskinia Reliktów · Wojownik",
    allowedClasses: ["warrior"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "warrior" && loot.relics >= 3,
  },
  {
    id: "hussar-gauntlets",
    name: "Rękawice Husarskiego Ostrza",
    slot: "gloves",
    rarity: "rare",
    icon: "⚔️",
    description: "Rękawice Wojownika zwiększające siłę cięcia i stabilność gardy.",
    stats: { attack: 4, defense: 2 },
    source: "Bear Army · Wojownik",
    allowedClasses: ["warrior"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "warrior" && loot.bearFragments >= 4,
  },
  {
    id: "eagle-eye-hood",
    name: "Kaptur Orlego Oka",
    slot: "head",
    rarity: "rare",
    icon: "🎯",
    description: "Relikt Łucznika. Poprawia celność, tempo i pierwszy ruch bez absurdalnego skoku HP.",
    stats: { attack: 2, speed: 3 },
    source: "Zaginiona Karawana · Łucznik",
    allowedClasses: ["ranger"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "ranger" && loot.relics >= 2 && loot.intel >= 2,
  },
  {
    id: "shadow-bolt-gloves",
    name: "Rękawice Cienistego Bełtu",
    slot: "gloves",
    rarity: "epic",
    icon: "🏹",
    description: "Precyzyjny osprzęt kusznika. Zwiększa obrażenia i szybkość, ale nie dodaje pancerza.",
    stats: { attack: 4, speed: 2 },
    source: "Kuźnia Kart · Łucznik",
    allowedClasses: ["ranger"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "ranger" && loot.cardFragments >= 2,
  },
  {
    id: "runic-grimoire",
    name: "Runiczny Grimoire",
    slot: "charm",
    rarity: "epic",
    icon: "📘",
    description: "Księga Maga stabilizująca zaklęcia. Daje moc, odrobinę życia i minimalną ochronę.",
    stats: { attack: 4, defense: 1, maxHp: 5 },
    source: "Ołtarz Burzy · Mag",
    allowedClasses: ["mage"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "mage" && loot.relics >= 2 && loot.comicFragments >= 2,
  },
  {
    id: "stormweave-boots",
    name: "Buty Splotu Burzy",
    slot: "boots",
    rarity: "rare",
    icon: "⚡",
    description: "Lekki relikt Maga. Ułatwia ustawienie zaklęcia i wycofanie się po kontroli celu.",
    stats: { attack: 2, defense: 1, speed: 3 },
    source: "Ołtarz Burzy · Mag",
    allowedClasses: ["mage"],
    unlock: (_discoveries, _npc, loot, pepeClass) => pepeClass === "mage" && loot.intel >= 3 && loot.relics >= 2,
  },
  {
    id: "hussar-field-armor",
    name: "Pancerz Husarskiego Frontu",
    slot: "body",
    rarity: "legendary",
    icon: "🪽",
    description: "Końcowy relikt Wojownika Season 1. Wzmacnia przeżywalność i siłę bez odbierania sensu szybkości innym klasom.",
    stats: { attack: 4, defense: 7, maxHp: 15, speed: -1 },
    source: "Ciemna Dolina · Wojownik",
    allowedClasses: ["warrior"],
    unlock: (discoveries, _npc, loot, pepeClass) => pepeClass === "warrior" && discoveries.includes("dark-commander-cache") && loot.relics >= 5,
  },
  {
    id: "white-eagle-scope",
    name: "Celownik Białego Orła",
    slot: "charm",
    rarity: "legendary",
    icon: "🦅",
    description: "Końcowy relikt Łucznika. Precyzja i tempo zamiast pancerza — idealny do budowy pod pierwszy ruch.",
    stats: { attack: 5, speed: 3, lootBonus: 2 },
    source: "Ciemna Dolina · Łucznik",
    allowedClasses: ["ranger"],
    unlock: (discoveries, _npc, loot, pepeClass) => pepeClass === "ranger" && discoveries.includes("dark-commander-cache") && loot.intel >= 5,
  },
  {
    id: "storm-crown",
    name: "Korona Runicznej Burzy",
    slot: "head",
    rarity: "legendary",
    icon: "🔮",
    description: "Końcowy relikt Maga. Wzmacnia zaklęcia i mobilność, ale nadal pozostawia Maga klasą wymagającą kontroli pola.",
    stats: { attack: 5, defense: 2, speed: 2 },
    source: "Ciemna Dolina · Mag",
    allowedClasses: ["mage"],
    unlock: (discoveries, _npc, loot, pepeClass) => pepeClass === "mage" && discoveries.includes("dark-commander-cache") && loot.comicFragments >= 3,
  },
  {
    id: "dark-valley-crown",
    name: "Korona Ciemnej Doliny",
    slot: "head",
    rarity: "legendary",
    icon: "👑",
    description: "Trofeum z głębi terytorium wroga. Symbol dominacji nad pierwszą kampanią.",
    stats: { attack: 8, defense: 5, maxHp: 30 },
    source: "Ciemna Dolina",
    unlock: (discoveries) => discoveries.includes("dark-commander-cache"),
  },
];

export function loadRpgInventoryState(): RpgInventoryState {
  try {
    const raw = localStorage.getItem(RPG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_RPG_INVENTORY, equipped: {} };
    const parsed = JSON.parse(raw) as Partial<RpgInventoryState>;
    return {
      crowns: typeof parsed.crowns === "number" ? parsed.crowns : 0,
      equipped: parsed.equipped && typeof parsed.equipped === "object" ? parsed.equipped : {},
    };
  } catch {
    return { ...DEFAULT_RPG_INVENTORY, equipped: {} };
  }
}

export function saveRpgInventoryState(state: RpgInventoryState) {
  localStorage.setItem(RPG_STORAGE_KEY, JSON.stringify(state));
}

export function awardCrowns(state: RpgInventoryState, amount: number): RpgInventoryState {
  const next = { ...state, crowns: Math.max(0, state.crowns + Math.max(0, Math.round(amount))) };
  saveRpgInventoryState(next);
  return next;
}

export function equipItem(state: RpgInventoryState, item: EquipmentItem, pepeClass?: PepeClass | null): RpgInventoryState {
  if (!item.unlocked) return state;
  if (item.allowedClasses?.length && (!pepeClass || !item.allowedClasses.includes(pepeClass))) return state;
  const next: RpgInventoryState = {
    ...state,
    equipped: {
      ...state.equipped,
      [item.slot]: item.id,
    },
  };
  saveRpgInventoryState(next);
  return next;
}

export function unequipSlot(state: RpgInventoryState, slot: EquipmentSlot): RpgInventoryState {
  const equipped = { ...state.equipped };
  delete equipped[slot];
  const next = { ...state, equipped };
  saveRpgInventoryState(next);
  return next;
}

export function buildEquipmentItems(
  discoveries: string[],
  rescuedNPCs: string[],
  loot: GameplayLootSnapshot,
  pepeClass?: PepeClass | null
): EquipmentItem[] {
  return EQUIPMENT_CATALOG.map((item) => ({
    id: item.id,
    name: item.name,
    slot: item.slot,
    rarity: item.rarity,
    icon: item.icon,
    description: item.description,
    stats: item.stats,
    source: item.source,
    allowedClasses: item.allowedClasses,
    unlocked: item.unlock(discoveries, rescuedNPCs, loot, pepeClass),
  }));
}

export function buildInventoryItems(
  loot: GameplayLootSnapshot,
  discoveries: string[],
  rescuedNPCs: string[],
  crowns = 0
): InventoryItem[] {
  const resources: InventoryItem[] = [
    {
      id: "crowns",
      name: "Korony PLPE",
      description: "Waluta zdobywana za walki, kontrakty i wydarzenia. Później wykorzystasz ją u handlarzy i do specjalnych ulepszeń.",
      icon: "🪙",
      kind: "currency",
      quantity: crowns,
    },
    {
      id: "meme-energy",
      name: "Meme Energy",
      description: "Podstawowy zasób rozwoju i aktywności.",
      icon: "⚡",
      kind: "resource",
      quantity: loot.memeEnergy,
    },
    {
      id: "relics",
      name: "Relikty",
      description: "Rzadkie materiały do ulepszeń budynków i kart.",
      icon: "◆",
      kind: "resource",
      quantity: loot.relics,
    },
    {
      id: "intel",
      name: "Intel",
      description: "Informacje wojskowe odblokowujące nowe drogi i cele.",
      icon: "✦",
      kind: "resource",
      quantity: loot.intel,
    },
    {
      id: "bear-fragments",
      name: "Bear Fragments",
      description: "Fragmenty zdobywane z Bear Army. Służą do craftingu kart i pancerzy.",
      icon: "🐻",
      kind: "resource",
      quantity: loot.bearFragments,
    },
    {
      id: "comic-fragments",
      name: "Comic Fragments",
      description: "Fragmenty historii PLPE. Używane w Archiwum, sekretach i amuletach.",
      icon: "◈",
      kind: "resource",
      quantity: loot.comicFragments,
    },
    {
      id: "card-fragments",
      name: "Card Fragments",
      description: "Rzadki materiał do tworzenia i ulepszania kart.",
      icon: "🃏",
      kind: "resource",
      quantity: loot.cardFragments,
    },
  ];

  const artifacts = discoveries
    .map((id) => DISCOVERY_ARTIFACTS[id])
    .filter((item): item is Omit<InventoryItem, "quantity"> => Boolean(item))
    .map((item) => ({ ...item, quantity: 1 }));

  const npcItems: InventoryItem[] = rescuedNPCs.map((npcId) => ({
    id: `npc-${npcId}`,
    name:
      npcId === "monastery-scout"
        ? "Uratowany Zwiadowca"
        : npcId === "rescued-traveller"
          ? "Uratowany Wędrowiec"
          : npcId === "dark-survivor"
            ? "Ocalały z Ciemnej Doliny"
            : "Uratowany NPC",
    description: "Uratowana postać wróciła do bezpiecznej strefy i może odblokować nowe możliwości.",
    icon: "👤",
    kind: "artifact",
    quantity: 1,
    source: "Ratunek",
  }));

  return [...resources, ...artifacts, ...npcItems];
}

export function buildUpgradeHints(loot: GameplayLootSnapshot): UpgradeHint[] {
  const hints: UpgradeHint[] = [
    {
      id: "monastery-l2",
      building: "Klasztor",
      title: "Ulepszenie Klasztoru",
      description: "Wymaga 200 Meme Energy i 5 Reliktów.",
      ready: loot.memeEnergy >= 200 && loot.relics >= 5,
    },
    {
      id: "training-ready",
      building: "Sala Treningowa",
      title: "Nowy trening PolishPepe",
      description: "Masz wystarczająco dużo Meme Energy, aby przygotować kolejne treningi i rozwój statystyk.",
      ready: loot.memeEnergy >= 100,
    },
    {
      id: "bear-card",
      building: "Kuźnia Kart",
      title: "Karta Bear Scout",
      description: "Możesz wykuć kartę za 5 Bear Fragments.",
      ready: loot.bearFragments >= 5,
    },
    {
      id: "plpe-defense",
      building: "Kuźnia Kart",
      title: "Karta PLPE Defense",
      description: "Możesz stworzyć kartę obrony za 3 Relikty.",
      ready: loot.relics >= 3,
    },
    {
      id: "bocian-blessing",
      building: "Kuźnia Kart",
      title: "Bocian Blessing",
      description: "Masz materiały: 3 Card Fragments + 2 Relikty. Wymagany odpowiedni poziom Kuźni.",
      ready: loot.cardFragments >= 3 && loot.relics >= 2,
    },
    {
      id: "archive-fragment",
      building: "Archiwum",
      title: "Nowy materiał w Archiwum",
      description: "Masz Comic Fragment. Sprawdź nowe zapiski i sekrety.",
      ready: loot.comicFragments >= 1,
    },
    {
      id: "dark-gate-intel",
      building: "Ekspedycje",
      title: "Nowe informacje strategiczne",
      description: "Masz co najmniej 3 Intel. Sprawdź zablokowane przejścia i cele wojenne.",
      ready: loot.intel >= 3,
    },
  ];

  return hints.filter((hint) => hint.ready);
}

export function calculateEquipmentBonuses(
  equipment: EquipmentItem[],
  state: RpgInventoryState
): EquipmentStats {
  const bonuses: EquipmentStats = {
    attack: 0,
    defense: 0,
    speed: 0,
    maxHp: 0,
    lootBonus: 0,
  };

  for (const id of Object.values(state.equipped)) {
    if (!id) continue;

    const item = equipment.find((candidate) => candidate.id === id && candidate.unlocked);
    if (!item) continue;

    bonuses.attack = (bonuses.attack ?? 0) + (item.stats.attack ?? 0);
    bonuses.defense = (bonuses.defense ?? 0) + (item.stats.defense ?? 0);
    bonuses.speed = (bonuses.speed ?? 0) + (item.stats.speed ?? 0);
    bonuses.maxHp = (bonuses.maxHp ?? 0) + (item.stats.maxHp ?? 0);
    bonuses.lootBonus = (bonuses.lootBonus ?? 0) + (item.stats.lootBonus ?? 0);
  }

  return bonuses;
}
