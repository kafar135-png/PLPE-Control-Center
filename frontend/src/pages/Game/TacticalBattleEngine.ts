export type BattleTeam = "player" | "enemy";

export type UnitKind =
  | "polish-pepe"
  | "bocian"
  | "bear-scout"
  | "bear-warrior"
  | "bear-archer"
  | "bear-elite"
  | "bear-commander"
  | "harpy"
  | "harpy-matriarch"
  | "water-serpent"
  | "ancient-serpent"
  | "wild-bear"
  | "mountain-bear";

export type StatusEffectType =
  | "poison"
  | "bleed"
  | "stun"
  | "shield"
  | "attack-up"
  | "defense-up"
  | "slow";

export interface StatusEffect {
  id: string;
  type: StatusEffectType;
  turns: number;
  value: number;
}

export interface BattleStatBonuses {
  maxHp?: number;
  attack?: number;
  defense?: number;
  speed?: number;
}

export interface BattleUnit {
  id: string;
  name: string;
  kind: UnitKind;
  team: BattleTeam;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  alive: boolean;
  statuses: StatusEffect[];
  actedThisRound: boolean;
}

export interface BattleLogEntry {
  id: string;
  round: number;
  text: string;
}

export interface TacticalBattleState {
  round: number;
  units: BattleUnit[];
  turnOrder: string[];
  activeTurnIndex: number;
  activeUnitId: string | null;
  winner: BattleTeam | null;
  log: BattleLogEntry[];
}

export interface EnemyGroupDefinition {
  id: string;
  name: string;
  units: UnitKind[];
}

