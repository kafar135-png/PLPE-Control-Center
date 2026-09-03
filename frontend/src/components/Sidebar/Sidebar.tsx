import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  House,
  BarChart3,
  UserCircle2,
  Info,
  CircleDot,
} from "lucide-react";

import logo from "../../assets/logo.png";
import WalletPanel from "../WalletPanel/WalletPanel";
import { useLanguage } from "../../hooks/useLanguage";
import { sendOnlineHeartbeat } from "../../services/online";
import "./Sidebar.css";

function Sidebar() {
  const { t } = useLanguage();

  const [onlineUsers, setOnlineUsers] =
    useState<number>(0);

  const menuItems = [
    {
      name: t.common.dashboard,
      icon: <House size={20} strokeWidth={2.2} />,
      path: "/",
    },
    {
      name: t.common.analytics,
      icon: <BarChart3 size={20} strokeWidth={2.2} />,
      path: "/analytics",
    },
    {
      name: t.common.holderProfile,
      icon: <UserCircle2 size={20} strokeWidth={2.2} />,
      path: "/holder",
    },
    {
      name: t.common.about,
      icon: <Info size={20} strokeWidth={2.2} />,
      path: "/about",
    },
  ];

  // ============================================
  // PLPE OS ONLINE USERS
  // ============================================

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
          "[ONLINE] Failed to update counter:",
          error
        );
      }
    }

    // Initial heartbeat
    heartbeat();

    // Heartbeat every 15 seconds
    const interval = setInterval(
      heartbeat,
      15000
    );

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <aside className="sidebar">

      {/* ============================================
          LOGO
      ============================================ */}

      <div className="sidebar-logo">
        <img
          src={logo}
          alt="PolishPepe"
          className="sidebar-logo-image"
        />

        <h2>PLPE OS</h2>

        <small>v0.1 Alpha</small>
      </div>

      {/* ============================================
          NAVIGATION
      ============================================ */}

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
            }
          >
            <span className="icon">
              {item.icon}
            </span>

            <span>
              {item.name}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* ============================================
          WALLET
      ============================================ */}

      <WalletPanel />

      {/* ============================================
          FOOTER
      ============================================ */}

      <div className="sidebar-footer">
        Ethereum Mainnet
        <br />

        PLPE / WETH
        <br />

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <CircleDot
            size={14}
            color="var(--plpe-green)"
            fill="var(--plpe-green)"
          />

          {onlineUsers} ONLINE
        </span>
      </div>

    </aside>
  );
}

export default Sidebar;