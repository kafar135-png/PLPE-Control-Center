import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getChallengeLeaderboard,
  type ChallengeData,
  type ChallengeParticipant,
} from "../../services/challenge";

import { useLanguage } from "../../hooks/useLanguage";

import "./ChallengeLeaderboard.css";

const REFRESH_INTERVAL = 30000;

/* =========================================================
   HELPERS
   ========================================================= */

function shortenWallet(wallet: string) {
  if (!wallet) return "-";

  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function formatVolume(volume: number) {
  const safeVolume = Number(volume);

  if (
    !Number.isFinite(safeVolume) ||
    safeVolume < 0
  ) {
    return "$0.00";
  }

  return `$${safeVolume.toFixed(2)}`;
}

/* =========================================================
   ENTRIES
   =========================================================

   Backend liczy:

   BUY >= $2 -> +1 ENTRY
   BUY < $2  -> +0 ENTRY
   SELL      -> +0 ENTRY

   Maksymalnie 6 ENTRIES na portfel / fazę.

   BUY $2   -> 1 ENTRY
   BUY $5   -> 1 ENTRY
   BUY $10  -> 1 ENTRY
   BUY $100 -> 1 ENTRY

   SELL nigdy nie daje ENTRY.
   ========================================================= */

function getSafeEntries(
  participant: ChallengeParticipant
) {
  const backendEntries =
    Number(participant.entries);

  if (
    !Number.isFinite(
      backendEntries
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      6,
      Math.floor(
        backendEntries
      )
    )
  );
}

function getEntriesLabel(
  entries: number
) {
  const safeEntries =
    Math.max(
      0,
      Math.min(
        6,
        Math.floor(
          Number(entries) || 0
        )
      )
    );

  return `🎟️ ${safeEntries}`;
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";

  return `#${rank}`;
}

/* =========================================================
   PHASE NAME
   ========================================================= */

function getPhaseName(
  phase: ChallengeData["phase"],
  t: any
) {
  const phaseId =
    String(
      phase?.id ?? ""
    ).trim();

  const backendName =
    String(
      phase?.name ?? ""
    ).trim();

  /*
   * PHASE #01
   *
   * Backend:
   * id = "01"
   * name = "LAUNCH PHASE"
   *
   * Frontend:
   * FAZA STARTOWA
   */

  if (
    phaseId === "01" ||
    phaseId === "1" ||
    backendName.toUpperCase() ===
      "LAUNCH PHASE"
  ) {
    return t.challenge.launchPhase;
  }

  /*
   * PHASE #02
   *
   * Backend:
   * id = "02"
   * name = "MONTHLY CHALLENGE"
   *
   * Jeżeli tłumaczenie dla fazy miesięcznej
   * istnieje w locale, używamy go.
   */

  if (
    phaseId === "02" ||
    phaseId === "2" ||
    backendName.toUpperCase() ===
      "MONTHLY CHALLENGE"
  ) {
    return (
      t.challenge.monthlyChallenge ||
      backendName ||
      t.challenge.launchPhase
    );
  }

  /*
   * Fallback:
   * jeżeli backend kiedyś zwróci inną fazę,
   * pokazujemy jej nazwę.
   */

  return (
    backendName ||
    t.challenge.launchPhase
  );
}

/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatPhaseDate(
  dateString: string
) {
  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  const day =
    String(
      date.getUTCDate()
    ).padStart(2, "0");

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0");

  const year =
    date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}

function getNextPhaseEnd(
  phaseEnd: string
) {
  const currentEnd =
    new Date(phaseEnd);

  if (
    Number.isNaN(
      currentEnd.getTime()
    )
  ) {
    return "";
  }

  /*
   * Następna faza:
   *
   * start = koniec obecnej fazy
   * end   = ten sam dzień kolejnego miesiąca
   */

  const nextEnd =
    new Date(
      currentEnd
    );

  nextEnd.setUTCMonth(
    nextEnd.getUTCMonth() + 1
  );

  return nextEnd.toISOString();
}

/* =========================================================
   COMPONENT
   ========================================================= */

function ChallengeLeaderboard() {
  const { t } =
    useLanguage();

  const [
    challenge,
    setChallenge,
  ] =
    useState<ChallengeData | null>(
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
    useState("");

  const [
    walletAddress,
    setWalletAddress,
  ] =
    useState("");

  /* =======================================================
     LOAD CHALLENGE
     ======================================================= */

  const loadChallenge =
    useCallback(
      async (
        showLoading = false
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
          }

          setError("");

          const data =
            await getChallengeLeaderboard();

          setChallenge(data);
        } catch (err) {
          console.error(
            "Challenge Leaderboard:",
            err
          );

          setError(
            t.challenge.error
          );
        } finally {
          setLoading(false);
        }
      },
      [t]
    );

  /* =======================================================
     DETECT WALLET
     ======================================================= */

  const detectWallet =
    useCallback(
      async () => {
        try {
          const ethereum =
            (window as any)
              .ethereum;

          if (!ethereum) {
            return;
          }

          const accounts =
            await ethereum.request(
              {
                method:
                  "eth_accounts",
              }
            );

          if (
            Array.isArray(
              accounts
            ) &&
            accounts.length > 0
          ) {
            setWalletAddress(
              accounts[0].toLowerCase()
            );
          } else {
            setWalletAddress("");
          }
        } catch (err) {
          console.error(
            "Wallet detection:",
            err
          );
        }
      },
      []
    );

  /* =======================================================
     EFFECTS
     ======================================================= */

  useEffect(() => {
    loadChallenge(true);
    detectWallet();

    const interval =
      window.setInterval(
        () => {
          loadChallenge(false);
          detectWallet();
        },
        REFRESH_INTERVAL
      );

    const onFocus =
      () => {
        loadChallenge(false);
        detectWallet();
      };

    const onVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadChallenge(false);
          detectWallet();
        }
      };

    window.addEventListener(
      "focus",
      onFocus
    );

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    const ethereum =
      (window as any)
        .ethereum;

    const onAccountsChanged =
      (
        accounts: string[]
      ) => {
        if (
          Array.isArray(
            accounts
          ) &&
          accounts.length > 0
        ) {
          setWalletAddress(
            accounts[0].toLowerCase()
          );
        } else {
          setWalletAddress("");
        }

        loadChallenge(false);
      };

    if (ethereum?.on) {
      ethereum.on(
        "accountsChanged",
        onAccountsChanged
      );
    }

    return () => {
      clearInterval(
        interval
      );

      window.removeEventListener(
        "focus",
        onFocus
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );

      if (
        ethereum?.removeListener
      ) {
        ethereum.removeListener(
          "accountsChanged",
          onAccountsChanged
        );
      }
    };
  }, [
    loadChallenge,
    detectWallet,
  ]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <section className="challenge-card">

        <div className="challenge-loading">
          {t.challenge.loading}
        </div>

      </section>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <section className="challenge-card">

        <div className="challenge-header">

          <div>

            <div className="challenge-kicker">
              {t.challenge.title}
            </div>

            <h2>
              {t.challenge.launchPhase}
            </h2>

          </div>

        </div>

        <div className="challenge-error">
          {error}
        </div>

      </section>
    );
  }

  if (!challenge) {
    return null;
  }

  /* =======================================================
     PHASE NAME
     ======================================================= */

  const phaseName =
    getPhaseName(
      challenge.phase,
      t
    );

  /* =======================================================
     RANKING
     =======================================================

     PRIORYTET:

     1. ENTRIES
        Więcej entries = wyższa pozycja.

     2. VOLUME
        Przy tej samej liczbie entries
        większy volume = wyższa pozycja.

     3. TRANSACTIONS
        Przy entries i volume równych
        więcej transakcji = wyższa pozycja.

     4. WALLET
        Stabilny tie-breaker.

     Przykład:

     Wallet A:
       volume $4
       entries 2

     Wallet B:
       volume $10
       entries 0

     A jest wyżej.

     ======================================================= */

  const leaderboard =
    [...(challenge.leaderboard || [])]
      .sort((a, b) => {
        const entriesA =
          getSafeEntries(a);

        const entriesB =
          getSafeEntries(b);

        /*
         * 1. ENTRIES
         */

        if (
          entriesB !==
          entriesA
        ) {
          return (
            entriesB -
            entriesA
          );
        }

        /*
         * 2. VOLUME
         */

        const volumeA =
          Number(a.volume) || 0;

        const volumeB =
          Number(b.volume) || 0;

        if (
          volumeB !==
          volumeA
        ) {
          return (
            volumeB -
            volumeA
          );
        }

        /*
         * 3. TRANSACTIONS
         */

        const tradesA =
          Number(a.trades) || 0;

        const tradesB =
          Number(b.trades) || 0;

        if (
          tradesB !==
          tradesA
        ) {
          return (
            tradesB -
            tradesA
          );
        }

        /*
         * 4. WALLET
         * Stabilny tie-breaker.
         */

        return a.wallet.localeCompare(
          b.wallet
        );
      })
      .map(
        (
          participant,
          index
        ) => ({
          ...participant,
          rank:
            index + 1,
        })
      );

  /* =======================================================
     MY WALLET
     ======================================================= */

  const normalizedWallet =
    walletAddress.toLowerCase();

  const myParticipant:
    | ChallengeParticipant
    | undefined =
    leaderboard.find(
      (
        participant
      ) =>
        participant.wallet
          .toLowerCase() ===
        normalizedWallet
    );

  /* =======================================================
     PHASE DATES
     ======================================================= */

  const phaseStart =
    challenge.phase.start;

  const phaseEnd =
    challenge.phase.end;

  const nextPhaseStart =
    phaseEnd;

  const nextPhaseEnd =
    getNextPhaseEnd(
      phaseEnd
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <section className="challenge-card">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="challenge-header">

        <div className="challenge-title-block">

          <div className="challenge-kicker">
            {t.challenge.title}
          </div>

          <h2>
            {phaseName}
          </h2>

          <p>
            PLPE/WETH · $2 minimum volume
          </p>

          {/* CURRENT PHASE */}

          <div
            className="challenge-phase-dates"
            style={{
              marginTop: "10px",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            🏆{" "}
            <strong>
              {phaseName}
            </strong>{" "}
            ·{" "}
            {formatPhaseDate(
              phaseStart
            )}{" "}
            →{" "}
            {formatPhaseDate(
              phaseEnd
            )}
          </div>

        </div>

        {/* =================================================
            REWARD
            ================================================= */}

        <div className="challenge-reward">

          <span>
            {t.challenge.rewardPool}
          </span>

          <strong>
            $100
          </strong>

          <small>
            🥇 $50 · 🥈 $30 · 🥉 $20 ETH
          </small>

        </div>

      </div>

      {/* ===================================================
          STATS
          =================================================== */}

      <div className="challenge-info">

        <div>
          <span>
            {t.challenge.phase.toUpperCase()}
          </span>

          <strong>
            #{challenge.phase.id}
          </strong>
        </div>

        <div>
          <span>
            {t.challenge.trades.toUpperCase()}
          </span>

          <strong>
            {challenge.stats.verifiedTrades}
          </strong>
        </div>

        <div>
          <span>
            {t.challenge.qualified.toUpperCase()}
          </span>

          <strong>
            {challenge.stats.qualifiedWallets}
          </strong>
        </div>

        <div>
          <span>
            {t.challenge.minimumVolume.toUpperCase()}
          </span>

          <strong>
            $2
          </strong>
        </div>

      </div>

      {/* ===================================================
          NEXT PHASE
          =================================================== */}

      <div
        className="challenge-next-phase"
        style={{
          marginTop: "14px",
          marginBottom: "14px",
          padding: "12px 16px",
          borderRadius: "10px",
          border:
            "1px solid rgba(0, 255, 140, 0.15)",
          background:
            "rgba(0, 255, 140, 0.035)",
          fontSize: "13px",
          lineHeight: "1.6",
        }}
      >
        🚀{" "}
        <strong>
          NASTĘPNA FAZA
        </strong>{" "}
        {formatPhaseDate(
          nextPhaseStart
        )}{" "}
        →{" "}
        {formatPhaseDate(
          nextPhaseEnd
        )}

        <div
          style={{
            opacity: 0.65,
            marginTop: "2px",
          }}
        >
          Po rozpoczęciu następnej fazy wolumen, transakcje i losy
          zostaną wyzerowane. Każdy portfel zaczyna od zera.
        </div>
      </div>

      {/* ===================================================
          TABLE
          =================================================== */}

      <div className="challenge-table">

        <div className="challenge-table-head">

          <span>
            #
          </span>

          <span>
            {t.challenge.wallet.toUpperCase()}
          </span>

          <span>
            {t.challenge.volume.toUpperCase()}
          </span>

          <span>
            {t.challenge.trades.toUpperCase()}
          </span>

          <span>
            {t.challenge.entries.toUpperCase()}
          </span>

        </div>

        {leaderboard.length === 0 ? (

          <div className="challenge-empty">

            <div>
              🐸
            </div>

            <strong>
              {t.challenge.noQualified}
            </strong>

            <span>
              {t.challenge.noQualifiedDescription}
            </span>

          </div>

        ) : (

          leaderboard.map(
            (
              participant
            ) => {

              const isMe =
                Boolean(
                  normalizedWallet &&
                  participant.wallet
                    .toLowerCase() ===
                    normalizedWallet
                );

              const entries =
                getSafeEntries(
                  participant
                );

              return (
                <div
                  key={
                    participant.wallet
                  }
                  className={
                    `challenge-row ${
                      isMe
                        ? "is-me"
                        : ""
                    }`
                  }
                >

                  {/* RANK */}

                  <div className="challenge-rank">

                    <span>
                      {getMedal(
                        participant.rank
                      )}
                    </span>

                  </div>

                  {/* WALLET */}

                  <div className="challenge-wallet">

                    <span>
                      {shortenWallet(
                        participant.wallet
                      )}
                    </span>

                    {isMe && (
                      <b>
                        {t.challenge.qualifiedStatus}
                      </b>
                    )}

                  </div>

                  {/* VOLUME */}

                  <div className="challenge-volume">

                    {formatVolume(
                      participant.volume
                    )}

                  </div>

                  {/* TRANSACTIONS */}

                  <div className="challenge-trades">

                    {participant.trades}

                  </div>

                  {/* ENTRIES */}

                  <div className="challenge-entries">

                    {getEntriesLabel(
                      entries
                    )}

                  </div>

                </div>
              );
            }
          )

        )}

      </div>

      {/* ===================================================
          MY RESULT
          =================================================== */}

      {myParticipant && (

        <div className="challenge-my-result">

          <div className="my-result-title">
            🎯{" "}
            {t.challenge.qualifiedStatus}
          </div>

          <div className="my-result-grid">

            <div>

              <span>
                {t.challenge.rank.toUpperCase()}
              </span>

              <strong>
                #{myParticipant.rank}
              </strong>

            </div>

            <div>

              <span>
                {t.challenge.volume.toUpperCase()}
              </span>

              <strong>
                {formatVolume(
                  myParticipant.volume
                )}
              </strong>

            </div>

            <div>

              <span>
                {t.challenge.entries.toUpperCase()}
              </span>

              <strong>
                {getEntriesLabel(
                  getSafeEntries(
                    myParticipant
                  )
                )}
              </strong>

            </div>

          </div>

        </div>

      )}

      {/* ===================================================
          NOT QUALIFIED
          =================================================== */}

      {!myParticipant &&
        walletAddress && (

          <div className="challenge-not-qualified">

            <strong>
              👛{" "}
              {t.challenge.portfolioNotQualified}
            </strong>

            <span>
              {t.challenge.portfolioNotQualifiedDescription}
            </span>

          </div>

        )}

      {/* ===================================================
          FOOTER
          =================================================== */}

      <div className="challenge-footer">

        <span>
          🔴 {t.challenge.live}
        </span>

        <span>
          {t.challenge.maxEntries}
        </span>

        <span>
          {t.challenge.onChainVerified}
        </span>

      </div>

    </section>
  );
}

export default ChallengeLeaderboard;
