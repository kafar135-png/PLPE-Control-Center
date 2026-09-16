import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./PrologueStory.css";

import {
  PROLOGUE_SCENES,
} from "./PrologueData";

import prologue01 from "../../assets/game/prologue_01_balloon_crash.png";
import prologue02 from "../../assets/game/prologue_02_map_clue.png";
import prologue03 from "../../assets/game/prologue_03_first_days.png";
import prologue04 from "../../assets/game/prologue_04_wandering.png";
import prologue05 from "../../assets/game/prologue_05_months.png";
import prologue06 from "../../assets/game/prologue_06_mountains.png";
import prologue07 from "../../assets/game/prologue_07_monastery_reveal.png";
import prologue08 from "../../assets/game/prologue_08_gate.png";

import {
  useLanguage,
} from "../../hooks/useLanguage";

import {
  isDialogueVoicePlaying,
  playDialogueVoice,
  stopDialogueVoice,
  useDialogueVoice,
} from "./dialogueVoice";

interface PrologueStoryProps {
  onComplete: () => void;
}

const PROLOGUE_BACKGROUNDS = [
  prologue01,
  prologue02,
  prologue03,
  prologue04,
  prologue05,
  prologue06,
  prologue07,
  prologue08,
];

export default function PrologueStory({
  onComplete,
}: PrologueStoryProps) {
  const {
    language,
  } = useLanguage();

  const voice = useDialogueVoice();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [inputLocked, setInputLocked] = useState(false);

  const typingTimerRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<number | null>(null);

  const scene = PROLOGUE_SCENES[sceneIndex];
  const dialogue = scene.dialogue[dialogueIndex];
  const background = PROLOGUE_BACKGROUNDS[sceneIndex];

  function localized(values: {
    pl: string;
    en: string;
    de: string;
  }) {
    if (language === "pl") return values.pl;
    if ((language as string) === "de") return values.de;
    return values.en;
  }

  const dialogueText = useMemo(
    () => localized(dialogue),
    [dialogue, language]
  );

  const title = localized(scene.title);
  const subtitle = localized(scene.subtitle);
  const isTyping = visibleText.length < dialogueText.length;
  const voiceKey = `prologue-${String(sceneIndex + 1).padStart(2, "0")}-${String(dialogueIndex + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (voice.enabled && !isDialogueVoicePlaying(voiceKey)) {
      void playDialogueVoice(voiceKey, language, voice.volume);
    }
  }, [voiceKey, language, voice.enabled, voice.volume]);

  useEffect(() => () => stopDialogueVoice(), []);

  function clearTypingTimer() {
    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }

  function clearUnlockTimer() {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  }

  useEffect(() => {
    clearTypingTimer();
    setVisibleText("");

    let characterIndex = 0;

    typingTimerRef.current = window.setInterval(() => {
      characterIndex += 1;
      setVisibleText(dialogueText.slice(0, characterIndex));

      if (characterIndex >= dialogueText.length) {
        clearTypingTimer();
      }
    }, 28);

    return () => {
      clearTypingTimer();
    };
  }, [sceneIndex, dialogueIndex, dialogueText]);

  useEffect(() => {
    return () => {
      clearTypingTimer();
      clearUnlockTimer();
    };
  }, []);

  function lockInputBriefly() {
    clearUnlockTimer();
    setInputLocked(true);

    unlockTimerRef.current = window.setTimeout(() => {
      setInputLocked(false);
      unlockTimerRef.current = null;
    }, 120);
  }

  function advance() {
    if (inputLocked) return;

    if (isTyping) {
      clearTypingTimer();
      setVisibleText(dialogueText);
      // This branch is always triggered by an explicit click/key gesture. If
      // autoplay was blocked on the first line, replay it now while the browser
      // grants audio permission.
      if (voice.enabled && !isDialogueVoicePlaying(voiceKey)) {
        void playDialogueVoice(voiceKey, language, voice.volume);
      }
      lockInputBriefly();
      return;
    }

    stopDialogueVoice();

    const isLastDialogue = dialogueIndex >= scene.dialogue.length - 1;

    if (!isLastDialogue) {
      const nextKey = `prologue-${String(sceneIndex + 1).padStart(2, "0")}-${String(dialogueIndex + 2).padStart(2, "0")}`;
      if (voice.enabled) void playDialogueVoice(nextKey, language, voice.volume);
      setDialogueIndex((current) => current + 1);
      lockInputBriefly();
      return;
    }

    const isLastScene = sceneIndex >= PROLOGUE_SCENES.length - 1;

    if (isLastScene) {
      clearTypingTimer();
      clearUnlockTimer();
      onComplete();
      return;
    }

    const nextSceneKey = `prologue-${String(sceneIndex + 2).padStart(2, "0")}-01`;
    if (voice.enabled) void playDialogueVoice(nextSceneKey, language, voice.volume);
    setSceneIndex((current) => current + 1);
    setDialogueIndex(0);
    lockInputBriefly();
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "Enter" &&
        event.key !== " " &&
        event.key !== "ArrowRight"
      ) {
        return;
      }

      event.preventDefault();
      advance();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  function speakerName() {
    if (dialogue.speaker === "pepe") return "PolishPepe";
    if (dialogue.speaker === "bocian") return "Bocian";
    return "";
  }

  function progressPercent() {
    return Math.round(
      ((sceneIndex + 1) / PROLOGUE_SCENES.length) * 100
    );
  }

  function continueLabel() {
    if (isTyping) {
      if (language === "pl") return "POKAŻ TEKST";
      if ((language as string) === "de") return "TEXT ANZEIGEN";
      return "SHOW TEXT";
    }

    const isLastDialogue = dialogueIndex >= scene.dialogue.length - 1;
    const isLastScene = sceneIndex >= PROLOGUE_SCENES.length - 1;

    if (isLastDialogue && isLastScene) {
      if (language === "pl") return "ROZPOCZNIJ GRĘ";
      if ((language as string) === "de") return "SPIEL STARTEN";
      return "START GAME";
    }

    if (language === "pl") return "DALEJ";
    if ((language as string) === "de") return "WEITER";
    return "NEXT";
  }

  return (
    <main
      className="prologue-cinematic"
      style={{
        backgroundImage: `url(${background})`,
      }}
      onClick={advance}
      role="button"
      tabIndex={0}
      aria-label={continueLabel()}
    >
      <div className="prologue-cinematic__overlay" />

      <header className="prologue-cinematic__header">
        <div className="prologue-cinematic__chapter">
          <span>{scene.chapter}</span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </div>

        <button
          type="button"
          className={`prologue-cinematic__voice ${voice.enabled ? "active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            if (voice.enabled) {
              voice.disable();
            } else {
              voice.enable();
              void playDialogueVoice(voiceKey, language, voice.volume);
            }
          }}
          title={language === "pl" ? "Lektor" : "Voice over"}
        >
          {voice.enabled ? "🔊 LEKTOR" : "🔇 LEKTOR"}
        </button>

        <div className="prologue-cinematic__progress">
          <div>
            <span
              style={{
                width: `${progressPercent()}%`,
              }}
            />
          </div>

          <small>
            {sceneIndex + 1}
            {" / "}
            {PROLOGUE_SCENES.length}
          </small>
        </div>
      </header>

      <section
        className={`prologue-cinematic__dialogue prologue-cinematic__dialogue--${dialogue.speaker}`}
        onClick={(event) => {
          event.stopPropagation();
          advance();
        }}
      >
        {dialogue.speaker !== "narrator" && (
          <strong>{speakerName()}</strong>
        )}

        <p>
          {visibleText}
          {isTyping && (
            <span className="prologue-cinematic__cursor">|</span>
          )}
        </p>

        <div className="prologue-cinematic__actions">
          <small>
            {language === "pl"
              ? "Kliknij ekran, użyj Enter / Spacji / → albo przycisku"
              : (language as string) === "de"
                ? "Bildschirm anklicken, Enter / Leertaste / → oder Taste verwenden"
                : "Click the screen, use Enter / Space / → or the button"}
          </small>

          <button
            type="button"
            className="prologue-cinematic__next"
            onClick={(event) => {
              event.stopPropagation();
              advance();
            }}
            disabled={inputLocked}
          >
            {continueLabel()}
            {!isTyping && " →"}
          </button>
        </div>
      </section>
    </main>
  );
}
