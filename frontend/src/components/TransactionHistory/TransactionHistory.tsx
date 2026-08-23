type Props = {
  history: any[];
  address?: string;
};

export default function TransactionHistory({
  history,
  address,
}: Props) {
  return (
    <div className="profile-card">

      <h2>Portfolio Timeline</h2>

      <div
        style={{
          maxHeight: 420,
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
              address?.toLowerCase();

            const isSell =
              tx.from?.toLowerCase() ===
              address?.toLowerCase();

            return (
              <div
                key={index}
                className="profile-row"
              >
                <span>
                  {isBuy
                    ? "🟢 BUY"
                    : isSell
                    ? "🔴 SELL"
                    : "🔄"}{" "}
                  {new Date(
                    Number(tx.timeStamp) * 1000
                  ).toLocaleDateString()}
                </span>

                <span
                  className={
                    isBuy
                      ? "profile-value green"
                      : isSell
                      ? "profile-value red"
                      : "profile-value"
                  }
                >
                  {amount.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  PLPE
                </span>
              </div>
            );
          })}
      </div>

    </div>
  );
}