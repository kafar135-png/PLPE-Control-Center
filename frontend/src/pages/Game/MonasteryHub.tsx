import {
  useState,
} from "react";

import "./MonasteryHub.css";
import "./MonasteryUpgradeHighlight.css";

import monasteryHubBackground from "../../assets/game/monastery_hub_bg.png";

import {
  useLanguage,
} from "../../hooks/useLanguage";

import {
  canAfford,
  formatCost,
  getAdventureXpBonus,
  getBuildingUpgradeCost,
  getMonasteryRankCap,
  upgradeGlobalBuilding,
  useGameProgress,
  type BuildingKey,
} from "./Progress";

type MonasteryPanel =
  | "bocian"
  | "chapter"
  | "buildings"
  | "upgrade"
  | null;

interface MonasteryHubProps {
  monasteryLevel?: number;

  bocianRank?: number;
  bocianXp?: number;
  bocianXpRequired?: number;
  bocianSupportLevel?: number;

  trainingHallLevel?: number;
  cardForgeLevel?: number;
  comicArchiveLevel?: number;
  plpeVaultLevel?: number;
  arenaLevel?: number;
  expeditionsLevel?: number;

  currentChapter?: number;

  chapter1Completed?: boolean;
  quest1Completed?: boolean;
  quest2Completed?: boolean;

  memeEnergy?: number;
  relics?: number;
  intel?: number;

  unlockedRegions?: number[];

  onUpgradeMonastery?: () => void;
  onResetGame?: () => void;

  onBack: () => void;
}

