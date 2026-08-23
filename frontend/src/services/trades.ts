export async function getTrades() {
  const response = await fetch(
    "http://localhost:3001/api/trades"
  );

  if (!response.ok) {
    throw new Error("Trades API error");
  }

  return response.json();
}