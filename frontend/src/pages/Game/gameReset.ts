const GAME_STORAGE_PREFIXES = [
  "plpe-arena-",
  "plpe-world-",
  "plpe-game-",
  "plpe-character-",
  "plpe-building-",
  "plpe-expedition-",
  "plpe-campaign-",
  "plpe-rpg-",
  "plpe-power-",
  "plpe-map-defense-",
  "plpe-journal-",
  "plpe-bonus-",
];

const PRESERVED_LOCAL_STORAGE_KEYS = new Set([
  // Test access is not gameplay progress and should survive a reset.
  "plpe-arena-test-access-v1",
]);

export function resetPLPEArenaGame() {
  const keysToRemove: string[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key || PRESERVED_LOCAL_STORAGE_KEYS.has(key)) {
      continue;
    }

    if (GAME_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));

  const sessionKeysToRemove: string[] = [];

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);

    if (key?.startsWith("plpe-arena-")) {
      sessionKeysToRemove.push(key);
    }
  }

  sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
