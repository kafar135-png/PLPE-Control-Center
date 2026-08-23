import "./ActivityFeed.css";

import { useLiveTrades } from "../../hooks/useLiveTrades";
import { useLanguage } from "../../hooks/useLanguage";

function ActivityFeed() {
  const { trades, loading } = useLiveTrades();
  const { t } = useLanguage();

  function timeAgo(timestamp: number) {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);

    if (seconds < 60) return `${seconds}${t.activity.secondsAgo}`;

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) return `${minutes}${t.activity.minutesAgo}`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}${t.activity.hoursAgo}`;

    const days = Math.floor(hours / 24);

    return `${days}${t.activity.daysAgo}`;
  }

  return (
    <div className="activity-feed">
      <h2>{t.activity.title}</h2>

      <div className="activity-list">
        {loading && (
          <div className="activity-item">
            {t.activity.loading}
          </div>
        )}

        {!loading &&
          trades.map((trade, index) => (
            <div
              key={trade.hash ?? index}
              className="activity-item"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color:
                        trade.type === "BUY"
                          ? "#22c55e"
                          : trade.type === "SELL"
                          ? "#ef4444"
                          : "#60a5fa",
                    }}
                  >
                    {trade.type === "BUY"
                      ? t.activity.buy
                      : trade.type === "SELL"
                      ? t.activity.sell
                      : t.activity.transfer}
                  </div>

                  <small>
                    {Math.round(trade.amount).toLocaleString()} PLPE
                  </small>
                </div>

                <small>{timeAgo(trade.timestamp)}</small>
              </div>
            </div>
          ))}

        {!loading && trades.length === 0 && (
          <div className="activity-item">
            {t.activity.noActivity}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;