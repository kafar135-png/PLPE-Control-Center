import "./MarketOverview.css";

import {
  CircleDollarSign,
  Droplets,
  Landmark,
  ChartColumn,
} from "lucide-react";

import AppIcon from "../UI/AppIcon/AppIcon";

import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

function MarketOverview() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  if (loading || !data) {
    return <p>{t.analytics.loading}</p>;
  }

  return (
    <div className="analytics-overview">
      <div className="overview-card">
        <span>
          <AppIcon
            icon={CircleDollarSign}
            size={16}
          />
          {t.analytics.price}
        </span>

        <h2>${data.price.toFixed(8)}</h2>
      </div>

      <div className="overview-card">
        <span>
          <AppIcon
            icon={Droplets}
            size={16}
          />
          {t.analytics.liquidity}
        </span>

        <h2>
          ${Math.round(data.liquidity).toLocaleString()}
        </h2>
      </div>

      <div className="overview-card">
        <span>
          <AppIcon
            icon={Landmark}
            size={16}
          />
          {t.analytics.marketCap}
        </span>

        <h2>
          ${Math.round(data.marketCap).toLocaleString()}
        </h2>
      </div>

      <div className="overview-card">
        <span>
          <AppIcon
            icon={ChartColumn}
            size={16}
          />
          {t.analytics.volume24h}
        </span>

        <h2>${data.volume24h.toFixed(2)}</h2>
      </div>
    </div>
  );
}

export default MarketOverview;