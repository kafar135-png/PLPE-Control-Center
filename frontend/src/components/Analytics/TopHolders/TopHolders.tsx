import "./TopHolders.css";

import { useLanguage } from "../../../hooks/useLanguage";

const holders = [
  { wallet: "#1", percent: 28.41 },
  { wallet: "#2", percent: 12.84 },
  { wallet: "#3", percent: 8.73 },
  { wallet: "#4", percent: 5.16 },
  { wallet: "#5", percent: 3.91 },
];

function TopHolders() {
  const { t } = useLanguage();

  return (
    <div className="analytics-card">
      <h2>{t.analytics.topHoldersTitle}</h2>

      <div className="holders-list">
        {holders.map((holder) => (
          <div
            key={holder.wallet}
            className="holder-row"
          >
            <div className="holder-info">
              <strong>{holder.wallet}</strong>

              <span>{holder.percent}%</span>
            </div>

            <div className="holder-bar">
              <div
                className="holder-fill"
                style={{
                  width: `${holder.percent}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopHolders;