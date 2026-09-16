const API = import.meta.env.VITE_API_URL || "";

export interface LiveTrade {
  hash: string;
  from: string;
  to: string | null;
  type: "BUY" | "SELL" | "TRANSFER";
  amount: number;
  price: number;
  volumeUsd: number;
  timestamp: number;
  verified: boolean;
}

interface LiveTradesResponse {
  value?: LiveTrade[];
  Count?: number;
}

export async function getLiveTrades(): Promise<LiveTrade[]> {
  const response = await fetch(`${API}/api/live-trades`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Live Trades API Error: ${response.status}`);
  }

  const json: LiveTradesResponse | LiveTrade[] =
    await response.json();

  // Backend może zwracać:
  // { value: [...], Count: 15 }
  if (Array.isArray(json)) {
    return json;
  }

  if (Array.isArray(json.value)) {
    return json.value;
  }

  return [];
}