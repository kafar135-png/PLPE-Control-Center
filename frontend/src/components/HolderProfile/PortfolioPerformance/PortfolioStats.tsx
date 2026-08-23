import {
  Wallet,
  Coins,
  PieChart,
  ArrowLeftRight,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import AppIcon from "../../UI/AppIcon/AppIcon";

interface Props {
  range: "7D" | "30D" | "90D" | "ALL";
}

function PortfolioStats({}: Props) {
  return (
    <div className="portfolio-stats">

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={Wallet} size={16} />
          Portfolio Value
        </div>

        <h3>$47.53</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={Coins} size={16} />
          PLPE Balance
        </div>

        <h3>23 350 257</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={PieChart} size={16} />
          Supply Share
        </div>

        <h3>2.335%</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={ArrowLeftRight} size={16} />
          Transactions
        </div>

        <h3>98</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={CalendarDays} size={16} />
          Holding Days
        </div>

        <h3>214</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={ShieldCheck} size={16} />
          Wallet Status
        </div>

        <h3
          style={{
            color: "var(--plpe-green)",
          }}
        >
          Active
        </h3>
      </div>

    </div>
  );
}

export default PortfolioStats;