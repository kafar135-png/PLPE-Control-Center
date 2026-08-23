import { useMemo } from "react";
import { portfolioData } from "./mockPortfolio";

export type PortfolioRange =
  | "7D"
  | "30D"
  | "90D"
  | "ALL";

export function usePortfolioPerformance(
  range: PortfolioRange
) {
  const chartData = useMemo(() => {
    return portfolioData[range];
  }, [range]);

  const values = chartData.map((item) => item.value);

  const currentValue =
    values[values.length - 1] ?? 0;

  const high = Math.max(...values);

  const low = Math.min(...values);

  const first = values[0] ?? 0;

  const change =
    first === 0
      ? 0
      : ((currentValue - first) / first) * 100;

  return {
    chartData,
    currentValue,
    high,
    low,
    change,
  };
}