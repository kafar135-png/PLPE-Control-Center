import { useEffect, useState } from "react";
import { getMarketData } from "../services/dexscreener";

export interface MarketData {
  price: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  marketCap: number;
}

let cachedData: MarketData | null = null;
let lastFetch = 0;

const CACHE_TIME = 30000;

export function useMarketData() {
  const [data, setData] = useState<MarketData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);

  async function load(force = false) {
    try {
      const now = Date.now();

      if (
        !force &&
        cachedData &&
        now - lastFetch < CACHE_TIME
      ) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      if (!cachedData) {
        setLoading(true);
      }

      const result = await getMarketData();

      cachedData = result;
      lastFetch = Date.now();

      setData(result);
    } catch (err) {
      console.error("MarketData:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = window.setInterval(() => {
      load(true);
    }, CACHE_TIME);

    const onFocus = () => {
      load(true);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "focus",
        onFocus
      );
      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );
    };
  }, []);

  return {
    data,
    loading,
    refresh: () => load(true),
  };
}