export default function MonasteryHub({
  monasteryLevel = 1,

  bocianRank = 1,
  bocianXp = 0,
  bocianXpRequired = 100,
  bocianSupportLevel = 1,

  currentChapter = 1,

  chapter1Completed = false,
  quest1Completed = false,
  quest2Completed = false,

  memeEnergy = 0,
  relics = 0,
  intel = 0,

  unlockedRegions = [1],

  onUpgradeMonastery,
  onResetGame,

  onBack,
}: MonasteryHubProps) {
  const { t, language } =
    useLanguage();

  const { progress } = useGameProgress();

  const [
    panel,
    setPanel,
  ] =
    useState<MonasteryPanel>(
      null
    );

  const safeRegions =
    Array.isArray(
      unlockedRegions
    ) &&
    unlockedRegions.length > 0
      ? unlockedRegions
      : [1];

  const rankCap =
    getMonasteryRankCap(
      monasteryLevel
    );

  const xpBonus =
    getAdventureXpBonus(
      monasteryLevel
    );

  const hasEnergy =
    memeEnergy >= 200;

  const hasRelics =
    relics >= 5;

  const canUpgradeLv2 =
    monasteryLevel === 1 &&
    chapter1Completed &&
    hasEnergy &&
    hasRelics;

  const bocianXpPercent =
    Math.min(
      100,
      Math.max(
        0,
        (bocianXp /
          Math.max(
            1,
            bocianXpRequired
          )) *
          100
      )
    );

  let chapterProgress = 0;

  if (quest1Completed) {
    chapterProgress = 50;
  }

  if (quest2Completed) {
    chapterProgress = 100;
  }

  function openPanel(
    nextPanel: MonasteryPanel
  ) {
    setPanel(
      nextPanel
    );
  }

  function closePanel() {
    setPanel(
      null
    );
  }

  function handleUpgrade() {
    if (
      !onUpgradeMonastery
    ) {
      return;
    }

    onUpgradeMonastery();
  }

  return (
    <main
      className="monastery-world"
      style={{
        backgroundImage:
          `url(${monasteryHubBackground})`,
      }}
    >
      <div className="monastery-world__shade" />

      {/* =====================================================
          TOP HUD
      ===================================================== */}

      <div className="monastery-world__topbar">
        <div className="monastery-world__identity">
          <span>
            KLASZTOR BOCIANA
          </span>

          <strong>
            {t.game.level}{" "}
            {monasteryLevel}
          </strong>
        </div>

        <div className="monastery-world__resources">
          <div>
            <span>
              ⚡
            </span>

            <strong>
              {memeEnergy}
            </strong>
          </div>

          <div>
            <span>
              ◆
            </span>

            <strong>
              {relics}
            </strong>
          </div>

          <div>
            <span>
              ✦
            </span>

            <strong>
              {intel}
            </strong>
          </div>
        </div>

        <div className="monastery-world__top-actions">
          {onResetGame ? (
            <button
              type="button"
              className="monastery-world__reset"
              onClick={onResetGame}
            >
              {language === "pl" ? "RESET GRY" : "RESET GAME"}
            </button>
          ) : null}

          <button
            type="button"
            className="monastery-world__back"
            onClick={
              onBack
            }
          >
            {language === "pl" ? "← POWRÓT DO HUBU" : "← BACK TO HUB"}
          </button>
        </div>
      </div>

      {/* =====================================================
          BOCIAN
      ===================================================== */}

      <button
        type="button"
        className="
          monastery-world__location
          monastery-world__location--book
        "
        onClick={() =>
          openPanel(
            "bocian"
          )
        }
      >
        <span>
          MENTOR
        </span>

        <strong>
          BOCIAN
        </strong>
      </button>

      {/* =====================================================
          CHAPTER
      ===================================================== */}

      <button
        type="button"
        className="
          monastery-world__location
          monastery-world__location--map
        "
        onClick={() =>
          openPanel(
            "chapter"
          )
        }
      >
        <span>
          STÓŁ DOWODZENIA
        </span>

        <strong>
          CHAPTER{" "}
          {currentChapter}
        </strong>
      </button>

      {/* =====================================================
          BUILDINGS
      ===================================================== */}

      <button
        type="button"
        className="
          monastery-world__location
          monastery-world__location--buildings
        "
        onClick={() =>
          openPanel(
            "buildings"
          )
        }
      >
        <span>
          ROZWÓJ BAZY
        </span>

        <strong>
          BUDYNKI
        </strong>
      </button>

      {/* =====================================================
          UPGRADE
      ===================================================== */}

      <button
        type="button"
        className="
          monastery-world__location
          monastery-world__location--upgrade
        "
        onClick={() =>
          openPanel(
            "upgrade"
          )
        }
      >
        <span>
          KLASZTOR
        </span>

        <strong>
          LV.{" "}
          {monasteryLevel}
        </strong>
      </button>

      <div className="monastery-world__hint">
        Kliknij element w Klasztorze
      </div>

      {/* =====================================================
          BOCIAN PANEL
      ===================================================== */}

      {panel ===
        "bocian" && (
        <section className="monastery-world__window">
          <div className="monastery-world__window-header">
            <div>
              <span>
                MENTOR POLISHPEPE
              </span>

              <h2>
                Bocian
              </h2>
            </div>

            <button
              type="button"
              onClick={
                closePanel
              }
            >
              ✕
            </button>
          </div>

          <div className="monastery-world__mentor-top">
            <div className="monastery-world__mentor-rank">
              <span>
                RANK
              </span>

              <strong>
                {bocianRank}
              </strong>
            </div>

            <div className="monastery-world__mentor-info">
              <span>
                MAX RANK
              </span>

              <strong>
                {rankCap}
              </strong>

              <small>
                Limit zależy od poziomu Klasztoru.
              </small>
            </div>
          </div>

          <div className="monastery-world__window-section">
            <div className="monastery-world__section-heading">
              <h3>
                Doświadczenie Bociana
              </h3>

              <span>
                {bocianXp}
                {" / "}
                {bocianXpRequired}
                {" XP"}
              </span>
            </div>

            <div className="monastery-world__progress">
              <div
                style={{
                  width:
                    `${bocianXpPercent}%`,
                }}
              />
            </div>
          </div>

          <div className="monastery-world__window-section">
            <h3>
              Support Level
            </h3>

            <div className="monastery-world__support-level">
              <strong>
                {bocianSupportLevel}
              </strong>

              <span>
                Poziom wsparcia podczas walk
                i ekspedycji.
              </span>
            </div>
          </div>

          <div className="monastery-world__window-section">
            <h3>
              Aktualne bonusy
            </h3>

            <ul>
              <li>
                Wsparcie Bociana podczas walk
              </li>

              <li>
                Pomoc podczas wydarzeń fabularnych
              </li>

              <li>
                Dostęp do wiedzy Klasztoru
              </li>

              <li>
                Bonus progresji świata
              </li>
            </ul>
          </div>

          <div className="monastery-world__notice">
            XP Bociana zdobywasz za fabułę,
            sekrety komiksu, ekspedycje oraz
            ważne wydarzenia świata.
          </div>
        </section>
      )}

      {/* =====================================================
          CHAPTER PANEL
      ===================================================== */}

      {panel ===
        "chapter" && (
        <section className="monastery-world__window">
          <div className="monastery-world__window-header">
            <div>
              <span>
                AKTUALNA HISTORIA
              </span>

              <h2>
                Chapter{" "}
                {currentChapter}
              </h2>
            </div>

            <button
              type="button"
              onClick={
                closePanel
              }
            >
              ✕
            </button>
          </div>

          <div className="monastery-world__chapter-title">
            <span>
              CHAPTER 1
            </span>

            <strong>
              {
                t.game
                  .chapter1Awakening
              }
            </strong>
          </div>

          <div className="monastery-world__window-section">
            <div className="monastery-world__section-heading">
              <h3>
                Postęp
              </h3>

              <span>
                {chapterProgress}%
              </span>
            </div>

            <div className="monastery-world__progress">
              <div
                style={{
                  width:
                    `${chapterProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="monastery-world__objectives">
            <div
              className={
                quest1Completed
                  ? "completed"
                  : ""
              }
            >
              <span>
                {quest1Completed
                  ? "✓"
                  : "1"}
              </span>

              <div>
                <strong>
                  Pierwszy sygnał
                </strong>

                <small>
                  Zbadaj zagrożenie przy Klasztorze.
                </small>
              </div>
            </div>

            <div
              className={
                quest2Completed
                  ? "completed"
                  : ""
              }
            >
              <span>
                {quest2Completed
                  ? "✓"
                  : "2"}
              </span>

              <div>
                <strong>
                  Obrona Klasztoru
                </strong>

                <small>
                  Pokonaj Bear Scout.
                </small>
              </div>
            </div>
          </div>

          <div className="monastery-world__window-section">
            <h3>
              Nagrody Chapter 1
            </h3>

            <div className="monastery-world__reward-grid">
              <div>
                <span>
                  XP
                </span>

                <strong>
                  +100
                </strong>
              </div>

              <div>
                <span>
                  Meme Energy
                </span>

                <strong>
                  +80
                </strong>
              </div>

              <div>
                <span>
                  Bear Fragments
                </span>

                <strong>
                  +2
                </strong>
              </div>
            </div>
          </div>

          {chapter1Completed && (
            <div className="monastery-world__completed-banner">
              CHAPTER 1 UKOŃCZONY
            </div>
          )}
        </section>
      )}

      {/* =====================================================
          BUILDINGS PANEL — INFO + UPGRADES ONLY
      ===================================================== */}

      {panel === "buildings" && (
        <section className="monastery-world__window monastery-world__window--wide">
          <div className="monastery-world__window-header">
            <div><span>KLASZTOR BOCIANA</span><h2>Rozwój budynków</h2></div>
            <button type="button" onClick={closePanel}>✕</button>
          </div>

          <p className="monastery-world__building-explainer">
            Każdy budynek rozwijasz osobno. Poniżej widzisz poziom, działanie i dokładny koszt kolejnego ulepszenia.
            Po wejściu do konkretnego budynku korzystasz z jego właściwych funkcji: treningu, kart mocy, archiwum, magazynu, Areny lub Ekspedycji.
          </p>

          <div className="monastery-world__building-list monastery-world__building-list--upgrades">
            {([
              ["trainingHall", "⚔️", t.game.trainingHall, "Odblokowuje treningi, statystyki i nowe umiejętności bohaterów"],
              ["cardForge", "🔨", t.game.cardForge, "Tworzenie kart mocy i artefaktów używanych bezpośrednio w walce"],
              ["comicArchive", "📖", t.game.comicArchive, "Czytelne zapiski fabularne, postacie, wrogowie, miejsca i odkryte sekrety"],
              ["plpeVault", "💎", t.game.plpeVault, "Magazyn Reliktów, fragmentów, Intel i PLPEków zdobytych podczas gry"],
              ["arena", "🛡️", t.game.arenaBuilding, "Trzy treningi bojowe o różnym poziomie; nagrody i cooldown po zwycięstwie"],
              ["expeditions", "🗺️", t.game.expeditions, "Wyprawy po Intel, Relikty i fragmenty oraz wejście na mapę świata"],
            ] as [BuildingKey, string, string, string][]).map(([key, icon, name, description]) => {
              const level = progress.buildings[key];
              const cost = getBuildingUpgradeCost(key, level);
              const affordable = Boolean(cost && canAfford(progress, cost));
              return (
                <div key={key} className={affordable ? "upgrade-ready" : ""}>
                  <span>{icon}</span>
                  <div>
                    <strong>{name}</strong>
                    <small>{description}</small>
                    <small>Wymagane do następnego poziomu: {formatCost(cost)}</small>
                  </div>
                  <b>{level > 0 ? `Lv. ${level}` : "LOCKED"}</b>
                  <button
                    type="button"
                    className="monastery-world__building-upgrade-button"
                    disabled={!cost || !affordable}
                    onClick={() => upgradeGlobalBuilding(key)}
                  >
                    {!cost ? "MAX" : affordable ? "ULEPSZ" : "BRAK ZASOBÓW"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="monastery-world__window-section">
            <h3>Odkryte regiony świata</h3>
            <div className="monastery-world__regions">
              {safeRegions.map((region) => <span key={region}>REGION {region}</span>)}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          UPGRADE PANEL
      ===================================================== */}

      {panel ===
        "upgrade" && (
        <section className="monastery-world__window monastery-world__window--upgrade">
          <div className="monastery-world__window-header">
            <div>
              <span>
                GŁÓWNA PROGRESJA
              </span>

              <h2>
                Klasztor Lv.{" "}
                {monasteryLevel}
              </h2>
            </div>

            <button
              type="button"
              onClick={
                closePanel
              }
            >
              ✕
            </button>
          </div>

          <div className="monastery-world__current-bonus">
            <span>
              AKTUALNY BONUS XP
            </span>

            <strong>
              +{xpBonus}%
            </strong>
          </div>

          {monasteryLevel ===
          1 ? (
            <>
              <div className="monastery-world__upgrade-title">
                <span>
                  NASTĘPNY POZIOM
                </span>

                <strong>
                  Lv. 1 → Lv. 2
                </strong>
              </div>

              <div className="monastery-world__upgrade-columns">
                <div>
                  <h3>
                    Wymagania
                  </h3>

                  <div
                    className={
                      chapter1Completed
                        ? "monastery-world__requirement complete"
                        : "monastery-world__requirement"
                    }
                  >
                    <span>
                      📖 Ukończ Chapter 1
                    </span>

                    <b>
                      {chapter1Completed
                        ? "✓"
                        : "✕"}
                    </b>
                  </div>

                  <div
                    className={
                      hasEnergy
                        ? "monastery-world__requirement complete"
                        : "monastery-world__requirement"
                    }
                  >
                    <span>
                      ⚡ 200 Meme Energy
                    </span>

                    <b>
                      {memeEnergy}
                      /200
                    </b>
                  </div>

                  <div
                    className={
                      hasRelics
                        ? "monastery-world__requirement complete"
                        : "monastery-world__requirement"
                    }
                  >
                    <span>
                      ◆ 5 Relics
                    </span>

                    <b>
                      {relics}
                      /5
                    </b>
                  </div>
                </div>

                <div>
                  <h3>
                    Odblokujesz
                  </h3>

                  <ul>
                    <li>
                      +10% XP z przygód
                    </li>

                    <li>
                      Bocian Rank max 3
                    </li>

                    <li>
                      Card Forge Lv.1
                    </li>

                    <li>
                      Lepsze wsparcie Bociana
                    </li>

                    <li>
                      Region 2 świata
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="button"
                className="monastery-world__action"
                disabled={
                  !canUpgradeLv2
                }
                onClick={
                  handleUpgrade
                }
              >
                ULEPSZ KLASZTOR
              </button>

              {!canUpgradeLv2 && (
                <div className="monastery-world__notice">
                  Spełnij wszystkie wymagania,
                  aby ulepszyć Klasztor.
                </div>
              )}
            </>
          ) : (
            <div className="monastery-world__level-complete">
              <span>
                KLASZTOR ROZWINIĘTY
              </span>

              <strong>
                Lv.{" "}
                {monasteryLevel}
              </strong>

              <p>
                Card Forge został odblokowany,
                limit Rank Bociana został zwiększony,
                a nowy region świata jest dostępny.
              </p>

              <div className="monastery-world__regions">
                {safeRegions.map(
                  (region) => (
                    <span
                      key={
                        region
                      }
                    >
                      REGION{" "}
                      {region}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}