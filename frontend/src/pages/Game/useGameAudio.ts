import {
  useCallback,
  useEffect,
} from "react";

import {
  startMenuMusic,
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
  playClick,
} from "./gameAudio";

export function useGameAudio() {
  useEffect(() => {
    function handleButtonClick(
      event: MouseEvent
    ) {
      const target =
        event.target as HTMLElement;

      if (!target.closest("button")) {
        return;
      }

      playClick();
    }

    document.addEventListener(
      "click",
      handleButtonClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleButtonClick
      );
    };
  }, []);

  const startAdventureMusic =
    useCallback(() => {
      void startMenuMusic();
    }, []);

  const startMonastery =
    useCallback(() => {
      void startMonasteryMusic();
    }, []);

  const startExploration =
    useCallback(() => {
      void startExplorationMusic();
    }, []);

  const startDanger =
    useCallback(() => {
      void startDangerMusic();
    }, []);

  const startBattle =
    useCallback(() => {
      void startBattleMusic();
    }, []);

  const returnAdventure =
    useCallback(() => {
      void returnToAdventure();
    }, []);

  return {
    startAdventureMusic,
    startMonasteryMusic:
      startMonastery,
    startExplorationMusic:
      startExploration,
    startDangerMusic:
      startDanger,
    startBattleMusic:
      startBattle,
    returnToAdventure:
      returnAdventure,

    playAttack,
    playHit,
    playAbility,
    playBearAttack,
    playVictory,
    playTransition,
  };
}