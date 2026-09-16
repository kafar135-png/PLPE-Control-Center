import "./ChartArea.css";

import { useEffect, useRef, useState } from "react";

import {
  createChart,
  ColorType,
  CandlestickSeries,
} from "lightweight-charts";

import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from "lightweight-charts";

import { getChartData } from "../../services/chart";
import { useLanguage } from "../../hooks/useLanguage";

function ChartArea() {
  const { t } = useLanguage();

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [timeframe, setTimeframe] = useState("1D");

  async function loadChart(tf: string) {
    try {
      setError("");

      const candles = await getChartData(tf);

      const formatted: CandlestickData[] = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      seriesRef.current?.setData(formatted);

      chartRef.current?.timeScale().fitContent();

      setLoading(false);
    } catch (err) {
      console.error(err);

      setError(t.dashboard.chartError);

      setLoading(false);
    }
  }

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 420,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#111827",
        },
        textColor: "#9CA3AF",
      },

      grid: {
        vertLines: {
          color: "#1F2937",
        },
        horzLines: {
          color: "#1F2937",
        },
      },

      rightPriceScale: {
        borderColor: "#374151",
      },

      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    loadChart(timeframe);

    const resize = () => {
      if (!chartContainerRef.current) return;

      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", resize);

    const interval = setInterval(() => {
      loadChart(timeframe);
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [timeframe, t]);

  return (
    <div className="chart-area">
      <div className="chart-header">
        <div>
          <h2>{t.dashboard.chartTitle}</h2>

          <p className="chart-subtitle">
            {t.dashboard.chartSubtitle}
          </p>
        </div>

        <div className="chart-actions">
          <button
            className={timeframe === "5m" ? "active" : ""}
            onClick={() => setTimeframe("5m")}
          >
            5m
          </button>

          <button
            className={timeframe === "15m" ? "active" : ""}
            onClick={() => setTimeframe("15m")}
          >
            15m
          </button>

          <button
            className={timeframe === "1H" ? "active" : ""}
            onClick={() => setTimeframe("1H")}
          >
            1H
          </button>

          <button
            className={timeframe === "4H" ? "active" : ""}
            onClick={() => setTimeframe("4H")}
          >
            4H
          </button>

          <button
            className={timeframe === "1D" ? "active" : ""}
            onClick={() => setTimeframe("1D")}
          >
            1D
          </button>

          <span className="live">
            ● {t.common.live}
          </span>
        </div>
      </div>

      {loading && (
        <div className="chart-loading">
          {t.dashboard.chartLoading}
        </div>
      )}

      {error && (
        <div className="chart-error">
          {error}
        </div>
      )}

      <div
        ref={chartContainerRef}
        className="chart-container"
      />

      <div className="chart-footer">
        {t.dashboard.poweredBy}
      </div>
    </div>
  );
}

export default ChartArea;