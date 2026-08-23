export async function getTrades() {
  const response = await fetch(
  `${import.meta.env.VITE_API_URL ?? "https://plpe-control-center.vercel.app"}/api/trades`
);

  if (!response.ok) {
    throw new Error("Trades API error");
  }

  return response.json();
}