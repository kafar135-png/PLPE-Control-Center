import { useCallback, useMemo, useState } from "react";
import { setGameMusicDucked } from "./gameAudio";

const ENABLED_KEY = "plpe-dialogue-voice-enabled-v1";
const VOLUME_KEY = "plpe-dialogue-voice-volume-v1";
const AUDIO_VERSION = "elevenlabs-20260915-1";

type PlaybackState = "idle" | "loading" | "playing";

let activeAudio: HTMLAudioElement | null = null;
let activeKey: string | null = null;
let activeState: PlaybackState = "idle";
let activePlayPromise: Promise<boolean> | null = null;
let playToken = 0;

function readEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ENABLED_KEY) !== "0";
}

function readVolume() {
  if (typeof window === "undefined") return 0.96;
  const value = Number(window.localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(value) && value >= 0.2 && value <= 1 ? value : 0.96;
}

function releaseAudio(audio: HTMLAudioElement, key: string, token: number) {
  if (token !== playToken) return;

  if (activeAudio === audio) {
    activeAudio.onended = null;
    activeAudio.onerror = null;
    activeAudio = null;
  }

  if (activeKey === key) activeKey = null;
  activeState = "idle";
  activePlayPromise = null;
  setGameMusicDucked(false);
}

export function stopDialogueVoice() {
  playToken += 1;

  const audio = activeAudio;
  activeAudio = null;
  activeKey = null;
  activeState = "idle";
  activePlayPromise = null;

  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers can reject seeking before metadata is available.
    }
  }

  setGameMusicDucked(false);
}

/**
 * Plays the prerecorded ElevenLabs dialogue MP3.
 *
 * Important: Prologue/Story can request the same key twice in quick succession
 * (explicit click + React effect). While the first audio.play() promise is still
 * pending, a second request MUST NOT call pause()/restart, otherwise Chromium
 * throws AbortError: "play() request was interrupted by a call to pause()".
 */
export function playDialogueVoice(
  key: string,
  language: string,
  volume = readVolume(),
): Promise<boolean> {
  if (!readEnabled() || typeof Audio === "undefined") {
    return Promise.resolve(false);
  }

  // Same line is already starting: share the existing promise instead of
  // stopping it. This is the core fix for the AbortError seen in Chromium.
  if (
    activeKey === key &&
    activeAudio &&
    activeState === "loading" &&
    activePlayPromise
  ) {
    return activePlayPromise;
  }

  // Same line is already audible: do not restart it.
  if (
    activeKey === key &&
    activeAudio &&
    activeState === "playing" &&
    !activeAudio.paused &&
    !activeAudio.ended
  ) {
    return Promise.resolve(true);
  }

  stopDialogueVoice();

  const token = playToken;
  const locale = language === "pl" ? "pl" : "en";
  const audio = new Audio();
  const safeVolume = Math.max(0.35, Math.min(1, volume));

  audio.preload = "auto";
  audio.autoplay = false;
  audio.muted = false;
  audio.volume = safeVolume;
  audio.setAttribute("playsinline", "true");
  audio.src = `/audio/game/dialogue/${locale}/${key}.mp3?v=${AUDIO_VERSION}`;

  activeAudio = audio;
  activeKey = key;
  activeState = "loading";
  setGameMusicDucked(true);

  const finish = () => releaseAudio(audio, key, token);
  audio.onended = finish;
  audio.onerror = () => {
    if (token !== playToken) return;
    console.warn(`[PLPE VOICE] Audio file error: ${locale}/${key}`);
    finish();
  };

  const promise = audio
    .play()
    .then(() => {
      if (token !== playToken || activeAudio !== audio) return false;
      activeState = "playing";
      console.info(`[PLPE VOICE] playing ${locale}/${key}`);
      return true;
    })
    .catch((error: unknown) => {
      if (token !== playToken) return false;

      const name =
        typeof error === "object" && error !== null && "name" in error
          ? String((error as { name?: unknown }).name ?? "")
          : "";

      if (name === "NotAllowedError") {
        console.info(`[PLPE VOICE] Waiting for user gesture: ${locale}/${key}`);
      } else if (name !== "AbortError") {
        console.warn(`[PLPE VOICE] Could not play ${locale}/${key}`, error);
      }

      releaseAudio(audio, key, token);
      return false;
    });

  activePlayPromise = promise;
  return promise;
}

export function isDialogueVoicePlaying(key?: string) {
  if (
    !activeAudio ||
    activeState !== "playing" ||
    activeAudio.paused ||
    activeAudio.ended
  ) {
    return false;
  }

  return key ? activeKey === key : true;
}

export function useDialogueVoice() {
  const [enabled, setEnabled] = useState(readEnabled);
  const [volume, setVolumeState] = useState(readVolume);

  const toggle = useCallback(() => {
    let nextValue = false;
    setEnabled((current) => {
      const next = !current;
      nextValue = next;
      window.localStorage.setItem(ENABLED_KEY, next ? "1" : "0");
      if (!next) stopDialogueVoice();
      return next;
    });
    return nextValue;
  }, []);

  const enable = useCallback(() => {
    window.localStorage.setItem(ENABLED_KEY, "1");
    const stored = Number(window.localStorage.getItem(VOLUME_KEY));
    if (!Number.isFinite(stored) || stored < 0.2) {
      window.localStorage.setItem(VOLUME_KEY, "0.96");
      setVolumeState(0.96);
    }
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    window.localStorage.setItem(ENABLED_KEY, "0");
    setEnabled(false);
    stopDialogueVoice();
  }, []);

  const setVolume = useCallback((next: number) => {
    const safe = Math.max(0, Math.min(1, next));
    window.localStorage.setItem(VOLUME_KEY, String(safe));
    setVolumeState(safe);
    if (activeAudio) activeAudio.volume = safe;
  }, []);

  return useMemo(
    () => ({ enabled, volume, toggle, enable, disable, setVolume }),
    [enabled, volume, toggle, enable, disable, setVolume],
  );
}
