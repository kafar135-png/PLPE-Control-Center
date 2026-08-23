import "./PortfolioPerformance.css";

import PortfolioChart from "./PortfolioChart";
import PortfolioStats from "./PortfolioStats";
import TimeRange from "./TimeRange";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

import CardTitle from "../../UI/CardTitle/CardTitle";

function PortfolioPerformance() {
  const [range, setRange] =
  useState<"7D" | "30D" | "90D" | "ALL">("30D");

  return (
    <div className="profile-card portfolio-performance">
      <div className="portfolio-header">
        <CardTitle
          icon={TrendingUp}
          title="Portfolio Performance"
        />

        <TimeRange
          range={range}
          onChange={setRange}
        />
      </div>

      <PortfolioChart range={range} />

      <PortfolioStats range={range} />
    </div>
  );
}

export default PortfolioPerformance;