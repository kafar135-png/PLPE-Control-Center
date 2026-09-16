import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { createPortal } from "react-dom";

import "./Game.css";
import "./GameTypography.css";

import MainHub from "./MainHub";
import MonasteryHub from "./MonasteryHub";
import ComicArchiveHub from "./ComicArchiveHub";
import ArenaHub from "./ArenaHub";
import TrainingHallHub from "./TrainingHallHub";
import CardForgeHub from "./CardForgeHub";
import VaultHub from "./VaultHub";
import ExpeditionsHub from "./ExpeditionsHub";
import WorldMapHub from "./WorldMapHub";
import PrologueStory from "./PrologueStory";
import GameLoginGate from "./GameLoginGate";
import CharacterClassSelect from "./CharacterClassSelect";
import type { PepeClass } from "./CharacterClasses";

import monastery from "../../assets/game/monastery.png";

import scene1Prologue from "../../assets/game/scene1_prologue_bg.png";
import scene2MountainPath from "../../assets/game/scene2_mountain_path_bg.png";
import scene3MonasteryGate from "../../assets/game/scene3_monastery_gate_bg.png";
import scene4Courtyard from "../../assets/game/scene4_courtyard_bg.png";
import scene5Library from "../../assets/game/scene5_library_bg.png";
import scene6Alarm from "../../assets/game/scene6_alarm_bg.png";
import scene7BearScout from "../../assets/game/scene7_gate_bg.png";
import scene8BattleBackground from "../../assets/game/scene8_battle_bg.png";

import charPolishPepe from "../../assets/game/char_polishpepe.png";
import warriorArt from "../../assets/game/char_polishpepe_warrior.png";
import rangerArt from "../../assets/game/char_polishpepe_ranger.png";
import mageArt from "../../assets/game/char_polishpepe_mage.png";
import charBocian from "../../assets/game/char_bocian.png";
import charBearScout from "../../assets/game/char_bear_scout.png";

import {
  useLanguage,
} from "../../hooks/useLanguage";

import {
  useGameProgress,
} from "./Progress";

import {
  useGameAudio,
} from "./useGameAudio";

import {
  stopGameMusic,
} from "./gameAudio";

import {
  resetPLPEArenaGame,
} from "./gameReset";

import {
  clearGameAuth,
  getGameAuthToken,
  syncGameProgression,
  updateGameSpecialization,
} from "../../services/gameMultiplayer";
import type { GamePlayerProfile } from "../../services/gameMultiplayer";

type GameMode =
  | "welcome"
  | "login"
  | "classSelect"
  | "hub"
  | "monastery"
  | "training"
  | "forge"
  | "archive"
  | "vault"
  | "arena"
  | "expeditions"
  | "worldMap"
  | "prologue"
  | "story"
  | "battle";

type StoryScene =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7;

type Speaker =
  | "narrator"
  | "pepe"
  | "bocian"
  | "bear";

interface DialogueLine {
  speaker: Speaker;
  text: string;
}

interface TypewriterDialogueProps {
  text: string;
  onFinished: () => void;
}

type DamagePopup =
  | {
      target:
        | "player"
        | "enemy";

      value: number;

      type:
        | "damage"
        | "ability";
    }
  | null;

function TypewriterDialogue({
  text,
  onFinished,
}: TypewriterDialogueProps) {
  const [
    visibleText,
    setVisibleText,
  ] = useState("");

  const onFinishedRef =
    useRef(onFinished);

  useEffect(() => {
    onFinishedRef.current =
      onFinished;
  }, [onFinished]);

  useEffect(() => {
    setVisibleText("");

    let index = 0;

    let readingTimer:
      number | undefined;

    const speed = 80;

    const interval =
      window.setInterval(() => {
        index += 1;

        setVisibleText(
          text.slice(
            0,
            index
          )
        );

        if (
          index >=
          text.length
        ) {
          window.clearInterval(
            interval
          );

          const readingTime =
            Math.min(
              7000,
              Math.max(
                2500,
                text.length * 38
              )
            );

          readingTimer =
            window.setTimeout(
              () => {
                onFinishedRef.current();
              },
              readingTime
            );
        }
      }, speed);

    return () => {
      window.clearInterval(
        interval
      );

      if (readingTimer) {
        window.clearTimeout(
          readingTimer
        );
      }
    };
  }, [text]);

  return (
    <p className="plpe-story__typed-text">
      {visibleText}

      <span className="plpe-story__cursor">
        |
      </span>
    </p>
  );
}

