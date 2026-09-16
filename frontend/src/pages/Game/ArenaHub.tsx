import { useCallback, useEffect, useMemo, useState } from "react";
import "./BuildingHubShared.css";
import "./ArenaHub.css";

import arenaBg from "../../assets/game/arena_hub_bg.png";
import bearScout from "../../assets/game/char_bear_scout.png";
import bearElite from "../../assets/game/char_bear_elite.png";
import bearCommander from "../../assets/game/char_bear_commander.png";

import { useLanguage } from "../../hooks/useLanguage";
import {
  clearGameAuth,
  getGameAuthToken,
  getGameChallenges,
  getGameProfile,
  getGameRanking,
  getActiveGameMatch,
  getGameMatchHistory,
  getOnlineGamePlayers,
  logoutGame,
  respondToGameChallenge,
  sendGameChallenge,
  sendGamePresenceHeartbeat,
  shortWallet,
  syncGameProgression,
  updateGameNickname,
} from "../../services/gameMultiplayer";
import type {
  GameChallenge,
  GameMatchLobby,
  GamePlayerProfile,
} from "../../services/gameMultiplayer";

import TacticalBattle from "./TacticalBattle";
import PvpBattle from "./PvpBattle";
import { awardGlobalReward, useGameProgress } from "./Progress";
import { loadCurrentPveLoadout } from "./BattleLoadout";

interface Props {
  playerLevel: number;
  playerXp: number;
  playerXpRequired: number;
  memeEnergy: number;
  relics: number;
  intel: number;
  chapter1Completed: boolean;
  onStartRankedBattle: (opponentId?: string) => void;
  onBack: () => void;
}

type ArenaTab = "training" | "pvp" | "ranking" | "history";

type Foe = {
  id: string;
  name: string;
  level: number;
  enemyGroupId: string;
  desc: string;
  xp: number;
  crowns: number;
  relicChance: number;
  image: string;
};

const TRAINING_KEY = "plpe-arena-training-v2";
const TRAINING_COOLDOWN = 12 * 60 * 60 * 1000;

