import "./MainHub.css";

import mainHub from "../../assets/game/main_hub.png";

import { useLanguage } from "../../hooks/useLanguage";

interface MainHubProps {
  level: number;
  xp: number;
  xpRequired: number;
  memeEnergy: number;
  relics: number;
  intel: number;

  onMonastery?: () => void;
  onTrainingHall?: () => void;
  onCardForge?: () => void;
  onComicArchive?: () => void;
  onVault?: () => void;
  onArena?: () => void;
  onExpeditions?: () => void;

  onExit: () => void;
}

export default function MainHub({
  level,
  xp,
  xpRequired,
  memeEnergy,
  relics,
  intel,

  onMonastery,
  onTrainingHall,
  onCardForge,
  onComicArchive,
  onVault,
  onArena,
  onExpeditions,

  onExit,
}: MainHubProps) {
  const { t, language } = useLanguage();

  const xpPercent =
    xpRequired > 0
      ? Math.min(
          100,
          (xp / xpRequired) * 100
        )
      : 0;

  return (
    <main
      className={`plpe-hub plpe-hub--${language}`}
      style={{
        backgroundImage: `url(${mainHub})`,
      }}
    >
      {/* =====================================================
          TOP HUD
      ===================================================== */}

      <div className="plpe-hub__hud">
        <div className="plpe-hub__hero">
          <div className="plpe-hub__hero-main">
            <div>
              <strong>
                {t.game.polishPepe}
              </strong>

              <span>
                {t.game.level} {level}
              </span>
            </div>
          </div>

          <div className="plpe-hub__xp">
            <div
              className="plpe-hub__xp-fill"
              style={{
                width: `${xpPercent}%`,
              }}
            />
          </div>

          <small>
            {xp} / {xpRequired} XP
          </small>
        </div>

        <div className="plpe-hub__resources">
          <div className="plpe-hub__resource">
            <span>⚡</span>

            <div>
              <small>
                {t.game.memeEnergy}
              </small>

              <strong>
                {memeEnergy}
              </strong>
            </div>
          </div>

          <div className="plpe-hub__resource">
            <span>◆</span>

            <div>
              <small>
                {t.game.relics}
              </small>

              <strong>
                {relics}
              </strong>
            </div>
          </div>

          <div className="plpe-hub__resource">
            <span>✦</span>

            <div>
              <small>
                {t.game.intel}
              </small>

              <strong>
                {intel}
              </strong>
            </div>
          </div>
        </div>

        <div className="plpe-hub__chapter">
          <small>
            {t.game.season1}
          </small>

          <strong>
            {t.game.chapter1Awakening}
          </strong>
        </div>
      </div>

      {/* =====================================================
          EXIT GAME
      ===================================================== */}

      <button
        type="button"
        className="plpe-hub__exit"
        onClick={onExit}
      >
        <span className="plpe-hub__exit-icon">
          ✕
        </span>

        <span className="plpe-hub__exit-label">
          {language === "pl" ? "WYJDŹ Z GRY" : "EXIT GAME"}
        </span>
      </button>

      {/* =====================================================
          BUILDING HOTSPOTS
      ===================================================== */}

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--training
        "
        onClick={onTrainingHall}
        aria-label={
          t.game.trainingHall
        }
      >
        <span>
          {t.game.trainingHall}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--forge
        "
        onClick={onCardForge}
        aria-label={
          t.game.cardForge
        }
      >
        <span>
          {t.game.cardForge}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--monastery
        "
        onClick={onMonastery}
        aria-label={
          t.game.storkMonastery
        }
      >
        <span>
          {t.game.storkMonastery}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--archive
        "
        onClick={onComicArchive}
        aria-label={
          t.game.comicArchive
        }
      >
        <span>
          {t.game.comicArchive}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--arena
        "
        onClick={onArena}
        aria-label={
          t.game.arenaBuilding
        }
      >
        <span>
          {t.game.arenaBuilding}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--vault
        "
        onClick={onVault}
        aria-label={
          t.game.plpeVault
        }
      >
        <span>
          {t.game.plpeVault}
        </span>
      </button>

      <button
        type="button"
        className="
          plpe-hub__hotspot
          plpe-hub__hotspot--expeditions
        "
        onClick={onExpeditions}
        aria-label={
          t.game.expeditions
        }
      >
        <span>
          {t.game.expeditions}
        </span>
      </button>

      {/* =====================================================
          BOTTOM STATUS
      ===================================================== */}

      <div className="plpe-hub__bottom">
        <div className="plpe-hub__status">
          <span className="plpe-hub__online-dot" />

          PLPE ARENA
        </div>

        <div className="plpe-hub__hint">
          {language === "pl" ? "Wybierz lokalizację" : "Select a location"}
        </div>
      </div>
    </main>
  );
}