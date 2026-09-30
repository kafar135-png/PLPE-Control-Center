import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getChallengeLeaderboard,
  getChallengeRegistrationMessage,
  getChallengeRegistrationStatus,
  submitChallengeRegistration,
  type ChallengeData,
  type ChallengeParticipant,
} from "../../services/challenge";

import { useLanguage } from "../../hooks/useLanguage";
import { useWallet } from "../../hooks/useWallet";

import ChallengeRulesModal from "./ChallengeRulesModal";

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
   ========================================================= */

function getSafeEntries(
  participant: ChallengeParticipant,
  maximumEntries = 6
) {
  const entries = Number(participant.entries);
  if (!Number.isFinite(entries)) return 0;
  return Math.max(0, Math.min(maximumEntries, Math.floor(entries)));
}

function getEntriesLabel(entries: number, maximumEntries = 6) {
  const safeEntries = Math.max(0, Math.min(maximumEntries, Math.floor(Number(entries) || 0)));
  return `🎟️ ${safeEntries}/${maximumEntries}`;
}

function getMedal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";

  return `#${rank}`;
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
  const {
    address: connectedWalletAddress,
    isConnected: walletConnected,
    signMessageAsync,
  } = useWallet();

  const walletAddress =
    walletConnected && connectedWalletAddress
      ? connectedWalletAddress.toLowerCase()
      : "";

  const [registered, setRegistered] = useState(false);
  const [excluded, setExcluded] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [rulesOpen, setRulesOpen] = useState(false);

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
     EFFECTS
     Wallet state is managed exclusively by wagmi.
     ======================================================= */

  useEffect(() => {
    loadChallenge(true);

    const interval = window.setInterval(() => {
      loadChallenge(false);
    }, REFRESH_INTERVAL);

    const onFocus = () => loadChallenge(false);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        loadChallenge(false);
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [loadChallenge]);
/* =======================================================
     PHASE #03 REGISTRATION
     ======================================================= */

  useEffect(() => {
    let cancelled = false;
    async function checkRegistration() {
      if (challenge?.phase.id !== "03" || !walletAddress) {
        if (!cancelled) { setRegistered(false); setExcluded(false); setRegistrationError(""); }
        return;
      }
      try {
        const result = await getChallengeRegistrationStatus(walletAddress);
        if (!cancelled) { setRegistered(Boolean(result.registered)); setExcluded(Boolean(result.excluded)); }
      } catch (err) { console.error("Challenge registration status:", err); }
    }
    checkRegistration();
    return () => { cancelled = true; };
  }, [challenge?.phase.id, walletAddress]);

  const registerForChallenge = useCallback(async () => {
    if (!walletAddress) { setRegistrationError("Connect your wallet first / Najpierw połącz portfel."); return; }
    try {
      setRegistering(true); setRegistrationError("");
      const nonce =
        await getChallengeRegistrationMessage(walletAddress);

      if (nonce.alreadyRegistered) {
        setRegistered(true);
        return;
      }

      const signature =
        await signMessageAsync({ message: nonce.message });
      await submitChallengeRegistration(walletAddress, signature);
      setRegistered(true); await loadChallenge(false);
    } catch (err) {
      console.error("Challenge registration:", err);
      setRegistrationError(err instanceof Error ? err.message : "Registration failed.");
    } finally { setRegistering(false); }
  }, [walletAddress, loadChallenge, signMessageAsync]);

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

            <h2>
              {t.challenge.monthlyTradingChallenge}
            </h2>

            <p>
              PLPE/WETH · {t.challenge.pairMinimumVolume}
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

  const isPhase03 = challenge.phase.id === "03";
  const maximumEntries = Number(challenge.rules?.maximumEntries) || (isPhase03 ? 8 : 6);
  const minimumBuy = Number(challenge.rules?.minimumBuyForEntry) || (isPhase03 ? 5 : 2);

  /* =======================================================
     LEADERBOARD SORT
     ======================================================= */

  const leaderboard =
    [
      ...(challenge.leaderboard || [])
    ]
      .sort((a, b) => {

        /* 1. ENTRIES */

        const entriesA =
          getSafeEntries(a, maximumEntries);

        const entriesB =
          getSafeEntries(b, maximumEntries);

        if (
          entriesA !==
          entriesB
        ) {
          return (
            entriesB -
            entriesA
          );
        }

        /* 2. PHASE-SPECIFIC SECONDARY RANKING */

        const secondA = isPhase03
          ? Number(a.netBuyVolume) || 0
          : Number(a.volume) || 0;

        const secondB = isPhase03
          ? Number(b.netBuyVolume) || 0
          : Number(b.volume) || 0;

        if (secondA !== secondB) {
          return secondB - secondA;
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
    challenge.phase.displayEnd || challenge.phase.end;

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

          <h2>
            {t.challenge.monthlyTradingChallenge}
          </h2>

         <p>
  PLPE/WETH · {isPhase03 ? t.challenge.pairMinimumBuy : t.challenge.pairMinimumVolume}
</p>

          <div
            className="challenge-phase-dates"
            style={{
              marginTop: "8px",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
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
            TRADE + REWARD
            ================================================= */}

        <div className="challenge-header-actions">

          <button type="button" className="challenge-trade-button" onClick={() => setRulesOpen(true)}>
            <span>📜</span><strong>RULES / REGULAMIN</strong><small>EN / PL</small>
          </button>

          <a
            href="https://app.uniswap.org/swap?chain=mainnet&inputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2&outputCurrency=0xc34e5ef4f7f5607fbd3e060077cd6e2161ab54c7"
            target="_blank"
            rel="noopener noreferrer"
            className="challenge-trade-button"
          >
            <span>
              ⚡
            </span>

            <strong>
              {t.challenge.tradePlpe}
            </strong>

            <small>
              PLPE / WETH
            </small>
          </a>

          <div className="challenge-reward">

            <span>
              {t.challenge.rewardPool}
            </span>

            <strong>${challenge.rewardPool?.total || (isPhase03 ? 200 : 100)}</strong>
            <small>{isPhase03 ? "🏆 $150 + 💎 $50 HOLDER" : "🥇 $50 · 🥈 $30 · 🥉 $20 ETH"}</small>

          </div>

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

          <strong>#{challenge.phase.id}</strong>
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
            {(isPhase03 ? t.challenge.minimumBuy : t.challenge.minimumVolume).toUpperCase()}
          </span>

          <strong>${minimumBuy}</strong>
        </div>

      </div>

      {isPhase03 && (
        <div className="challenge-next-phase" style={{ marginTop: "14px", marginBottom: "14px", padding: "12px 16px", borderRadius: "10px", border: "1px solid rgba(0, 255, 140, 0.20)", background: "rgba(0, 255, 140, 0.045)" }}>
          <strong>🔐 PHASE #03 WALLET REGISTRATION</strong>
          <div style={{ opacity: 0.82, marginTop: "6px", lineHeight: "1.6" }}>Only trades made after successful registration count. / Liczą się wyłącznie transakcje wykonane po rejestracji.</div>
          <div style={{ marginTop: "10px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {excluded ? <strong>⛔ PLPE OPERATIONAL WALLET — NOT ELIGIBLE</strong> : registered ? <strong>✅ REGISTERED — PHASE #03</strong> : (
              <button type="button" className="challenge-trade-button" onClick={registerForChallenge} disabled={registering || !walletAddress}>
                <span>🔐</span><strong>{registering ? "REGISTERING..." : "REGISTER FOR PHASE #03"}</strong><small>SIGN MESSAGE · NO GAS</small>
              </button>
            )}
            {walletAddress && <small>{shortenWallet(walletAddress)}</small>}
          </div>
          {registrationError && <div className="challenge-error" style={{ marginTop: "10px" }}>{registrationError}</div>}
        </div>
      )}

      {/* ===================================================
          RULES
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
          {t.challenge.entryRules}
        </strong>

        <div
          style={{
            opacity: 0.8,
            marginTop: "4px",
          }}
        >
          {isPhase03 ? `BUY ≥ $${minimumBuy} = 1 ENTRY · MAX ${maximumEntries} · SELL = 0 ENTRY · 🏆 RANKING: ① ENTRY → ② NET BUY → ③ TRADES → ④ WALLET` : t.challenge.entryRulesDescription}
        </div>

      </div>

      {/* ===================================================
          TABLE
          =================================================== */}

      <div className="challenge-table">

        <div
          className="challenge-table-head"
          style={
            isPhase03
              ? {
                  gridTemplateColumns:
                    "54px minmax(150px, 1.6fr) minmax(90px, .8fr) minmax(90px, .8fr) minmax(110px, .9fr) minmax(80px, .7fr) minmax(100px, .8fr)",
                }
              : undefined
          }
        >

          <span>
            #
          </span>

          <span>
            {t.challenge.wallet.toUpperCase()}
          </span>

          {isPhase03 ? (
            <>
              <span>BUY</span>
              <span>SELL</span>
              <span>📈 NET BUY #2</span>
            </>
          ) : (
            <span>
              {t.challenge.volume.toUpperCase()}
            </span>
          )}

          <span>
            {t.challenge.trades.toUpperCase()}
          </span>

          <span>
            {isPhase03
              ? "🎟️ ENTRY #1"
              : t.challenge.entries.toUpperCase()}
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
              {isPhase03 ? t.challenge.noQualifiedDescriptionPhase03 : t.challenge.noQualifiedDescription}
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
                  participant,
                  maximumEntries
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
                  style={
                    isPhase03
                      ? {
                          gridTemplateColumns:
                            "54px minmax(150px, 1.6fr) minmax(90px, .8fr) minmax(90px, .8fr) minmax(110px, .9fr) minmax(80px, .7fr) minmax(100px, .8fr)",
                        }
                      : undefined
                  }
                >

                  <div className="challenge-rank">

                    <span>
                      {getMedal(
                        participant.rank
                      )}
                    </span>

                  </div>

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

                  {isPhase03 ? (
                    <>
                      <div className="challenge-volume">
                        {formatVolume(
                          Number(participant.buyVolume) || 0
                        )}
                      </div>

                      <div className="challenge-volume">
                        {formatVolume(
                          Number(participant.sellVolume) || 0
                        )}
                      </div>

                      <div
                        className="challenge-volume"
                        style={{ fontWeight: 800 }}
                      >
                        {formatVolume(
                          Number(participant.netBuyVolume) || 0
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="challenge-volume">
                      {formatVolume(participant.volume)}
                    </div>
                  )}

                  <div className="challenge-trades">

                    {
                      participant.trades
                    }

                  </div>

                  <div className="challenge-entries">

                    {getEntriesLabel(
                      entries,
                      maximumEntries
                    )}

                  </div>

                </div>
              );
            }
          )

        )}

      </div>


      {isPhase03 && (
        <div className="challenge-holder">
          <div className="challenge-holder-head">
            <div>
              <strong>💎 {t.challenge.holderBonus}</strong>
              <span>{t.challenge.holderBonusDescription}</span>
            </div>
          </div>

          {(challenge.holderLeaderboard || []).length === 0 ? (
            <div className="challenge-empty" style={{ marginTop: "12px" }}>
              <strong>{t.challenge.noHolderQualified}</strong>
              <span>{t.challenge.noHolderQualifiedDescription}</span>
            </div>
          ) : (
            <div className="challenge-holder-list">
              {(challenge.holderLeaderboard || []).map((participant, index) => (
                <div key={`holder-${participant.wallet}`}>
                  <b>{getMedal(index + 1)}</b>
                  <code>{shortenWallet(participant.wallet)}</code>
                  <strong>{Number(participant.holdPercent || 0).toFixed(2)}%</strong>
                  <span>
                    {t.challenge.netBuy}: {formatVolume(Number(participant.netBuyVolume) || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          MY RESULT
          =================================================== */}

      {myParticipant && (

        <div className="challenge-my-result">

          <div className="my-result-title">

            🎯{" "}
            {t.challenge.qualifiedStatus}

          </div>

          <div
            className="my-result-grid"
            style={
              isPhase03
                ? {
                    gridTemplateColumns:
                      "repeat(6, minmax(90px, 1fr))",
                  }
                : undefined
            }
          >

            <div>

              <span>
                {t.challenge.rank.toUpperCase()}
              </span>

              <strong>
                #{myParticipant.rank}
              </strong>

            </div>

            {isPhase03 ? (
              <>
                <div>
                  <span>BUY</span>
                  <strong>
                    {formatVolume(
                      Number(myParticipant.buyVolume) || 0
                    )}
                  </strong>
                </div>

                <div>
                  <span>SELL</span>
                  <strong>
                    {formatVolume(
                      Number(myParticipant.sellVolume) || 0
                    )}
                  </strong>
                </div>

                <div>
                  <span>📈 NET BUY #2</span>
                  <strong>
                    {formatVolume(
                      Number(myParticipant.netBuyVolume) || 0
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    {t.challenge.trades.toUpperCase()}
                  </span>
                  <strong>
                    {myParticipant.trades}
                  </strong>
                </div>

                <div>
                  <span>🎟️ ENTRY #1</span>
                  <strong>
                    {getEntriesLabel(
                      getSafeEntries(
                        myParticipant,
                        maximumEntries
                      ),
                      maximumEntries
                    )}
                  </strong>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span>
                    {t.challenge.volume.toUpperCase()}
                  </span>
                  <strong>
                    {formatVolume(myParticipant.volume)}
                  </strong>
                </div>

                <div>
                  <span>
                    {t.challenge.entries.toUpperCase()}
                  </span>
                  <strong>
                    {getEntriesLabel(
                      getSafeEntries(
                        myParticipant,
                        maximumEntries
                      ),
                      maximumEntries
                    )}
                  </strong>
                </div>
              </>
            )}

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
              {isPhase03 ? t.challenge.portfolioNotQualifiedDescriptionPhase03 : t.challenge.portfolioNotQualifiedDescription}
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
          {isPhase03 ? `MAX ${maximumEntries} ENTRIES` : t.challenge.maxEntries.toUpperCase()}
        </span>

        <span>
          {t.challenge.onChainVerified}
        </span>

      </div>

      {rulesOpen && <ChallengeRulesModal onClose={() => setRulesOpen(false)} />}

    </section>
  );
}

export default ChallengeLeaderboard;





