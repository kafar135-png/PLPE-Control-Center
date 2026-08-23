import "./HolderProfile.css";

import WalletSearch from "../components/HolderProfile/WalletSearch";
import TransactionHistory from "../components/HolderProfile/TransactionHistory";

import { useSelectedWallet } from "../hooks/useSelectedWallet";
import { useWalletProfile } from "../hooks/useWalletProfile";
import { useWalletHistory } from "../hooks/useWalletHistory";
import { useLanguage } from "../hooks/useLanguage";
import CardTitle from "../components/UI/CardTitle/CardTitle";
import PortfolioPerformance from "../components/HolderProfile/PortfolioPerformance/PortfolioPerformance";

import {
  Wallet,
  Coins,
  PieChart,
  ChartColumn,
  TrendingUp,
} from "lucide-react";

export default function HolderProfile() {

  const { t } = useLanguage();

  const {
    address,
    isConnected,
    usingExternalWallet,
    connectedAddress,
  } = useSelectedWallet();

  const {
    balance,
    value,
    share,
    loading,
  } = useWalletProfile(address);

  const {
    history,
    loading: historyLoading,
    transactions,
    firstBuy,
    lastActivity,
    holdingDays,
    largestBuy,
    largestSell,
  } = useWalletHistory(address);

  let totalBought = 0;
  let totalSold = 0;

  history.forEach((tx: any) => {
    const amount =
      Number(tx.value) /
      Math.pow(10, Number(tx.tokenDecimal));

    if (
      tx.to?.toLowerCase() ===
      address?.toLowerCase()
    ) {
      totalBought += amount;
    }

    if (
      tx.from?.toLowerCase() ===
      address?.toLowerCase()
    ) {
      totalSold += amount;
    }
  });

  const netPosition = totalBought - totalSold;

  return (
    <div className="page">
      <h1>👤 {t.common.holderProfile}</h1>

      <WalletSearch />

      {!isConnected && !address && (
        <div className="profile-card">
          <h2>{t.holderProfile.noWalletSelected}</h2>
          <p>
            {t.holderProfile.noWalletDescription}
          </p>
        </div>
      )}

      {address && (
        <>
          {usingExternalWallet && (
            <div
              className="profile-card"
              style={{ marginBottom: 20 }}
            >
              <h2>{t.holderProfile.externalWalletAnalysis}</h2>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.connectedWallet}
                </span>

                <span className="profile-value">
                  {connectedAddress
                    ? `${connectedAddress.slice(
                        0,
                        8
                      )}...${connectedAddress.slice(-6)}`
                    : "-"}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.analyzedWallet}
                </span>

                <span className="profile-value yellow">
                  {address.slice(0, 8)}...
                  {address.slice(-6)}
                </span>
              </div>
            </div>
          )}
          <PortfolioPerformance />

          <div className="profile-grid">
            <div className="profile-card">
              <CardTitle
  icon={Wallet}
  title={t.holderProfile.wallet}
/>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.status}
                </span>

                <span className="profile-value green">
  {t.holderProfile.ready}
</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.address}
                </span>

                <span className="profile-value">
                  {address.slice(0, 8)}...
                  {address.slice(-6)}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.firstBuy}
                </span>

                <span className="profile-value">
                  {historyLoading
                    ? t.common.loading
                    : firstBuy}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.holdingDays}
                </span>

                <span className="profile-value">
                  {historyLoading
                    ? "-"
                    : holdingDays}
                </span>
              </div>
            </div>

            <div className="profile-card">
              <CardTitle
  icon={Coins}
  title={t.holderProfile.holdings}
/>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.plpeBalance}
</span>

                <span className="profile-value">
                  {loading
                    ? t.common.loading
                    : balance.toLocaleString(
                        undefined,
                        {
                          maximumFractionDigits: 0,
                        }
                      )}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.currentValue}
                </span>

                <span className="profile-value green">
                  $
                  {value.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            </div>

            <div className="profile-card">
              <CardTitle
  icon={PieChart}
  title={t.holderProfile.ownership}
/>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.supplyShare}
</span>

                <span className="profile-value">
                  {share.toFixed(4)}%
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.transactions}
</span>

                <span className="profile-value">
                  {historyLoading
                    ? t.common.loading
                    : transactions}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.lastActivity}
                </span>

                <span className="profile-value">
                  {historyLoading
                    ? "-"
                    : lastActivity}
                </span>
              </div>
            </div>

            <div className="profile-card">
              <CardTitle
  icon={ChartColumn}
  title={t.holderProfile.portfolioAnalytics}
/>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.largestBuy}
</span>

                <span className="profile-value green">
                  {largestBuy.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
                  {t.holderProfile.largestSell}
                </span>

                <span className="profile-value red">
                  {largestSell.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.portfolioAge}
</span>

                <span className="profile-value">
                  {holdingDays} 
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.activity}
</span>

                <span className="profile-value green">
  {t.holderProfile.active}
</span>
              </div>
            </div>

            <div className="profile-card">
              <CardTitle
  icon={TrendingUp}
  title={t.holderProfile.portfolioPerformance}
/>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.currentBalance}
</span>

                <span className="profile-value">
                  {balance.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.currentValue}
</span>

                <span className="profile-value green">
                  $
                  {value.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.totalBought}
</span>

                <span className="profile-value green">
                  {totalBought.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.totalSold}
                </span>

                <span className="profile-value red">
                  {totalSold.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>

              <div className="profile-row">
                <span className="profile-label">
  {t.holderProfile.netPosition}
</span>

                <span className="profile-value yellow">
                  {netPosition.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 0,
                    }
                  )}{" "}
                  PLPE
                </span>
              </div>
            </div>
          </div>

          <TransactionHistory
            history={history}
            address={address}
          />
        </>
      )}
    </div>
  );
}