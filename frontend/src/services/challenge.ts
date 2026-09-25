const API = import.meta.env.VITE_API_URL ?? "";

export interface ChallengeParticipant {
  rank: number; holderRank?: number; wallet: string;
  volume: number; buyVolume?: number; sellVolume?: number; netBuyVolume?: number;
  trades: number; buys: number; sells: number; qualifyingBuys?: number; entries: number; qualified: boolean;
  buyPlpe?: number; sellPlpe?: number; retainedChallengePlpe?: number; holdPercent?: number;
  startingPlpeBalance?: number; currentPlpeBalance?: number;
}
export interface ChallengeData {
  status: string;
  phase: { id: string; name: string; status?: string; start: string; end: string; displayEnd?: string };
  rules?: { minimumVolume: number; minimumBuyForEntry?: number; pair: string; maximumEntries: number; ranking?: string; registrationRequired?: boolean; holderMinimumEntries?: number | null };
  rewardPool?: any;
  stats: { plpeTransfers: number; verifiedTrades: number; verifiedBuys?: number; verifiedSells?: number; totalEntries?: number; totalVolume?: number; qualifiedWallets: number };
  leaderboard: ChallengeParticipant[];
  holderLeaderboard?: ChallengeParticipant[];
}
async function jsonFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${API}${path}`, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json?.status === "0") throw new Error(json?.error || `Challenge API error (${response.status})`);
  return json;
}
export async function getChallengeLeaderboard(): Promise<ChallengeData> { return jsonFetch("/api/challenge"); }
export async function getChallengeRegistrationStatus(wallet: string) { return jsonFetch(`/api/challenge/registration/status/${wallet}`); }
export async function getChallengeRegistrationMessage(wallet: string) { return jsonFetch("/api/challenge/registration/nonce", { method: "POST", body: JSON.stringify({ wallet }) }); }
export async function submitChallengeRegistration(wallet: string, signature: string) { return jsonFetch("/api/challenge/registration/register", { method: "POST", body: JSON.stringify({ wallet, signature }) }); }
