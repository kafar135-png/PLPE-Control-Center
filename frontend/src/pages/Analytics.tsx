import { BarChart3 } from "lucide-react";

import "./Analytics.css";

import MarketOverview from "../components/Analytics/MarketOverview";
import HolderGrowth from "../components/Analytics/HolderGrowth/HolderGrowth";
import MarketHealth from "../components/Analytics/MarketHealth/MarketHealth";
import TopHolders from "../components/Analytics/TopHolders/TopHolders";
import WhaleActivity from "../components/Analytics/WhaleActivity/WhaleActivity";
import MarketMonitor from "../components/Analytics/MarketMonitor/MarketMonitor";
import LiveTrades from "../components/Analytics/LiveTrades/LiveTrades";
import AIAnalysis from "../components/AIAnalysis/AIAnalysis";

function Analytics() {
  return (
    <div className="analytics-page">
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <BarChart3
          size={30}
          strokeWidth={2.2}
          color="var(--plpe-green)"
        />
        Analytics
      </h1>

      <div className="analytics-overview">
        <MarketOverview />
      </div>

      <div className="analytics-grid">
        <div className="analytics-top">
          <HolderGrowth />

          <MarketHealth />
        </div>

        <div className="analytics-row">
          <LiveTrades />

          <WhaleActivity />
        </div>

        <div className="analytics-row">
          <TopHolders />

          <AIAnalysis />
        </div>

        <MarketMonitor />
      </div>
    </div>
  );
}

export default Analytics;