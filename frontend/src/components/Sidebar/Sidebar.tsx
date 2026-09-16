import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import {
  House,
  BarChart3,
  UserCircle2,
  Info,
  CircleDot,
  Gamepad2,
} from "lucide-react";

import logo from "../../assets/polishpepe-logo-512.png";

import WalletPanel from "../WalletPanel/WalletPanel";

import { useLanguage } from "../../hooks/useLanguage";

import {
  sendOnlineHeartbeat,
} from "../../services/online";

import {
  startAdventureMusic,
  stopGameMusic,
  playClick,
} from "../../pages/Game/gameAudio";

import "./Sidebar.css";

function Sidebar() {
  const { t } = useLanguage();

  const [
    onlineUsers,
    setOnlineUsers,
  ] = useState<number>(0);

  const menuItems = [
    {
      name: t.common.dashboard,
      icon: (
        <House
          size={20}
          strokeWidth={2.2}
        />
      ),
      path: "/",
    },

    {
      name: t.common.analytics,
      icon: (
        <BarChart3
          size={20}
          strokeWidth={2.2}
        />
      ),
      path: "/analytics",
    },

    {
      name: t.common.holderProfile,
      icon: (
        <UserCircle2
          size={20}
          strokeWidth={2.2}
        />
      ),
      path: "/holder",
    },

    {
      name: "PLPE Arena",
      icon: (
        <Gamepad2
          size={20}
          strokeWidth={2.2}
        />
      ),
      path: "/game",
    },

    {
      name: t.common.about,
      icon: (
        <Info
          size={20}
          strokeWidth={2.2}
        />
      ),
      path: "/about",
    },
  ];

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
          "[ONLINE] Failed:",
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

  function handlePointerDown(
    path: string
  ) {
    /*
      WAŻNE:
      muzyka startuje podczas fizycznego
      kliknięcia użytkownika,
      ZANIM React zmieni stronę.
    */

    if (path === "/game") {
      void startAdventureMusic();

      return;
    }

    stopGameMusic();
  }

  function handleClick() {
    playClick();
  }

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <img
          src={logo}
          alt="PolishPepe"
          className="sidebar-logo-image"
        />

        <h2>
          PLPE OS
        </h2>

        <small>
          v0.1 Alpha
        </small>

      </div>

      <nav className="sidebar-menu">

        {menuItems.map(
          (item) => (
            <NavLink
              key={item.path}
              to={item.path}

              onPointerDown={() =>
                handlePointerDown(
                  item.path
                )
              }

              onClick={
                handleClick
              }

              className={({
                isActive,
              }) =>
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
          )
        )}

      </nav>

      <WalletPanel />

      <div className="sidebar-footer">

        Ethereum Mainnet

        <br />

        PLPE / WETH

        <br />

        <span
          style={{
            display:
              "inline-flex",

            alignItems:
              "center",

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