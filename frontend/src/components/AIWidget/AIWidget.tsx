import "./AIWidget.css";

import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

function AIWidget() {
  const { data, loading } = useMarketData();
  const { t } = useLanguage();

  function getMarketSentiment() {
    if (!data) {
      return {
        title: t.ai.waitingTitle,
        color: "#9ca3af",
        text: t.ai.waitingText,
      };
    }

    if (data.priceChange24h >= 10) {
      return {
        title: t.ai.strongBullishTitle,
        color: "#22c55e",
        text: t.ai.strongBullishText,
      };
    }

    if (data.priceChange24h >= 3) {
      return {
        title: t.ai.bullishTitle,
        color: "#22c55e",
        text: t.ai.bullishText,
      };
    }

    if (data.priceChange24h <= -10) {
      return {
        title: t.ai.strongBearishTitle,
        color: "#ef4444",
        text: t.ai.strongBearishText,
      };
    }

    if (data.priceChange24h <= -3) {
      return {
        title: t.ai.bearishTitle,
        color: "#f97316",
        text: t.ai.bearishText,
      };
    }

    return {
      title: t.ai.neutralTitle,
      color: "#facc15",
      text: t.ai.neutralText,
    };
  }

  const sentiment = getMarketSentiment();

  return (
    <div className="ai-widget">
      <h2>{t.ai.title}</h2>

      {loading ? (
        <p>{t.ai.loading}</p>
      ) : (
        <>
          <div
            className="ai-message"
            style={{
              color: sentiment.color,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {sentiment.title}
          </div>

          <p>{sentiment.text}</p>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <strong>{t.ai.change24h}</strong>

            <div
              style={{
                marginTop: 8,
                fontSize: 24,
                color:
                  data!.priceChange24h >= 0
                    ? "#22c55e"
                    : "#ef4444",
                fontWeight: 700,
              }}
            >
              {data!.priceChange24h.toFixed(2)}%
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
            }}
          >
            <strong>{t.ai.liquidity}</strong>

            <div
              style={{
                marginTop: 8,
                fontWeight: 700,
              }}
            >
              $
              {Math.round(
                data!.liquidity
              ).toLocaleString()}
            </div>
          </div>

          <button
            className="ai-button"
            style={{
              marginTop: 24,
            }}
          >
            {t.ai.scoreButton}
          </button>
        </>
      )}
    </div>
  );
}

export default AIWidget;