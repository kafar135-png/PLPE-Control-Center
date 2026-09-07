import "./PortfolioPerformance.css";

import PortfolioChart from "./PortfolioChart";
import PortfolioStats from "./PortfolioStats";
import TimeRange from "./TimeRange";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

import CardTitle from "../../UI/CardTitle/CardTitle";

interface Props {
  address: string;
}

function PortfolioPerformance({
  address,
}: Props) {
  const [range, setRange] = useState<
    "7D" | "30D" | "90D" | "ALL"
  >("30D");

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

      <PortfolioChart
        address={address}
        range={range}
      />

      <PortfolioStats
        address={address}
        range={range}
      />
    </div>
  );
}

export default PortfolioPerformance;