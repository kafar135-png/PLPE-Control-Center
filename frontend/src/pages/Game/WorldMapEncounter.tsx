import {
  useMemo,
  useState,
} from "react";

import "./WorldMapEncounter.css";

import charPolishPepe from "../../assets/game/char_polishpepe.png";
import charBearScout from "../../assets/game/char_bear_scout.png";

export type WorldEncounterMode =
  | "battle"
  | "elite"
  | "boss"
  | "puzzle"
  | "search"
  | "rescue"
  | "choice";

interface WorldMapEncounterProps {
  mode: WorldEncounterMode;

  title: string;

  description: string;

  puzzleId?: string;

  onComplete: () => void;

  onClose: () => void;
}

interface PuzzleOption {
  id: string;

  label: string;

  correct: boolean;
}

export default function WorldMapEncounter({
  mode,
  title,
  description,
  puzzleId,
  onComplete,
  onClose,
}: WorldMapEncounterProps) {
  const [
    playerHp,
    setPlayerHp,
  ] =
    useState(100);

  const enemyMaxHp =
    mode === "boss"
      ? 180
      : mode === "elite"
        ? 120
        : 75;

  const [
    enemyHp,
    setEnemyHp,
  ] =
    useState(
      enemyMaxHp
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    finished,
    setFinished,
  ] =
    useState(false);

  const [
    searchProgress,
    setSearchProgress,
  ] =
    useState(0);

  const [
    wrongAnswer,
    setWrongAnswer,
  ] =
    useState(false);

  const [
    selectedChoice,
    setSelectedChoice,
  ] =
    useState<
      string | null
    >(null);

  /* =========================================================
     PUZZLES
  ========================================================= */

  const puzzle =
    useMemo(
      () => {
        if (
          puzzleId ===
          "stone-circle"
        ) {
          return {
            question:
              "Na kamieniu widzisz trzy znaki. Który symbol odpowiada wskazówkom znalezionym wcześniej?",

            options: [
              {
                id:
                  "eagle",

                label:
                  "Biały orzeł",

                correct:
                  false,
              },

              {
                id:
                  "wing",

                label:
                  "Skrzydło / Bocian",

                correct:
                  true,
              },

              {
                id:
                  "bear",

                label:
                  "Niedźwiedzia łapa",

                correct:
                  false,
              },
            ] satisfies PuzzleOption[],
          };
        }

        if (
          puzzleId ===
          "dark-gate"
        ) {
          return {
            question:
              "Brama reaguje na zgromadzoną wiedzę. W jakiej kolejności połączysz wskazówki?",

            options: [
              {
                id:
                  "intel-comic-scout",

                label:
                  "Intel → Comic Fragment → wiedza Zwiadowcy",

                correct:
                  true,
              },

              {
                id:
                  "relic-energy",

                label:
                  "Relikt → Meme Energy → siła",

                correct:
                  false,
              },

              {
                id:
                  "bear-force",

                label:
                  "Bear Fragment → taran → atak",

                correct:
                  false,
              },
            ] satisfies PuzzleOption[],
          };
        }

        return {
          question:
            "Który z tych śladów jest najbardziej podejrzany?",

          options: [
            {
              id:
                "tracks",

              label:
                "Głębokie, świeże ślady ciężkich łap",

              correct:
                true,
            },

            {
              id:
                "stones",

              label:
                "Kilka przesuniętych kamieni",

              correct:
                false,
            },

            {
              id:
                "branch",

              label:
                "Złamana gałąź",

              correct:
                false,
            },
          ] satisfies PuzzleOption[],
        };
      },
      [
        puzzleId,
      ]
    );

  /* =========================================================
     BATTLE
  ========================================================= */

  function enemyAttack(
    currentPlayerHp:
      number
  ) {
    if (
      enemyHp <= 0
    ) {
      return;
    }

    const damage =
      mode === "boss"
        ? 18
        : mode ===
            "elite"
          ? 14
          : 10;

    const nextHp =
      Math.max(
        0,
        currentPlayerHp -
          damage
      );

    setPlayerHp(
      nextHp
    );

    setMessage(
      `Przeciwnik zadaje ${damage} obrażeń.`
    );

    if (
      nextHp <= 0
    ) {
      setFinished(
        true
      );

      setMessage(
        "PolishPepe został pokonany."
      );
    }
  }

  function attack() {
    if (
      finished
    ) {
      return;
    }

    const damage =
      24;

    const nextEnemyHp =
      Math.max(
        0,
        enemyHp -
          damage
      );

    setEnemyHp(
      nextEnemyHp
    );

    setMessage(
      `PolishPepe zadaje ${damage} obrażeń.`
    );

    if (
      nextEnemyHp <= 0
    ) {
      setFinished(
        true
      );

      setMessage(
        "Zwycięstwo!"
      );

      return;
    }

    window.setTimeout(
      () => {
        enemyAttack(
          playerHp
        );
      },
      450
    );
  }

  function ability() {
    if (
      finished
    ) {
      return;
    }

    const damage =
      36;

    const nextEnemyHp =
      Math.max(
        0,
        enemyHp -
          damage
      );

    setEnemyHp(
      nextEnemyHp
    );

    setMessage(
      `PLPE Spirit zadaje ${damage} obrażeń.`
    );

    if (
      nextEnemyHp <= 0
    ) {
      setFinished(
        true
      );

      setMessage(
        "Zwycięstwo!"
      );

      return;
    }

    window.setTimeout(
      () => {
        enemyAttack(
          playerHp
        );
      },
      450
    );
  }

  function defend() {
    if (
      finished
    ) {
      return;
    }

    const damage =
      mode === "boss"
        ? 8
        : mode ===
            "elite"
          ? 6
          : 4;

    const nextHp =
      Math.max(
        0,
        playerHp -
          damage
      );

    setPlayerHp(
      nextHp
    );

    setMessage(
      `PolishPepe blokuje większość ataku. Otrzymuje ${damage} obrażeń.`
    );

    if (
      nextHp <= 0
    ) {
      setFinished(
        true
      );
    }
  }

  /* =========================================================
     SEARCH / RESCUE
  ========================================================= */

  function search() {
    if (
      finished
    ) {
      return;
    }

    const next =
      Math.min(
        3,
        searchProgress +
          1
      );

    setSearchProgress(
      next
    );

    if (
      next === 1
    ) {
      setMessage(
        "Przeszukujesz najbliższą okolicę..."
      );
    }

    if (
      next === 2
    ) {
      setMessage(
        mode === "rescue"
          ? "Znajdujesz ślady czyjejś obecności."
          : "Znajdujesz coś podejrzanego."
      );
    }

    if (
      next === 3
    ) {
      setMessage(
        mode === "rescue"
          ? "Znalazłeś zaginioną osobę!"
          : "Znalazłeś to, czego szukałeś."
      );

      setFinished(
        true
      );
    }
  }

  /* =========================================================
     PUZZLE
  ========================================================= */

  function answerPuzzle(
    option: PuzzleOption
  ) {
    if (
      finished
    ) {
      return;
    }

    if (
      option.correct
    ) {
      setWrongAnswer(
        false
      );

      setFinished(
        true
      );

      setMessage(
        "Mechanizm reaguje. To właściwa odpowiedź."
      );

      return;
    }

    setWrongAnswer(
      true
    );

    setMessage(
      "To nie jest właściwa odpowiedź."
    );
  }

  /* =========================================================
     CHOICE
  ========================================================= */

  function choose(
    choice:
      "bridge"
      | "detour"
  ) {
    if (
      selectedChoice
    ) {
      return;
    }

    setSelectedChoice(
      choice
    );

    if (
      choice ===
      "bridge"
    ) {
      setMessage(
        "Wybierasz uszkodzony most. To szybsza droga, ale po drugiej stronie zauważasz ruch Bear Army."
      );
    } else {
      setMessage(
        "Wybierasz dłuższy objazd. Droga jest bezpieczniejsza, ale prowadzi cię z powrotem w pobliże przeprawy."
      );
    }

    setFinished(
      true
    );
  }

  /* =========================================================
     BATTLE UI
  ========================================================= */

  function renderBattle() {
    return (
      <>
        <div className="world-encounter__battle">

          <div className="world-encounter__fighter">

            <div className="world-encounter__hp">

              <span>
                PolishPepe
              </span>

              <div>
                <i
                  style={{
                    width:
                      `${playerHp}%`,
                  }}
                />
              </div>

              <b>
                {playerHp}/100
              </b>

            </div>

            <img
              src={
                charPolishPepe
              }
              alt="PolishPepe"
            />

          </div>

          <div className="world-encounter__vs">
            VS
          </div>

          <div className="world-encounter__fighter world-encounter__fighter--enemy">

            <div className="world-encounter__hp">

              <span>
                {mode === "boss"
                  ? "Bear Commander"
                  : mode === "elite"
                    ? "Bear Elite"
                    : "Bear Patrol"}
              </span>

              <div>
                <i
                  style={{
                    width:
                      `${Math.max(
                        0,
                        (
                          enemyHp /
                          enemyMaxHp
                        ) *
                          100
                      )}%`,
                  }}
                />
              </div>

              <b>
                {enemyHp}/
                {enemyMaxHp}
              </b>

            </div>

            <img
              src={
                charBearScout
              }
              alt="Bear"
            />

          </div>

        </div>

        {!finished && (
          <div className="world-encounter__actions">

            <button
              type="button"
              onClick={
                attack
              }
            >
              ⚔ ATAK
            </button>

            <button
              type="button"
              onClick={
                ability
              }
            >
              ⚡ PLPE SPIRIT
            </button>

            <button
              type="button"
              onClick={
                defend
              }
            >
              🛡 OBRONA
            </button>

          </div>
        )}
      </>
    );
  }

  /* =========================================================
     PUZZLE UI
  ========================================================= */

  function renderPuzzle() {
    return (
      <div className="world-encounter__puzzle">

        <h3>
          {
            puzzle.question
          }
        </h3>

        <div className="world-encounter__answers">

          {puzzle.options.map(
            (
              option
            ) => (
              <button
                key={
                  option.id
                }
                type="button"
                disabled={
                  finished
                }
                onClick={() =>
                  answerPuzzle(
                    option
                  )
                }
              >
                {
                  option.label
                }
              </button>
            )
          )}

        </div>

        {wrongAnswer && (
          <small>
            Spróbuj jeszcze raz.
          </small>
        )}

      </div>
    );
  }

  /* =========================================================
     SEARCH UI
  ========================================================= */

  function renderSearch() {
    return (
      <div className="world-encounter__search">

        <div className="world-encounter__search-progress">

          {[1, 2, 3].map(
            (
              value
            ) => (
              <span
                key={
                  value
                }
                className={
                  searchProgress >=
                  value
                    ? "active"
                    : ""
                }
              >
                {value}
              </span>
            )
          )}

        </div>

        {!finished && (
          <button
            type="button"
            onClick={
              search
            }
          >
            {mode ===
            "rescue"
              ? "🔎 SZUKAJ ZAGINIONEGO"
              : "🔎 PRZESZUKAJ OKOLICĘ"}
          </button>
        )}

      </div>
    );
  }

  /* =========================================================
     CHOICE UI
  ========================================================= */

  function renderChoice() {
    return (
      <div className="world-encounter__choice">

        <button
          type="button"
          disabled={
            selectedChoice !==
            null
          }
          onClick={() =>
            choose(
              "bridge"
            )
          }
        >
          🌉 PRZEJDŹ MOSTEM
        </button>

        <button
          type="button"
          disabled={
            selectedChoice !==
            null
          }
          onClick={() =>
            choose(
              "detour"
            )
          }
        >
          🥾 POSZUKAJ OBJAZDU
        </button>

      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="world-encounter">

      <div className="world-encounter__window">

        <div className="world-encounter__header">

          <div>

            <span>
              {mode === "boss"
                ? "BOSS"
                : mode ===
                    "elite"
                  ? "ELITA"
                  : mode ===
                      "battle"
                    ? "WALKA"
                    : mode ===
                        "puzzle"
                      ? "ZAGADKA"
                      : mode ===
                          "rescue"
                        ? "RATUNEK"
                        : mode ===
                            "search"
                          ? "EKSPLORACJA"
                          : "DECYZJA"}
            </span>

            <h2>
              {title}
            </h2>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
          >
            ✕
          </button>

        </div>

        <p className="world-encounter__description">
          {description}
        </p>

        {(mode ===
          "battle" ||
          mode ===
            "elite" ||
          mode ===
            "boss") &&
          renderBattle()}

        {mode ===
          "puzzle" &&
          renderPuzzle()}

        {(mode ===
          "search" ||
          mode ===
            "rescue") &&
          renderSearch()}

        {mode ===
          "choice" &&
          renderChoice()}

        {message && (
          <div className="world-encounter__message">
            {message}
          </div>
        )}

        {finished &&
          playerHp >
            0 && (
            <button
              type="button"
              className="world-encounter__complete"
              onClick={
                onComplete
              }
            >
              ✓ KONTYNUUJ
            </button>
          )}

        {finished &&
          playerHp <=
            0 && (
            <button
              type="button"
              className="world-encounter__retry"
              onClick={() =>
                window.location.reload()
              }
            >
              ↻ SPRÓBUJ PONOWNIE
            </button>
          )}

      </div>

    </section>
  );
}