const API =
  import.meta.env.VITE_API_URL ?? "";

export interface ChallengeParticipant {
  rank: number;
  wallet: string;

  volume: number;
  buyVolume?: number;
  sellVolume?: number;

  trades: number;
  buys: number;
  sells: number;

  qualifyingBuys?: number;
  entries: number;

  qualified: boolean;

  entryDetails?: {
    hash: string;
    type: string;
    volume: number;
    source?: string;
    entry: number;
    entriesTotal: number;
  }[];
}

export interface ChallengeData {
  status: string;

  phase: {
    id: string;
    name: string;
    start: string;
    end: string;
  };

  rules?: {
    minimumVolume: number;
    minimumBuyForEntry?: number;
    pair: string;
    maximumEntries: number;
    qualification?: string;
    entries?: string;
  };

  rewardPool?: {
    total: number;
    currency: string;
    payoutCurrency: string;
    prizes: {
      place: number;
      amount: number;
    }[];
  };

  qualification?: {
    minimumVolume: number;
    pair: string;
    currency: string;
    maximumEntries: number;
  };

  entries?: {
    min: number;
    max: number | null;
    entries: number;
  }[];

  stats: {
    plpeTransfers: number;
    wethTransfers?: number | string;

    verifiedTrades: number;
    verifiedBuys?: number;
    verifiedSells?: number;

    totalEntries?: number;
    totalVolume?: number;

    qualifiedWallets: number;
  };

  leaderboard: ChallengeParticipant[];

  cached?: boolean;
  generatedAt?: number;
}

export async function getChallengeLeaderboard(): Promise<ChallengeData> {
  const response =
    await fetch(
      `${API}/api/challenge`,
      {
        cache: "no-store",
      }
    );

  if (!response.ok) {
    throw new Error(
      `Challenge API error (${response.status})`
    );
  }

  const json =
    await response.json();

  if (
    json?.status !== "1"
  ) {
    throw new Error(
      json?.error ||
      "Challenge API error"
    );
  }

  return json as ChallengeData;
}