import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./TacticalBattle.css";

import charPolishPepe from "../../assets/game/char_polishpepe.png";
import charBocian from "../../assets/game/char_bocian.png";
import charBearScout from "../../assets/game/char_bear_scout.png";
import charBearWarrior from "../../assets/game/char_bear_warrior.png";
import charBearArcher from "../../assets/game/char_bear_archer.png";
import charBearElite from "../../assets/game/char_bear_elite.png";
import charBearCommander from "../../assets/game/char_bear_commander.png";
import charWildBear from "../../assets/game/char_wild_bear.png";
import charMountainBear from "../../assets/game/char_mountain_bear.png";
import charWaterSerpent from "../../assets/game/char_water_serpent.png";
import charAncientSerpent from "../../assets/game/char_ancient_serpent.png";
import charHarpy from "../../assets/game/char_harpy.svg";
import charHarpyMatriarch from "../../assets/game/char_harpy_matriarch.svg";

import battleBgForest from "../../assets/game/battle_bg_forest.png";
import battleBgMountain from "../../assets/game/battle_bg_mountain.png";
import battleBgArena from "../../assets/game/battle_bg_arena.png";
import battleBgAlarm from "../../assets/game/battle_bg_alarm.png";

import {
  advanceBattleTurn,
  calculateDamage,
  createBattleState,
  createEnemyParty,
  determineWinner,
  getAliveUnits,
  getUnit,
} from "./TacticalBattleEngine";
import { PEPE_CLASSES, type PepeClass } from "./CharacterClasses";
import {
  playAbility,
  playAttack,
  playBearAttack,
  playHit,
  playVictory,
} from "./gameAudio";

import type {
  BattleUnit,
  StatusEffect,
  TacticalBattleState,
  UnitKind,
} from "./TacticalBattleEngine";

interface TacticalBattleProps {
  title: string;
  enemyGroupId: string;
  enemyLevel?: number;
  pepeLevel?: number;
  bocianLevel?: number;
  pepeClass?: PepeClass | null;
  pepeBonuses?: {
    attack?: number;
    defense?: number;
    speed?: number;
    maxHp?: number;
    lootBonus?: number;
  };
  bocianBonuses?: {
    attack?: number;
    defense?: number;
    speed?: number;
    maxHp?: number;
  };
  rewardText?: string[];
  onVictory: () => void;
  onDefeat: () => void;
  onRetreat?: () => void;
}

type TargetMode =
  | "shield"
  | "heal"
  | "freeze"
  | "sleep"
  | "blessing"
  | null;

type BattleFxType =
  | "slash"
  | "lightning"
  | "bolt"
  | "arrow"
  | "fire"
  | "poison"
  | "heal"
  | "shield"
  | "block"
  | "freeze"
  | "sleep"
  | "blessing"
  | "death";

interface BattleFx {
  id: number;
  type: BattleFxType;
  direction: "player-to-enemy" | "enemy-to-player" | "self";
  targetId?: string;
}

interface PendingEnemyAttack {
  attackerId: string;
  targetId: string;
}

interface CombatText {
  id: number;
  targetId: string;
  text: string;
  kind: "damage" | "heal" | "block" | "status";
}

const SPIRIT_MAX = 1000;

const BATTLE_BACKGROUNDS = [
  battleBgForest,
  battleBgMountain,
  battleBgArena,
  battleBgAlarm,
];

function unitEmoji(kind: UnitKind) {
  switch (kind) {
    case "bear-scout":
      return "🐻";
    case "bear-warrior":
      return "🪓";
    case "bear-archer":
      return "🏹";
    case "bear-elite":
      return "🛡️";
    case "bear-commander":
      return "👑";
    case "harpy":
      return "🪽";
    case "harpy-matriarch":
      return "🦅";
    case "water-serpent":
      return "🐍";
    case "ancient-serpent":
      return "🐉";
    case "wild-bear":
      return "🐻";
    case "mountain-bear":
      return "🐻‍❄️";
    default:
      return "⚔️";
  }
}

function enemyFx(kind: UnitKind): BattleFxType {
  switch (kind) {
    case "bear-archer":
      return "arrow";
    case "water-serpent":
    case "ancient-serpent":
      return "poison";
    case "bear-commander":
    case "bear-elite":
      return "fire";
    default:
      return "slash";
  }
}

