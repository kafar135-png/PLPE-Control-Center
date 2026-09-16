export interface CharacterProgressState {
  pepeLevel: number;
  pepeXp: number;
  bocianLevel: number;
  bocianXp: number;
  trainingPoints: number;
}

const KEY = "plpe-character-progression-v1";

export function xpRequired(level: number) {
  return Math.round(100 + Math.pow(Math.max(1, level), 1.45) * 72);
}

export function loadCharacterProgress(): CharacterProgressState {
  const fallback: CharacterProgressState = { pepeLevel: 1, pepeXp: 0, bocianLevel: 1, bocianXp: 0, trainingPoints: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch { return fallback; }
}

export function saveCharacterProgress(state: CharacterProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

function levelOne(level: number, xp: number, gain: number) {
  let nextLevel = level;
  let nextXp = xp + Math.max(0, gain);
  while (nextXp >= xpRequired(nextLevel)) {
    nextXp -= xpRequired(nextLevel);
    nextLevel += 1;
  }
  return { level: nextLevel, xp: nextXp };
}

export function addTrainingXp(state: CharacterProgressState, pepeXpGain: number, bocianXpGain: number) {
  const pepe = levelOne(state.pepeLevel, state.pepeXp, pepeXpGain);
  const bocian = levelOne(state.bocianLevel, state.bocianXp, bocianXpGain);
  return saveCharacterProgress({
    ...state,
    pepeLevel: pepe.level,
    pepeXp: pepe.xp,
    bocianLevel: bocian.level,
    bocianXp: bocian.xp,
    trainingPoints: state.trainingPoints + Math.max(1, Math.floor((pepeXpGain + bocianXpGain) / 120)),
  });
}