interface UnitBaseStats {
  name: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

const UNIT_STATS: Record<UnitKind, UnitBaseStats> = {
  "polish-pepe": { name: "PolishPepe", hp: 100, attack: 20, defense: 15, speed: 20 },
  bocian: { name: "Bocian", hp: 105, attack: 18, defense: 19, speed: 14 },
  "bear-scout": { name: "Bear Scout", hp: 65, attack: 15, defense: 7, speed: 15 },
  "bear-warrior": { name: "Bear Warrior", hp: 100, attack: 22, defense: 13, speed: 9 },
  "bear-archer": { name: "Bear Archer", hp: 58, attack: 20, defense: 5, speed: 14 },
  "bear-elite": { name: "Bear Elite", hp: 140, attack: 27, defense: 18, speed: 11 },
  "bear-commander": { name: "Bear Commander", hp: 240, attack: 34, defense: 23, speed: 12 },
  harpy: { name: "Harpy", hp: 58, attack: 17, defense: 5, speed: 22 },
  "harpy-matriarch": { name: "Harpy Matriarch", hp: 150, attack: 26, defense: 10, speed: 23 },
  "water-serpent": { name: "Water Serpent", hp: 94, attack: 21, defense: 10, speed: 13 },
  "ancient-serpent": { name: "Ancient Serpent", hp: 215, attack: 31, defense: 18, speed: 11 },
  "wild-bear": { name: "Wild Bear", hp: 120, attack: 24, defense: 12, speed: 8 },
  "mountain-bear": { name: "Mountain Bear", hp: 185, attack: 30, defense: 19, speed: 7 },
};

export const ENEMY_GROUPS: EnemyGroupDefinition[] = [
  { id: "bear-scout", name: "Bear Scout Patrol", units: ["bear-scout", "bear-scout"] },
  { id: "bear-small-patrol", name: "Bear Patrol", units: ["bear-scout", "bear-warrior"] },
  { id: "bear-standard-patrol", name: "Bear Army Patrol", units: ["bear-scout", "bear-warrior", "bear-archer"] },
  { id: "bear-heavy-patrol", name: "Heavy Bear Patrol", units: ["bear-warrior", "bear-warrior", "bear-archer", "bear-elite"] },
  { id: "bear-elite", name: "Bear Elite Guard", units: ["bear-warrior", "bear-archer", "bear-elite"] },
  { id: "bear-command-group", name: "Bear Command Group", units: ["bear-warrior", "bear-archer", "bear-elite", "bear-commander"] },
  { id: "harpy-flock", name: "Harpy Flock", units: ["harpy", "harpy", "harpy"] },
  { id: "harpy-nest", name: "Harpy Nest", units: ["harpy", "harpy", "harpy", "harpy-matriarch"] },
  { id: "serpent-pack", name: "Water Serpents", units: ["water-serpent", "water-serpent"] },
  { id: "ancient-serpent-pack", name: "Ancient Waters", units: ["water-serpent", "water-serpent", "ancient-serpent"] },
  { id: "wild-bears", name: "Wild Bears", units: ["wild-bear", "wild-bear"] },
  { id: "mountain-bear-family", name: "Mountain Bears", units: ["wild-bear", "wild-bear", "mountain-bear"] },
];

function scaleStat(value: number, level: number, multiplier: number) {
  if (level <= 1) return value;
  return Math.round(value * (1 + (level - 1) * multiplier));
}

export function createBattleUnit(kind: UnitKind, team: BattleTeam, level = 1, index = 0): BattleUnit {
  const base = UNIT_STATS[kind];
  const hp = scaleStat(base.hp, level, 0.11);
  return {
    id: `${team}-${kind}-${index}-${Math.random().toString(36).slice(2, 9)}`,
    name: base.name,
    kind,
    team,
    level,
    maxHp: hp,
    hp,
    attack: scaleStat(base.attack, level, 0.07),
    defense: scaleStat(base.defense, level, 0.06),
    speed: scaleStat(base.speed, level, 0.025),
    alive: true,
    statuses: [],
    actedThisRound: false,
  };
}

export function createPlayerParty(
  pepeLevel = 1,
  bocianLevel = 1,
  pepeBonuses: BattleStatBonuses = {},
  bocianBonuses: BattleStatBonuses = {}
) {
  // Player stats come from persistent progression / chosen class. Do NOT apply
  // the enemy level-scaling curve to heroes as well, otherwise PvE silently
  // becomes much stronger than the server-authoritative PvP profile.
  const pepeBase = createBattleUnit("polish-pepe", "player", 1, 0);
  const bocianBase = createBattleUnit("bocian", "player", 1, 1);

  const pepeHp = Math.max(1, pepeBase.maxHp + (pepeBonuses.maxHp ?? 0));
  const bocianHp = Math.max(1, bocianBase.maxHp + (bocianBonuses.maxHp ?? 0));

  const upgradedPepe: BattleUnit = {
    ...pepeBase,
    level: pepeLevel,
    maxHp: pepeHp,
    hp: pepeHp,
    attack: Math.max(1, pepeBase.attack + (pepeBonuses.attack ?? 0)),
    defense: Math.max(0, pepeBase.defense + (pepeBonuses.defense ?? 0)),
    speed: Math.max(1, pepeBase.speed + (pepeBonuses.speed ?? 0)),
  };

  const upgradedBocian: BattleUnit = {
    ...bocianBase,
    level: bocianLevel,
    maxHp: bocianHp,
    hp: bocianHp,
    attack: Math.max(1, bocianBase.attack + (bocianBonuses.attack ?? 0)),
    defense: Math.max(0, bocianBase.defense + (bocianBonuses.defense ?? 0)),
    speed: Math.max(1, bocianBase.speed + (bocianBonuses.speed ?? 0)),
  };

  return [upgradedPepe, upgradedBocian];
}

export function createEnemyParty(groupId: string, level = 1) {
  const group = ENEMY_GROUPS.find((item) => item.id === groupId) ?? ENEMY_GROUPS[0];
  return group.units.map((kind, index) => createBattleUnit(kind, "enemy", level, index));
}

export function calculateTurnOrder(units: BattleUnit[], round = 1) {
  const alive = units.filter((unit) => unit.alive);

  const players = alive
    .filter((unit) => unit.team === "player")
    .sort((a, b) => b.speed - a.speed);

  const enemies = alive
    .filter((unit) => unit.team === "enemy")
    .sort((a, b) => b.speed - a.speed);

  if (!players.length) return enemies.map((unit) => unit.id);
  if (!enemies.length) return players.map((unit) => unit.id);

  /*
    PLPE BATTLE v11

    Runda jest świadomie podzielona na fazę bohaterów i fazę przeciwnika.
    Pepe i Bocian ZAWSZE dostają po jednej akcji zanim zacznie się seria wroga.

    Poziom trudności określa ilu przeciwników faktycznie działa w rundzie:
      Lv. 1-2 -> 1 wróg
      Lv. 3-4 -> 2 wrogów
      Lv. 5+  -> 3 wrogów

    Przy dużych grupach aktywni wrogowie rotują co rundę. Dzięki temu czterech
    niedźwiedzi może stać na polu, ale nie wykonują czterech kolejnych ataków.
  */
  const difficulty = Math.max(1, ...enemies.map((unit) => unit.level));
  const enemyActions = difficulty <= 2 ? 1 : difficulty <= 4 ? 2 : 3;
  const slots = Math.min(enemies.length, enemyActions);
  const offset = enemies.length > 0 ? ((round - 1) * slots) % enemies.length : 0;
  const activeEnemies = Array.from({ length: slots }, (_, index) =>
    enemies[(offset + index) % enemies.length]
  );

  // Najpierw cała faza gracza, potem ograniczona faza przeciwnika.
  return [
    ...players.map((unit) => unit.id),
    ...activeEnemies.map((unit) => unit.id),
  ];
}

export function createBattleState(
  enemies: BattleUnit[],
  pepeLevel = 1,
  bocianLevel = 1,
  pepeBonuses: BattleStatBonuses = {},
  bocianBonuses: BattleStatBonuses = {}
): TacticalBattleState {
  const units = [...createPlayerParty(pepeLevel, bocianLevel, pepeBonuses, bocianBonuses), ...enemies];
  const order = calculateTurnOrder(units, 1);
  return {
    round: 1,
    units,
    turnOrder: order,
    activeTurnIndex: 0,
    activeUnitId: order[0] ?? null,
    winner: null,
    log: [{ id: `start-${Date.now()}`, round: 1, text: "Rozpoczyna się walka." }],
  };
}

export function getUnit(state: TacticalBattleState, unitId: string) {
  return state.units.find((unit) => unit.id === unitId);
}

export function getAliveUnits(state: TacticalBattleState, team: BattleTeam) {
  return state.units.filter((unit) => unit.team === team && unit.alive);
}

function addLog(state: TacticalBattleState, text: string): BattleLogEntry[] {
  return [...state.log, { id: `${Date.now()}-${Math.random()}`, round: state.round, text }].slice(-80);
}

function effectiveDefense(unit: BattleUnit) {
  const shield = unit.statuses
    .filter((s) => s.type === "shield")
    .reduce((sum, s) => sum + s.value, 0);
  return unit.defense + shield;
}

export function calculateDamage(attacker: BattleUnit, defender: BattleUnit, multiplier = 1) {
  const raw = attacker.attack * multiplier - effectiveDefense(defender) * 0.55;
  const random = 0.9 + Math.random() * 0.2;
  return Math.max(1, Math.round(raw * random));
}

export function determineWinner(units: BattleUnit[]): BattleTeam | null {
  const playerAlive = units.some((unit) => unit.team === "player" && unit.alive);
  const enemyAlive = units.some((unit) => unit.team === "enemy" && unit.alive);
  if (!playerAlive) return "enemy";
  if (!enemyAlive) return "player";
  return null;
}

export function addStatus(state: TacticalBattleState, targetId: string, effect: StatusEffect) {
  return {
    ...state,
    units: state.units.map((unit) => {
      if (unit.id !== targetId) return unit;
      return {
        ...unit,
        statuses: [...unit.statuses.filter((s) => s.type !== effect.type), effect],
      };
    }),
  };
}

export function performAttack(
  state: TacticalBattleState,
  attackerId: string,
  targetId: string,
  multiplier = 1,
  label = "atakuje"
): TacticalBattleState {
  const attacker = getUnit(state, attackerId);
  const target = getUnit(state, targetId);
  if (!attacker || !target || !attacker.alive || !target.alive) return state;

  const stunned = attacker.statuses.some((status) => status.type === "stun" && status.turns > 0);
  if (stunned) {
    return {
      ...state,
      units: state.units.map((u) => u.id === attackerId ? { ...u, actedThisRound: true } : u),
      log: addLog(state, `${attacker.name} jest ogłuszony i traci turę.`),
    };
  }

  const damage = calculateDamage(attacker, target, multiplier);
  const nextHp = Math.max(0, target.hp - damage);
  const units = state.units.map((unit) => {
    if (unit.id === targetId) return { ...unit, hp: nextHp, alive: nextHp > 0 };
    if (unit.id === attackerId) return { ...unit, actedThisRound: true };
    return unit;
  });

  let text = `${attacker.name} ${label} ${target.name} za ${damage}.`;
  if (nextHp <= 0) text += ` ${target.name} został pokonany.`;

  return { ...state, units, winner: determineWinner(units), log: addLog(state, text) };
}

export function performPepeSpirit(state: TacticalBattleState, attackerId: string, targetId: string) {
  let next = performAttack(state, attackerId, targetId, 1.45, "używa PLPE Spirit przeciw");
  if (next.winner) return next;
  const target = getUnit(next, targetId);
  if (target?.alive && Math.random() < 0.3) {
    next = addStatus(next, targetId, {
      id: `stun-${Date.now()}`,
      type: "stun",
      turns: 1,
      value: 1,
    });
    next = { ...next, log: addLog(next, `${target.name} został ogłuszony.`) };
  }
  return next;
}

export function performBocianShield(state: TacticalBattleState, bocianId: string, targetId: string) {
  const bocian = getUnit(state, bocianId);
  const target = getUnit(state, targetId);
  if (!bocian || !target || !bocian.alive || !target.alive) return state;
  const shield = 10 + bocian.level * 3;
  let next = addStatus(state, targetId, {
    id: `shield-${Date.now()}`,
    type: "shield",
    turns: 2,
    value: shield,
  });
  next = {
    ...next,
    units: next.units.map((u) => u.id === bocianId ? { ...u, actedThisRound: true } : u),
    log: addLog(next, `Bocian daje ${target.name} tarczę +${shield} DEF na 2 rundy.`),
  };
  return next;
}

export function performBocianHeal(state: TacticalBattleState, bocianId: string, targetId: string) {
  const bocian = getUnit(state, bocianId);
  const target = getUnit(state, targetId);
  if (!bocian || !target || !bocian.alive || !target.alive) return state;
  const heal = 18 + bocian.level * 4;
  const healed = Math.min(target.maxHp, target.hp + heal);
  return {
    ...state,
    units: state.units.map((u) => {
      if (u.id === targetId) return { ...u, hp: healed };
      if (u.id === bocianId) return { ...u, actedThisRound: true };
      return u;
    }),
    log: addLog(state, `Bocian leczy ${target.name} o ${healed - target.hp} HP.`),
  };
}

function processStatuses(unit: BattleUnit): BattleUnit {
  let hp = unit.hp;
  const nextStatuses: StatusEffect[] = [];
  for (const status of unit.statuses) {
    if (status.type === "poison" || status.type === "bleed") hp = Math.max(0, hp - status.value);
    if (status.turns > 1) nextStatuses.push({ ...status, turns: status.turns - 1 });
  }
  return { ...unit, hp, alive: hp > 0, statuses: nextStatuses, actedThisRound: false };
}

export function startNextRound(state: TacticalBattleState): TacticalBattleState {
  const units = state.units.map(processStatuses);
  const winner = determineWinner(units);
  if (winner) return { ...state, units, winner };
  const order = calculateTurnOrder(units, state.round + 1);
  const next = {
    ...state,
    round: state.round + 1,
    units,
    turnOrder: order,
    activeTurnIndex: 0,
    activeUnitId: order[0] ?? null,
  };
  return { ...next, log: addLog(next, `Runda ${next.round}.`) };
}

export function advanceBattleTurn(state: TacticalBattleState): TacticalBattleState {
  if (state.winner) return state;

  const current = state.activeUnitId ? getUnit(state, state.activeUnitId) : undefined;

  /*
    Battle phase guard.

    The player phase lets the user choose Pepe or Bocian in any order. Because of
    that we cannot blindly advance by one turnOrder index: the unit whose slot is
    currently active may be different from the hero that has just acted.

    Instead:
      1) while at least one living player has not acted, stay in the player phase
         and hand control to an unacted hero;
      2) once both heroes acted, jump to the first available enemy action;
      3) during the enemy phase, move only through living enemies that have not
         acted;
      4) when no enemy action remains, start a clean next round.

    This removes ghost turns where activeUnitId points at a unit that already
    acted and prevents the UI from ending up with no valid action.
  */
  if (current?.team === "player") {
    const nextPlayer = state.turnOrder
      .map((id) => getUnit(state, id))
      .find((unit) => unit?.team === "player" && unit.alive && !unit.actedThisRound);

    if (nextPlayer) {
      const index = state.turnOrder.indexOf(nextPlayer.id);
      return {
        ...state,
        activeTurnIndex: index >= 0 ? index : state.activeTurnIndex,
        activeUnitId: nextPlayer.id,
      };
    }

    const nextEnemy = state.turnOrder
      .map((id, index) => ({ unit: getUnit(state, id), index }))
      .find(({ unit }) => unit?.team === "enemy" && unit.alive && !unit.actedThisRound);

    if (nextEnemy?.unit) {
      return {
        ...state,
        activeTurnIndex: nextEnemy.index,
        activeUnitId: nextEnemy.unit.id,
      };
    }

    return startNextRound(state);
  }

  if (current?.team === "enemy") {
    let index = state.activeTurnIndex + 1;

    while (index < state.turnOrder.length) {
      const id = state.turnOrder[index];
      const unit = getUnit(state, id);

      if (unit?.team === "enemy" && unit.alive && !unit.actedThisRound) {
        return {
          ...state,
          activeTurnIndex: index,
          activeUnitId: id,
        };
      }

      index += 1;
    }

    return startNextRound(state);
  }

  // Defensive recovery for an invalid/missing active unit.
  const nextPlayer = state.turnOrder
    .map((id) => getUnit(state, id))
    .find((unit) => unit?.team === "player" && unit.alive && !unit.actedThisRound);

  if (nextPlayer) {
    const index = state.turnOrder.indexOf(nextPlayer.id);
    return {
      ...state,
      activeTurnIndex: index >= 0 ? index : 0,
      activeUnitId: nextPlayer.id,
    };
  }

  const nextEnemy = state.turnOrder
    .map((id, index) => ({ unit: getUnit(state, id), index }))
    .find(({ unit }) => unit?.team === "enemy" && unit.alive && !unit.actedThisRound);

  if (nextEnemy?.unit) {
    return {
      ...state,
      activeTurnIndex: nextEnemy.index,
      activeUnitId: nextEnemy.unit.id,
    };
  }

  return startNextRound(state);
}

export function chooseEnemyTarget(state: TacticalBattleState) {
  const targets = getAliveUnits(state, "player");
  if (targets.length === 0) return null;
  if (Math.random() < 0.65) {
    return [...targets].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
  }
  return targets[Math.floor(Math.random() * targets.length)];
}

export function performEnemyTurn(state: TacticalBattleState, enemyId: string): TacticalBattleState {
  const enemy = getUnit(state, enemyId);
  if (!enemy?.alive) return state;
  const target = chooseEnemyTarget(state);
  if (!target) return state;

  let multiplier = 1;
  let label = "atakuje";
  switch (enemy.kind) {
    case "bear-archer": multiplier = 1.08; label = "strzela do"; break;
    case "bear-elite": multiplier = 1.18; label = "wyprowadza ciężki atak na"; break;
    case "bear-commander": multiplier = 1.3; label = "uderza dowódczym atakiem w"; break;
    case "harpy": multiplier = 0.95; label = "szarżuje z powietrza na"; break;
    case "harpy-matriarch": multiplier = 1.25; label = "atakuje z powietrza"; break;
    case "water-serpent": multiplier = 1.1; label = "kąsa"; break;
    case "ancient-serpent": multiplier = 1.32; label = "miażdży"; break;
    case "wild-bear": multiplier = 1.12; label = "szarżuje na"; break;
    case "mountain-bear": multiplier = 1.28; label = "potężnie uderza"; break;
  }

  let next = performAttack(state, enemy.id, target.id, multiplier, label);
  if ((enemy.kind === "water-serpent" || enemy.kind === "ancient-serpent") && target.alive && Math.random() < 0.35) {
    next = addStatus(next, target.id, {
      id: `poison-${Date.now()}`,
      type: "poison",
      turns: 3,
      value: enemy.kind === "ancient-serpent" ? 8 : 5,
    });
  }
  if ((enemy.kind === "bear-archer" || enemy.kind === "harpy") && target.alive && Math.random() < 0.25) {
    next = addStatus(next, target.id, {
      id: `bleed-${Date.now()}`,
      type: "bleed",
      turns: 2,
      value: 4,
    });
  }
  return next;
}
