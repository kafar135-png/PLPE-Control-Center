import { useMemo, useState } from "react";

import { useWallet } from "../../hooks/useWallet";
import { usePLPEBalance } from "../../hooks/usePLPEBalance";
import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";

import "./WalletPanel.css";

const TOTAL_SUPPLY = 1_000_000_000;

function walletDisplayName(name: string) {
  const value = name.toLowerCase();

  if (value.includes("metamask")) {
    return "MetaMask";
  }

  if (value.includes("brave")) {
    return "Brave Wallet";
  }

  if (value === "injected") {
    return "Browser Wallet";
  }

  if (value.includes("walletconnect")) {
    return "WalletConnect";
  }

  return name || "Browser Wallet";
}

function walletIcon(name: string) {
  const value = walletDisplayName(name).toLowerCase();

  if (value.includes("metamask")) return "🦊";
  if (value.includes("brave")) return "🦁";
  if (value.includes("walletconnect")) return "🔗";

  return "👛";
}

export default function WalletPanel() {
  const {
    address,
    isConnected,
    connector,
    connectAsync,
    connectors,
    disconnect,
    isPending,
    connectError,
    resetConnect,
  } = useWallet();

  const [showWallets, setShowWallets] = useState(false);
  const [localError, setLocalError] = useState("");

  const { balance, loading } = usePLPEBalance(address);
  const { data } = useMarketData();
  const { t } = useLanguage();

  const availableConnectors = useMemo(() => {
    const seen = new Set<string>();

    const unique = connectors.filter((item) => {
      const key = item.uid || `${item.id}:${item.name}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

    const specificInjected = unique.filter((item) => {
      const name = String(item.name || "").toLowerCase();

      return (
        item.type === "injected" &&
        name !== "injected"
      );
    });

    return unique.filter((item) => {
      const name = String(item.name || "").toLowerCase();

      if (
        name === "injected" &&
        specificInjected.length > 0
      ) {
        return false;
      }

      return true;
    });
  }, [connectors]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const walletValue = data && balance ? balance * data.price : 0;
  const share = balance ? (balance / TOTAL_SUPPLY) * 100 : 0;

  async function handleConnector(
    selectedConnector: (typeof connectors)[number]
  ) {
    try {
      setLocalError("");
      resetConnect();
      await connectAsync({ connector: selectedConnector });
      setShowWallets(false);
    } catch (err) {
      console.error("[WALLET] Connection failed:", err);
      setLocalError(
        err instanceof Error ? err.message : "Wallet connection failed."
      );
    }
  }

  function openWalletSelector() {
    setLocalError("");
    resetConnect();
    setShowWallets(true);
  }

  return (
    <div className="wallet-panel">
      <div className="wallet-title">{t.common.wallet}</div>

      {!isConnected ? (
        <>
          <div className="wallet-status disconnected">
            ⚪ {t.common.disconnected}
          </div>

          {!showWallets ? (
            <button
              className="wallet-button"
              onClick={openWalletSelector}
              disabled={isPending}
            >
              {isPending ? t.common.connecting : t.common.connectWallet}
            </button>
          ) : (
            <div style={{ display: "grid", gap: "8px" }}>
              {availableConnectors.length > 0 ? (
                availableConnectors.map((item) => (
                  <button
                    key={item.uid}
                    className="wallet-button"
                    disabled={isPending}
                    onClick={() => handleConnector(item)}
                  >
                    {walletIcon(item.name)}{" "}
                    {isPending ? t.common.connecting : walletDisplayName(item.name)}
                  </button>
                ))
              ) : (
                <div className="wallet-status disconnected">
                  No EVM wallet detected.
                </div>
              )}

              <button
                type="button"
                className="wallet-button disconnect"
                disabled={isPending}
                onClick={() => {
                  resetConnect();
                  setLocalError("");
                  setShowWallets(false);
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {(localError || connectError) && (
            <div
              className="wallet-status disconnected"
              style={{ marginTop: "8px", whiteSpace: "normal" }}
            >
              ⚠️ {localError || connectError?.message}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="wallet-status connected">
            🟢 {t.common.connected}
          </div>

          {connector?.name && (
            <div style={{ opacity: 0.7, fontSize: "12px", marginBottom: "6px" }}>
              {walletIcon(connector.name)} {walletDisplayName(connector.name)}
            </div>
          )}

          <div className="wallet-address">{shortAddress}</div>

          <div className="wallet-balance">
            <span>PLPE</span>
            <strong>
              {loading
                ? t.common.loading
                : balance.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
            </strong>
          </div>

          <div className="wallet-balance">
            <span>{t.common.value}</span>
            <strong>
              ${walletValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div className="wallet-balance">
            <span>{t.common.share}</span>
            <strong>{share.toFixed(3)}%</strong>
          </div>

          <button
            className="wallet-button disconnect"
            onClick={() => {
              resetConnect();
              setShowWallets(false);
              disconnect();
            }}
          >
            {t.common.disconnect}
          </button>
        </>
      )}
    </div>
  );
}




