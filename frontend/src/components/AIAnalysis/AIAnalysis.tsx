import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

function AIAnalysis() {
  const { data } = useMarketData();
  const { t } = useLanguage();

  if (!data) {
    return <p>{t.ai.loading}</p>;
  }

  let health = t.analytics.healthy;
  let risk = 10;
  let recommendation = t.analytics.strongBuy;

  if (data.liquidity < 100) {
    health = t.analytics.lowLiquidity;
    risk += 40;
  }

  if (data.volume24h < 20) {
    risk += 20;
  }

  if (data.marketCap < 5000) {
    risk += 15;
  }

  if (risk < 20) {
    recommendation = t.analytics.strongBuy;
  } else if (risk < 40) {
    recommendation = t.analytics.accumulation;
  } else if (risk < 60) {
    recommendation = t.ai.neutralTitle;
  } else {
    recommendation = t.analytics.highRisk;
  }

  return (
    <div className="analytics-card large">
      <h2>{t.analytics.aiAnalysisTitle}</h2>

      <p>
        <strong>{t.analytics.marketHealth}:</strong> {health}
      </p>

      <p>
        <strong>{t.analytics.liquidity}:</strong> ${Math.round(data.liquidity)}
      </p>

      <p>
        <strong>{t.analytics.volume24h}:</strong> ${data.volume24h.toFixed(2)}
      </p>

      <p>
        <strong>{t.analytics.marketCap}:</strong> ${Math.round(data.marketCap)}
      </p>

      <h3>{t.analytics.riskScore}</h3>

      <h1>{risk}/100</h1>

      <h3>{recommendation}</h3>
    </div>
  );
}

export default AIAnalysis;