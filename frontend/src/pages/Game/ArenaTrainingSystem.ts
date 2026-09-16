export interface ArenaTrainingOpponent {
  id: string;
  name: string;
  subtitle: string;
  enemyGroupId: string;
  enemyLevel: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  xpReward: number;
  crownsReward: number;
  relicChance: number;
}

export interface ArenaTrainingState {
  lastWins: Record<string, number>;
  totalWins: number;
}

export const ARENA_TRAINING_COOLDOWN_MS = 12 * 60 * 60 * 1000;
const KEY = "plpe-arena-training-v1";

export const ARENA_TRAINING_OPPONENTS: ArenaTrainingOpponent[] = [
  { id: "training-scout", name: "Borys — Bear Scout", subtitle: "Szybki trening techniki i bloków.", enemyGroupId: "bear-scout", enemyLevel: 1, difficulty: "EASY", xpReward: 60, crownsReward: 35, relicChance: 0.12 },
  { id: "training-elite", name: "Granit — Bear Elite", subtitle: "Cięższy sparing. Więcej obrony i kontroli pola.", enemyGroupId: "bear-elite", enemyLevel: 2, difficulty: "MEDIUM", xpReward: 120, crownsReward: 70, relicChance: 0.28 },
  { id: "training-command", name: "Ursus — Bear Commander", subtitle: "Najmocniejszy trening. Walka jak przed ofensywą.", enemyGroupId: "bear-command-group", enemyLevel: 3, difficulty: "HARD", xpReward: 220, crownsReward: 130, relicChance: 0.48 },
];

export function loadArenaTrainingState(): ArenaTrainingState {
  const fallback: ArenaTrainingState = { lastWins: {}, totalWins: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}

export function saveArenaTrainingState(state: ArenaTrainingState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function arenaTrainingRemainingMs(state: ArenaTrainingState, opponentId: string, now = Date.now()) {
  const last = state.lastWins[opponentId] ?? 0;
  return Math.max(0, last + ARENA_TRAINING_COOLDOWN_MS - now);
}

export function arenaTrainingAvailable(state: ArenaTrainingState, opponentId: string, now = Date.now()) {
  return arenaTrainingRemainingMs(state, opponentId, now) <= 0;
}

export function markArenaTrainingWin(state: ArenaTrainingState, opponentId: string, now = Date.now()) {
  return saveArenaTrainingState({ lastWins: { ...state.lastWins, [opponentId]: now }, totalWins: state.totalWins + 1 });
}

export function formatTrainingCooldown(ms: number) {
  if (ms <= 0) return "GOTOWE";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
