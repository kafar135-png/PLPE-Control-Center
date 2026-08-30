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

   REGULAMIN FAZY 02:

   BUY >= $2  = 1 ENTRY
   BUY < $2   = 0 ENTRY
   SELL       = 0 ENTRY

   Maksymalnie:
   6 ENTRIES / WALLET / FAZA

   Ważne:
   $2, $5, $10, $100 BUY
   = zawsze 1 ENTRY.

   ENTRY nie zależy od wielkości BUY.
   ========================================================= */

function getSafeEntries(
  participant: ChallengeParticipant
) {
  const entries =
    Number(participant.entries);

  if (!Number.isFinite(entries)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      6,
      Math.floor(entries)
    )
  );
}

function getEntriesLabel(entries: number) {
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

  return `🎟️ ${safeEntries}/6`;
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";

  return `#${rank}`;
}

/* =========================================================
   PHASE
   ========================================================= */

function getPhaseName(
  phase: ChallengeData["phase"]
) {
  /*
   * FAZA 02 jest jedyną aktywną fazą.
   *
   * Backend powinien zwracać:
   *
   * id   = "02"
   * name = "MONTHLY CHALLENGE"
   */

  if (
    String(phase?.id) === "02" ||
    String(phase?.id) === "2"
  ) {
    return "MONTHLY CHALLENGE";
  }

  /*
   * Nie tworzymy tutaj FAZY 01.
   *
   * Jeżeli backend zwróci coś nieoczekiwanego,
   * pokazujemy nazwę z backendu.
   */

  return (
    String(
      phase?.name || ""
    ).trim() ||
    "MONTHLY CHALLENGE"
  );
}

/* =========================================================
   DATE
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
            (window as any).ethereum;

          if (!ethereum) {
            setWalletAddress("");
            return;
          }

          const accounts =
            await ethereum.request({
              method:
                "eth_accounts",
            });

          if (
            Array.isArray(accounts) &&
            accounts.length > 0
          ) {
            setWalletAddress(
              String(
                accounts[0]
              ).toLowerCase()
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
      window.setInterval(() => {
        loadChallenge(false);
        detectWallet();
      }, REFRESH_INTERVAL);

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
      (window as any).ethereum;

    const onAccountsChanged =
      (
        accounts: string[]
      ) => {
        if (
          Array.isArray(accounts) &&
          accounts.length > 0
        ) {
          setWalletAddress(
            String(
              accounts[0]
            ).toLowerCase()
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
      window.clearInterval(
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

          <div className="challenge-title-block">

            <div className="challenge-kicker">
              {t.challenge.title}
            </div>

            <h2>
              MONTHLY CHALLENGE
            </h2>

            <p>
              PLPE/WETH · $2 minimum volume
            </p>

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
     PHASE
     ======================================================= */

  const phaseName =
    getPhaseName(
      challenge.phase
    );

  /* =======================================================
     LEADERBOARD SORT
     =======================================================

     Kolejność:

     1. ENTRIES — więcej = wyżej
     2. VOLUME — więcej = wyżej
     3. TRANSACTIONS — więcej = wyżej
     4. WALLET — stabilny tie-breaker

     Przykład:

     A = $4 volume / 2 entries
     B = $10 volume / 0 entries

     A jest wyżej.
     ======================================================= */

  const leaderboard =
    [
      ...(challenge.leaderboard || [])
    ]
      .sort((a, b) => {

        /* 1. ENTRIES */

        const entriesA =
          getSafeEntries(a);

        const entriesB =
          getSafeEntries(b);

        if (
          entriesA !==
          entriesB
        ) {
          return (
            entriesB -
            entriesA
          );
        }

        /* 2. VOLUME */

        const volumeA =
          Number(a.volume) || 0;

        const volumeB =
          Number(b.volume) || 0;

        if (
          volumeA !==
          volumeB
        ) {
          return (
            volumeB -
            volumeA
          );
        }

        /* 3. TRANSACTIONS */

        const tradesA =
          Number(a.trades) || 0;

        const tradesB =
          Number(b.trades) || 0;

        if (
          tradesA !==
          tradesB
        ) {
          return (
            tradesB -
            tradesA
          );
        }

        /* 4. WALLET */

        return String(
          a.wallet || ""
        ).localeCompare(
          String(
            b.wallet || ""
          )
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
      (participant) =>
        String(
          participant.wallet || ""
        ).toLowerCase() ===
        normalizedWallet
    );

  /* =======================================================
     PHASE DATES
     ======================================================= */

  const phaseStart =
    challenge.phase.start;

  const phaseEnd =
    challenge.phase.end;

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
            #02
          </strong>
        </div>

        <div>
          <span>
            {t.challenge.trades.toUpperCase()}
          </span>

          <strong>
            {
              challenge.stats
                .verifiedTrades
            }
          </strong>
        </div>

        <div>
          <span>
            {t.challenge.qualified.toUpperCase()}
          </span>

          <strong>
            {
              challenge.stats
                .qualifiedWallets
            }
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
          CHALLENGE RULES
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

        🎟️{" "}
        <strong>
          ZASADY ENTRY
        </strong>

        <div
          style={{
            opacity: 0.8,
            marginTop: "4px",
          }}
        >
          BUY ≥ $2 = 1 ENTRY · BUY &lt; $2 = 0
          ENTRY · SELL = 0 ENTRY · MAX 6 ENTRY
          / WALLET
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

              const participantWallet =
                String(
                  participant.wallet ||
                    ""
                ).toLowerCase();

              const isMe =
                Boolean(
                  normalizedWallet &&
                  participantWallet ===
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

                  {/* TRADES */}

                  <div className="challenge-trades">

                    {
                      participant.trades
                    }

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
          MAX 6 ENTRIES
        </span>

        <span>
          {t.challenge.onChainVerified}
        </span>

      </div>

    </section>
  );
}

export default ChallengeLeaderboard;
