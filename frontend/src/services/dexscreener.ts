const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001";

export interface MarketData {
  price: number;
  liquidity: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}

export async function getMarketData(): Promise<MarketData> {
  const response = await fetch(
    `${API}/api/market?t=${Date.now()}`,
    {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Backend API error (${response.status})`
    );
  }

  const json = await response.json();

  return {
    price: Number(json.price ?? 0),
    liquidity: Number(json.liquidity ?? 0),
    marketCap: Number(json.marketCap ?? 0),
    volume24h: Number(json.volume24h ?? 0),
    priceChange24h: Number(
      json.priceChange24h ?? 0
    ),
  };
}