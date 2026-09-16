import "./LiveTrades.css";

import { useLiveTrades } from "../../../hooks/useLiveTrades";
import { useLanguage } from "../../../hooks/useLanguage";

export default function LiveTrades() {
  const { trades, loading } = useLiveTrades();
  const { t } = useLanguage();

  return (
    <div className="analytics-card">
      <h2>{t.analytics.liveTradesTitle}</h2>

      {loading && <p>{t.common.loading}</p>}

      {!loading &&
        trades.slice(0, 15).map((trade, index) => (
          <div
            key={index}
            className="trade-row"
          >
            <div>
              <span
                className={
                  trade.amount >= 1000000
                    ? "trade-type whale"
                    : "trade-type"
                }
              >
                🐸
              </span>

              <span className="trade-amount">
                {trade.amount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{" "}
                PLPE
              </span>
            </div>

            <span className="trade-time">
              {new Date(
                trade.timestamp * 1000
              ).toLocaleTimeString()}
            </span>
          </div>
        ))}
    </div>
  );
}