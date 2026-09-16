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
  address?: string;
}

function PortfolioChart({
  range,
  address,
}: Props) {
  const chartRef =
    useRef<HTMLDivElement>(null);

  const {
    chartData,
    loading,
  } =
    usePortfolioPerformance(
      range,
      address
    );

  useEffect(() => {
    if (
      !chartRef.current ||
      chartData.length === 0
    ) {
      return;
    }

    const chart = createChart(
      chartRef.current,
      {
        width:
          chartRef.current.clientWidth,
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
            color:
              "rgba(255,255,255,.05)",
          },
          horzLines: {
            color:
              "rgba(255,255,255,.05)",
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
            labelBackgroundColor:
              "#00ff8c",
          },

          horzLine: {
            color: "#00ff8c",
            width: 1,
            style: 2,
            labelBackgroundColor:
              "#00ff8c",
          },
        },
      }
    );

    const series =
      chart.addSeries(
        LineSeries,
        {
          color: "#00ff8c",
          lineWidth: 3,
        }
      );

    series.setData(
      chartData
    );

    const lastPoint =
      chartData[
        chartData.length - 1
      ];

    if (lastPoint) {
      series.createPriceLine({
        price:
          lastPoint.value,
        color: "#00ff8c",
        lineWidth: 2,
        lineStyle:
          LineStyle.Dashed,
        axisLabelVisible: true,
        title: "PLPE",
      });
    }

    series.applyOptions({
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor:
        "#00ff8c",
      priceLineWidth: 2,
    });

    chart.timeScale()
      .fitContent();

    chart.applyOptions({
      localization: {
        priceFormatter: (
          price: number
        ) =>
          new Intl.NumberFormat(
            "en-US",
            {
              maximumFractionDigits: 0,
            }
          ).format(price),
      },
    });

    const resize = () => {
      if (!chartRef.current) {
        return;
      }

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
  }, [chartData]);

  if (loading) {
    return (
      <div
        className="portfolio-chart"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          color: "#94a3b8",
        }}
      >
        Loading portfolio history...
      </div>
    );
  }

  if (!address) {
    return (
      <div
        className="portfolio-chart"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          color: "#94a3b8",
        }}
      >
        Select a wallet to view
        performance.
      </div>
    );
  }

  if (
    chartData.length === 0
  ) {
    return (
      <div
        className="portfolio-chart"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          color: "#94a3b8",
        }}
      >
        No PLPE transaction
        history for this
        period.
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="portfolio-chart"
    />
  );
}

export default PortfolioChart;