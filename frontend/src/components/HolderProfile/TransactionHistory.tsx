import { useLanguage } from "../../hooks/useLanguage";

type Props = {
  history: any[];
  address: string;
};

export default function TransactionHistory({
  history,
  address,
}: Props) {
  const { t } = useLanguage();

  if (!history.length) {
    return (
      <div className="profile-card">
        <h2>{t.holderProfile.portfolioTimeline}</h2>

        <p>{t.holderProfile.noTransactions}</p>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2>{t.holderProfile.portfolioTimeline}</h2>

      <div
        style={{
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        {history
          .slice()
          .reverse()
          .map((tx, index) => {
            const amount =
              Number(tx.value) /
              Math.pow(
                10,
                Number(tx.tokenDecimal)
              );

            const isBuy =
              tx.to?.toLowerCase() ===
              address.toLowerCase();

            return (
              <div
                key={index}
                className="profile-row"
                style={{
                  padding: "14px 0",
                  borderBottom:
                    "1px solid #2b3650",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: isBuy
                        ? "#22c55e"
                        : "#ef4444",
                    }}
                  >
                    {isBuy
                      ? t.holderProfile.buy
                      : t.holderProfile.sell}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                    }}
                  >
                    {new Date(
                      Number(tx.timeStamp) * 1000
                    ).toLocaleString()}
                  </div>

                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      color: "#60a5fa",
                      textDecoration: "none",
                    }}
                  >
                    {tx.hash.slice(0, 14)}...
                  </a>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    className={
                      isBuy
                        ? "profile-value green"
                        : "profile-value"
                    }
                  >
                    {amount.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 13,
                    }}
                  >
                    PLPE
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}