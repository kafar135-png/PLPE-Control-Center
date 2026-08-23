import "./MarketHealth.css";

import { useMarketData } from "../../../hooks/useMarketData";
import { useLanguage } from "../../../hooks/useLanguage";

function MarketHealth() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  if (loading || !data) {
    return (
      <div className="market-health">
        {t.common.loading}
      </div>
    );
  }

  const health =
    data.liquidity > 200
      ? t.analytics.healthy
      : data.liquidity > 100
      ? t.analytics.moderate
      : t.analytics.weak;

  const trend =
    data.priceChange24h >= 0
      ? t.analytics.bullish
      : t.analytics.bearish;

  const risk =
    data.liquidity > 200
      ? 18
      : data.liquidity > 100
      ? 42
      : 76;

  const aiScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          risk +
          Math.min(data.volume24h * 2, 15)
      )
    )
  );

  return (
    <div className="market-health">
      <h2>{t.analytics.marketHealthTitle}</h2>

      <div className="health-item">
        <span>{t.analytics.status}</span>
        <strong>{health}</strong>
      </div>

      <div className="health-item">
        <span>{t.analytics.trend}</span>
        <strong>{trend}</strong>
      </div>

      <div className="health-item">
        <span>{t.analytics.risk}</span>
        <strong>{risk}/100</strong>
      </div>

      <div className="health-item">
        <span>{t.analytics.liquidity}</span>
        <strong>${Math.round(data.liquidity)}</strong>
      </div>

      <div className="health-item">
        <span>{t.analytics.volume24h}</span>
        <strong>${data.volume24h.toFixed(2)}</strong>
      </div>

      <div className="health-item">
        <span>{t.analytics.aiScore}</span>
        <strong>{aiScore}/100</strong>
      </div>
    </div>
  );
}

export default MarketHealth;