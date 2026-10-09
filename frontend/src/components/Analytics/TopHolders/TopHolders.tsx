import "./TopHolders.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "../../../hooks/useLanguage";

type HolderEntry = {
  wallet: string;
  balance: string;
  percent: number;
};

type NamedWalletEntry =
  HolderEntry & {
    name: string;
    type:
      | "project"
      | "liquidity";
  };

type ContractHolderEntry =
  HolderEntry & {
    type?: "contract";
  };

type HoldersResponse = {
  holders?: number;
  topHolders?: HolderEntry[];
  contractHolders?: ContractHolderEntry[];
  projectWallets?: NamedWalletEntry[];
  liquidityPool?: NamedWalletEntry;
};

function shortenWallet(
  wallet: string
) {
  if (
    !wallet ||
    wallet.length < 22
  ) {
    return wallet;
  }

  return `${wallet.slice(
    0,
    10
  )}...${wallet.slice(-8)}`;
}

function formatPlpe(
  value: string,
  locale: string
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "0 PLPE";
  }

  return `${new Intl.NumberFormat(
    locale,
    {
      maximumFractionDigits: 2,
    }
  ).format(amount)} PLPE`;
}

function formatPercent(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return "0%";
  }

  return `${value.toFixed(
    value >= 1
      ? 2
      : 4
  )}%`;
}

