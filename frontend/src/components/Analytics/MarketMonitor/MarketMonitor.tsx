import "./MarketMonitor.css";

import { useMarketData } from "../../../hooks/useMarketData";
import { useLanguage } from "../../../hooks/useLanguage";

function MarketMonitor() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  if (loading || !data) {
    return (
      <div className="analytics-card large">
        <h2>{t.analytics.marketMonitorTitle}</h2>
        <p>{t.analytics.connecting}</p>
      </div>
    );
  }

  return (
    <div className="analytics-card large">
      <h2>{t.analytics.marketMonitorTitle}</h2>

      <div className="monitor-grid">
        <div className="monitor-item">
          <span>{t.analytics.currentPrice}</span>
          <strong>${data.price.toFixed(8)}</strong>
        </div>

        <div className="monitor-item">
          <span>{t.analytics.liquidity}</span>
          <strong>${Math.round(data.liquidity)}</strong>
        </div>

        <div className="monitor-item">
          <span>{t.analytics.marketCap}</span>
          <strong>${Math.round(data.marketCap)}</strong>
        </div>

        <div className="monitor-item">
          <span>{t.analytics.volume24h}</span>
          <strong>${data.volume24h.toFixed(2)}</strong>
        </div>

        <div className="monitor-item">
          <span>{t.analytics.connection}</span>
          <strong className="live">
            ● {t.common.live}
          </strong>
        </div>

        <div className="monitor-item">
          <span>{t.analytics.lastRefresh}</span>
          <strong>{new Date().toLocaleTimeString()}</strong>
        </div>
      </div>
    </div>
  );
}

export default MarketMonitor;