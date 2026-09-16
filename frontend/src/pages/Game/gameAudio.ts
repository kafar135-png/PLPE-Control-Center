const AUDIO_PATH = "/audio/game";

type MusicTrack =
  | "menu"
  | "monastery"
  | "exploration"
  | "danger"
  | "battle"
  | "none";

const tracks = {
  menu: new Audio(
    `${AUDIO_PATH}/menu_theme.ogg`
  ),

  monastery: new Audio(
    `${AUDIO_PATH}/monastery_theme.ogg`
  ),

  exploration: new Audio(
    `${AUDIO_PATH}/exploration_theme.ogg`
  ),

  danger: new Audio(
    `${AUDIO_PATH}/danger_theme.ogg`
  ),

  battle: new Audio(
    `${AUDIO_PATH}/battle_theme.ogg`
  ),
};

Object.values(tracks).forEach(
  (audio) => {
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.45;
  }
);

tracks.menu.volume = 0.42;
tracks.monastery.volume = 0.4;
tracks.exploration.volume = 0.42;
tracks.danger.volume = 0.48;
tracks.battle.volume = 0.55;

let currentMusic: MusicTrack =
  "none";

function stopAllTracks() {
  Object.values(tracks).forEach(
    (audio) => {
      audio.pause();
      audio.currentTime = 0;
    }
  );
}

async function playTrack(
  track: Exclude<MusicTrack, "none">
) {
  if (
    currentMusic === track &&
    !tracks[track].paused
  ) {
    return;
  }

  stopAllTracks();

  currentMusic = track;

  try {
    await tracks[track].play();

    console.log(
      `[PLPE AUDIO] ${track} playing`
    );
  } catch (error) {
    console.error(
      `[PLPE AUDIO] ${track} failed:`,
      error
    );
  }
}

export function startMenuMusic() {
  return playTrack("menu");
}

export function startMonasteryMusic() {
  return playTrack("monastery");
}

export function startExplorationMusic() {
  return playTrack("exploration");
}

export function startDangerMusic() {
  return playTrack("danger");
}

export function startBattleMusic() {
  return playTrack("battle");
}

export function startAdventureMusic() {
  return startMenuMusic();
}

export function returnToAdventure() {
  return startMenuMusic();
}

export function stopGameMusic() {
  stopAllTracks();

  currentMusic = "none";
}

export function playGameSound(
  file: string,
  volume = 0.6
) {
  const audio = new Audio(
    `${AUDIO_PATH}/${file}`
  );

  audio.volume = volume;

  audio.play().catch((error) => {
    console.error(
      `[PLPE AUDIO] SFX failed: ${file}`,
      error
    );
  });
}

export function playClick() {
  playGameSound(
    "click.wav",
    0.4
  );
}

export function playAttack() {
  playGameSound(
    "attack.wav",
    0.7
  );
}

export function playHit() {
  playGameSound(
    "hit.wav",
    0.75
  );
}

export function playAbility() {
  playGameSound(
    "ability.wav",
    0.8
  );
}

export function playBearAttack() {
  playGameSound(
    "bear_attack.wav",
    0.8
  );
}

export function playVictory() {
  playGameSound(
    "victory.wav",
    0.85
  );
}

export function playTransition() {
  playGameSound(
    "scene_transition.wav",
    0.3
  );
}

export function setGameMusicDucked(ducked: boolean) {
  tracks.menu.volume = ducked ? 0.14 : 0.42;
  tracks.monastery.volume = ducked ? 0.13 : 0.4;
  tracks.exploration.volume = ducked ? 0.14 : 0.42;
  tracks.danger.volume = ducked ? 0.16 : 0.48;
  tracks.battle.volume = ducked ? 0.18 : 0.55;
}
