import { useEffect, useMemo, useState } from "react";
import "./StorySceneModal.css";
import warriorArt from "../../assets/game/char_polishpepe_warrior.png";
import rangerArt from "../../assets/game/char_polishpepe_ranger.png";
import mageArt from "../../assets/game/char_polishpepe_mage.png";
import charBocian from "../../assets/game/char_bocian.png";
import type { WorldStoryScene } from "./WorldStory";
import { useLanguage } from "../../hooks/useLanguage";
import { useGameProgress } from "./Progress";
import { isDialogueVoicePlaying, playDialogueVoice, stopDialogueVoice, useDialogueVoice } from "./dialogueVoice";

interface StorySceneModalProps {
  scene: WorldStoryScene;
  onComplete: () => void;
}

export default function StorySceneModal({ scene, onComplete }: StorySceneModalProps) {
  const { language } = useLanguage();
  const polish = language === "pl";
  const voice = useDialogueVoice();
  const { progress } = useGameProgress();
  const pepeArt = progress.polishPepe.specialization === "ranger" ? rangerArt : progress.polishPepe.specialization === "mage" ? mageArt : warriorArt;
  const [index, setIndex] = useState(0);

  const lines = useMemo(() => {
    if (scene.dialogue?.length) return scene.dialogue;
    const base = polish ? scene.text : (scene.textEn ?? scene.text);
    return base.map((text) => ({
      speaker: scene.speaker as "PolishPepe" | "Bocian" | "Zwiadowca" | "Narrator",
      text,
      textEn: text,
    }));
  }, [scene, polish]);

  const current = lines[index] ?? lines[0];
  const currentText = current ? (polish ? current.text : (current.textEn ?? current.text)) : "";
  const last = index >= lines.length - 1;
  const pepeSpeaking = current?.speaker === "PolishPepe";
  const bocianSpeaking = current?.speaker === "Bocian";
  const title = polish ? scene.title : (scene.titleEn ?? scene.title);
  const voiceKey = `${scene.id}-${String(index + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (voice.enabled && currentText && !isDialogueVoicePlaying(voiceKey)) {
      void playDialogueVoice(voiceKey, language, voice.volume);
    }
  }, [voiceKey, language, voice.enabled, voice.volume, currentText]);

  useEffect(() => () => stopDialogueVoice(), []);

  function speakerLabel() {
    if (!current) return scene.speaker;
    if (current.speaker === "Zwiadowca") return polish ? "Zwiadowca" : "Scout";
    if (current.speaker === "Narrator") return polish ? "Narrator" : "Narrator";
    return current.speaker;
  }

  function advance() {
    stopDialogueVoice();
    if (last) {
      onComplete();
      return;
    }

    const nextKey = `${scene.id}-${String(index + 2).padStart(2, "0")}`;
    if (voice.enabled) void playDialogueVoice(nextKey, language, voice.volume);
    setIndex((value) => value + 1);
  }

  return (
    <section className="story-scene" role="dialog" aria-modal="true" aria-label={title}>
      <div className="story-scene__shade" />
      <div className="story-scene__title">
        <span>{polish ? "SCENA FABULARNA" : "STORY SCENE"}</span>
        <strong>{title}</strong>
        <small>{index + 1}/{lines.length}</small>
        <button
          type="button"
          className={`story-scene__voice ${voice.enabled ? "active" : ""}`}
          onClick={() => {
            if (voice.enabled) {
              voice.disable();
            } else {
              voice.enable();
              void playDialogueVoice(voiceKey, language, voice.volume);
            }
          }}
        >
          {voice.enabled ? "🔊" : "🔇"}
        </button>
      </div>
      <div className="story-scene__characters">
        <img src={pepeArt} alt="PolishPepe" className={`story-scene__pepe ${pepeSpeaking ? "speaking" : ""}`} />
        <img src={charBocian} alt="Bocian" className={`story-scene__bocian ${bocianSpeaking ? "speaking" : ""}`} />
      </div>
      <div className="story-scene__dialogue">
        <span>{speakerLabel()}</span>
        <p>{currentText}</p>
        <button type="button" onClick={advance}>
          {last ? (polish ? "✓ ZAPISZ W DZIENNIKU" : "✓ SAVE TO JOURNAL") : (polish ? "DALEJ →" : "NEXT →")}
        </button>
      </div>
    </section>
  );
}
