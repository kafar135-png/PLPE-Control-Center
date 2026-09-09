import {
  CircleDollarSign,
  Globe,
  Wallet,
  CircleDot,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import "./TopBar.css";

import { useWalletProfile } from "../../hooks/useWalletProfile";
import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

import { sendOnlineHeartbeat } from "../../services/online";

import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import WalletPanel from "../WalletPanel/WalletPanel";

function TopBar() {
  const {
    address,
    isConnected,
  } = useWalletProfile();

  const { data } =
    useMarketData();

  const { t } =
    useLanguage();

  const [
    onlineUsers,
    setOnlineUsers,
  ] =
    useState(0);

  const shortAddress =
    address
      ? `${address.slice(
          0,
          6
        )}...${address.slice(-4)}`
      : t.common.disconnected;

  /*
   * ==========================================
   * ONLINE USERS
   * ==========================================
   */

  useEffect(() => {
    let mounted = true;

    async function heartbeat() {
      try {
        const count =
          await sendOnlineHeartbeat();

        if (mounted) {
          setOnlineUsers(count);
        }
      } catch (error) {
        console.error(
          "[TOPBAR ONLINE] Failed:",
          error
        );
      }
    }

    heartbeat();

    const interval =
      window.setInterval(
        heartbeat,
        15000
      );

    return () => {
      mounted = false;

      window.clearInterval(
        interval
      );
    };
  }, []);

  return (
    <header className="topbar">

      {/* ======================================
          TITLE
      ====================================== */}

      <div className="topbar-left">

        <h1>
          {t.topbar.title}
        </h1>

        <p>
          {t.topbar.subtitle}
        </p>

      </div>

      {/* ======================================
          MARKET / NETWORK / WALLET
      ====================================== */}

      <div className="topbar-right">

        {/* PRICE */}

        <div className="topbar-box">

          <CircleDollarSign
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>

            <small>
              {t.common.price}
            </small>

            <strong>
              {data
                ? `$${data.price.toFixed(
                    8
                  )}`
                : "--"}
            </strong>

          </div>

        </div>

        {/* NETWORK */}

        <div className="topbar-box">

          <Globe
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>

            <small>
              {t.common.network}
            </small>

            <strong>
              {t.topbar.networkName}
            </strong>

          </div>

        </div>

        {/* WALLET STATUS */}

        <div className="topbar-box">

          <Wallet
            size={20}
            strokeWidth={2.2}
            className="topbar-icon"
          />

          <div>

            <small>
              {t.common.wallet}
            </small>

            <strong>
              {isConnected
                ? shortAddress
                : t.common.disconnected}
            </strong>

          </div>

        </div>

        {/* LANGUAGE */}

        <LanguageSwitcher />

        {/* ONLINE */}

        <div className="status">

          <CircleDot
            size={14}
            fill="var(--plpe-green)"
            color="var(--plpe-green)"
          />

          <span className="desktop-live-label">
            {t.common.live}
          </span>

          <span className="mobile-online-label">
            {onlineUsers} ONLINE
          </span>

        </div>

      </div>

      {/* ======================================
          MOBILE WALLET
      ====================================== */}

      <div className="topbar-mobile-wallet">
        <WalletPanel />
      </div>

    </header>
  );
}

export default TopBar;