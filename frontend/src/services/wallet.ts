const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001";

export async function getWalletHistory(
  address: string
) {
  const response = await fetch(
    `${API}/api/wallet/${address}`
  );

  if (!response.ok) {
    throw new Error(
      `Wallet API error (${response.status})`
    );
  }

  const json = await response.json();

  return {
    status: json.status ?? "0",
    message: json.message ?? "",
    result: Array.isArray(json.result)
      ? json.result
      : [],
    meta: json.meta ?? null,
  };
}