function loadTrainingCooldowns() {
  try {
    return JSON.parse(
      localStorage.getItem(TRAINING_KEY) || "{}"
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

function formatCooldown(ms: number, polish: boolean) {
  if (ms <= 0) return polish ? "GOTOWY" : "READY";

  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function displayName(player: GamePlayerProfile | null | undefined) {
  if (!player) return "Unknown";
  return player.nickname || shortWallet(player.walletAddress);
}

function statusLabel(player: GamePlayerProfile, polish: boolean) {
  if (player.presenceStatus === "in_battle") {
    return polish ? "W WALCE" : "IN BATTLE";
  }

  return polish ? "ONLINE" : "ONLINE";
}


function classLabel(player: GamePlayerProfile, polish: boolean) {
  if (player.specialization === "warrior") return polish ? "⚔️ Wojownik" : "⚔️ Warrior";
  if (player.specialization === "ranger") return polish ? "🏹 Łucznik" : "🏹 Ranger";
  if (player.specialization === "mage") return polish ? "🧙 Mag" : "🧙 Mage";
  return polish ? "Bez klasy" : "No class";
}

export default function ArenaHub(p: Props) {
  const { progress } = useGameProgress();
  const pveLoadout = useMemo(() => loadCurrentPveLoadout(progress), [progress]);
  const { language } = useLanguage();
  const polish = language === "pl";
  const [tab, setTab] = useState<ArenaTab>("training");
  const [cooldowns, setCooldowns] = useState(loadTrainingCooldowns);
  const [selectedFoe, setSelectedFoe] = useState<Foe | null>(null);
  const [, setClockTick] = useState(0);

  const [profile, setProfile] = useState<GamePlayerProfile | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<GamePlayerProfile[]>([]);
  const [ranking, setRanking] = useState<GamePlayerProfile[]>([]);
  const [matchHistory, setMatchHistory] = useState<GameMatchLobby[]>([]);
  const [incoming, setIncoming] = useState<GameChallenge[]>([]);
  const [outgoing, setOutgoing] = useState<GameChallenge[]>([]);
  const [nickname, setNickname] = useState("");
  const [multiplayerBusy, setMultiplayerBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [matchLobby, setMatchLobby] = useState<GameMatchLobby | null>(null);

  const copy = useMemo(
    () =>
      polish
        ? {
            eyebrow: "KLASZTOR · ARENA",
            title: "Arena PLPE",
            back: "← WRÓĆ DO HUBU",
            training: "TRENING",
            pvp: "GRACZE ONLINE",
            ranking: "RANKING",
            history: "HISTORIA",
            trainingTitle: "Trzy pojedynki treningowe",
            trainingText:
              "Każdy przeciwnik daje nagrody raz na 12 godzin. Porażka nie uruchamia cooldownu.",
            startTraining: "ROZPOCZNIJ TRENING",
            refresh: "ODNOWIENIE",
            loginNeeded: "Sesja gry wygasła. Wróć do ekranu startowego i zaloguj się ponownie.",
            profile: "PROFIL GRACZA",
            nickname: "Nick gracza",
            saveNickname: "ZAPISZ NICK",
            logout: "WYLOGUJ Z GRY",
            onlineNow: "GRACZE ONLINE",
            noPlayers: "Brak innych dostępnych graczy online.",
            challenge: "WYZWANIE",
            busy: "W WALCE",
            incoming: "PRZYCHODZĄCE WYZWANIA",
            outgoing: "WYSŁANE WYZWANIA",
            accept: "AKCEPTUJ",
            decline: "ODRZUĆ",
            pending: "OCZEKUJE",
            wins: "Wygrane",
            losses: "Porażki",
            winRate: "Win rate",
            rating: "Rating",
            streak: "Seria",
            battles: "Walki PvP",
            rankTitle: "GLOBALNY RANKING",
            rankText: "Ranking bazuje na ratingu PvP. Wyniki walk będą zapisywane przez backend.",
            challengeSent: "Wyzwanie wysłane.",
            challengeDeclined: "Wyzwanie odrzucone.",
            lobbyCreated: "Wyzwanie zaakceptowane. Utworzono lobby PvP.",
            lobbyStage:
              "Mecz jest aktywny i synchronizowany przez backend.",
            historyTitle: "HISTORIA WALK",
          }
        : {
            eyebrow: "MONASTERY · ARENA",
            title: "PLPE Arena",
            back: "← BACK TO HUB",
            training: "TRAINING",
            pvp: "ONLINE PLAYERS",
            ranking: "RANKING",
            history: "HISTORIA",
            trainingTitle: "Three training duels",
            trainingText:
              "Each opponent rewards you once every 12 hours. A defeat does not start the cooldown.",
            startTraining: "START TRAINING",
            refresh: "REFRESH IN",
            loginNeeded: "Your game session expired. Return to the start screen and log in again.",
            profile: "PLAYER PROFILE",
            nickname: "Player nickname",
            saveNickname: "SAVE NICKNAME",
            logout: "LOG OUT OF GAME",
            onlineNow: "PLAYERS ONLINE",
            noPlayers: "No other available players are online.",
            challenge: "CHALLENGE",
            busy: "IN BATTLE",
            incoming: "INCOMING CHALLENGES",
            outgoing: "SENT CHALLENGES",
            accept: "ACCEPT",
            decline: "DECLINE",
            pending: "PENDING",
            wins: "Wins",
            losses: "Losses",
            winRate: "Win rate",
            rating: "Rating",
            streak: "Streak",
            battles: "PvP battles",
            rankTitle: "GLOBAL RANKING",
            rankText: "Ranking is based on PvP rating. Match results will be persisted by the backend.",
            challengeSent: "Challenge sent.",
            challengeDeclined: "Challenge declined.",
            lobbyCreated: "Challenge accepted. PvP lobby created.",
            lobbyStage:
              "The match is active and synchronized by the backend.",
            historyTitle: "MATCH HISTORY",
          },
    [polish]
  );

  const foes = useMemo<Foe[]>(
    () => [
      {
        id: "arena-scout",
        name: "Borys — Bear Scout",
        level: 1,
        enemyGroupId: "bear-scout",
        desc: polish
          ? "Łatwy trening: reakcja, blok i pojedynczy cel."
          : "Easy training: reactions, blocking and a single target.",
        xp: 60,
        crowns: 35,
        relicChance: 0.12,
        image: bearScout,
      },
      {
        id: "arena-elite",
        name: "Granit — Bear Elite",
        level: 2,
        enemyGroupId: "bear-elite",
        desc: polish
          ? "Średni trening: większa obrona i cięższe uderzenia."
          : "Medium training: tougher defense and heavier attacks.",
        xp: 120,
        crowns: 70,
        relicChance: 0.28,
        image: bearElite,
      },
      {
        id: "arena-command",
        name: "Ursus — Bear Commander",
        level: 3,
        enemyGroupId: "bear-command-group",
        desc: polish
          ? "Trudny trening: kontrola Bociana, tarcza i Spirit są potrzebne."
          : "Hard training: Bocian control, shields and Spirit are essential.",
        xp: 220,
        crowns: 130,
        relicChance: 0.48,
        image: bearCommander,
      },
    ],
    [polish]
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClockTick((current) => current + 1);
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const refreshMultiplayer = useCallback(async () => {
    if (!getGameAuthToken()) return;

    const [nextProfile, online, challenges, activeMatch] = await Promise.all([
      getGameProfile(),
      getOnlineGamePlayers(),
      getGameChallenges(),
      getActiveGameMatch(),
    ]);

    setProfile(nextProfile);
    setNickname(nextProfile.nickname || "");
    setOnlinePlayers(
      online.players.filter(
        (player) =>
          player.walletAddress.toLowerCase() !==
          nextProfile.walletAddress.toLowerCase()
      )
    );
    setIncoming(challenges.incoming);
    setOutgoing(challenges.outgoing);
    setMatchLobby(activeMatch);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getGameAuthToken()) {
        if (!cancelled) {
          setProfile(null);
          setOnlinePlayers([]);
          setIncoming([]);
          setOutgoing([]);
        }
        return;
      }

      try {
        await sendGamePresenceHeartbeat("online");
        await refreshMultiplayer();
      } catch {
        clearGameAuth();
        if (!cancelled) setProfile(null);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [refreshMultiplayer]);

  useEffect(() => {
    if (tab !== "pvp" || !profile) return;

    void syncGameProgression({
      level: progress.polishPepe.level,
      xp: progress.polishPepe.xp,
      hp: progress.polishPepe.hp,
      attack: progress.polishPepe.attack,
      defense: progress.polishPepe.defense,
      speed: progress.polishPepe.speed,
    }).catch((cause: unknown) => {
      console.warn("[PLPE GAME] Progression sync failed", cause);
    });

    const timer = window.setInterval(() => {
      void (async () => {
        try {
          await sendGamePresenceHeartbeat(
            matchLobby ? "in_battle" : "online"
          );
          await refreshMultiplayer();
        } catch (cause) {
          console.warn("[PLPE GAME] Multiplayer refresh failed", cause);
        }
      })();
    }, 10_000);

    return () => window.clearInterval(timer);
  }, [tab, profile, matchLobby, refreshMultiplayer]);

  useEffect(() => {
    if (tab !== "ranking") return;

    void getGameRanking(50)
      .then(setRanking)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Ranking error");
      });
  }, [tab]);

  useEffect(() => {
    if (tab !== "history" || !profile) return;
    void getGameMatchHistory(30)
      .then(setMatchHistory)
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Match history error");
      });
  }, [tab, profile]);

  async function handleNicknameSave() {
    setMultiplayerBusy(true);
    setError("");

    try {
      const nextProfile = await updateGameNickname(nickname);
      setProfile(nextProfile);
      setNickname(nextProfile.nickname || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nickname update failed");
    } finally {
      setMultiplayerBusy(false);
    }
  }

  async function handleLogout() {
    setMultiplayerBusy(true);

    try {
      await logoutGame();
    } catch (cause) {
      console.warn("[PLPE GAME] Logout request failed", cause);
    } finally {
      setProfile(null);
      setOnlinePlayers([]);
      setIncoming([]);
      setOutgoing([]);
      setMatchLobby(null);
      setMultiplayerBusy(false);
    }
  }

  async function handleChallenge(walletAddress: string) {
    setMultiplayerBusy(true);
    setError("");
    setNotice("");

    try {
      await sendGameChallenge(walletAddress);
      await refreshMultiplayer();
      setNotice(copy.challengeSent);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Challenge failed");
    } finally {
      setMultiplayerBusy(false);
    }
  }

  async function handleChallengeResponse(
    challengeId: string,
    action: "accept" | "decline"
  ) {
    setMultiplayerBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await respondToGameChallenge(challengeId, action);

      if (result.match) {
        setMatchLobby(result.match);
        setNotice(copy.lobbyCreated);
        await sendGamePresenceHeartbeat("in_battle");
      } else {
        setNotice(copy.challengeDeclined);
      }

      await refreshMultiplayer();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Challenge response failed");
    } finally {
      setMultiplayerBusy(false);
    }
  }

  if (matchLobby && profile) {
    return <PvpBattle
      matchId={matchLobby.id}
      myWallet={profile.walletAddress}
      onExit={() => {
        setMatchLobby(null);
        void refreshMultiplayer();
      }}
    />;
  }

  if (selectedFoe) {
    return (
      <TacticalBattle
        title={`TRAINING — ${selectedFoe.name}`}
        enemyGroupId={selectedFoe.enemyGroupId}
        enemyLevel={selectedFoe.level}
        pepeLevel={progress.polishPepe.level}
        bocianLevel={progress.bocian.rank}
        pepeClass={progress.polishPepe.specialization}
        pepeBonuses={pveLoadout.pepeBonuses}
        bocianBonuses={pveLoadout.bocianBonuses}
        rewardText={[
          `+${selectedFoe.xp} XP`,
          `+${selectedFoe.crowns} PLPEków`,
          `${polish ? "Szansa na relikt" : "Relic chance"} ${Math.round(
            selectedFoe.relicChance * 100
          )}%`,
        ]}
        onVictory={() => {
          const next = {
            ...cooldowns,
            [selectedFoe.id]: Date.now(),
          };

          setCooldowns(next);
          localStorage.setItem(TRAINING_KEY, JSON.stringify(next));
          awardGlobalReward({
            xp: selectedFoe.xp,
            bocianXp: Math.round(selectedFoe.xp * 0.7),
            crowns: selectedFoe.crowns,
            relics: Math.random() < selectedFoe.relicChance ? 1 : 0,
            bearFragments: selectedFoe.level,
          });
          setSelectedFoe(null);
        }}
        onDefeat={() => setSelectedFoe(null)}
        onRetreat={() => setSelectedFoe(null)}
      />
    );
  }

  const outgoingTargets = new Set(
    outgoing.map((challenge) => challenge.challengedWallet.toLowerCase())
  );

  return (
    <main
      className="building-hub arena-multiplayer"
      style={{ backgroundImage: `url(${arenaBg})` }}
    >
      <header className="building-hub__top">
        <div>
          <div className="building-hub__eyebrow">{copy.eyebrow}</div>
          <h1 className="building-hub__title">{copy.title}</h1>
        </div>

        <div className="arena-multiplayer__top-actions">
          <div className="building-resourcebar arena-multiplayer__resources">
            <span>LVL {p.playerLevel}</span>
            <span>
              XP {p.playerXp}/{p.playerXpRequired}
            </span>
            <span>⚡ {p.memeEnergy}</span>
            <span>◈ {p.relics}</span>
            <span>◎ {p.intel}</span>
          </div>

          <button className="building-hub__back" onClick={p.onBack}>
            {copy.back}
          </button>
        </div>
      </header>

      <section className="building-hub__content">
        <div className="building-tabs">
          <button
            className={`building-tab ${tab === "training" ? "active" : ""}`}
            onClick={() => setTab("training")}
          >
            ⚔ {copy.training}
          </button>
          <button
            className={`building-tab ${tab === "pvp" ? "active" : ""}`}
            onClick={() => setTab("pvp")}
          >
            🟢 {copy.pvp}
            {profile ? ` (${onlinePlayers.length + 1})` : ""}
          </button>
          <button
            className={`building-tab ${tab === "ranking" ? "active" : ""}`}
            onClick={() => setTab("ranking")}
          >
            🏆 {copy.ranking}
          </button>
          <button
            className={`building-tab ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            📜 {copy.history}
          </button>
        </div>

        {notice ? <div className="arena-message success">{notice}</div> : null}
        {error ? <div className="arena-message error">{error}</div> : null}

        {tab === "training" ? (
          <>
            <div className="building-hub__hero">
              <h2>{copy.trainingTitle}</h2>
              <p>{copy.trainingText}</p>
            </div>

            <div className="building-hub__grid">
              {foes.map((foe) => {
                const remaining =
                  (cooldowns[foe.id] || 0) + TRAINING_COOLDOWN - Date.now();
                const ready = remaining <= 0;

                return (
                  <article
                    className={`building-card ${ready ? "ready" : "locked"}`}
                    key={foe.id}
                  >
                    <div className="arena-portrait">
                      <img src={foe.image} alt={foe.name} />
                    </div>
                    <h3>{foe.name}</h3>
                    <p>{foe.desc}</p>
                    <div className="building-card__meta">
                      <span className="building-chip">LVL {foe.level}</span>
                      <span className="building-chip">+{foe.xp} XP</span>
                      <span className="building-chip">+{foe.crowns} PLPEków</span>
                      <span className="building-chip">
                        ⏱ {formatCooldown(remaining, polish)}
                      </span>
                    </div>
                    <button
                      className="building-action"
                      disabled={!ready}
                      onClick={() => ready && setSelectedFoe(foe)}
                    >
                      {ready
                        ? copy.startTraining
                        : `${copy.refresh} ${formatCooldown(remaining, polish)}`}
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        ) : null}

        {tab === "pvp" ? (
          !profile ? (
            <div className="building-panel arena-login-panel">
              <h2>{copy.loginNeeded}</h2>
              <p>
                {polish
                  ? "Konto PLPE Game jest teraz logowane nickiem/e-mailem i hasłem na ekranie startowym."
                  : "PLPE Game now uses nickname/email and password login on the start screen."}
              </p>
            </div>
          ) : (
            <div className="arena-pvp-layout">
              <div className="arena-pvp-main">
                {matchLobby ? (
                  <div className="building-panel arena-match-lobby">
                    <div className="building-hub__eyebrow">PVP MATCH LOBBY</div>
                    <h2>{shortWallet(matchLobby.id)}</h2>
                    <p>{copy.lobbyStage}</p>
                    <div className="building-card__meta">
                      <span className="building-chip">MATCH {matchLobby.id}</span>
                      <span className="building-chip">STATUS: {matchLobby.status}</span>
                    </div>
                  </div>
                ) : null}

                {incoming.length > 0 ? (
                  <div className="building-panel">
                    <h3>{copy.incoming}</h3>
                    <div className="building-list">
                      {incoming.map((challenge) => (
                        <div className="building-row arena-challenge-row" key={challenge.id}>
                          <div>
                            <strong>{displayName(challenge.challenger)}</strong>
                            <small>
                              {challenge.challenger
                                ? `${copy.rating}: ${challenge.challenger.rating}`
                                : shortWallet(challenge.challengerWallet)}
                            </small>
                          </div>
                          <div className="arena-row-actions">
                            <button
                              className="arena-small-button accept"
                              disabled={multiplayerBusy}
                              onClick={() =>
                                handleChallengeResponse(challenge.id, "accept")
                              }
                            >
                              {copy.accept}
                            </button>
                            <button
                              className="arena-small-button decline"
                              disabled={multiplayerBusy}
                              onClick={() =>
                                handleChallengeResponse(challenge.id, "decline")
                              }
                            >
                              {copy.decline}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="building-panel">
                  <div className="arena-panel-heading">
                    <div>
                      <div className="building-hub__eyebrow">LIVE PVP</div>
                      <h2>{copy.onlineNow}</h2>
                    </div>
                    <span className="arena-online-count">
                      🟢 {onlinePlayers.length + 1}
                    </span>
                  </div>

                  {onlinePlayers.length === 0 ? (
                    <div className="building-note">{copy.noPlayers}</div>
                  ) : (
                    <div className="arena-player-list">
                      {onlinePlayers.map((player) => {
                        const pending = outgoingTargets.has(
                          player.walletAddress.toLowerCase()
                        );
                        const unavailable = player.presenceStatus === "in_battle";

                        return (
                          <div className="arena-player-row" key={player.walletAddress}>
                            <div className="arena-player-identity">
                              <span
                                className={`arena-presence-dot ${
                                  unavailable ? "busy" : ""
                                }`}
                              />
                              <div>
                                <strong>{displayName(player)}</strong>
                                <small>{shortWallet(player.walletAddress)} · {classLabel(player, polish)}</small>
                              </div>
                            </div>
                            <div className="arena-player-stat">
                              <span>{copy.rating}</span>
                              <b>{player.rating}</b>
                            </div>
                            <div className="arena-player-stat">
                              <span>W / L</span>
                              <b>
                                {player.wins} / {player.losses}
                              </b>
                            </div>
                            <div className="arena-player-stat">
                              <span>{copy.winRate}</span>
                              <b>{player.winRate}%</b>
                            </div>
                            <span className={`arena-status ${unavailable ? "busy" : ""}`}>
                              {statusLabel(player, polish)}
                            </span>
                            <button
                              className="arena-small-button challenge"
                              disabled={multiplayerBusy || unavailable || pending}
                              onClick={() => handleChallenge(player.walletAddress)}
                            >
                              {pending
                                ? copy.pending
                                : unavailable
                                  ? copy.busy
                                  : copy.challenge}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {outgoing.length > 0 ? (
                  <div className="building-panel">
                    <h3>{copy.outgoing}</h3>
                    <div className="building-list">
                      {outgoing.map((challenge) => (
                        <div className="building-row" key={challenge.id}>
                          <span>{displayName(challenge.challenged)}</span>
                          <strong>{copy.pending}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="building-panel arena-profile-card">
                <div className="building-hub__eyebrow">{copy.profile}</div>
                <h2>{displayName(profile)}</h2>
                <small>{shortWallet(profile.walletAddress)} · {classLabel(profile, polish)}</small>

                <div className="arena-profile-rating">
                  <span>{copy.rating}</span>
                  <strong>{profile.rating}</strong>
                </div>

                <div className="hero-stat-grid arena-profile-stats">
                  <div className="hero-stat">
                    <span>{copy.wins}</span>
                    <b>{profile.wins}</b>
                  </div>
                  <div className="hero-stat">
                    <span>{copy.losses}</span>
                    <b>{profile.losses}</b>
                  </div>
                  <div className="hero-stat">
                    <span>{copy.winRate}</span>
                    <b>{profile.winRate}%</b>
                  </div>
                  <div className="hero-stat">
                    <span>{copy.streak}</span>
                    <b>{profile.currentWinStreak}</b>
                  </div>
                </div>

                <label className="arena-nickname-label" htmlFor="arena-nickname">
                  {copy.nickname}
                </label>
                <input
                  id="arena-nickname"
                  className="arena-nickname-input"
                  maxLength={20}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="PolishPepe"
                />
                <button
                  className="building-action secondary"
                  disabled={multiplayerBusy || nickname.trim().length < 3}
                  onClick={handleNicknameSave}
                >
                  {copy.saveNickname}
                </button>
                <button
                  className="arena-logout"
                  disabled={multiplayerBusy}
                  onClick={handleLogout}
                >
                  {copy.logout}
                </button>
              </aside>
            </div>
          )
        ) : null}

        {tab === "ranking" ? (
          <div className="building-panel">
            <div className="arena-panel-heading">
              <div>
                <div className="building-hub__eyebrow">PVP ELO</div>
                <h2>{copy.rankTitle}</h2>
                <p>{copy.rankText}</p>
              </div>
            </div>

            <div className="arena-ranking-table">
              {ranking.length === 0 ? (
                <div className="building-note">
                  {polish
                    ? "Ranking jest pusty. Pierwsze profile pojawią się po logowaniu graczy."
                    : "The ranking is empty. Player profiles will appear after the first logins."}
                </div>
              ) : (
                ranking.map((player, index) => (
                  <div className="arena-ranking-row" key={player.walletAddress}>
                    <strong>#{player.rank || index + 1}</strong>
                    <div>
                      <b>{displayName(player)}</b>
                      <small>{shortWallet(player.walletAddress)}</small>
                    </div>
                    <span>{classLabel(player, polish)}</span>
                    <span>LVL {player.level}</span>
                    <span>{copy.rating}: {player.rating}</span>
                    <span>{player.wins}W / {player.losses}L</span>
                    <span>{player.winRate}%</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        {tab === "history" ? (
          <div className="building-panel">
            <div className="arena-panel-heading"><div><div className="building-hub__eyebrow">PVP</div><h2>{copy.historyTitle}</h2></div></div>
            <div className="arena-ranking-table">
              {matchHistory.length === 0 ? (
                <div className="building-note">{polish ? "Brak rozegranych pojedynków." : "No PvP matches yet."}</div>
              ) : matchHistory.map((match) => {
                const won = match.winnerWallet?.toLowerCase() === profile?.walletAddress.toLowerCase();
                const completed = match.status === "completed";
                const opponent = match.playerAWallet.toLowerCase() === profile?.walletAddress.toLowerCase() ? match.playerBWallet : match.playerAWallet;
                return <div className="arena-ranking-row" key={match.id}>
                  <strong>{completed ? (won ? "WIN" : "LOSS") : "LIVE"}</strong>
                  <div><b>{shortWallet(opponent)}</b><small>{new Date(match.createdAt).toLocaleString()}</small></div>
                  <span>{completed ? `${won ? "+" : "-"}${match.ratingDelta || 0} ELO` : (polish ? "W toku" : "Active")}</span>
                  <span>{match.battleState ? `${polish ? "Runda" : "Round"} ${match.battleState.round}` : "—"}</span>
                </div>;
              })}
            </div>
          </div>
        ) : null}

        {!p.chapter1Completed && tab !== "training" ? (
          <div className="building-note">
            {polish
              ? "Tryb PvP jest już dostępny technicznie do testów. Docelowo możemy wymagać ukończenia Rozdziału 1."
              : "PvP is technically available for testing. We can require Chapter 1 completion in the final progression rules."}
          </div>
        ) : null}
      </section>
    </main>
  );
}
