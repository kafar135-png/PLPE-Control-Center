import "./HolderGrowth.css";

import { useEffect, useRef } from "react";

import {
  createChart,
  AreaSeries,
  ColorType,
} from "lightweight-charts";

import { useLanguage } from "../../../hooks/useLanguage";

function HolderGrowth() {
  const chartRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
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
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#22c55e",

      topColor: "rgba(34,197,94,.45)",

      bottomColor: "rgba(34,197,94,.03)",
    });

    series.setData([
      { time: "2026-01-01", value: 62 },
      { time: "2026-02-01", value: 84 },
      { time: "2026-03-01", value: 96 },
      { time: "2026-04-01", value: 128 },
      { time: "2026-05-01", value: 182 },
      { time: "2026-06-01", value: 241 },
      { time: "2026-07-01", value: 337 },
    ]);

    chart.timeScale().fitContent();

    const resize = () => {
      if (!chartRef.current) return;

      chart.applyOptions({
        width: chartRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, []);

  return (
    <div className="analytics-card large">
      <div className="holder-header">
        <div>
          <h2>{t.analytics.holderGrowthTitle}</h2>

          <p>{t.analytics.holderGrowthSubtitle}</p>
        </div>

        <div className="holder-value">
          <span>{t.analytics.current}</span>

          <h1>337</h1>
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