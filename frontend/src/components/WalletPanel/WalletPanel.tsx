import { useWallet } from "../../hooks/useWallet";
import { usePLPEBalance } from "../../hooks/usePLPEBalance";
import { useMarketData } from "../../hooks/useMarketData";
import { useLanguage } from "../../hooks/useLanguage";
import "./WalletPanel.css";

const TOTAL_SUPPLY = 1_000_000_000;

export default function WalletPanel() {
  const {
    address,
    isConnected,
    connect,
    connectors,
    disconnect,
    isPending,
  } = useWallet();

  const { balance, loading } = usePLPEBalance(address);
  const { data } = useMarketData();
  const { t } = useLanguage();

  const injectedConnector = connectors.find(
    (connector) => connector.type === "injected"
  );

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const walletValue =
    data && balance ? balance * data.price : 0;

  const share =
    balance ? (balance / TOTAL_SUPPLY) * 100 : 0;

  return (
    <div className="wallet-panel">
      <div className="wallet-title">
        {t.common.wallet}
      </div>

      {!isConnected ? (
        <>
          <div className="wallet-status disconnected">
            ⚪ {t.common.disconnected}
          </div>

          <button
            className="wallet-button"
            onClick={() =>
              injectedConnector &&
              connect({
                connector: injectedConnector,
              })
            }
            disabled={isPending}
          >
            {isPending
              ? t.common.connecting
              : t.common.connectWallet}
          </button>
        </>
      ) : (
        <>
          <div className="wallet-status connected">
            🟢 {t.common.connected}
          </div>

          <div className="wallet-address">
            {shortAddress}
          </div>

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
              $
              {walletValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </div>

          <div className="wallet-balance">
            <span>{t.common.share}</span>

            <strong>
              {share.toFixed(3)}%
            </strong>
          </div>

          <button
            className="wallet-button disconnect"
            onClick={() => disconnect()}
          >
            {t.common.disconnect}
          </button>
        </>
      )}
    </div>
  );
}