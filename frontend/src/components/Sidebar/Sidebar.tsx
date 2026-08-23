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
import "./Sidebar.css";

function Sidebar() {
  const { t } = useLanguage();

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

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img
          src={logo}
          alt="PolishPepe"
          className="sidebar-logo-image"
        />

        <h2>PLPE OS</h2>

        <small>v0.1 Alpha</small>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <WalletPanel />

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
          ONLINE
        </span>
      </div>
    </aside>
  );
}

export default Sidebar;