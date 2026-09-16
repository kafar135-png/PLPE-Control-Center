export type PepeClass = "warrior" | "ranger" | "mage";

export interface PepeCombatStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PepeClassDefinition {
  id: PepeClass;
  namePl: string;
  nameEn: string;
  taglinePl: string;
  taglineEn: string;
  rolePl: string;
  roleEn: string;
  icon: string;
  startingStats: PepeCombatStats;
  skills: Array<{
    level: number;
    icon: string;
    namePl: string;
    nameEn: string;
    descPl: string;
    descEn: string;
  }>;
}

/**
 * Season 1 class baseline.
 *
 * All three classes are built around the original PolishPepe baseline
 * 100 HP / 20 ATK / 15 DEF / 20 SPD. The differences are intentionally
 * moderate so PvE remains readable and Ranked PvP is decided mainly by
 * skill usage, stat-point allocation and counterplay rather than a huge
 * level-one stat gap.
 */
export const PEPE_CLASSES: Record<PepeClass, PepeClassDefinition> = {
  warrior: {
    id: "warrior",
    namePl: "Wojownik",
    nameEn: "Warrior",
    taglinePl: "Miecz, tarcza i wytrzymałość. Najpewniejszy w walce bezpośredniej.",
    taglineEn: "Sword, shield and endurance. The safest direct-combat class.",
    rolePl: "Tank / walka wręcz",
    roleEn: "Tank / melee",
    icon: "⚔️",
    startingStats: { hp: 110, attack: 21, defense: 18, speed: 18 },
    skills: [
      { level: 1, icon: "⚔️", namePl: "Cięcie", nameEn: "Slash", descPl: "Stabilny atak mieczem. Najlepiej wykorzystuje wysoką obronę Wojownika.", descEn: "Reliable sword strike that pairs with the Warrior's high defense." },
      { level: 2, icon: "🛡️", namePl: "Mur Tarczy", nameEn: "Shield Wall", descPl: "Osłania Pepe lub Bociana na 2 rundy. W PvP oczyszcza krwawienie i kontruje presję Rangera.", descEn: "Protects Pepe or Bocian for 2 rounds. In PvP it cleanses bleed and counters Ranger pressure." },
      { level: 4, icon: "🔥", namePl: "Polska Furia", nameEn: "Polish Fury", descPl: "Najmocniejsze pojedyncze uderzenie klasowe oraz dodatkowa tarcza po użyciu Spirit.", descEn: "The strongest single class hit plus a defensive Spirit shield." },
    ],
  },
  ranger: {
    id: "ranger",
    namePl: "Łucznik / Kusznik",
    nameEn: "Ranger / Crossbowman",
    taglinePl: "Szybkość, dystans i przebijanie pancerza. Styl precyzyjnego łowcy.",
    taglineEn: "Speed, range and armor piercing. A precise hunter playstyle.",
    rolePl: "Dystans / presja",
    roleEn: "Ranged / pressure",
    icon: "🏹",
    startingStats: { hp: 100, attack: 21, defense: 14, speed: 23 },
    skills: [
      { level: 1, icon: "🏹", namePl: "Strzał", nameEn: "Shot", descPl: "Szybki atak dystansowy. Ranger zwykle rozpoczyna pojedynek dzięki wysokiej szybkości.", descEn: "Fast ranged attack. High speed usually lets the Ranger act first." },
      { level: 2, icon: "🎯", namePl: "Przebijający Bełt", nameEn: "Piercing Bolt", descPl: "Nie może zostać zablokowany, częściowo ignoruje obronę i nakłada kontrolowane krwawienie.", descEn: "Cannot be blocked, partially ignores defense and applies controlled bleed." },
      { level: 4, icon: "🌧️", namePl: "Salwa PLPE", nameEn: "PLPE Volley", descPl: "Spirit trafia do trzech celów bez możliwości bloku i utrzymuje presję krwawieniem.", descEn: "Spirit hits up to three targets without block and adds bleed pressure." },
    ],
  },
  mage: {
    id: "mage",
    namePl: "Mag",
    nameEn: "Mage",
    taglinePl: "Kontrola pola walki, zamrożenie i magia ignorująca część pancerza.",
    taglineEn: "Battlefield control, freezing and magic that bypasses part of armor.",
    rolePl: "Kontrola / magia",
    roleEn: "Control / magic",
    icon: "🧙",
    startingStats: { hp: 100, attack: 21, defense: 14, speed: 22 },
    skills: [
      { level: 1, icon: "✨", namePl: "Pocisk Arkanów", nameEn: "Arcane Bolt", descPl: "Magiczny atak częściowo ignorujący obronę przeciwnika.", descEn: "Magic attack that partially ignores enemy defense." },
      { level: 2, icon: "❄️", namePl: "Runiczny Mróz", nameEn: "Runic Frost", descPl: "Zamraża przeciwnika i odbiera mu ruch. Magia przebija większość ciężkiej tarczy Wojownika.", descEn: "Freezes the enemy and removes a turn. Magic penetrates most of the Warrior's heavy shield." },
      { level: 4, icon: "⚡", namePl: "Burza PLPE", nameEn: "PLPE Storm", descPl: "Spirit uderza do trzech celów i może dodatkowo ogłuszyć żywy cel.", descEn: "Spirit strikes up to three targets and can additionally stun a surviving target." },
    ],
  },
};

export const PREVIOUS_CLASS_STARTING_STATS_V2: Record<PepeClass, PepeCombatStats> = {
  warrior: { hp: 115, attack: 21, defense: 19, speed: 17 },
  ranger: { hp: 100, attack: 22, defense: 14, speed: 25 },
  mage: { hp: 95, attack: 21, defense: 13, speed: 22 },
};

export const LEGACY_CLASS_STARTING_STATS: Record<PepeClass, PepeCombatStats> = {
  warrior: { hp: 130, attack: 23, defense: 21, speed: 18 },
  ranger: { hp: 105, attack: 22, defense: 14, speed: 28 },
  mage: { hp: 95, attack: 20, defense: 13, speed: 24 },
};

export const PEPE_TACTICAL_BASE_STATS: PepeCombatStats = {
  hp: 100,
  attack: 20,
  defense: 15,
  speed: 20,
};

export function isPepeClass(value: unknown): value is PepeClass {
  return value === "warrior" || value === "ranger" || value === "mage";
}
