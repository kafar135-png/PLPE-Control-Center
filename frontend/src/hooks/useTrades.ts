import { useEffect, useState } from "react";
import { getTrades } from "../services/trades";

export function useTrades() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrades();
        setTrades(data);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    load();

    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);
  }, []);

  return {
    trades,
    loading,
  };
}