function chooseBattleBackground(title: string, enemyGroupId: string) {
  const seed = `${title}-${enemyGroupId}-${Date.now()}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  let index = hash % BATTLE_BACKGROUNDS.length;

  if (typeof window !== "undefined") {
    const storageKey = "plpe-arena-last-battle-bg-v1";
    const previous = Number(window.sessionStorage.getItem(storageKey));

    if (Number.isInteger(previous) && previous === index && BATTLE_BACKGROUNDS.length > 1) {
      index = (index + 1) % BATTLE_BACKGROUNDS.length;
    }

    window.sessionStorage.setItem(storageKey, String(index));
  }

  return BATTLE_BACKGROUNDS[index];
}

function ClassEquipmentOverlay({ pepeClass }: { pepeClass: PepeClass }) {
  if (pepeClass === "warrior") {
    return (
      <svg className="tactical-battle__class-equipment tactical-battle__class-equipment--warrior" viewBox="0 0 100 180" aria-hidden="true">
        <defs><linearGradient id="warriorMetal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff3c1"/><stop offset=".45" stopColor="#aeb8c7"/><stop offset="1" stopColor="#4e596b"/></linearGradient></defs>
        <path d="M18 84 L12 139 L20 145 L27 88 Z" fill="url(#warriorMetal)" stroke="#1b2029" strokeWidth="2"/>
        <path d="M10 139 L30 139 L25 149 L15 149 Z" fill="#d3a64e" stroke="#2b1d0c" strokeWidth="2"/>
        <path d="M72 86 C88 91 92 101 88 121 C84 139 75 148 66 153 C58 146 52 136 50 120 C48 103 54 91 72 86 Z" fill="#b8c4d4" stroke="#4a2d1e" strokeWidth="3"/>
        <path d="M69 96 L69 142 M56 116 L84 116" stroke="#c51f2a" strokeWidth="5"/>
      </svg>
    );
  }
  if (pepeClass === "ranger") {
    return (
      <svg className="tactical-battle__class-equipment tactical-battle__class-equipment--ranger" viewBox="0 0 100 180" aria-hidden="true">
        <path d="M79 58 C97 79 96 120 74 145" fill="none" stroke="#8b5d30" strokeWidth="4"/>
        <path d="M79 58 Q62 102 74 145" fill="none" stroke="#e3d3a3" strokeWidth="1.4"/>
        <path d="M25 95 L83 107" stroke="#d8c8a0" strokeWidth="2"/>
        <path d="M84 107 l-8 -5 l2 8 z" fill="#dbe6e8"/>
        <path d="M23 58 C12 76 11 101 18 128" fill="none" stroke="#1f6c3f" strokeWidth="10" strokeLinecap="round" opacity=".75"/>
      </svg>
    );
  }
  return (
    <svg className="tactical-battle__class-equipment tactical-battle__class-equipment--mage" viewBox="0 0 100 180" aria-hidden="true">
      <defs><radialGradient id="mageOrb"><stop stopColor="#ffffff"/><stop offset=".2" stopColor="#91c5ff"/><stop offset=".55" stopColor="#815dff"/><stop offset="1" stopColor="#321b70"/></radialGradient></defs>
      <path d="M79 62 L72 151" stroke="#6a472e" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="80" cy="55" r="11" fill="url(#mageOrb)" stroke="#d7c8ff" strokeWidth="2"/>
      <path d="M25 32 Q48 8 67 34 L59 43 L23 43 Z" fill="#4d2d8f" stroke="#241346" strokeWidth="2"/>
      <path d="M17 42 Q47 35 74 43 Q49 54 17 42 Z" fill="#6d43bd" stroke="#241346" strokeWidth="2"/>
      <circle cx="80" cy="55" r="17" fill="none" stroke="#9c7cff" strokeWidth="1.4" opacity=".75"/>
    </svg>
  );
}

function UnitPortrait({ unit, pepeClass = "warrior" }: { unit: BattleUnit; pepeClass?: PepeClass }) {
  if (unit.kind === "polish-pepe") {
    return (
      <div className={`tactical-battle__pepe-class tactical-battle__pepe-class--${pepeClass}`}>
        <span className="tactical-battle__class-aura" aria-hidden="true" />
        <img className="tactical-battle__sprite-image" src={charPolishPepe} alt={`PolishPepe ${PEPE_CLASSES[pepeClass].nameEn}`} />
        <ClassEquipmentOverlay pepeClass={pepeClass} />
        <span className="tactical-battle__class-badge">{PEPE_CLASSES[pepeClass].icon}</span>
      </div>
    );
  }

  if (unit.kind === "bocian") {
    return <img className="tactical-battle__sprite-image" src={charBocian} alt="Bocian" />;
  }

  const bearSprite: Partial<Record<UnitKind, string>> = {
    "bear-scout": charBearScout,
    "bear-warrior": charBearWarrior,
    "bear-archer": charBearArcher,
    "bear-elite": charBearElite,
    "bear-commander": charBearCommander,
    "wild-bear": charWildBear,
    "mountain-bear": charMountainBear,
    "water-serpent": charWaterSerpent,
    "ancient-serpent": charAncientSerpent,
    harpy: charHarpy,
    "harpy-matriarch": charHarpyMatriarch,
  };

  const sprite = bearSprite[unit.kind];

  if (sprite) {
    return (
      <div className={`tactical-battle__enemy-sprite tactical-battle__enemy-sprite--${unit.kind}`}>
        <img className="tactical-battle__sprite-image" src={sprite} alt={unit.name} />
      </div>
    );
  }

  /*
    Fallback wyłącznie dla stworzeń bez osobnego sprite'a (np. harpie).
    Water Serpent i Ancient Serpent mają już własne PNG i stoją na ziemi
    tak samo jak pozostałe jednostki.
  */
  return (
    <div className={`tactical-battle__creature-sprite tactical-battle__creature-sprite--${unit.kind}`} aria-label={unit.name}>
      <span>{unitEmoji(unit.kind)}</span>
    </div>
  );
}

function IconSword() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M48 5 59 16 29 46l-11 3 3-11L48 5Z" />
      <path d="m18 42-9 9 4 4 9-9M29 46l8 8" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 5 53 13v15c0 14-8 24-21 31C19 52 11 42 11 28V13L32 5Z" />
      <path d="M32 14v33" />
    </svg>
  );
}

function IconLightning() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M37 4 15 36h15l-4 24 23-34H34L37 4Z" />
    </svg>
  );
}

function IconMedkit() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="18" width="44" height="35" rx="7" />
      <path d="M24 18v-6h16v6M32 27v17M23 35h18" />
    </svg>
  );
}

function IconSnow() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6v52M9 19l46 26M9 45l46-26M25 12l7 7 7-7M25 52l7-7 7 7M12 27l10 3-3 10M52 37l-10-3 3-10" />
    </svg>
  );
}

function IconSleep() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 17h22L14 39h22M31 11h19L34 28h19" />
    </svg>
  );
}

function IconBlessing() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6v52M6 32h52M14 14l36 36M50 14 14 50" />
      <circle cx="32" cy="32" r="9" />
    </svg>
  );
}

function statusIcon(status: StatusEffect) {
  if (status.type === "shield") return "🛡";
  if (status.type === "attack-up") return "✨";
  if (status.type === "slow") return "❄";
  if (status.type === "stun" && status.value >= 2) return "💤";
  if (status.type === "stun") return "⚡";
  if (status.type === "poison") return "☠";
  if (status.type === "bleed") return "🩸";
  return "•";
}

export default function TacticalBattle({
  title,
  enemyGroupId,
  enemyLevel = 1,
  pepeLevel = 1,
  bocianLevel = 1,
  pepeClass = "warrior",
  pepeBonuses,
  bocianBonuses,
  rewardText = [],
  onVictory,
  onDefeat,
  onRetreat,
}: TacticalBattleProps) {
  const initialState = useMemo(() =>
    createBattleState(
      createEnemyParty(enemyGroupId, enemyLevel),
      pepeLevel,
      bocianLevel,
      pepeBonuses,
      bocianBonuses
    ),
  [enemyGroupId, enemyLevel, pepeLevel, bocianLevel, pepeBonuses, bocianBonuses]);

  const background = useMemo(
    () => chooseBattleBackground(title, enemyGroupId),
    [title, enemyGroupId]
  );

  const [battle, setBattle] = useState<TacticalBattleState>(initialState);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [targetMode, setTargetMode] = useState<TargetMode>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [pendingEnemyAttack, setPendingEnemyAttack] = useState<PendingEnemyAttack | null>(null);
  const [impactId, setImpactId] = useState<string | null>(null);
  const [shieldFlashId, setShieldFlashId] = useState<string | null>(null);
  const [fx, setFx] = useState<BattleFx | null>(null);
  const [spiritPoints, setSpiritPoints] = useState(0);
  const [classSkillCooldown, setClassSkillCooldown] = useState(0);
  const [combatTexts, setCombatTexts] = useState<CombatText[]>([]);

  /*
    Synchronous battle lock.

    React state alone is not enough to guard fast double-clicks because two click
    handlers can run before the aiBusy state update is rendered. That used to
    create two overlapping timers and eventually leave the battle in a deadlock.
  */
  const actionLockRef = useRef(false);
  const actionTokenRef = useRef(0);
  const lockStartedAtRef = useRef(0);
  const actionTimersRef = useRef<Set<number>>(new Set());
  const mountedRef = useRef(true);
  const battleRef = useRef(battle);
  const victoryPlayedRef = useRef(false);

  function beginAction() {
    if (actionLockRef.current) return null;

    actionLockRef.current = true;
    lockStartedAtRef.current = Date.now();
    const token = actionTokenRef.current + 1;
    actionTokenRef.current = token;
    setAiBusy(true);
    return token;
  }

  function actionIsCurrent(token: number) {
    return mountedRef.current && actionTokenRef.current === token;
  }

  function releaseAction(token: number) {
    if (!actionIsCurrent(token)) return;
    actionLockRef.current = false;
    lockStartedAtRef.current = 0;
    setAiBusy(false);
  }

  function invalidateAction() {
    actionTokenRef.current += 1;
    actionLockRef.current = false;
    lockStartedAtRef.current = 0;
    setAiBusy(false);
  }

  function scheduleAction(token: number, delay: number, callback: () => void) {
    const timer = window.setTimeout(() => {
      actionTimersRef.current.delete(timer);
      if (!actionIsCurrent(token)) return;
      callback();
    }, delay);

    actionTimersRef.current.add(timer);
    return timer;
  }

  const activeUnit = battle.activeUnitId
    ? getUnit(battle, battle.activeUnitId)
    : undefined;

  const playerUnits = getAliveUnits(battle, "player");
  const enemyUnits = getAliveUnits(battle, "enemy");
  const availableActors = playerUnits.filter((unit) => !unit.actedThisRound);
  const selectedActor =
    playerUnits.find((unit) => unit.id === selectedActorId && !unit.actedThisRound) ??
    availableActors[0] ??
    playerUnits[0];
  const spiritPercent = Math.min(100, Math.round((spiritPoints / SPIRIT_MAX) * 100));
  const spiritReady = spiritPoints >= SPIRIT_MAX;
  const activePepeClass: PepeClass = pepeClass ?? "warrior";
  const pepeClassDefinition = PEPE_CLASSES[activePepeClass];

  useEffect(() => {
    battleRef.current = battle;
  }, [battle]);

  useEffect(() => {
    if (battle.winner === "player" && !victoryPlayedRef.current) {
      victoryPlayedRef.current = true;
      playVictory();
    }
  }, [battle.winner]);

  useEffect(() => {
    // Cooldown ticks once when a new combat round begins. Warrior/Ranger skills
    // can be used every other round; Mage control has a longer cadence so it
    // cannot permanently stun-lock a target.
    setClassSkillCooldown((current) => Math.max(0, current - 1));
  }, [battle.round]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      actionTokenRef.current += 1;
      actionTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      actionTimersRef.current.clear();
    };
  }, []);

  /*
    Final deadlock guard. If any animation/action lock survives for too long, the
    battle recovers instead of forcing the player to refresh the whole page.
    Player turns are simply unlocked. A stuck enemy turn is safely consumed so
    the next valid turn can begin.
  */
  useEffect(() => {
    // React state is only the visual lock. The ref is authoritative. If a
    // batched update ever leaves aiBusy=true after the synchronous lock was
    // released, repair it immediately so reaction/action buttons stay usable.
    if (aiBusy && !actionLockRef.current) setAiBusy(false);
  }, [aiBusy, pendingEnemyAttack, battle.activeUnitId]);

  useEffect(() => {
    const watchdog = window.setInterval(() => {
      if (!actionLockRef.current || lockStartedAtRef.current <= 0) return;
      if (Date.now() - lockStartedAtRef.current < 4500) return;

      const hadPendingReaction = Boolean(pendingEnemyAttack);
      invalidateAction();

      if (hadPendingReaction) {
        // The reaction buttons must always become clickable again.
        return;
      }

      setBattle((current) => {
        if (current.winner || !current.activeUnitId) return current;
        const stuckUnit = getUnit(current, current.activeUnitId);

        if (stuckUnit?.team === "enemy") {
          return advanceBattleTurn(markActed(current, stuckUnit.id));
        }

        return current;
      });
    }, 700);

    return () => window.clearInterval(watchdog);
  }, [pendingEnemyAttack]);

  useEffect(() => {
    if (!activeUnit || activeUnit.team !== "player") return;

    const choices = getAliveUnits(battle, "player").filter((unit) => !unit.actedThisRound);
    const currentValid = choices.some((unit) => unit.id === selectedActorId);

    if (!currentValid) {
      const preferredPepe = choices.find((unit) => unit.kind === "polish-pepe");
      setSelectedActorId((preferredPepe ?? choices[0] ?? null)?.id ?? null);
    }
  }, [battle.activeUnitId, battle.units, activeUnit, selectedActorId]);

  useEffect(() => {
    if (enemyUnits.length === 0) {
      setSelectedEnemyId(null);
      return;
    }

    if (!selectedEnemyId || !enemyUnits.some((unit) => unit.id === selectedEnemyId)) {
      setSelectedEnemyId(enemyUnits[0].id);
    }
  }, [enemyUnits, selectedEnemyId]);

  function addStatus(
    state: TacticalBattleState,
    targetId: string,
    effect: StatusEffect
  ): TacticalBattleState {
    return {
      ...state,
      units: state.units.map((unit) => {
        if (unit.id !== targetId) return unit;

        return {
          ...unit,
          statuses: [
            ...unit.statuses.filter((status) => status.type !== effect.type),
            effect,
          ],
        };
      }),
    };
  }

  function markActed(state: TacticalBattleState, unitId: string) {
    return {
      ...state,
      units: state.units.map((unit) =>
        unit.id === unitId
          ? { ...unit, actedThisRound: true }
          : unit
      ),
    };
  }

  function showFx(
    type: BattleFxType,
    direction: BattleFx["direction"],
    targetId?: string,
    duration = 650
  ) {
    const id = Date.now();
    setFx({ id, type, direction, targetId });

    window.setTimeout(() => {
      setFx((current) => current?.id === id ? null : current);
    }, duration);
  }

  function flashImpact(unitId: string, duration = 420) {
    setImpactId(unitId);
    window.setTimeout(() => {
      setImpactId((current) => current === unitId ? null : current);
    }, duration);
  }

  function flashShield(unitId: string, duration = 720) {
    setShieldFlashId(unitId);
    window.setTimeout(() => {
      setShieldFlashId((current) => current === unitId ? null : current);
    }, duration);
  }

  function showCombatText(targetId: string, text: string, kind: CombatText["kind"] = "damage") {
    const item: CombatText = { id: Date.now() + Math.floor(Math.random() * 1000), targetId, text, kind };
    setCombatTexts((current) => [...current, item]);
    window.setTimeout(() => {
      setCombatTexts((current) => current.filter((entry) => entry.id !== item.id));
    }, 950);
  }

  function chargeSpiritFromPepeHit(damage: number) {
    if (damage <= 0) return;

    const gained = Math.max(180, Math.min(360, damage * 12));
    setSpiritPoints((current) => Math.min(SPIRIT_MAX, current + gained));
  }

  function chargeSpiritFromDamageTaken(damage: number) {
    if (damage <= 0) return;

    const gained = Math.max(120, Math.min(300, damage * 10));
    setSpiritPoints((current) => Math.min(SPIRIT_MAX, current + gained));
  }

  function effectiveAttack(unit: BattleUnit) {
    const bonus = unit.statuses
      .filter((status) => status.type === "attack-up")
      .reduce((sum, status) => sum + status.value, 0);

    return unit.attack + bonus;
  }

  function effectiveDefenseForBlock(unit: BattleUnit) {
    const shield = unit.statuses
      .filter((status) => status.type === "shield")
      .reduce((sum, status) => sum + status.value, 0);

    return unit.defense + shield;
  }

  function blockChance(defender: BattleUnit) {
    return Math.min(
      0.75,
      Math.max(
        0.13,
        0.17 + effectiveDefenseForBlock(defender) * 0.012 + defender.speed * 0.006
      )
    );
  }

  type DamageMode = "normal" | "piercing" | "magic";

  interface StrikeResolution {
    state: TacticalBattleState;
    blocked: boolean;
    damage: number;
    defeated: boolean;
  }

  function resolveStrike(
    state: TacticalBattleState,
    attackerId: string,
    targetId: string,
    multiplier: number,
    defenderTriesToBlock: boolean,
    breakSleep = true,
    damageMode: DamageMode = "normal"
  ): StrikeResolution {
    const attacker = getUnit(state, attackerId);
    const target = getUnit(state, targetId);

    if (!attacker || !target || !attacker.alive || !target.alive) {
      return {
        state,
        blocked: false,
        damage: 0,
        defeated: false,
      };
    }

    const attackerWithBuffs: BattleUnit = {
      ...attacker,
      attack: effectiveAttack(attacker),
    };

    const defenderDisabled = target.statuses.some(
      (status) => status.type === "stun" && status.turns > 0
    );
    const blocked =
      defenderTriesToBlock &&
      !defenderDisabled &&
      Math.random() < blockChance(target);
    const targetForDamage: BattleUnit = damageMode === "normal"
      ? target
      : {
          ...target,
          // Keep the same penetration model in PvE and server PvP.
          defense: target.defense * (damageMode === "magic" ? 0.45 : 0.35),
          statuses: target.statuses.map((status) => {
            if (status.type !== "shield") return status;
            if (damageMode === "magic") return { ...status, value: Math.round(status.value * 0.45) };
            if (damageMode === "piercing") return { ...status, value: Math.round(status.value * 0.25) };
            return status;
          }),
        };

    const damage = blocked
      ? 0
      : calculateDamage(attackerWithBuffs, targetForDamage, multiplier);

    const nextHp = Math.max(0, target.hp - damage);

    const units = state.units.map((unit) => {
      if (unit.id === attackerId) {
        return {
          ...unit,
          actedThisRound: true,
        };
      }

      if (unit.id === targetId) {
        const statuses = breakSleep && damage > 0
          ? unit.statuses.filter(
              (status) => !(status.type === "stun" && status.value >= 2)
            )
          : unit.statuses;

        return {
          ...unit,
          hp: nextHp,
          alive: nextHp > 0,
          statuses,
        };
      }

      return unit;
    });

    const next: TacticalBattleState = {
      ...state,
      units,
      winner: determineWinner(units),
    };

    return {
      state: next,
      blocked,
      damage,
      defeated: target.alive && nextHp <= 0,
    };
  }

  function advanceAfter(
    state: TacticalBattleState,
    delay = 420,
    clearEnemyReaction = false,
    actionToken?: number
  ) {
    const token = actionToken ?? actionTokenRef.current;

    scheduleAction(token, delay, () => {
      if (clearEnemyReaction) {
        setPendingEnemyAttack(null);
      }

      setBattle(advanceBattleTurn(state));
      setTargetMode(null);
      releaseAction(token);
    });
  }

  useEffect(() => {
    if (
      battle.winner ||
      !activeUnit ||
      activeUnit.team !== "enemy" ||
      pendingEnemyAttack ||
      actionLockRef.current
    ) {
      return;
    }

    const stunned = activeUnit.statuses.some(
      (status) => status.type === "stun" && status.turns > 0
    );

    const token = beginAction();
    if (token === null) return;

    if (stunned) {
      const sleeping = activeUnit.statuses.some(
        (status) => status.type === "stun" && status.value >= 2
      );

      showFx(sleeping ? "sleep" : "freeze", "self", activeUnit.id, 700);

      scheduleAction(token, 760, () => {
        setBattle((current) =>
          advanceBattleTurn(markActed(current, activeUnit.id))
        );
        releaseAction(token);
      });
      return;
    }

    const targets = getAliveUnits(battle, "player");
    if (targets.length === 0) {
      releaseAction(token);
      return;
    }

    const target = Math.random() < 0.55
      ? targets[Math.floor(Math.random() * targets.length)]
      : [...targets].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];

    const attackerId = activeUnit.id;
    const targetId = target.id;

    scheduleAction(token, 480, () => {
      setPendingEnemyAttack({ attackerId, targetId });
      releaseAction(token);
    });
  }, [battle.activeUnitId, battle.winner, pendingEnemyAttack]);

  // Defensive state-machine recovery: never leave the UI parked on a unit that
  // has already consumed its action. This is intentionally independent from
  // animation timers, so even a cancelled/slow animation cannot freeze combat.
  useEffect(() => {
    if (battle.winner || pendingEnemyAttack || actionLockRef.current || !activeUnit) return;
    if (activeUnit.actedThisRound) {
      const timer = window.setTimeout(() => {
        setBattle((current) => advanceBattleTurn(current));
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [battle.activeUnitId, battle.units, battle.winner, pendingEnemyAttack, activeUnit]);

  // Reaction fallback. The normal flow remains interactive, but if a browser
  // loses a click/focus or a reaction control becomes unreachable, the battle
  // automatically resolves the defense after 9 seconds instead of requiring a
  // full page refresh.
  useEffect(() => {
    if (!pendingEnemyAttack) return;
    const pending = pendingEnemyAttack;
    const timer = window.setTimeout(() => {
      if (actionLockRef.current) return;
      const currentPending = pendingEnemyAttack;
      if (!currentPending || currentPending.attackerId !== pending.attackerId || currentPending.targetId !== pending.targetId) return;
      finishEnemyAttack(pending.targetId);
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [pendingEnemyAttack]);

  function finishEnemyAttack(defendedUnitId: string) {
    if (!pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    const currentBattle = battleRef.current;
    const attacker = getUnit(currentBattle, pendingEnemyAttack.attackerId);
    const realTarget = getUnit(currentBattle, pendingEnemyAttack.targetId);
    const defendedUnit = getUnit(currentBattle, defendedUnitId);

    if (!attacker || !realTarget || !defendedUnit) {
      setPendingEnemyAttack(null);
      releaseAction(token);
      return;
    }

    const guessedCorrectly = defendedUnit.id === realTarget.id;
    const directionFx = enemyFx(attacker.kind);

    /*
      Keep pendingEnemyAttack visible until the strike is fully resolved. This
      prevents the enemy effect from starting a second attack in the same slot.
    */
    playBearAttack();
    showFx(directionFx, "enemy-to-player", realTarget.id, 650);

    scheduleAction(token, 360, () => {
      const strike = resolveStrike(
        currentBattle,
        attacker.id,
        realTarget.id,
        attacker.kind === "bear-commander"
          ? 1.3
          : attacker.kind === "bear-elite"
            ? 1.18
            : 1,
        guessedCorrectly,
        true
      );

      if (guessedCorrectly && strike.blocked) {
        flashShield(realTarget.id);
        showFx("block", "self", realTarget.id, 720);
        showCombatText(realTarget.id, "BLOCK", "block");
      } else {
        flashImpact(realTarget.id);
        playHit();
        showCombatText(realTarget.id, `-${strike.damage}`, "damage");
        chargeSpiritFromDamageTaken(strike.damage);
      }

      if (strike.defeated) {
        showFx("death", "self", realTarget.id, 850);
      }

      advanceAfter(strike.state, 520, true, token);
    });
  }

  function chosenEnemy() {
    if (selectedEnemyId) {
      const selected = enemyUnits.find((unit) => unit.id === selectedEnemyId);
      if (selected) return selected;
    }

    return enemyUnits[0];
  }

  function performPepeAttack() {
    if (
      !selectedActor ||
      selectedActor.kind !== "polish-pepe" ||
      activeUnit?.team !== "player" ||
      aiBusy ||
      pendingEnemyAttack
    ) {
      return;
    }

    const target = chosenEnemy();
    if (!target) return;

    const token = beginAction();
    if (token === null) return;

    setTargetMode(null);
    playAttack();
    showFx(activePepeClass === "ranger" ? "arrow" : activePepeClass === "mage" ? "bolt" : "slash", "player-to-enemy", target.id, 620);

    scheduleAction(token, 330, () => {
      const strike = resolveStrike(
        battle,
        selectedActor.id,
        target.id,
        activePepeClass === "warrior" ? 1.04 : activePepeClass === "ranger" ? 1.05 : 1.0,
        activePepeClass !== "mage",
        true,
        activePepeClass === "mage" ? "magic" : "normal"
      );

      if (strike.blocked) {
        flashShield(target.id);
        showFx("block", "self", target.id, 700);
        showCombatText(target.id, "BLOCK", "block");
      } else {
        flashImpact(target.id);
        playHit();
        showCombatText(target.id, `-${strike.damage}`, "damage");
        chargeSpiritFromPepeHit(strike.damage);
      }

      if (strike.defeated) {
        showFx("death", "self", target.id, 850);
      }

      advanceAfter(strike.state, 500, false, token);
    });
  }

  function performPepeClassSkill() {
    if (!selectedActor || selectedActor.level < 2 || classSkillCooldown > 0) return;
    if (!selectedActor || selectedActor.kind !== "polish-pepe" || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    if (activePepeClass === "warrior") {
      setTargetMode(targetMode === "shield" ? null : "shield");
      return;
    }

    const target = chosenEnemy();
    if (!target) return;
    const token = beginAction();
    if (token === null) return;
    setTargetMode(null);

    if (activePepeClass === "ranger") {
      playAbility();
      setClassSkillCooldown(3);
      showFx("arrow", "player-to-enemy", target.id, 720);
      scheduleAction(token, 340, () => {
        const strike = resolveStrike(battle, selectedActor.id, target.id, 1.0, false, true, "piercing");
        let next = strike.state;
        if (!strike.blocked && strike.damage > 0 && !strike.defeated) {
          next = addStatus(next, target.id, { id: `ranger-bleed-${Date.now()}`, type: "bleed", turns: 2, value: 2 });
        }
        flashImpact(target.id);
        playHit();
        showCombatText(target.id, `-${strike.damage}`, "damage");
        if (!strike.defeated) showCombatText(target.id, "BLEED", "status");
        chargeSpiritFromPepeHit(strike.damage);
        if (strike.defeated) showFx("death", "self", target.id, 850);
        advanceAfter(next, 560, false, token);
      });
      return;
    }

    playAbility();
    setClassSkillCooldown(5);
    showFx("freeze", "player-to-enemy", target.id, 820);
    scheduleAction(token, 360, () => {
      let next = addStatus(battle, target.id, { id: `mage-freeze-${Date.now()}`, type: "stun", turns: 1, value: 1 });
      next = addStatus(next, target.id, { id: `mage-slow-${Date.now()}`, type: "slow", turns: 2, value: 5 + selectedActor.level });
      next = markActed(next, selectedActor.id);
      showCombatText(target.id, "FREEZE", "status");
      advanceAfter(next, 620, false, token);
    });
  }

  function performSpirit() {
    if (
      !selectedActor ||
      selectedActor.kind !== "polish-pepe" ||
      activeUnit?.team !== "player" ||
      !spiritReady ||
      selectedActor.level < 4 ||
      aiBusy
    ) {
      return;
    }

    const targets = [...enemyUnits]
      .sort((a, b) => {
        if (a.id === selectedEnemyId) return -1;
        if (b.id === selectedEnemyId) return 1;
        return a.hp - b.hp;
      })
      .slice(0, 3);

    if (targets.length === 0) return;

    const token = beginAction();
    if (token === null) return;

    setTargetMode(null);
    setSpiritPoints(0);
    playAbility();
    showFx("lightning", "player-to-enemy", targets[0]?.id, 950);

    scheduleAction(token, 480, () => {
      let next = battle;
      let defeatedAny = false;

      for (const target of targets) {
        const strike = resolveStrike(
          next,
          selectedActor.id,
          target.id,
          activePepeClass === "warrior" ? 1.40 : activePepeClass === "ranger" ? 1.35 : 1.35,
          false,
          true,
          activePepeClass === "mage" ? "magic" : activePepeClass === "ranger" ? "piercing" : "normal"
        );

        next = strike.state;
        defeatedAny = defeatedAny || strike.defeated;
        flashImpact(target.id, 620);
        playHit();
        showCombatText(target.id, `-${strike.damage}`, "damage");
      }

      if (activePepeClass === "ranger") {
        for (const target of targets) {
          const stillAlive = getUnit(next, target.id);
          if (stillAlive?.alive) {
            next = addStatus(next, target.id, {
              id: `ranger-spirit-bleed-${target.id}-${Date.now()}`,
              type: "bleed",
              turns: 2,
              value: 3,
            });
          }
        }
      }

      if (activePepeClass === "warrior" && selectedActor) {
        next = addStatus(next, selectedActor.id, { id: `warrior-spirit-shield-${Date.now()}`, type: "shield", turns: 2, value: 6 + selectedActor.level });
      }
      if (activePepeClass === "mage") {
        for (const target of targets) {
          const stillAlive = getUnit(next, target.id);
          if (stillAlive?.alive && Math.random() < 0.35) {
            next = addStatus(next, target.id, { id: `mage-spirit-stun-${target.id}-${Date.now()}`, type: "stun", turns: 1, value: 1 });
          }
        }
      }
      if (defeatedAny) {
        showFx("death", "self", undefined, 900);
      }

      advanceAfter(next, 720, false, token);
    });
  }

  function performBocianBolt() {
    if (
      !selectedActor ||
      selectedActor.kind !== "bocian" ||
      activeUnit?.team !== "player" ||
      aiBusy
    ) {
      return;
    }

    const target = chosenEnemy();
    if (!target) return;

    const token = beginAction();
    if (token === null) return;

    setTargetMode(null);
    playAbility();
    showFx("bolt", "player-to-enemy", target.id, 700);

    scheduleAction(token, 360, () => {
      const strike = resolveStrike(
        battle,
        selectedActor.id,
        target.id,
        0.92,
        true,
        true
      );

      if (strike.blocked) {
        flashShield(target.id);
        showFx("block", "self", target.id, 700);
        showCombatText(target.id, "BLOCK", "block");
      } else {
        flashImpact(target.id);
        playHit();
        showCombatText(target.id, `-${strike.damage}`, "damage");
      }

      if (strike.defeated) {
        showFx("death", "self", target.id, 850);
      }

      advanceAfter(strike.state, 500, false, token);
    });
  }

  function performShield(target: BattleUnit) {
    if (!selectedActor || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    const shieldValue = selectedActor.kind === "bocian"
      ? 11 + selectedActor.level * 3
      : 7 + selectedActor.level * 2;

    let next = addStatus(battle, target.id, {
      id: `shield-${Date.now()}`,
      type: "shield",
      turns: 2,
      value: shieldValue,
    });

    if (selectedActor.kind === "polish-pepe" && activePepeClass === "warrior") {
      next = {
        ...next,
        units: next.units.map((unit) => unit.id === selectedActor.id
          ? { ...unit, statuses: unit.statuses.filter((status) => status.type !== "bleed") }
          : unit),
      };
      setClassSkillCooldown(4);
    }
    next = markActed(next, selectedActor.id);
    setTargetMode(null);
    playAbility();
    flashShield(target.id, 900);
    showFx("shield", "self", target.id, 850);
    showCombatText(target.id, `+${shieldValue} DEF`, "status");
    advanceAfter(next, 650, false, token);
  }

  function performHeal(target: BattleUnit) {
    if (!selectedActor || selectedActor.kind !== "bocian" || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    const heal = 20 + selectedActor.level * 5;
    const healedHp = Math.min(target.maxHp, target.hp + heal);

    const next = markActed(
      {
        ...battle,
        units: battle.units.map((unit) =>
          unit.id === target.id
            ? { ...unit, hp: healedHp }
            : unit
        ),
      },
      selectedActor.id
    );

    setTargetMode(null);
    playAbility();
    showFx("heal", "self", target.id, 800);
    showCombatText(target.id, `+${Math.max(0, healedHp - target.hp)} HP`, "heal");
    advanceAfter(next, 650, false, token);
  }

  function performFreeze(target: BattleUnit) {
    if (!selectedActor || selectedActor.kind !== "bocian" || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    let next = addStatus(battle, target.id, {
      id: `freeze-stun-${Date.now()}`,
      type: "stun",
      turns: 1,
      value: 1,
    });

    next = addStatus(next, target.id, {
      id: `freeze-slow-${Date.now()}`,
      type: "slow",
      turns: 1,
      value: 4,
    });

    next = markActed(next, selectedActor.id);

    setTargetMode(null);
    playAbility();
    showFx("freeze", "player-to-enemy", target.id, 900);
    showCombatText(target.id, "FREEZE", "status");
    advanceAfter(next, 720, false, token);
  }

  function performSleep(target: BattleUnit) {
    if (!selectedActor || selectedActor.kind !== "bocian" || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    let next = addStatus(battle, target.id, {
      id: `sleep-${Date.now()}`,
      type: "stun",
      turns: 2,
      value: 2,
    });

    next = markActed(next, selectedActor.id);

    setTargetMode(null);
    playAbility();
    showFx("sleep", "player-to-enemy", target.id, 900);
    showCombatText(target.id, "SLEEP", "status");
    advanceAfter(next, 720, false, token);
  }

  function performBlessing(target: BattleUnit) {
    if (!selectedActor || selectedActor.kind !== "bocian" || activeUnit?.team !== "player" || aiBusy || pendingEnemyAttack) return;

    const token = beginAction();
    if (token === null) return;

    const attackBonus = 7 + selectedActor.level * 2;

    let next = addStatus(battle, target.id, {
      id: `blessing-${Date.now()}`,
      type: "attack-up",
      turns: 2,
      value: attackBonus,
    });

    next = markActed(next, selectedActor.id);

    setTargetMode(null);
    playAbility();
    showFx("blessing", "self", target.id, 850);
    showCombatText(target.id, `+${attackBonus} ATK`, "status");
    advanceAfter(next, 680, false, token);
  }

  function handlePlayerUnitClick(unit: BattleUnit) {
    if (!activeUnit || activeUnit.team !== "player" || aiBusy || pendingEnemyAttack) return;

    if (!targetMode) {
      if (!unit.actedThisRound) {
        setSelectedActorId(unit.id);
      }
      return;
    }

    if (targetMode === "shield") {
      performShield(unit);
      return;
    }

    if (targetMode === "heal") {
      performHeal(unit);
      return;
    }

    if (targetMode === "blessing") {
      performBlessing(unit);
    }
  }

  function handleEnemyUnitClick(unit: BattleUnit) {
    if (!activeUnit || activeUnit.team !== "player" || aiBusy || pendingEnemyAttack) return;

    setSelectedEnemyId(unit.id);

    if (targetMode === "freeze") {
      performFreeze(unit);
      return;
    }

    if (targetMode === "sleep") {
      performSleep(unit);
    }
  }

  function hpPercent(unit: BattleUnit) {
    return Math.max(0, Math.round((unit.hp / unit.maxHp) * 100));
  }

  function playerShieldVisible(unit: BattleUnit) {
    return (
      shieldFlashId === unit.id ||
      unit.statuses.some((status) => status.type === "shield" && status.turns > 0)
    );
  }

  const targetPrompt = (() => {
    if (activeUnit?.team === "player" && !targetMode) return "TWOJA FAZA — KAŻDY BOHATER MA 1 AKCJĘ W TEJ RUNDZIE";
    if (targetMode === "shield") return "WYBIERZ POSTAĆ DO OCHRONY";
    if (targetMode === "heal") return "WYBIERZ POSTAĆ DO ULECZENIA";
    if (targetMode === "blessing") return "WYBIERZ POSTAĆ DO WZMOCNIENIA";
    if (targetMode === "freeze") return "WYBIERZ PRZECIWNIKA DO ZAMROŻENIA";
    if (targetMode === "sleep") return "WYBIERZ PRZECIWNIKA DO UŚPIENIA";
    return null;
  })();

  return (
    <section
      className={`tactical-battle ${
        fx?.type === "lightning" || fx?.type === "fire" || fx?.type === "death"
          ? "tactical-battle--shake"
          : ""
      }`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(2,5,9,.12), rgba(2,5,9,.42)), url(${background})`,
      }}
    >
      <div className="tactical-battle__backdrop" />

      {fx && (
        <div
          key={fx.id}
          className={`tactical-battle__fx tactical-battle__fx--${fx.type} tactical-battle__fx--${fx.direction}`}
          aria-hidden="true"
        >
          <span />
        </div>
      )}

      <header className="tactical-battle__topbar">
        <div className="tactical-battle__battle-title">
          <span>PLPE ARENA</span>
          <strong>{title}</strong>
        </div>

        <div className="tactical-battle__round">
          <small>RUNDA</small>
          <strong>{battle.round}</strong>
        </div>

        <div className="tactical-battle__turn">
          <small>RUCH</small>
          <strong>
            {pendingEnemyAttack
              ? "OBRONA"
              : activeUnit?.team === "player"
                ? `WYBÓR — ${selectedActor?.name ?? "BOHATER"}`
                : activeUnit
                  ? `WRÓG — ${activeUnit.name}`
                  : "—"}
          </strong>
        </div>

        {onRetreat && !battle.winner && (
          <button
            type="button"
            className="tactical-battle__retreat"
            onClick={onRetreat}
            disabled={Boolean(pendingEnemyAttack) || aiBusy}
          >
            WYCOFAJ SIĘ
          </button>
        )}
      </header>

      <div className="tactical-battle__initiative" aria-label="Kolejność ruchu">
        {battle.turnOrder.map((unitId, index) => {
          const unit = getUnit(battle, unitId);
          if (!unit?.alive) return null;

          return (
            <div
              key={unitId}
              className={`tactical-battle__initiative-unit ${unit.team} ${
                unit.id === battle.activeUnitId ? "active" : ""
              }`}
            >
              <span>{index + 1}</span>
              <b>{unitEmoji(unit.kind)}</b>
            </div>
          );
        })}
      </div>

      {targetPrompt && (
        <div className="tactical-battle__target-prompt">{targetPrompt}</div>
      )}

      <div className="tactical-battle__field">
        <div className="tactical-battle__formation tactical-battle__formation--player">
          {playerUnits.map((unit) => (
            <button
              key={unit.id}
              type="button"
              className={`tactical-battle__fighter tactical-battle__fighter--player ${
                impactId === unit.id ? "impact" : ""
              } ${selectedActor?.id === unit.id && activeUnit?.team === "player" ? "selected-actor" : ""} ${
                unit.actedThisRound ? "acted" : ""
              } ${targetMode && ["shield", "heal", "blessing"].includes(targetMode) ? "targetable" : ""}`}
              onClick={() => handlePlayerUnitClick(unit)}
            >
              <div className="tactical-battle__overhead">
                <div className="tactical-battle__name-row">
                  <strong>{unit.name}</strong>
                  <small>LV.{unit.level}</small>
                </div>
                <div className="tactical-battle__hpbar">
                  <i style={{ width: `${hpPercent(unit)}%` }} />
                </div>
                <div className="tactical-battle__mini-row">
                  <span>{unit.hp}/{unit.maxHp} HP</span>
                  <span>⚔{effectiveAttack(unit)} 🛡{effectiveDefenseForBlock(unit)}</span>
                </div>
                {unit.statuses.length > 0 && (
                  <div className="tactical-battle__statuses">
                    {unit.statuses.map((status) => (
                      <span key={status.id}>{statusIcon(status)}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="tactical-battle__body">
                <UnitPortrait unit={unit} pepeClass={activePepeClass} />
                {combatTexts.filter((entry) => entry.targetId === unit.id).map((entry) => (
                  <span key={entry.id} className={`tactical-battle__combat-text tactical-battle__combat-text--${entry.kind}`}>{entry.text}</span>
                ))}
                <i className="tactical-battle__ground-shadow" />
                {playerShieldVisible(unit) && (
                  <span className="tactical-battle__shield-visual" aria-hidden="true">
                    <IconShield />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="tactical-battle__versus">VS</div>

        <div className="tactical-battle__formation tactical-battle__formation--enemy">
          {enemyUnits.map((unit) => (
            <button
              key={unit.id}
              type="button"
              className={`tactical-battle__fighter tactical-battle__fighter--enemy ${
                impactId === unit.id ? "impact" : ""
              } ${selectedEnemyId === unit.id ? "selected-enemy" : ""} ${
                targetMode && ["freeze", "sleep"].includes(targetMode) ? "targetable" : ""
              }`}
              onClick={() => handleEnemyUnitClick(unit)}
            >
              <div className="tactical-battle__overhead">
                <div className="tactical-battle__name-row">
                  <strong>{unit.name}</strong>
                  <small>LV.{unit.level}</small>
                </div>
                <div className="tactical-battle__hpbar tactical-battle__hpbar--enemy">
                  <i style={{ width: `${hpPercent(unit)}%` }} />
                </div>
                <div className="tactical-battle__mini-row">
                  <span>{unit.hp}/{unit.maxHp} HP</span>
                  <span>⚔{effectiveAttack(unit)} 🛡{effectiveDefenseForBlock(unit)}</span>
                </div>
                {unit.statuses.length > 0 && (
                  <div className="tactical-battle__statuses">
                    {unit.statuses.map((status) => (
                      <span key={status.id}>{statusIcon(status)}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="tactical-battle__body">
                <UnitPortrait unit={unit} pepeClass={activePepeClass} />
                {combatTexts.filter((entry) => entry.targetId === unit.id).map((entry) => (
                  <span key={entry.id} className={`tactical-battle__combat-text tactical-battle__combat-text--${entry.kind}`}>{entry.text}</span>
                ))}
                <i className="tactical-battle__ground-shadow" />
                {shieldFlashId === unit.id && (
                  <span className="tactical-battle__shield-visual" aria-hidden="true">
                    <IconShield />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {pendingEnemyAttack ? (
        <footer className="tactical-battle__reaction">
          <div className="tactical-battle__reaction-shield" aria-hidden="true">
            <IconShield />
          </div>

          <div className="tactical-battle__reaction-targets">
            {playerUnits.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => finishEnemyAttack(unit.id)}
                disabled={aiBusy}
                title={`Broń ${unit.name}`}
                aria-label={`Broń ${unit.name}`}
              >
                <UnitPortrait unit={unit} pepeClass={activePepeClass} />
                <span>{unit.name}</span>
              </button>
            ))}
          </div>
        </footer>
      ) : !battle.winner && activeUnit?.team === "enemy" ? (
        <div className="tactical-battle__enemy-phase">
          <span className="tactical-battle__enemy-phase-pulse" />
        </div>
      ) : !battle.winner && activeUnit?.team === "player" ? (
        <footer className="tactical-battle__action-dock">
          <div className="tactical-battle__active-hero">
            <span>WYBIERZ BOHATERA: {selectedActor?.kind === "polish-pepe" ? `PEPE · ${pepeClassDefinition.namePl.toUpperCase()}` : "BOCIAN"}</span>
          </div>

          {selectedActor?.kind === "polish-pepe" ? (
            <>
              <button
                type="button"
                className="tactical-battle__action-button"
                onClick={performPepeAttack}
                disabled={aiBusy || enemyUnits.length === 0}
                title={activePepeClass === "warrior" ? "Atak mieczem" : activePepeClass === "ranger" ? "Strzał z kuszy" : "Pocisk Arkanów"}
                aria-label={activePepeClass === "warrior" ? "Atak mieczem" : activePepeClass === "ranger" ? "Strzał z kuszy" : "Pocisk Arkanów"}
              >
                <IconSword />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "shield" ? "active" : ""}`}
                onClick={performPepeClassSkill}
                disabled={aiBusy || pepeLevel < 2 || classSkillCooldown > 0 || (activePepeClass !== "warrior" && enemyUnits.length === 0)}
                title={pepeLevel < 2 ? "Umiejętność odblokowuje się na LV 2" : classSkillCooldown > 0 ? `Odnowienie umiejętności: ${classSkillCooldown} r.` : activePepeClass === "warrior" ? "Mur Tarczy — wybierz sojusznika" : activePepeClass === "ranger" ? "Przebijający Bełt — bez możliwości bloku" : "Runiczny Mróz — zamraża przeciwnika"}
                aria-label={activePepeClass === "warrior" ? "Mur Tarczy" : activePepeClass === "ranger" ? "Przebijający Bełt" : "Runiczny Mróz"}
              >
                {activePepeClass === "warrior" ? <IconShield /> : activePepeClass === "ranger" ? <span className="tactical-battle__class-glyph">🏹</span> : <IconSnow />}
                {classSkillCooldown > 0 && <small className="tactical-battle__cooldown">{classSkillCooldown}</small>}
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button tactical-battle__spirit-button ${spiritReady ? "ready" : ""}`}
                onClick={performSpirit}
                disabled={aiBusy || pepeLevel < 4 || !spiritReady}
                title={pepeLevel < 4 ? "PLPE Spirit odblokowuje się na LV 4" : spiritReady ? `${activePepeClass === "warrior" ? "Polska Furia" : activePepeClass === "ranger" ? "Salwa PLPE" : "Burza PLPE"} gotowa` : `PLPE Spirit ${spiritPoints}/${SPIRIT_MAX}`}
                aria-label={spiritReady ? "PLPE Spirit gotowy" : `PLPE Spirit ${spiritPoints}/${SPIRIT_MAX}`}
              >
                <svg className="tactical-battle__charge-ring" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="43" />
                  <circle
                    className="tactical-battle__charge-ring-value"
                    cx="50"
                    cy="50"
                    r="43"
                    style={{
                      strokeDasharray: 270,
                      strokeDashoffset: 270 - (270 * spiritPercent) / 100,
                    }}
                  />
                </svg>
                <IconLightning />
                <span className="tactical-battle__charge-number">{spiritPercent}%</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="tactical-battle__action-button"
                onClick={performBocianBolt}
                disabled={aiBusy || enemyUnits.length === 0}
                title="Bociani piorun"
                aria-label="Bociani piorun"
              >
                <IconLightning />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "shield" ? "active" : ""}`}
                onClick={() => setTargetMode(targetMode === "shield" ? null : "shield")}
                disabled={aiBusy}
                title="Tarcza — wybierz kogo chronić"
                aria-label="Tarcza — wybierz kogo chronić"
              >
                <IconShield />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "heal" ? "active" : ""}`}
                onClick={() => setTargetMode(targetMode === "heal" ? null : "heal")}
                disabled={aiBusy}
                title="Leczenie — wybierz cel"
                aria-label="Leczenie — wybierz cel"
              >
                <IconMedkit />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "freeze" ? "active" : ""}`}
                onClick={() => setTargetMode(targetMode === "freeze" ? null : "freeze")}
                disabled={aiBusy}
                title="Zamrożenie — wybierz przeciwnika"
                aria-label="Zamrożenie — wybierz przeciwnika"
              >
                <IconSnow />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "sleep" ? "active" : ""}`}
                onClick={() => setTargetMode(targetMode === "sleep" ? null : "sleep")}
                disabled={aiBusy}
                title="Uśpienie — wybierz przeciwnika"
                aria-label="Uśpienie — wybierz przeciwnika"
              >
                <IconSleep />
              </button>

              <button
                type="button"
                className={`tactical-battle__action-button ${targetMode === "blessing" ? "active" : ""}`}
                onClick={() => setTargetMode(targetMode === "blessing" ? null : "blessing")}
                disabled={aiBusy}
                title="Błogosławieństwo — wybierz sojusznika"
                aria-label="Błogosławieństwo — wybierz sojusznika"
              >
                <IconBlessing />
              </button>
            </>
          )}
        </footer>
      ) : null}

      {battle.winner && (
        <div className={`tactical-battle__result tactical-battle__result--${battle.winner}`}>
          <span>{battle.winner === "player" ? "ZWYCIĘSTWO" : "PORAŻKA"}</span>
          <h2>
            {battle.winner === "player"
              ? "Pole bitwy należy do Ciebie"
              : "Drużyna została pokonana"}
          </h2>

          {battle.winner === "player" ? (
            <>
              <div className="tactical-battle__rewards">
                {rewardText.map((reward) => (
                  <b key={reward}>{reward}</b>
                ))}
              </div>
              <button type="button" onClick={onVictory}>ODBIERZ NAGRODY</button>
            </>
          ) : (
            <button type="button" onClick={onDefeat}>WRÓĆ DO MAPY</button>
          )}
        </div>
      )}
    </section>
  );
}
