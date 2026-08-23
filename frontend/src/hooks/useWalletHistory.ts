import { useEffect, useMemo, useState } from "react";
import { getWalletHistory } from "../services/wallet";

const REFRESH_INTERVAL = 30000;

export function useWalletHistory(address?: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!address) {
      setHistory([]);
      return;
    }

    try {
      setLoading(true);

      const result = await getWalletHistory(address);

      setHistory(
        Array.isArray(result.result)
          ? result.result
          : []
      );
    } catch (err) {
      console.error("Wallet History:", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    if (!address) {
      return;
    }

    const interval = window.setInterval(() => {
      load();
    }, REFRESH_INTERVAL);

    const onFocus = () => {
      load();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        load();
      }
    };

    window.addEventListener("focus", onFocus);

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        onFocus
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );
    };
  }, [address]);

  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        firstBuy: "-",
        lastActivity: "-",
        transactions: 0,
        holdingDays: 0,
        largestBuy: 0,
        largestSell: 0,
      };
    }

    const first = history[0];
    const last = history[history.length - 1];

    const firstDate = new Date(
      Number(first.timeStamp) * 1000
    );

    const lastDate = new Date(
      Number(last.timeStamp) * 1000
    );

    let largestBuy = 0;
    let largestSell = 0;

    history.forEach((tx: any) => {
      const decimals =
        Number(tx.tokenDecimal) || 18;

      const amount =
        Number(tx.value) /
        Math.pow(10, decimals);

      if (
        tx.to?.toLowerCase() ===
        address?.toLowerCase()
      ) {
        largestBuy = Math.max(
          largestBuy,
          amount
        );
      }

      if (
        tx.from?.toLowerCase() ===
        address?.toLowerCase()
      ) {
        largestSell = Math.max(
          largestSell,
          amount
        );
      }
    });

    return {
      firstBuy:
        firstDate.toLocaleDateString(),

      lastActivity:
        lastDate.toLocaleDateString(),

      transactions: history.length,

      holdingDays: Math.floor(
        (Date.now() -
          firstDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ),

      largestBuy,
      largestSell,
    };
  }, [history, address]);

  return {
    history,
    loading,
    refresh: load,
    ...stats,
  };
}