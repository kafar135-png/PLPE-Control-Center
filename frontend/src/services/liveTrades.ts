const API = import.meta.env.VITE_API_URL ?? "";

export async function getLiveTrades() {
  const response = await fetch(
    `${API}/api/live-trades`
  );

  if (!response.ok) {
    throw new Error("Live Trades API Error");
  }

  return response.json();
}