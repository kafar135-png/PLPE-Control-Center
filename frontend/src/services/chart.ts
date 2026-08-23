export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001";

export async function getChartData(
  timeframe = "1D"
): Promise<Candle[]> {
  const response = await fetch(
    `${API}/api/chart?tf=${timeframe}`
  );

  if (!response.ok) {
    throw new Error("Chart API error");
  }

  const json = await response.json();

  const list =
    json?.data?.attributes?.ohlcv_list ?? [];

  return list
    .map((c: any) => ({
      time: Number(c[0]),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
    }))
    .sort(
      (a: Candle, b: Candle) =>
        a.time - b.time
    );
}