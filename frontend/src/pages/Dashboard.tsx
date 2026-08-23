import TopBar from "../components/TopBar/TopBar";
import Hero from "../components/Hero/Hero";
import StatCard from "../components/StatCard/StatCard";
import ChartArea from "../components/ChartArea/ChartArea";
import AIWidget from "../components/AIWidget/AIWidget";
import ActivityFeed from "../components/ActivityFeed/ActivityFeed";
import ChallengeLeaderboard from "../components/ChallengeLeaderboard/ChallengeLeaderboard";

import { useMarketData } from "../hooks/useMarketData";
import { useLanguage } from "../hooks/useLanguage";

function Dashboard() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  if (loading || !data) {
    return (
      <h2>
        {t.dashboard.loading}
      </h2>
    );
  }

  return (
    <div className="dashboard">

      <TopBar />

      <Hero />

      <div className="stats-grid">

        <StatCard
          title={t.dashboard.price}
          value={`$${data.price.toFixed(8)}`}
          change={`${data.priceChange24h.toFixed(2)}%`}
        />

        <StatCard
          title={t.dashboard.liquidity}
          value={`$${Math.round(
            data.liquidity
          ).toLocaleString()}`}
          change={t.common.live}
        />

        <StatCard
          title={t.dashboard.marketCap}
          value={`$${Math.round(
            data.marketCap
          ).toLocaleString()}`}
          change={t.common.live}
        />

        <StatCard
          title={t.dashboard.volume24h}
          value={`$${Math.round(
            data.volume24h
          ).toLocaleString()}`}
          change={t.common.live}
        />

      </div>

      <ChallengeLeaderboard />

      <ChartArea />

      <div className="dashboard-bottom">

        <AIWidget />

        <ActivityFeed />

      </div>

    </div>
  );
}

export default Dashboard;