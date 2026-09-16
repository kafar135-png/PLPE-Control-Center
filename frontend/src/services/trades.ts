const API = import.meta.env.VITE_API_URL ?? "";

export async function getTrades() {
  const response = await fetch(
    `${API}/api/trades`
  );

  if (!response.ok) {
    throw new Error("Trades API error");
  }

  return response.json();
}