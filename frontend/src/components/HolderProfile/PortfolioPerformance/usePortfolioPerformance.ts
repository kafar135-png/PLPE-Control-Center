import { useMemo } from "react";
import { useWalletHistory } from "../../../hooks/useWalletHistory";

export type PortfolioRange =
  | "7D"
  | "30D"
  | "90D"
  | "ALL";

interface WalletTransaction {
  timeStamp?: string;
  value?: string;
  tokenDecimal?: string;
  from?: string;
  to?: string;
}

export interface PortfolioPoint {
  time: string;
  value: number;
}

export function usePortfolioPerformance(
  range: PortfolioRange,
  address?: string
) {
  const {
    history,
    loading,
  } = useWalletHistory(address);

  const chartData =
    useMemo<PortfolioPoint[]>(() => {
      if (
        !address ||
        history.length === 0
      ) {
        return [];
      }

      const now = Date.now();

      const rangeMs = {
        "7D":
          7 * 24 * 60 * 60 * 1000,

        "30D":
          30 * 24 * 60 * 60 * 1000,

        "90D":
          90 * 24 * 60 * 60 * 1000,

        ALL: Infinity,
      }[range];

      const cutoff =
        rangeMs === Infinity
          ? 0
          : now - rangeMs;

      const transactions =
        history
          .filter(
            (tx: WalletTransaction) => {
              const timestamp =
                Number(
                  tx.timeStamp || 0
                ) * 1000;

              return (
                timestamp > 0 &&
                timestamp >= cutoff
              );
            }
          )
          .sort(
            (
              a: WalletTransaction,
              b: WalletTransaction
            ) =>
              Number(
                a.timeStamp || 0
              ) -
              Number(
                b.timeStamp || 0
              )
          );

      if (
        transactions.length === 0
      ) {
        return [];
      }

      let balance = 0;

      /*
       * Lightweight Charts wymaga unikalnego
       * czasu dla każdego punktu.
       *
       * Dlatego agregujemy wiele transakcji
       * z tego samego dnia do jednego punktu.
       */
      const dailyBalances =
        new Map<string, number>();

      for (const tx of transactions) {
        const decimals =
          Number(
            tx.tokenDecimal
          ) || 18;

        const amount =
          Number(
            tx.value || 0
          ) /
          Math.pow(
            10,
            decimals
          );

        const incoming =
          tx.to?.toLowerCase() ===
          address.toLowerCase();

        const outgoing =
          tx.from?.toLowerCase() ===
          address.toLowerCase();

        if (incoming) {
          balance += amount;
        }

        if (outgoing) {
          balance -= amount;
        }

        const date =
          new Date(
            Number(
              tx.timeStamp
            ) * 1000
          )
            .toISOString()
            .slice(0, 10);

        dailyBalances.set(
          date,
          Math.max(balance, 0)
        );
      }

      return Array.from(
        dailyBalances.entries()
      ).map(
        ([time, value]) => ({
          time,
          value,
        })
      );
    }, [
      history,
      address,
      range,
    ]);

  const values =
    chartData.map(
      (item) => item.value
    );

  const currentValue =
    values[
      values.length - 1
    ] ?? 0;

  const high =
    values.length > 0
      ? Math.max(...values)
      : 0;

  const low =
    values.length > 0
      ? Math.min(...values)
      : 0;

  const first =
    values[0] ?? 0;

  const change =
    first === 0
      ? 0
      : ((currentValue - first) /
          first) *
        100;

  return {
    chartData,
    currentValue,
    high,
    low,
    change,
    loading,
  };
}