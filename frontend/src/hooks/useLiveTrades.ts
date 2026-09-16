import { useCallback, useEffect, useState } from "react";
import {
  getLiveTrades,
  type LiveTrade,
} from "../services/liveTrades";

export function useLiveTrades() {
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);

      const data = await getLiveTrades();

      setTrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Live Trades:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Live Trades API Error"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    const interval = window.setInterval(() => {
      load();
    }, 10000);

    return () => {
      window.clearInterval(interval);
    };
  }, [load]);

  return {
    trades,
    loading,
    error,
    reload: load,
  };
}