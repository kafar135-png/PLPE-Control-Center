import { useState } from "react";
import "./BuildingGameplayHub.css";
import ArenaTrainingHub from "./ArenaTrainingHub";
import {
  POWER_RECIPES,
  addResources,
  canCraftPower,
  craftPower,
  loadBuildingState,
  upgradeBuilding,
} from "./BuildingEconomy";
import {
  addTrainingXp,
  loadCharacterProgress,
  xpRequired,
} from "./CharacterProgression";

import trainingHallBg from "../../assets/game/training_hall_hub_bg.png";
import cardForgeBg from "../../assets/game/card_forge_hub_bg.png";
import comicArchiveBg from "../../assets/game/comic_archive_hub_clean.png";
import vaultBg from "../../assets/game/plpe_vault_hub_bg.png";
import expeditionsBg from "../../assets/game/expeditions_hub_bg.png";

export type BuildingGameplayId =
  | "training"
  | "forge"
  | "archive"
  | "vault"
  | "expeditions"
  | "arena";

interface BuildingGameplayHubProps {
  building: BuildingGameplayId;
  onBack: () => void;
}

const BACKGROUNDS: Partial<Record<BuildingGameplayId, string>> = {
  training: trainingHallBg,
  forge: cardForgeBg,
  archive: comicArchiveBg,
  vault: vaultBg,
  expeditions: expeditionsBg,
};

const BUILDING_TITLES: Record<BuildingGameplayId, string> = {
  training: "Sala Treningowa",
  forge: "Kuźnia Mocy i Artefaktów",
  archive: "Archiwum Komiksu",
  vault: "Skarbiec PLPE",
  expeditions: "Ekspedycje",
  arena: "Arena Treningowa",
};

