import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  LineStyle,
} from "lightweight-charts";

import { usePortfolioPerformance } from "./usePortfolioPerformance";

interface Props {
  range: "7D" | "30D" | "90D" | "ALL";
}

function PortfolioChart({ range }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  const { chartData } = usePortfolioPerformance(range);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 260,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "transparent",
        },

        textColor: "#94a3b8",
      },

      grid: {
        vertLines: {
          color: "rgba(255,255,255,.05)",
        },

        horzLines: {
          color: "rgba(255,255,255,.05)",
        },
      },

      rightPriceScale: {
        borderColor: "#2f3b56",
      },

      timeScale: {
        borderColor: "#2f3b56",
      },

      crosshair: {
        vertLine: {
          color: "#00ff8c",
          width: 1,
          style: 2,
          labelBackgroundColor: "#00ff8c",
        },

        horzLine: {
          color: "#00ff8c",
          width: 1,
          style: 2,
          labelBackgroundColor: "#00ff8c",
        },
      },
    });

    const series = chart.addSeries(LineSeries, {
      color: "#00ff8c",
      lineWidth: 3,
    });

    series.setData(chartData);

    const lastPoint = chartData[chartData.length - 1];

    if (lastPoint) {
      series.createPriceLine({
        price: lastPoint.value,
        color: "#00ff8c",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: "PLPE",
      });
    }

    series.applyOptions({
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: "#00ff8c",
      priceLineWidth: 2,
    });

    chart.timeScale().fitContent();

    chart.applyOptions({
      localization: {
        priceFormatter: (price: number) => `$${price.toFixed(2)}`,
      },
    });

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
  }, [chartData]);

  return <div ref={chartRef} className="portfolio-chart" />;
}

export default PortfolioChart;