const API =
  import.meta.env.VITE_API_URL ??
  "https://plpe-control-center.vercel.app";

export interface ChallengeParticipant {
  rank: number;
  wallet: string;
  volume: number;
  trades: number;
  buys: number;
  sells: number;
  entries: number;
  qualified: boolean;
}

export interface ChallengeData {
  status: string;

  phase: {
    id: string;
    name: string;
    start: string;
    end: string;
  };

  rewardPool: {
    total: number;
    currency: string;
    payoutCurrency: string;
    prizes: {
      place: number;
      amount: number;
    }[];
  };

  qualification: {
    minimumVolume: number;
    pair: string;
    currency: string;
    maximumEntries: number;
  };

  entries: {
    min: number;
    max: number | null;
    entries: number;
  }[];

  stats: {
    plpeTransfers: number;
    wethTransfers: number;
    verifiedTrades: number;
    qualifiedWallets: number;
  };

  leaderboard: ChallengeParticipant[];

  cached?: boolean;
  generatedAt?: number;
}

export async function getChallengeLeaderboard(): Promise<ChallengeData> {
  const response = await fetch(
    `${API}/api/challenge`
  );

  if (!response.ok) {
    throw new Error(
      `Challenge API error (${response.status})`
    );
  }

  const json = await response.json();

  if (json.status !== "1") {
    throw new Error(
      json.error ||
        "Challenge API error"
    );
  }

  return json;
}