function TopHolders() {
  const { t } =
    useLanguage();

  const [
    data,
    setData,
  ] =
    useState<HoldersResponse | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState(false);

  const isPolish =
    t.analytics.topHoldersTitle
      .toLowerCase()
      .includes(
        "najwięksi"
      );

  const labels =
    useMemo(
      () =>
        isPolish
          ? {
              community:
                "👑 Najwięksi holderzy społeczności",

              communityDescription:
                "Portfele projektu, smart kontrakty i pula płynności są wykluczone z tego rankingu.",

              contracts:
                "📜 Smart Contract Holders",

              contractsDescription:
                "Adresy kontraktów wykryte on-chain przez eth_getCode. Nie są traktowane jako zwykłe portfele społeczności.",

              project:
                "🏛️ Portfele projektu",

              projectDescription:
                "Oficjalne portfele ekosystemu PolishPepe.",

              liquidity:
                "💧 Pula płynności",

              liquidityDescription:
                "Oficjalna para PLPE/WETH na Uniswap V2.",

              loading:
                "Ładowanie danych holderów...",

              error:
                "Nie udało się pobrać danych holderów.",

              noHolders:
                "Brak danych holderów.",
            }
          : {
              community:
                "👑 Top Community Holders",

              communityDescription:
                "Project wallets, smart contracts and the liquidity pool are excluded from this ranking.",

              contracts:
                "📜 Smart Contract Holders",

              contractsDescription:
                "Contract addresses detected on-chain with eth_getCode. They are not treated as normal community wallets.",

              project:
                "🏛️ Project Wallets",

              projectDescription:
                "Official PolishPepe ecosystem wallets.",

              liquidity:
                "💧 Liquidity Pool",

              liquidityDescription:
                "Official PLPE/WETH pair on Uniswap V2.",

              loading:
                "Loading holder data...",

              error:
                "Unable to load holder data.",

              noHolders:
                "No holder data available.",
            },
      [
        isPolish,
      ]
    );

  const locale =
    isPolish
      ? "pl-PL"
      : "en-US";

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const response =
          await fetch(
            `/api/holders?t=${Date.now()}`,
            {
              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const result: HoldersResponse =
          await response.json();

        if (
          cancelled
        ) {
          return;
        }

        setData(
          result
        );

        setError(
          false
        );
      } catch (err) {
        console.error(
          "[TOP HOLDERS] Failed:",
          err
        );

        if (
          !cancelled
        ) {
          setError(
            true
          );
        }
      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }

    load();

    const interval =
      window.setInterval(
        load,
        60_000
      );

    return () => {
      cancelled =
        true;

      window.clearInterval(
        interval
      );
    };
  }, []);

  const topHolders =
    data?.topHolders ??
    [];

  const contractHolders =
    data?.contractHolders ??
    [];

  const projectWallets =
    data?.projectWallets ??
    [];

  const liquidityPool =
    data?.liquidityPool;

  return (
    <div className="analytics-card top-holders-card">

      <section className="holders-section">
        <div className="holders-section-header">
          <div>
            <h2>
              {labels.community}
            </h2>

            <p>
              {labels.communityDescription}
            </p>
          </div>
        </div>

        {loading && (
          <div className="holders-state">
            {labels.loading}
          </div>
        )}

        {!loading &&
          error &&
          !data && (
            <div className="holders-state holders-error">
              {labels.error}
            </div>
          )}

        {!loading &&
          !error &&
          topHolders.length ===
            0 && (
            <div className="holders-state">
              {labels.noHolders}
            </div>
          )}

        {topHolders.length >
          0 && (
          <div className="holders-table">

            {topHolders.map(
              (
                holder,
                index
              ) => (
                <div
                  key={
                    holder.wallet
                  }
                  className="holder-table-row"
                >
                  <div className="holder-rank">
                    #{index + 1}
                  </div>

                  <div className="holder-wallet-column">
                    <a
                      href={`https://etherscan.io/address/${holder.wallet}`}
                      target="_blank"
                      rel="noreferrer"
                      className="holder-wallet-link"
                      title={
                        holder.wallet
                      }
                    >
                      {shortenWallet(
                        holder.wallet
                      )}
                    </a>

                    <div className="holder-progress">
                      <div
                        className="holder-progress-fill"
                        style={{
                          width: `${Math.min(
                            holder.percent,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="holder-balance-column">
                    <strong>
                      {formatPlpe(
                        holder.balance,
                        locale
                      )}
                    </strong>

                    <span>
                      {formatPercent(
                        holder.percent
                      )}
                    </span>
                  </div>
                </div>
              )
            )}

          </div>
        )}
      </section>

      {contractHolders.length >
        0 && (
        <>
          <div className="holders-divider" />

          <section className="holders-section">
            <div className="holders-section-header">
              <div>
                <h2>
                  {labels.contracts}
                </h2>

                <p>
                  {labels.contractsDescription}
                </p>
              </div>
            </div>

            <div className="project-wallet-table">
              {contractHolders.map(
                (holder) => (
                  <div
                    key={
                      holder.wallet
                    }
                    className="project-wallet-row contract-wallet-row"
                  >
                    <div className="project-wallet-identity">
                      <div className="contract-wallet-title">
                        <strong>
                          Smart Contract
                        </strong>

                        <span className="contract-badge">
                          CONTRACT
                        </span>
                      </div>

                      <a
                        href={`https://etherscan.io/address/${holder.wallet}`}
                        target="_blank"
                        rel="noreferrer"
                        title={
                          holder.wallet
                        }
                      >
                        {shortenWallet(
                          holder.wallet
                        )}
                      </a>
                    </div>

                    <div className="project-wallet-values">
                      <strong>
                        {formatPlpe(
                          holder.balance,
                          locale
                        )}
                      </strong>

                      <span>
                        {formatPercent(
                          holder.percent
                        )}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        </>
      )}

      <div className="holders-divider" />

      <section className="holders-section">
        <div className="holders-section-header">
          <div>
            <h2>
              {labels.project}
            </h2>

            <p>
              {labels.projectDescription}
            </p>
          </div>
        </div>

        <div className="project-wallet-table">
          {projectWallets.map(
            (wallet) => (
              <div
                key={
                  wallet.wallet
                }
                className="project-wallet-row"
              >
                <div className="project-wallet-identity">
                  <strong>
                    {wallet.name}
                  </strong>

                  <a
                    href={`https://etherscan.io/address/${wallet.wallet}`}
                    target="_blank"
                    rel="noreferrer"
                    title={
                      wallet.wallet
                    }
                  >
                    {shortenWallet(
                      wallet.wallet
                    )}
                  </a>
                </div>

                <div className="project-wallet-values">
                  <strong>
                    {formatPlpe(
                      wallet.balance,
                      locale
                    )}
                  </strong>

                  <span>
                    {formatPercent(
                      wallet.percent
                    )}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {liquidityPool && (
        <>
          <div className="holders-divider" />

          <section className="holders-section liquidity-section">
            <div className="holders-section-header">
              <div>
                <h2>
                  {labels.liquidity}
                </h2>

                <p>
                  {labels.liquidityDescription}
                </p>
              </div>
            </div>

            <div className="project-wallet-row liquidity-wallet-row">
              <div className="project-wallet-identity">
                <strong>
                  {liquidityPool.name}
                </strong>

                <a
                  href={`https://etherscan.io/address/${liquidityPool.wallet}`}
                  target="_blank"
                  rel="noreferrer"
                  title={
                    liquidityPool.wallet
                  }
                >
                  {shortenWallet(
                    liquidityPool.wallet
                  )}
                </a>
              </div>

              <div className="project-wallet-values">
                <strong>
                  {formatPlpe(
                    liquidityPool.balance,
                    locale
                  )}
                </strong>

                <span>
                  {formatPercent(
                    liquidityPool.percent
                  )}
                </span>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}

export default TopHolders;