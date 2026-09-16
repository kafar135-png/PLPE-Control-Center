import "./WhaleActivity.css";

import { useMarketData } from "../../../hooks/useMarketData";
import { useLanguage } from "../../../hooks/useLanguage";

function WhaleActivity() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  if (loading || !data) {
    return (
      <div className="analytics-card">
        <h2>{t.analytics.whaleActivityTitle}</h2>
        <p>{t.analytics.scanning}</p>
      </div>
    );
  }

  const status =
    data.volume24h > 1000
      ? t.analytics.highActivity
      : data.volume24h > 100
      ? t.analytics.mediumActivity
      : t.analytics.lowActivity;

  const pressure =
    data.priceChange24h > 0
      ? t.analytics.buyingPressure
      : data.priceChange24h < 0
      ? t.analytics.sellingPressure
      : t.analytics.neutral;

  return (
    <div className="analytics-card">
      <h2>{t.analytics.whaleActivityTitle}</h2>

      <div className="whale-row">
        <span>{t.analytics.status}</span>
        <strong>{status}</strong>
      </div>

      <div className="whale-row">
        <span>{t.analytics.marketPressure}</span>
        <strong>{pressure}</strong>
      </div>

      <div className="whale-row">
        <span>{t.analytics.largeTrades}</span>
        <strong>0 {t.analytics.detected}</strong>
      </div>

      <div className="whale-row">
        <span>{t.analytics.monitoring}</span>
        <strong>{t.common.live}</strong>
      </div>

      <div className="whale-row">
        <span>{t.analytics.lastScan}</span>
        <strong>{new Date().toLocaleTimeString()}</strong>
      </div>
    </div>
  );
}

export default WhaleActivity;