export default function Game() {
  const navigate =
    useNavigate();

  const { t, language } =
    useLanguage();

  const {
    progress,

    startChapter,

    completeQuest1,

    completeQuest2,

    upgradeMonastery,

    upgradePepeStat,

    resetProgress,
    choosePepeClass,
  } = useGameProgress();

  const selectedPepeArt = progress.polishPepe.specialization === "ranger" ? rangerArt : progress.polishPepe.specialization === "mage" ? mageArt : progress.polishPepe.specialization === "warrior" ? warriorArt : charPolishPepe;

  useEffect(() => {
    if (!progress.polishPepe.specialization || !getGameAuthToken()) return;

    const timer = window.setTimeout(() => {
      void syncGameProgression({
        level: progress.polishPepe.level,
        xp: progress.polishPepe.xp,
        hp: progress.polishPepe.hp,
        attack: progress.polishPepe.attack,
        defense: progress.polishPepe.defense,
        speed: progress.polishPepe.speed,
      }).catch((error) => {
        console.warn("[PLPE GAME] progression sync failed", error);
      });
    }, 700);

    return () => window.clearTimeout(timer);
  }, [
    progress.polishPepe.specialization,
    progress.polishPepe.level,
    progress.polishPepe.xp,
    progress.polishPepe.hp,
    progress.polishPepe.attack,
    progress.polishPepe.defense,
    progress.polishPepe.speed,
  ]);

  const {
    startAdventureMusic,
    startMonasteryMusic,
    startExplorationMusic,
    startDangerMusic,
    startBattleMusic,
    returnToAdventure,

    playAttack,
    playHit,
    playAbility,
    playBearAttack,
    playVictory,
    playTransition,
  } = useGameAudio();

  const [
    mode,
    setMode,
  ] = useState<GameMode>(
    "welcome"
  );

  const [
    scene,
    setScene,
  ] = useState<StoryScene>(
    1
  );

  const [
    dialogueIndex,
    setDialogueIndex,
  ] = useState(0);

  const [
    transitioning,
    setTransitioning,
  ] = useState(false);

  const [
    playerHp,
    setPlayerHp,
  ] = useState(100);

  const [
    enemyHp,
    setEnemyHp,
  ] = useState(70);

  const [
    playerDefending,
    setPlayerDefending,
  ] = useState(false);

  const [
    battleMessage,
    setBattleMessage,
  ] = useState("");

  const [
    battleLocked,
    setBattleLocked,
  ] = useState(false);

  const [
    playerAttackAnimation,
    setPlayerAttackAnimation,
  ] = useState(false);

  const [
    enemyAttackAnimation,
    setEnemyAttackAnimation,
  ] = useState(false);

  const [
    playerHitAnimation,
    setPlayerHitAnimation,
  ] = useState(false);

  const [
    enemyHitAnimation,
    setEnemyHitAnimation,
  ] = useState(false);

  const [
    abilityAnimation,
    setAbilityAnimation,
  ] = useState(false);

  const [
    damagePopup,
    setDamagePopup,
  ] = useState<DamagePopup>(
    null
  );

  const scenes =
    useMemo<
      Record<
        StoryScene,
        DialogueLine[]
      >
    >(
      () => ({
        1: [
          {
            speaker:
              "narrator",

            text:
              t.game
                .prologueText1,
          },

          {
            speaker:
              "narrator",

            text:
              t.game
                .prologueText2,
          },

          {
            speaker:
              "narrator",

            text:
              t.game
                .prologueText3,
          },
        ],

        2: [
          {
            speaker:
              "narrator",

            text:
              t.game
                .scene2Narrator,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene2PolishPepe,
          },
        ],

        3: [
          {
            speaker:
              "bocian",

            text:
              t.game
                .scene3Bocian1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene3PolishPepe1,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene3Bocian2,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene3PolishPepe2,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene3Bocian3,
          },
        ],

        4: [
          {
            speaker:
              "pepe",

            text:
              t.game
                .scene4PolishPepe1,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene4Bocian1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene4PolishPepe2,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene4Bocian2,
          },
        ],

        5: [
          {
            speaker:
              "bocian",

            text:
              t.game
                .scene5Bocian1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene5PolishPepe1,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene5Bocian2,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene5PolishPepe2,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene5Bocian3,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene5PolishPepe3,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene5Bocian4,
          },
        ],

        6: [
          {
            speaker:
              "bocian",

            text:
              t.game
                .scene6Bocian1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene6PolishPepe1,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene6Bocian2,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene6PolishPepe2,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene6Bocian3,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene6Bocian4,
          },
        ],

        7: [
          {
            speaker:
              "bear",

            text:
              t.game
                .scene7Bear1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene7PolishPepe1,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene7Bocian1,
          },

          {
            speaker:
              "pepe",

            text:
              t.game
                .scene7PolishPepe2,
          },

          {
            speaker:
              "bocian",

            text:
              t.game
                .scene7Bocian2,
          },
        ],
      }),
      [t]
    );

  const currentDialogue =
    scenes[scene][
      dialogueIndex
    ];

  const dialogueFinished =
    dialogueIndex >=
    scenes[scene].length - 1;

  /* =========================================================
     STORY MUSIC
  ========================================================= */

  useEffect(() => {
    if (
      mode !== "story"
    ) {
      return;
    }

    if (
      scene === 1 ||
      scene === 2
    ) {
      startExplorationMusic();

      return;
    }

    if (
      scene >= 3 &&
      scene <= 5
    ) {
      startMonasteryMusic();

      return;
    }

    if (
      scene === 6 ||
      scene === 7
    ) {
      startDangerMusic();
    }
  }, [
    mode,
    scene,
    startExplorationMusic,
    startMonasteryMusic,
    startDangerMusic,
  ]);

  function changeScene(
    nextScene: StoryScene
  ) {
    playTransition();

    setTransitioning(
      true
    );

    window.setTimeout(
      () => {
        setScene(
          nextScene
        );

        setDialogueIndex(
          0
        );

        window.setTimeout(
          () => {
            setTransitioning(
              false
            );
          },
          450
        );
      },
      550
    );
  }

  function handleDialogueFinished() {
    if (
      !dialogueFinished
    ) {
      setDialogueIndex(
        (current) =>
          current + 1
      );

      return;
    }

    if (
      scene === 1 ||
      scene === 3 ||
      scene === 4 ||
      scene === 5
    ) {
      changeScene(
        (scene + 1) as StoryScene
      );
    }
  }

  /* =========================================================
     MAIN NAVIGATION
  ========================================================= */

  function goToHub() {
    playTransition();

    startAdventureMusic();

    setMode(
      "hub"
    );
  }

  function handleBeginAdventure() {
    startAdventureMusic();

    setMode(
      "login"
    );
  }

  function handleGameAuthenticated(player: GamePlayerProfile) {
    const serverClass = player.specialization as PepeClass | null;
    if (!progress.polishPepe.specialization && serverClass) {
      choosePepeClass(serverClass);
      if (progress.chapterStarted) {
        startAdventureMusic();
        setMode("hub");
      } else {
        startExplorationMusic();
        setMode("prologue");
      }
      return;
    }

    if (!progress.polishPepe.specialization) {
      startAdventureMusic();
      setMode("classSelect");
      return;
    }

    if (progress.chapterStarted) {
      startAdventureMusic();
      setMode("hub");
      return;
    }

    startExplorationMusic();
    setMode("prologue");
  }

  async function handleClassSelected(pepeClass: PepeClass) {
    await updateGameSpecialization(pepeClass);
    choosePepeClass(pepeClass);
    if (progress.chapterStarted) {
      startAdventureMusic();
      setMode("hub");
      return;
    }
    startExplorationMusic();
    setMode("prologue");
  }

  function handleExitGame() {
    stopGameMusic();

    setMode(
      "welcome"
    );

    setScene(
      1
    );

    setDialogueIndex(
      0
    );

    navigate(
      "/"
    );
  }

  /* =========================================================
     MONASTERY
  ========================================================= */

  function handleMonastery() {
    playTransition();

    startMonasteryMusic();

    setMode(
      "monastery"
    );
  }

  /* =========================================================
     TRAINING HALL
  ========================================================= */

  function handleTrainingHall() {
    playTransition();

    startMonasteryMusic();

    setMode(
      "training"
    );
  }

  /* =========================================================
     CARD FORGE
  ========================================================= */

  function handleCardForge() {
    playTransition();

    startDangerMusic();

    setMode(
      "forge"
    );
  }

  /* =========================================================
     ARCHIVE
  ========================================================= */

  function handleComicArchive() {
    playTransition();

    startExplorationMusic();

    setMode(
      "archive"
    );
  }

  /* =========================================================
     VAULT
  ========================================================= */

  function handleVault() {
    playTransition();

    startMonasteryMusic();

    setMode(
      "vault"
    );
  }

  /* =========================================================
     ARENA
  ========================================================= */

  function handleArena() {
    playTransition();

    startDangerMusic();

    setMode(
      "arena"
    );
  }

  /* =========================================================
     EXPEDITIONS
  ========================================================= */

  function handleExpeditions() {
    playTransition();

    startExplorationMusic();

    setMode(
      "expeditions"
    );
  }

  function handleOpenWorldMap() {
    playTransition();

    startExplorationMusic();

    setMode(
      "worldMap"
    );
  }

  function handleBackToExpeditions() {
    playTransition();

    startExplorationMusic();

    setMode(
      "expeditions"
    );
  }

  /* =========================================================
     STORY
  ========================================================= */

  function handleStartChapter() {
    setDialogueIndex(
      0
    );

    if (
      !progress
        .chapterStarted
    ) {
      startExplorationMusic();

      setMode(
        "prologue"
      );

      return;
    }

    setScene(
      4
    );

    startMonasteryMusic();

    setMode(
      "story"
    );
  }

  function handlePrologueComplete() {
    startChapter();

    setScene(
      4
    );

    setDialogueIndex(
      0
    );

    startAdventureMusic();

    setMode(
      "hub"
    );
  }

  function handleGoToMonastery() {
    changeScene(
      3
    );
  }

  function handleInvestigate() {
    completeQuest1();

    changeScene(
      7
    );
  }

  function startBattle() {
    startBattleMusic();

    setPlayerHp(
      progress
        .polishPepe
        .hp
    );

    setEnemyHp(
      70
    );

    setPlayerDefending(
      false
    );

    setBattleMessage(
      ""
    );

    setBattleLocked(
      false
    );

    setDamagePopup(
      null
    );

    setMode(
      "battle"
    );
  }

  function handleDefendMonastery() {
    playTransition();

    setTransitioning(
      true
    );

    window.setTimeout(
      () => {
        startBattle();

        setTransitioning(
          false
        );
      },
      550
    );
  }

  function handleStartArenaBattle() {
    playTransition();

    window.setTimeout(
      () => {
        startBattle();
      },
      400
    );
  }

  /* =========================================================
     RESET
  ========================================================= */

  function handleResetProgress() {
    const confirmed = window.confirm(
      language === "pl"
        ? "Czy na pewno chcesz zresetować postęp gry i zacząć od nowa?\n\nDotychczasowy postęp w grze zostanie utracony."
        : "Are you sure you want to reset your game progress and start over?\n\nYour current game progress will be lost."
    );

    if (!confirmed) {
      return;
    }

    clearGameAuth();
    resetPLPEArenaGame();
    resetProgress();
    returnToAdventure();

    window.location.reload();
  }

  /* =========================================================
     BATTLE
  ========================================================= */

  const battleFinished =
    enemyHp <= 0 ||
    playerHp <= 0;

  const battleResult =
    enemyHp <= 0
      ? "victory"
      : playerHp <= 0
        ? "defeat"
        : null;

  function showDamage(
    target:
      | "player"
      | "enemy",

    value: number,

    type:
      | "damage"
      | "ability"
  ) {
    setDamagePopup({
      target,
      value,
      type,
    });

    window.setTimeout(
      () => {
        setDamagePopup(
          null
        );
      },
      850
    );
  }

  function enemyTurn(
    currentHp: number,
    defending: boolean
  ) {
    let damage =
      defending
        ? 7
        : 14;

    /*
      Defense zaczyna wpływać
      na rzeczywistą walkę.
    */

    const defenseReduction =
      Math.floor(
        progress
          .polishPepe
          .defense /
          10
      );

    damage =
      Math.max(
        1,
        damage -
          defenseReduction
      );

    playBearAttack();

    setEnemyAttackAnimation(
      true
    );

    window.setTimeout(
      () => {
        setEnemyAttackAnimation(
          false
        );

        playHit();

        setPlayerHitAnimation(
          true
        );

        showDamage(
          "player",
          damage,
          "damage"
        );

        setPlayerHp(
          Math.max(
            0,
            currentHp -
              damage
          )
        );

        setBattleMessage(
          `${t.game.bearScout}: -${damage} HP`
        );

        window.setTimeout(
          () => {
            setPlayerHitAnimation(
              false
            );

            setPlayerDefending(
              false
            );

            setBattleLocked(
              false
            );
          },
          450
        );
      },
      450
    );
  }

  function handleAttack() {
    if (
      battleFinished ||
      battleLocked
    ) {
      return;
    }

    setBattleLocked(
      true
    );

    playAttack();

    setPlayerAttackAnimation(
      true
    );

    let damage =
      progress
        .polishPepe
        .attack;

    /*
      PLPE Spirit:
      +15% ATK poniżej 50% HP.
    */

    if (
      playerHp <=
      progress
        .polishPepe
        .hp *
        0.5
    ) {
      damage =
        Math.round(
          damage *
            1.15
        );
    }

    window.setTimeout(
      () => {
        setPlayerAttackAnimation(
          false
        );

        playHit();

        setEnemyHitAnimation(
          true
        );

        showDamage(
          "enemy",
          damage,
          "damage"
        );

        const nextEnemyHp =
          Math.max(
            0,
            enemyHp -
              damage
          );

        setEnemyHp(
          nextEnemyHp
        );

        setBattleMessage(
          `${t.game.polishPepe}: -${damage} HP`
        );

        window.setTimeout(
          () => {
            setEnemyHitAnimation(
              false
            );

            if (
              nextEnemyHp > 0
            ) {
              enemyTurn(
                playerHp,
                playerDefending
              );
            } else {
              setBattleLocked(
                false
              );

              playVictory();
            }
          },
          450
        );
      },
      350
    );
  }

  function handleAbility() {
    if (
      battleFinished ||
      battleLocked
    ) {
      return;
    }

    setBattleLocked(
      true
    );

    playAbility();

    setAbilityAnimation(
      true
    );

    setPlayerAttackAnimation(
      true
    );

    const damage =
      progress
        .polishPepe
        .attack +
      8;

    window.setTimeout(
      () => {
        setPlayerAttackAnimation(
          false
        );

        playHit();

        setEnemyHitAnimation(
          true
        );

        showDamage(
          "enemy",
          damage,
          "ability"
        );

        const nextEnemyHp =
          Math.max(
            0,
            enemyHp -
              damage
          );

        setEnemyHp(
          nextEnemyHp
        );

        setBattleMessage(
          `${t.game.polishPepe} · PLPE Spirit: -${damage} HP`
        );

        window.setTimeout(
          () => {
            setAbilityAnimation(
              false
            );

            setEnemyHitAnimation(
              false
            );

            if (
              nextEnemyHp > 0
            ) {
              enemyTurn(
                playerHp,
                playerDefending
              );
            } else {
              setBattleLocked(
                false
              );

              playVictory();
            }
          },
          550
        );
      },
      550
    );
  }

  function handleDefend() {
    if (
      battleFinished ||
      battleLocked
    ) {
      return;
    }

    setBattleLocked(
      true
    );

    setPlayerDefending(
      true
    );

    setBattleMessage(
      `${t.game.polishPepe}: ${t.game.defend}`
    );

    window.setTimeout(
      () => {
        enemyTurn(
          playerHp,
          true
        );
      },
      500
    );
  }

  function handleClaimVictory() {
    completeQuest2();

    returnToAdventure();

    setMode(
      "hub"
    );
  }

  /* =========================================================
     STORY HELPERS
  ========================================================= */

  function getSpeakerName(
    speaker: Speaker
  ) {
    if (
      speaker === "pepe"
    ) {
      return t.game.polishPepe;
    }

    if (
      speaker === "bocian"
    ) {
      return t.game.bocian;
    }

    if (
      speaker === "bear"
    ) {
      return t.game.bearScout;
    }

    return "";
  }

  function getSceneBackground() {
    switch (scene) {
      case 1:
        return scene1Prologue;

      case 2:
        return scene2MountainPath;

      case 3:
        return scene3MonasteryGate;

      case 4:
        return scene4Courtyard;

      case 5:
        return scene5Library;

      case 6:
        return scene6Alarm;

      case 7:
        return scene7BearScout;

      default:
        return monastery;
    }
  }

  /* =========================================================
     WELCOME
  ========================================================= */

  if (
    mode === "welcome"
  ) {
    return (
      <main
        className="plpe-welcome"
        style={{
          backgroundImage: `linear-gradient(
            rgba(2, 6, 11, 0.35),
            rgba(2, 6, 11, 0.78)
          ), url(${scene2MountainPath})`,
        }}
      >
        <div className="plpe-welcome__content">

          <span className="plpe-welcome__eyebrow">
            POLISHPEPE UNIVERSE
          </span>

          <h1>
            {
              t.game
                .welcomeTitle
            }
          </h1>

          <p>
            {
              t.game
                .welcomeText1
            }
          </p>

          <p>
            {
              t.game
                .welcomeText2
            }
          </p>

          <button
            type="button"
            onClick={
              handleBeginAdventure
            }
          >
            {
              t.game
                .beginAdventure
            }
          </button>

        </div>
      </main>
    );
  }

  /* =========================================================
     PLAYER LOGIN
  ========================================================= */

  if (
    mode === "login"
  ) {
    return (
      <GameLoginGate
        onAuthenticated={
          handleGameAuthenticated
        }
        onBack={() =>
          setMode(
            "welcome"
          )
        }
      />
    );
  }

  if (mode === "classSelect") {
    return <CharacterClassSelect onSelect={handleClassSelected} />;
  }

  /* =========================================================
     MAIN HUB
  ========================================================= */

  if (
    mode === "hub"
  ) {
    return (
      <>
        <MainHub
          level={
            progress
              .polishPepe
              .level
          }

          xp={
            progress
              .polishPepe
              .xp
          }

          xpRequired={
            progress
              .polishPepe
              .xpRequired
          }

          memeEnergy={
            progress
              .memeEnergy
          }

          relics={
            progress
              .relics
          }

          intel={
            progress
              .intel
          }

          onMonastery={
            handleMonastery
          }

          onTrainingHall={
            handleTrainingHall
          }

          onCardForge={
            handleCardForge
          }

          onComicArchive={
            handleComicArchive
          }

          onVault={
            handleVault
          }

          onArena={
            handleArena
          }

          onExpeditions={
            handleExpeditions
          }

          onExit={
            handleExitGame
          }
        />

        {!progress
          .quest2Completed && (
          <button
            type="button"
            className="plpe-hub__story-button"
            onClick={
              handleStartChapter
            }
          >
            {
              t.game
                .startChapter
            }
          </button>
        )}

      </>
    );
  }

  /* =========================================================
     MONASTERY
  ========================================================= */

  if (
    mode ===
    "monastery"
  ) {
    return (
      <MonasteryHub
        monasteryLevel={
          progress
            .monastery
            .level
        }

        bocianRank={
          progress
            .bocian
            .rank
        }

        bocianXp={
          progress
            .bocian
            .xp
        }

        bocianXpRequired={
          progress
            .bocian
            .xpRequired
        }

        bocianSupportLevel={
          progress
            .bocian
            .supportLevel
        }

        trainingHallLevel={
          progress
            .buildings
            .trainingHall
        }

        cardForgeLevel={
          progress
            .buildings
            .cardForge
        }

        comicArchiveLevel={
          progress
            .buildings
            .comicArchive
        }

        plpeVaultLevel={
          progress
            .buildings
            .plpeVault
        }

        arenaLevel={
          progress
            .buildings
            .arena
        }

        expeditionsLevel={
          progress
            .buildings
            .expeditions
        }

        currentChapter={
          progress
            .chapter
        }

        chapter1Completed={
          progress
            .chapter1Completed
        }

        quest1Completed={
          progress
            .quest1Completed
        }

        quest2Completed={
          progress
            .quest2Completed
        }

        memeEnergy={
          progress
            .memeEnergy
        }

        relics={
          progress
            .relics
        }

        intel={
          progress
            .intel
        }

        unlockedRegions={
          progress
            .world
            .unlockedRegions
        }

        onUpgradeMonastery={
          upgradeMonastery
        }

        onResetGame={
          handleResetProgress
        }

        onBack={
          goToHub
        }
      />
    );
  }

  /* =========================================================
     TRAINING HALL
  ========================================================= */

  if (
    mode ===
    "training"
  ) {
    return createPortal(
      (
        <TrainingHallHub
        level={
          progress
            .polishPepe
            .level
        }

        xp={
          progress
            .polishPepe
            .xp
        }

        xpRequired={
          progress
            .polishPepe
            .xpRequired
        }

        hp={
          progress
            .polishPepe
            .hp
        }

        attack={
          progress
            .polishPepe
            .attack
        }

        defense={
          progress
            .polishPepe
            .defense
        }

        speed={
          progress
            .polishPepe
            .speed
        }

        skillPoints={
          progress
            .polishPepe
            .skillPoints
        }

        onUpgradeStat={
          upgradePepeStat
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     CARD FORGE
  ========================================================= */

  if (
    mode === "forge"
  ) {
    return createPortal(
      (
        <CardForgeHub
        forgeLevel={
          progress
            .buildings
            .cardForge
        }

        memeEnergy={
          progress
            .memeEnergy
        }

        relics={
          progress
            .relics
        }

        bearFragments={
          progress
            .bearFragments
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     ARCHIVE
  ========================================================= */

  if (
    mode ===
    "archive"
  ) {
    return createPortal(
      (
        <ComicArchiveHub
        currentChapter={
          progress
            .chapter
        }

        chapter1Completed={
          progress
            .chapter1Completed
        }

        quest1Completed={
          progress
            .quest1Completed
        }

        quest2Completed={
          progress
            .quest2Completed
        }

        intel={
          progress
            .intel
        }

        bearFragments={
          progress
            .bearFragments
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     VAULT
  ========================================================= */

  if (
    mode === "vault"
  ) {
    return createPortal(
      (
        <VaultHub
        vaultLevel={
          progress
            .buildings
            .plpeVault
        }

        memeEnergy={
          progress
            .memeEnergy
        }

        relics={
          progress
            .relics
        }

        intel={
          progress
            .intel
        }

        bearFragments={
          progress
            .bearFragments
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     ARENA
  ========================================================= */

  if (
    mode === "arena"
  ) {
    return createPortal(
      (
        <ArenaHub
        playerLevel={
          progress
            .polishPepe
            .level
        }

        playerXp={
          progress
            .polishPepe
            .xp
        }

        playerXpRequired={
          progress
            .polishPepe
            .xpRequired
        }

        memeEnergy={
          progress
            .memeEnergy
        }

        relics={
          progress
            .relics
        }

        intel={
          progress
            .intel
        }

        chapter1Completed={
          progress
            .chapter1Completed
        }

        onStartRankedBattle={
          handleStartArenaBattle
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     EXPEDITIONS
  ========================================================= */

  if (
    mode ===
    "expeditions"
  ) {
    return createPortal(
      (
        <ExpeditionsHub
        expeditionsLevel={
          progress
            .buildings
            .expeditions
        }

        unlockedRegions={
          progress
            .world
            .unlockedRegions
        }

        onOpenWorldMap={
          handleOpenWorldMap
        }

        onBack={
          goToHub
        }
      />
      ),
      document.body
    );
  }

  /* =========================================================
     WORLD MAP
  ========================================================= */

  if (
    mode ===
    "worldMap"
  ) {
    return (
      <WorldMapHub
        unlockedRegions={
          progress
            .world
            .unlockedRegions
        }

        onBack={
          handleBackToExpeditions
        }

        onEnterMonastery={
          handleMonastery
        }
      />
    );
  }

  /* =========================================================
     CINEMATIC PROLOGUE
  ========================================================= */

  if (
    mode === "prologue"
  ) {
    return (
      <PrologueStory
        onComplete={
          handlePrologueComplete
        }
      />
    );
  }

  /* =========================================================
     STORY
  ========================================================= */

  if (
    mode === "story"
  ) {
    return (
      <main
        className={`plpe-story ${
          transitioning
            ? "plpe-story--transition"
            : ""
        }`}
        style={{
          backgroundImage: `linear-gradient(
            rgba(2, 6, 11, 0.14),
            rgba(2, 6, 11, 0.40)
          ), url(${getSceneBackground()})`,
        }}
      >
        <div className="plpe-story__characters">

          {scene >= 2 &&
            scene <= 7 && (
              <div
                className={`plpe-story__speaker plpe-story__speaker--pepe ${
                  currentDialogue
                    .speaker ===
                  "pepe"
                    ? "plpe-story__speaker--active"
                    : ""
                }`}
              >
                <img
                  src={selectedPepeArt}
                  alt="PolishPepe"
                />
              </div>
            )}

          {scene >= 3 &&
            scene <= 6 && (
              <div
                className={`plpe-story__speaker plpe-story__speaker--bocian ${
                  currentDialogue
                    .speaker ===
                  "bocian"
                    ? "plpe-story__speaker--active"
                    : ""
                }`}
              >
                <img
                  src={
                    charBocian
                  }
                  alt="Bocian"
                />
              </div>
            )}

          {scene === 7 && (
            <div
              className={`plpe-story__speaker plpe-story__speaker--bear ${
                currentDialogue
                  .speaker ===
                  "bear"
                    ? "plpe-story__speaker--active"
                    : ""
              }`}
            >
              <img
                src={
                  charBearScout
                }
                alt={
                  t.game
                    .bearScout
                }
              />
            </div>
          )}

        </div>

        <div
          className={`plpe-story__dialogue-box plpe-story__dialogue-box--${currentDialogue.speaker}`}
          key={`${scene}-${dialogueIndex}`}
        >
          {currentDialogue
            .speaker !==
            "narrator" && (
            <strong>
              {
                getSpeakerName(
                  currentDialogue
                    .speaker
                )
              }
            </strong>
          )}

          <TypewriterDialogue
            text={
              currentDialogue
                .text
            }
            onFinished={
              handleDialogueFinished
            }
          />
        </div>

        {scene === 2 &&
          dialogueFinished && (
            <button
              type="button"
              className="plpe-story__action"
              onClick={
                handleGoToMonastery
              }
            >
              {
                t.game
                  .goToMonastery
              }
            </button>
          )}

        {scene === 6 &&
          dialogueFinished && (
            <button
              type="button"
              className="plpe-story__action"
              onClick={
                handleInvestigate
              }
            >
              {
                t.game
                  .investigate
              }
            </button>
          )}

        {scene === 7 &&
          dialogueFinished && (
            <button
              type="button"
              className="plpe-story__action plpe-story__action--battle"
              onClick={
                handleDefendMonastery
              }
            >
              {
                t.game
                  .defendMonastery
              }
            </button>
          )}

      </main>
    );
  }

  /* =========================================================
     BATTLE
  ========================================================= */

  return (
    <main
      className="plpe-game plpe-game--battle"
      style={{
        backgroundImage: `linear-gradient(
          rgba(4, 8, 14, 0.05),
          rgba(4, 8, 14, 0.32)
        ), url(${scene8BattleBackground})`,
      }}
    >
      <section className="plpe-game__battle">

        <div className="plpe-game__battle-title">

          <span className="plpe-game__eyebrow">
            {
              t.game
                .battle
            }
          </span>

          <h2>
            {
              t.game
                .polishPepe
            }

            {" VS "}

            {
              t.game
                .bearScout
            }
          </h2>

        </div>

        <div className="plpe-game__battle-field">

          <div
            className={`plpe-game__battle-character plpe-game__battle-character--pepe ${
              playerAttackAnimation
                ? "plpe-game__battle-character--player-attack"
                : ""
            } ${
              playerHitAnimation
                ? "plpe-game__battle-character--hit"
                : ""
            } ${
              abilityAnimation
                ? "plpe-game__battle-character--ability"
                : ""
            }`}
          >
            <div className="plpe-game__floating-hp">

              <span>
                {
                  t.game
                    .polishPepe
                }
              </span>

              <div className="plpe-game__health-bar">
                <div
                  className="plpe-game__health-fill"
                  style={{
                    width:
                      `${Math.max(
                        0,
                        (playerHp /
                          progress
                            .polishPepe
                            .hp) *
                          100
                      )}%`,
                  }}
                />
              </div>

              <strong>
                {playerHp}
                {" / "}
                {
                  progress
                    .polishPepe
                    .hp
                }
              </strong>

            </div>

            <img
              src={
                charPolishPepe
              }
              alt="PolishPepe"
            />

            {damagePopup
              ?.target ===
              "player" && (
              <div className="plpe-game__damage-popup">
                -
                {
                  damagePopup
                    .value
                }
              </div>
            )}

          </div>

          <div className="plpe-game__battle-support">

            <img
              src={
                charBocian
              }
              alt="Bocian"
            />

          </div>

          <div
            className={`plpe-game__battle-character plpe-game__battle-character--enemy ${
              enemyAttackAnimation
                ? "plpe-game__battle-character--enemy-attack"
                : ""
            } ${
              enemyHitAnimation
                ? "plpe-game__battle-character--hit"
                : ""
            }`}
          >
            <div className="plpe-game__floating-hp plpe-game__floating-hp--enemy">

              <span>
                {
                  t.game
                    .bearScout
                }
              </span>

              <div className="plpe-game__health-bar">
                <div
                  className="plpe-game__health-fill plpe-game__health-fill--enemy"
                  style={{
                    width:
                      `${
                        (Math.max(
                          0,
                          enemyHp
                        ) /
                          70) *
                        100
                      }%`,
                  }}
                />
              </div>

              <strong>
                {enemyHp}
                {" / 70"}
              </strong>

            </div>

            <img
              src={
                charBearScout
              }
              alt={
                t.game
                  .bearScout
              }
            />

            {damagePopup
              ?.target ===
              "enemy" && (
              <div
                className={`plpe-game__damage-popup ${
                  damagePopup
                    .type ===
                  "ability"
                    ? "plpe-game__damage-popup--ability"
                    : ""
                }`}
              >
                -
                {
                  damagePopup
                    .value
                }
              </div>
            )}

          </div>

        </div>

        <div className="plpe-game__battle-cards">

          <article className="plpe-game__combat-card">

            <h3>
              {
                t.game
                  .polishPepe
              }
            </h3>

            <p>
              HP{" "}
              {
                progress
                  .polishPepe
                  .hp
              }
            </p>

            <p>
              ATK{" "}
              {
                progress
                  .polishPepe
                  .attack
              }
            </p>

            <p>
              DEF{" "}
              {
                progress
                  .polishPepe
                  .defense
              }
            </p>

            <p>
              SPD{" "}
              {
                progress
                  .polishPepe
                  .speed
              }
            </p>

            <hr />

            <strong>
              PLPE Spirit
            </strong>

            <small>
              +15% ATK below 50% HP
            </small>

          </article>

          <div className="plpe-game__battle-actions">

            <button
              type="button"
              disabled={
                battleLocked ||
                battleFinished
              }
              onClick={
                handleAttack
              }
            >
              ⚔️{" "}
              {
                t.game
                  .attack
              }
            </button>

            <button
              type="button"
              disabled={
                battleLocked ||
                battleFinished
              }
              onClick={
                handleAbility
              }
            >
              ⚡{" "}
              {
                t.game
                  .ability
              }
            </button>

            <button
              type="button"
              disabled={
                battleLocked ||
                battleFinished
              }
              onClick={
                handleDefend
              }
            >
              🛡️{" "}
              {
                t.game
                  .defend
              }
            </button>

          </div>

          <article className="plpe-game__combat-card">

            <h3>
              {
                t.game
                  .bearScout
              }
            </h3>

            <p>
              HP {enemyHp}/70
            </p>

            <p>
              ATK 14
            </p>

            <p>
              DEF 8
            </p>

            <p>
              SPD 10
            </p>

          </article>

        </div>

        {battleMessage && (
          <div className="plpe-game__battle-message">
            {
              battleMessage
            }
          </div>
        )}

        {battleResult ===
          "victory" && (
          <div className="plpe-game__battle-result">

            <h2>
              {
                t.game
                  .victory
              }
            </h2>

            <p>
              +100 XP
              <br />

              +80{" "}
              {
                t.game
                  .memeEnergy
              }

              <br />

              +2 Bear Fragments
            </p>

            <button
              type="button"
              onClick={
                handleClaimVictory
              }
            >
              {
                t.game
                  .reward
              }
            </button>

          </div>
        )}

      </section>
    </main>
  );
}