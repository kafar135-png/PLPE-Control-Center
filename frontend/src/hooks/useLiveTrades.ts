import { useEffect, useState } from "react";
import { getLiveTrades } from "../services/liveTrades";

export function useLiveTrades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await getLiveTrades();
      setTrades(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();

    const interval = setInterval(load, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    trades,
    loading,
  };
}