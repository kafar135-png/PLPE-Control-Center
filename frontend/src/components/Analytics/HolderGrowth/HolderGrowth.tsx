import "./HolderGrowth.css";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createChart,
  AreaSeries,
  ColorType,
} from "lightweight-charts";

import { useLanguage } from "../../../hooks/useLanguage";

type HolderApiResponse =
  | number
  | {
      holders?: number;
      count?: number;
      holderCount?: number;
      totalHolders?: number;
      data?:
        | number
        | {
            holders?: number;
            count?: number;
            holderCount?: number;
            totalHolders?: number;
          };
    };

function extractHolderCount(
  response: HolderApiResponse
): number | null {
  if (typeof response === "number") {
    return response;
  }

  const direct =
    response.holders ??
    response.count ??
    response.holderCount ??
    response.totalHolders;

  if (
    typeof direct === "number" &&
    Number.isFinite(direct)
  ) {
    return direct;
  }

  if (
    typeof response.data === "number" &&
    Number.isFinite(response.data)
  ) {
    return response.data;
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    const nested =
      response.data.holders ??
      response.data.count ??
      response.data.holderCount ??
      response.data.totalHolders;

    if (
      typeof nested === "number" &&
      Number.isFinite(nested)
    ) {
      return nested;
    }
  }

  return null;
}

function HolderGrowth() {
  const chartRef =
    useRef<HTMLDivElement>(null);

  const [currentHolders, setCurrentHolders] =
    useState<number | null>(null);

  const { t } = useLanguage();

  /*
  =========================================================
  LIVE HOLDER COUNT
  =========================================================
  */

  useEffect(() => {
    let cancelled = false;

    async function loadHolders() {
      try {
        const response = await fetch(
          `/api/holders?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data: HolderApiResponse =
          await response.json();

        const count =
          extractHolderCount(data);

        if (count === null) {
          throw new Error(
            "Invalid holders API response"
          );
        }

        if (!cancelled) {
          setCurrentHolders(count);
        }
      } catch (error) {
        console.error(
          "[HOLDER GROWTH] Failed to load holders:",
          error
        );

        if (!cancelled) {
          setCurrentHolders(null);
        }
      }
    }

    loadHolders();

    const interval = window.setInterval(
      loadHolders,
      60_000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  /*
  =========================================================
  HOLDER CHART
  =========================================================
  */

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(
      chartRef.current,
      {
        width:
          chartRef.current.clientWidth,

        height: 260,

        layout: {
          background: {
            type: ColorType.Solid,
            color: "#141c2d",
          },

          textColor: "#94a3b8",
        },

        grid: {
          vertLines: {
            color: "#1f2937",
          },

          horzLines: {
            color: "#1f2937",
          },
        },

        rightPriceScale: {
          borderColor: "#374151",
        },

        timeScale: {
          borderColor: "#374151",
        },
      }
    );

    const series =
      chart.addSeries(AreaSeries, {
        lineColor: "#22c55e",

        topColor:
          "rgba(34,197,94,.45)",

        bottomColor:
          "rgba(34,197,94,.03)",
      });

    /*
     * Existing historical values.
     *
     * IMPORTANT:
     * These values are currently manual/static.
     * They are NOT calculated from Alchemy.
     *
     * We can replace them later with real
     * historical blockchain snapshots.
     */

    const historicalData = [
      {
        time: "2026-01-01",
        value: 62,
      },
      {
        time: "2026-02-01",
        value: 84,
      },
      {
        time: "2026-03-01",
        value: 96,
      },
      {
        time: "2026-04-01",
        value: 128,
      },
      {
        time: "2026-05-01",
        value: 182,
      },
      {
        time: "2026-06-01",
        value: 241,
      },
      {
        time: "2026-07-01",
        value: 337,
      },
    ];

    if (currentHolders !== null) {
      const today =
        new Date()
          .toISOString()
          .slice(0, 10);

      historicalData.push({
        time: today,
        value: currentHolders,
      });
    }

    series.setData(historicalData);

    chart
      .timeScale()
      .fitContent();

    const resize = () => {
      if (!chartRef.current) return;

      chart.applyOptions({
        width:
          chartRef.current.clientWidth,
      });
    };

    window.addEventListener(
      "resize",
      resize
    );

    return () => {
      window.removeEventListener(
        "resize",
        resize
      );

      chart.remove();
    };
  }, [currentHolders]);

  return (
    <div className="analytics-card large">
      <div className="holder-header">
        <div>
          <h2>
            {
              t.analytics
                .holderGrowthTitle
            }
          </h2>

          <p>
            {
              t.analytics
                .holderGrowthSubtitle
            }
          </p>
        </div>

        <div className="holder-value">
          <span>
            {t.analytics.current}
          </span>

          <h1>
            {currentHolders ??
              "—"}
          </h1>
        </div>
      </div>

      <div
        ref={chartRef}
        className="holder-chart"
      />
    </div>
  );
}

export default HolderGrowth;