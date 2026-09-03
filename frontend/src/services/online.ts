const API = import.meta.env.VITE_API_URL ?? "";

function getSessionId(): string {
  const key = "plpe_online_session";

  let sessionId = localStorage.getItem(key);

  if (!sessionId) {
    sessionId =
      crypto.randomUUID();

    localStorage.setItem(
      key,
      sessionId
    );
  }

  return sessionId;
}

export async function sendOnlineHeartbeat(): Promise<number> {
  const response = await fetch(
    `${API}/api/online/heartbeat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: getSessionId(),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Online API error"
    );
  }

  const data = await response.json();

  return Number(data.online ?? 0);
}