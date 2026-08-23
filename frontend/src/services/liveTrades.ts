export async function getLiveTrades() {
  const response = await fetch(
    "http://localhost:3001/api/live-trades"
  );

  if (!response.ok) {
    throw new Error("Live Trades API Error");
  }

  return response.json();
}