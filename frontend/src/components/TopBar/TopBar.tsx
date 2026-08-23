import {
  CircleDollarSign,
  Globe,
  Wallet,
  CircleDot,
} from "lucide-react";

import "./TopBar.css";

import { useWalletProfile } from "../../hooks/useWalletProfile";
import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

function TopBar() {
  const { address, isConnected } = useWalletProfile();
  const { data } = useMarketData();
  const { t } = useLanguage();

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : t.common.disconnected;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1>{t.topbar.title}</h1>

        <p>{t.topbar.subtitle}</p>
      </div>

      <div className="topbar-right">
        <div className="topbar-box">
          <CircleDollarSign
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>
            <small>{t.common.price}</small>
            <strong>
              {data ? `$${data.price.toFixed(8)}` : "--"}
            </strong>
          </div>
        </div>

        <div className="topbar-box">
          <Globe
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>
            <small>{t.common.network}</small>
            <strong>{t.topbar.networkName}</strong>
          </div>
        </div>

        <div className="topbar-box">
          <Wallet
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>
            <small>{t.common.wallet}</small>
            <strong>
              {isConnected ? shortAddress : t.common.disconnected}
            </strong>
          </div>
        </div>

        <LanguageSwitcher />

        <div className="status">
          <CircleDot
            size={14}
            fill="var(--plpe-green)"
            color="var(--plpe-green)"
          />

          <span>{t.common.live}</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;