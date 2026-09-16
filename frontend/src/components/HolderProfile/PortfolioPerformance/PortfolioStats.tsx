import {
  Wallet,
  Coins,
  PieChart,
  ArrowLeftRight,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import AppIcon from "../../UI/AppIcon/AppIcon";

import { useWalletProfile } from "../../../hooks/useWalletProfile";
import { useWalletHistory } from "../../../hooks/useWalletHistory";

interface Props {
  range: "7D" | "30D" | "90D" | "ALL";
  address?: string;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatUsd(value: number) {
  return `$${value.toFixed(2)}`;
}

function PortfolioStats({ address }: Props) {
  const {
    balance,
    value,
    share,
    loading: profileLoading,
  } = useWalletProfile(address);

  const {
    history,
    loading: historyLoading,
    holdingDays,
  } = useWalletHistory(address);

  const loading =
    profileLoading || historyLoading;

  const transactions = history.length;

  if (loading) {
    return (
      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={Wallet} size={16} />
            Portfolio Value
          </div>
          <h3>Loading...</h3>
        </div>

        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={Coins} size={16} />
            PLPE Balance
          </div>
          <h3>Loading...</h3>
        </div>

        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={PieChart} size={16} />
            Supply Share
          </div>
          <h3>Loading...</h3>
        </div>

        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={ArrowLeftRight} size={16} />
            Transactions
          </div>
          <h3>Loading...</h3>
        </div>

        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={CalendarDays} size={16} />
            Holding Days
          </div>
          <h3>Loading...</h3>
        </div>

        <div className="portfolio-stat">
          <div className="portfolio-label">
            <AppIcon icon={ShieldCheck} size={16} />
            Wallet Status
          </div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-stats">

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={Wallet} size={16} />
          Portfolio Value
        </div>
        <h3>{formatUsd(value)}</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={Coins} size={16} />
          PLPE Balance
        </div>
        <h3>{formatNumber(balance)}</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={PieChart} size={16} />
          Supply Share
        </div>
        <h3>{share.toFixed(4)}%</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={ArrowLeftRight} size={16} />
          Transactions
        </div>
        <h3>{transactions}</h3>
      </div>

      <div className="portfolio-stat">
        <div className="portfolio-label">
          <AppIcon icon={CalendarDays} size={16} />
          Holding Days
        </div>
        <h3>{holdingDays}</h3>
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
          {address ? "Active" : "No Wallet"}
        </h3>
      </div>

    </div>
  );
}

export default PortfolioStats;