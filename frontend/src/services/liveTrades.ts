export async function getLiveTrades() {
  const response = await fetch(
  `${import.meta.env.VITE_API_URL ?? "https://plpe-control-center.vercel.app"}/api/live-trades`
);

  if (!response.ok) {
    throw new Error("Live Trades API Error");
  }

  return response.json();
}