export default function BuildingGameplayHub({
  building,
  onBack,
}: BuildingGameplayHubProps) {
  const [state, setState] = useState(loadBuildingState);
  const [progress, setProgress] = useState(loadCharacterProgress);
  const [message, setMessage] = useState("");

  function upgrade(name: keyof typeof state.levels) {
    const before = state.levels[name];
    const next = upgradeBuilding(state, name);
    setState(next);
    setMessage(
      next.levels[name] > before
        ? `Budynek ulepszony do poziomu ${next.levels[name]}.`
        : "Brakuje Meme Energy lub Koron."
    );
  }

  if (building === "arena") {
    return (
      <ArenaTrainingHub
        onBack={onBack}
        onReward={(reward) => {
          setState((previous) =>
            addResources(previous, {
              crowns: reward.crowns,
              relics: reward.relics,
            })
          );
          setProgress(loadCharacterProgress());
        }}
      />
    );
  }

  const background = BACKGROUNDS[building];

  return (
    <section
      className={`building-interior building-interior--${building}`}
      style={background ? { backgroundImage: `url(${background})` } : undefined}
    >
      <div className="building-interior__shade" />

      <header className="building-interior__header">
        <div>
          <small>KLASZTOR BOCIANA · {BUILDING_TITLES[building].toUpperCase()}</small>
          <h1>{BUILDING_TITLES[building]}</h1>
          {message && <p>{message}</p>}
        </div>
        <button type="button" onClick={onBack}>
          ← WRÓĆ DO KLASZTORU
        </button>
      </header>

      <div className="building-interior__resources">
        <span>⚡ {state.resources.memeEnergy} Energy</span>
        <span>💎 {state.resources.relics} Relikty</span>
        <span>🧠 {state.resources.intel} Intel</span>
        <span>🐻 {state.resources.bearFragments} Bear</span>
        <span>📜 {state.resources.comicFragments} Comic</span>
        <span>🃏 {state.resources.cardFragments} Card</span>
        <span>🪙 {state.resources.crowns} Koron</span>
      </div>

      <main className="building-interior__content">
        {building === "training" && (
          <section className="building-interior__panel">
            <div className="building-interior__title">
              <div>
                <small>POZIOM {state.levels.trainingHall}</small>
                <h2>Sala Treningowa</h2>
                <p>Tu rozwijasz PolishPepe i Bociana poza walką.</p>
              </div>
              <button type="button" onClick={() => upgrade("trainingHall")}>
                ULEPSZ SALĘ
              </button>
            </div>

            <div className="building-interior__two">
              <article>
                <h3>PolishPepe</h3>
                <strong>LV. {progress.pepeLevel}</strong>
                <div className="building-interior__bar">
                  <i
                    style={{
                      width: `${Math.min(
                        100,
                        (progress.pepeXp / xpRequired(progress.pepeLevel)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p>
                  {progress.pepeXp} / {xpRequired(progress.pepeLevel)} XP
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (state.resources.memeEnergy < 30) {
                      setMessage("Potrzebujesz 30 Meme Energy.");
                      return;
                    }
                    setState(addResources(state, { memeEnergy: -30 }));
                    setProgress(addTrainingXp(progress, 35, 20));
                    setMessage("PolishPepe: +35 XP.");
                  }}
                >
                  🥊 TRENING PEPE · 30 ENERGY
                </button>
              </article>

              <article>
                <h3>Bocian</h3>
                <strong>LV. {progress.bocianLevel}</strong>
                <div className="building-interior__bar">
                  <i
                    style={{
                      width: `${Math.min(
                        100,
                        (progress.bocianXp / xpRequired(progress.bocianLevel)) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p>
                  {progress.bocianXp} / {xpRequired(progress.bocianLevel)} XP
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (state.resources.memeEnergy < 30) {
                      setMessage("Potrzebujesz 30 Meme Energy.");
                      return;
                    }
                    setState(addResources(state, { memeEnergy: -30 }));
                    setProgress(addTrainingXp(progress, 15, 35));
                    setMessage("Bocian: +35 XP.");
                  }}
                >
                  🪄 TRENING BOCIANA · 30 ENERGY
                </button>
              </article>
            </div>
          </section>
        )}

        {building === "forge" && (
          <section className="building-interior__panel">
            <div className="building-interior__title">
              <div>
                <small>POZIOM {state.levels.cardForge}</small>
                <h2>Kuźnia Mocy i Artefaktów</h2>
                <p>Tu powstają aktywne moce zabierane do walki.</p>
              </div>
              <button type="button" onClick={() => upgrade("cardForge")}>
                ULEPSZ KUŹNIĘ
              </button>
            </div>

            <div className="building-interior__recipe-grid">
              {POWER_RECIPES.map((recipe) => {
                const unlocked = state.unlockedRecipes.includes(recipe.id);
                const ready = canCraftPower(state, recipe.id);
                const owned =
                  state.powers.find((power) => power.id === recipe.id)?.charges ?? 0;

                return (
                  <article key={recipe.id} className={!unlocked ? "locked" : ""}>
                    <div className="building-interior__power-icon">
                      {recipe.id === "storm-core"
                        ? "⚡"
                        : recipe.id === "frost-rune"
                          ? "❄"
                          : recipe.id === "guardian-sigil"
                            ? "🛡"
                            : recipe.id === "sleep-dust"
                              ? "💤"
                              : "✚"}
                    </div>
                    <h3>{recipe.name}</h3>
                    <p>{recipe.description}</p>
                    <small>Wymagana Kuźnia: LV.{recipe.forge}</small>
                    <div className="building-interior__cost">
                      {Object.entries(recipe.cost).map(([key, value]) => (
                        <span key={key}>
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                    <b>Ładunki: {owned}</b>
                    <button
                      type="button"
                      disabled={!ready}
                      onClick={() => {
                        const next = craftPower(state, recipe.id);
                        setState(next);
                        setMessage(
                          next === state
                            ? "Brakuje materiałów."
                            : `Wykuto: ${recipe.name}.`
                        );
                      }}
                    >
                      {unlocked ? "WYKUJ MOC" : "RECEPTURA ZABLOKOWANA"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {building === "archive" && (
          <section className="building-interior__panel">
            <div className="building-interior__title">
              <div>
                <small>POZIOM {state.levels.comicArchive}</small>
                <h2>Archiwum Komiksu</h2>
                <p>Wiedza, sekrety, fragmenty komiksu i szyfry.</p>
              </div>
              <button type="button" onClick={() => upgrade("comicArchive")}>
                ULEPSZ ARCHIWUM
              </button>
            </div>

            <div className="building-interior__cards">
              <article>
                <h3>📜 Fragmenty Komiksu</h3>
                <strong>{state.resources.comicFragments}</strong>
                <p>Odblokowują wpisy fabularne, kody i specjalne receptury.</p>
              </article>
              <article>
                <h3>🧠 Intel</h3>
                <strong>{state.resources.intel}</strong>
                <p>Informacje o patrolach, Ciemnej Dolinie i ukrytych przejściach.</p>
              </article>
              <article>
                <h3>🔐 Szyfry</h3>
                <p>Zagadki fabularne będą trafiać właśnie tutaj.</p>
                <button type="button" onClick={() => setMessage("Brak nowego szyfru.")}> 
                  SPRAWDŹ ZAPISKI
                </button>
              </article>
            </div>
          </section>
        )}

        {building === "vault" && (
          <section className="building-interior__panel">
            <div className="building-interior__title">
              <div>
                <small>POZIOM {state.levels.plpeVault}</small>
                <h2>Skarbiec PLPE</h2>
                <p>Tu przechowywany jest cały loot zdobyty w świecie.</p>
              </div>
              <button type="button" onClick={() => upgrade("plpeVault")}>
                ULEPSZ SKARBIEC
              </button>
            </div>

            <div className="building-interior__vault-grid">
              {Object.entries(state.resources).map(([key, value]) => (
                <article key={key}>
                  <small>{key.toUpperCase()}</small>
                  <strong>{value}</strong>
                </article>
              ))}
            </div>
          </section>
        )}

        {building === "expeditions" && (
          <section className="building-interior__panel">
            <div className="building-interior__title">
              <div>
                <small>POZIOM {state.levels.expeditions}</small>
                <h2>Ekspedycje</h2>
                <p>Wysyłaj zwiad i odblokowuj informacje potrzebne na mapie.</p>
              </div>
              <button type="button" onClick={() => upgrade("expeditions")}>
                ULEPSZ EKSPEDYCJE
              </button>
            </div>

            <div className="building-interior__cards">
              <article>
                <h3>🧭 Zwiad Leśny</h3>
                <p>Energy, Intel i Bear Fragments.</p>
                <button
                  type="button"
                  onClick={() => {
                    setState(
                      addResources(state, {
                        memeEnergy: 25,
                        intel: 1,
                        bearFragments: 1,
                      })
                    );
                    setMessage("Zwiad wrócił: +25 Energy, +1 Intel, +1 Bear Fragment.");
                  }}
                >
                  WYŚLIJ ZWIAD
                </button>
              </article>

              <article>
                <h3>⛏ Wyprawa do Kopalni</h3>
                <p>Relikty i Card Fragments.</p>
                <button
                  type="button"
                  onClick={() => {
                    setState(addResources(state, { relics: 1, cardFragments: 1 }));
                    setMessage("Ekspedycja: +1 Relikt, +1 Card Fragment.");
                  }}
                >
                  WYŚLIJ EKIPĘ
                </button>
              </article>

              <article className="locked">
                <h3>🌑 Granica Ciemnej Doliny</h3>
                <p>Odblokowywana przez scenariusz.</p>
                <button type="button" disabled>
                  WYMAGA SCENARIUSZA
                </button>
              </article>
            </div>
          </section>
        )}
      </main>
    </section>
  );
}
