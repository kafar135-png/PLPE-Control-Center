const API = import.meta.env.VITE_API_URL ?? "";

const TOKEN_KEY = "plpe_game_auth_token";

export type GamePresenceStatus = "offline" | "online" | "in_battle";

export type GameSpecialization = "warrior" | "ranger" | "mage";

export interface GamePlayerProfile {
  walletAddress: string;
  nickname: string | null;
  specialization: GameSpecialization | null;
  level: number;
  xp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  rating: number;
  highestRating: number;
  wins: number;
  losses: number;
  pvpBattles: number;
  winRate: number;
  currentWinStreak: number;
  bestWinStreak: number;
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
  blocks: number;
  spiritUses: number;
  presenceStatus: GamePresenceStatus;
  lastSeen: string | null;
  createdAt: string | null;
  rank?: number;
}

export interface GameChallenge {
  id: string;
  challengerWallet: string;
  challengedWallet: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  createdAt: string;
  expiresAt: string;
  respondedAt: string | null;
  matchId: string | null;
  challenger?: GamePlayerProfile | null;
  challenged?: GamePlayerProfile | null;
}

export interface GamePvpCombatant {
  wallet: string;
  nickname: string;
  specialization: GameSpecialization;
  level: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  spirit: number;
  shield: number;
  defend: boolean;
  stunTurns: number;
  bleedTurns: number;
  bleedDamage: number;
  skillCooldown: number;
}

export interface GamePvpBattleState {
  round: number;
  turnWallet: string;
  players: Record<string, GamePvpCombatant>;
  log: Array<{ at: string; text: string }>;
}

export interface GameMatchLobby {
  id: string;
  status: string;
  playerAWallet: string;
  playerBWallet: string;
  winnerWallet?: string | null;
  loserWallet?: string | null;
  ratingDelta?: number;
  turnVersion?: number;
  battleState?: GamePvpBattleState | null;
  createdAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

export function shortWallet(walletAddress: string) {
  if (walletAddress.length < 12) return walletAddress;
  return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
}

export function getGameAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveGameAuth(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearGameAuth() {
  localStorage.removeItem(TOKEN_KEY);
}

async function api<T>(
  path: string,
  init: RequestInit = {},
  authenticated = false
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getGameAuthToken();

    if (!token) {
      throw new Error("Game login required");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, {
    ...init,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    if (response.status === 401) {
      clearGameAuth();
    }

    throw new Error(data.error || data.message || `Game API error ${response.status}`);
  }

  return data;
}

export async function registerGameAccount(
  email: string,
  nickname: string,
  password: string,
  walletAddress: string
) {
  const result = await api<{
    token: string;
    expiresAt: string;
    player: GamePlayerProfile;
  }>("/api/game/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, nickname, password, walletAddress }),
  });

  saveGameAuth(result.token);

  return result;
}

export async function loginGameAccount(login: string, password: string) {
  const result = await api<{
    token: string;
    expiresAt: string;
    player: GamePlayerProfile;
  }>("/api/game/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password }),
  });

  saveGameAuth(result.token);

  return result;
}

export async function logoutGame() {
  try {
    await api<{ ok: boolean }>(
      "/api/game/auth/logout",
      { method: "POST" },
      true
    );
  } finally {
    clearGameAuth();
  }
}

export async function getGameProfile() {
  const data = await api<{ player: GamePlayerProfile }>(
    "/api/game/profile",
    {},
    true
  );

  return data.player;
}

export async function updateGameSpecialization(specialization: GameSpecialization) {
  const data = await api<{ player: GamePlayerProfile }>(
    "/api/game/profile/specialization",
    { method: "PATCH", body: JSON.stringify({ specialization }) },
    true
  );
  return data.player;
}

export async function syncGameProgression(progress: { level: number; xp: number; hp: number; attack: number; defense: number; speed: number }) {
  const data = await api<{ player: GamePlayerProfile }>(
    "/api/game/profile/progression",
    { method: "PATCH", body: JSON.stringify(progress) },
    true
  );
  return data.player;
}

export async function updateGameNickname(nickname: string) {
  const data = await api<{ player: GamePlayerProfile }>(
    "/api/game/profile",
    {
      method: "PATCH",
      body: JSON.stringify({ nickname }),
    },
    true
  );

  return data.player;
}

export async function sendGamePresenceHeartbeat(
  status: Exclude<GamePresenceStatus, "offline"> = "online"
) {
  return api<{
    online: number;
    player: GamePlayerProfile;
  }>(
    "/api/game/presence/heartbeat",
    {
      method: "POST",
      body: JSON.stringify({ status }),
    },
    true
  );
}

export async function getOnlineGamePlayers() {
  return api<{
    online: number;
    players: GamePlayerProfile[];
  }>("/api/game/players/online", {}, true);
}

export async function getGameRanking(limit = 50) {
  const data = await api<{ players: GamePlayerProfile[] }>(
    `/api/game/ranking?limit=${encodeURIComponent(String(limit))}`
  );

  return data.players;
}

export async function sendGameChallenge(challengedWallet: string) {
  const data = await api<{ challenge: GameChallenge }>(
    "/api/game/challenges",
    {
      method: "POST",
      body: JSON.stringify({ challengedWallet }),
    },
    true
  );

  return data.challenge;
}

export async function getGameChallenges() {
  return api<{
    incoming: GameChallenge[];
    outgoing: GameChallenge[];
  }>("/api/game/challenges", {}, true);
}

export async function respondToGameChallenge(
  challengeId: string,
  action: "accept" | "decline"
) {
  return api<{
    challenge: GameChallenge;
    match: GameMatchLobby | null;
  }>(
    `/api/game/challenges/${encodeURIComponent(challengeId)}/respond`,
    {
      method: "POST",
      body: JSON.stringify({ action }),
    },
    true
  );
}


export async function getGameMatch(matchId: string) {
  const data = await api<{ match: GameMatchLobby }>(`/api/game/matches/${encodeURIComponent(matchId)}`, {}, true);
  return data.match;
}

export async function submitGameMatchAction(matchId: string, action: "attack" | "skill" | "spirit" | "defend", expectedVersion: number) {
  const data = await api<{ match: GameMatchLobby }>(`/api/game/matches/${encodeURIComponent(matchId)}/action`, { method: "POST", body: JSON.stringify({ type: action, expectedVersion }) }, true);
  return data.match;
}

export async function getActiveGameMatch() {
  const data = await api<{ match: GameMatchLobby | null }>(
    "/api/game/matches/active",
    {},
    true
  );
  return data.match;
}

export async function getGameMatchHistory(limit = 20) {
  const data = await api<{ matches: GameMatchLobby[] }>(`/api/game/matches/history?limit=${encodeURIComponent(String(limit))}`, {}, true);
  return data.matches;
}
