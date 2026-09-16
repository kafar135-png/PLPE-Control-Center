import {
  WORLD_MAP_LOCATIONS,
} from "./WorldMapData";

import type {
  GameReward,
} from "./WorldMapData";

export type StrategyFaction =
  | "bear"
  | "wild";

export type TerritoryOwner =
  | "player"
  | "enemy"
  | "neutral";

export type StrategyBotKind =
  | "bear-scout"
  | "bear-warband"
  | "bear-elite"
  | "harpy"
  | "water-serpent"
  | "wild-bear";

export interface StrategyBot {
  id: string;
  name: string;
  kind: StrategyBotKind;
  faction: StrategyFaction;
  locationId: string;
  homeLocationId: string;
  level: number;
  strength: number;
  alive: boolean;
  respawnTurn?: number;
}

export interface StrategyHistoryEntry {
  id: string;
  turn: number;
  text: string;
}

export interface WorldStrategyState {
  turn: number;
  bearBaseLevel: number;
  bearResources: number;
  bearAggression: number;
  bearControlledLocations: string[];
  playerControlledLocations: string[];
  bearFortifiedLocations: string[];
  contestedLocations: string[];
  bots: StrategyBot[];
  history: StrategyHistoryEntry[];
}

const STORAGE_KEY =
  "plpe-world-strategy-v2";

const OLD_STORAGE_KEYS = [
  "plpe-world-strategy-v1",
];

const PROTECTED_PLAYER_LOCATIONS = [
  "monastery",
];

const INITIAL_ENEMY_TERRITORY = [
  "dark-valley",
  "dark-watch",
  "ash-pits",
  "lava-bridge",
  "dark-crossroads",
  "burned-village",
  "dark-gate",
  "bear-lookout",
  "bear-camp",
  "bear-supply-yard",
];

const INITIAL_PLAYER_TERRITORY = [
  "monastery",
];

const INITIAL_BOTS: StrategyBot[] = [
  {
    id: "bear-front-north",
    name: "Northern Bear Guard",
    kind: "bear-warband",
    faction: "bear",
    locationId: "bear-lookout",
    homeLocationId: "bear-lookout",
    level: 2,
    strength: 105,
    alive: true,
  },
  {
    id: "bear-front-west",
    name: "Western Bear Guard",
    kind: "bear-warband",
    faction: "bear",
    locationId: "bear-camp",
    homeLocationId: "bear-camp",
    level: 2,
    strength: 110,
    alive: true,
  },
  {
    id: "bear-dark-elite",
    name: "Dark Valley Elite",
    kind: "bear-elite",
    faction: "bear",
    locationId: "dark-watch",
    homeLocationId: "dark-watch",
    level: 3,
    strength: 145,
    alive: true,
  },
  {
    id: "harpy-high-trail",
    name: "Northern Harpy Flock",
    kind: "harpy",
    faction: "wild",
    locationId: "high-trail",
    homeLocationId: "high-trail",
    level: 1,
    strength: 80,
    alive: true,
  },
  {
    id: "harpy-north-ridge",
    name: "Ridge Harpies",
    kind: "harpy",
    faction: "wild",
    locationId: "north-ridge",
    homeLocationId: "north-ridge",
    level: 2,
    strength: 95,
    alive: true,
  },
  {
    id: "serpent-mist-lake",
    name: "Mist Lake Serpent",
    kind: "water-serpent",
    faction: "wild",
    locationId: "mist-lake",
    homeLocationId: "mist-lake",
    level: 2,
    strength: 100,
    alive: true,
  },
  {
    id: "wild-bear-forest",
    name: "Mountain Bear",
    kind: "wild-bear",
    faction: "wild",
    locationId: "pine-clearing",
    homeLocationId: "pine-clearing",
    level: 1,
    strength: 90,
    alive: true,
  },
];

function addHistory(
  state: WorldStrategyState,
  text: string
) {
  const entry: StrategyHistoryEntry = {
    id: `${state.turn}-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    text,
  };

  return [
    entry,
    ...state.history,
  ].slice(0, 40);
}

function getLocation(
  locationId: string
) {
  return WORLD_MAP_LOCATIONS.find(
    location =>
      location.id ===
      locationId
  );
}

function getConnections(
  locationId: string
) {
  const location =
    getLocation(
      locationId
    );

  if (!location) {
    return [];
  }

  return (
    location.connections ??
    []
  ).filter(targetId =>
    Boolean(
      getLocation(
        targetId
      )
    )
  );
}

function unique(
  items: string[]
) {
  return [
    ...new Set(items),
  ];
}

function territoryOwner(
  state: WorldStrategyState,
  locationId: string
): TerritoryOwner {
  if (
    state.bearControlledLocations.includes(
      locationId
    )
  ) {
    return "enemy";
  }

  if (
    state.playerControlledLocations.includes(
      locationId
    )
  ) {
    return "player";
  }

  return "neutral";
}

export function getTerritoryOwner(
  state: WorldStrategyState,
  locationId: string
) {
  return territoryOwner(
    state,
    locationId
  );
}

export function createDefaultWorldStrategy(): WorldStrategyState {
  return {
    turn: 1,
    bearBaseLevel: 1,
    bearResources: 100,
    bearAggression: 25,
    bearControlledLocations: [
      ...INITIAL_ENEMY_TERRITORY,
    ],
    playerControlledLocations: [
      ...INITIAL_PLAYER_TERRITORY,
    ],
    bearFortifiedLocations: [
      "dark-valley",
      "dark-watch",
      "bear-camp",
    ],
    contestedLocations: [],
    bots:
      INITIAL_BOTS.map(bot => ({
        ...bot,
      })),
    history: [
      {
        id: "strategy-start",
        turn: 1,
        text:
          "Ciemna Dolina kontroluje wschodnią część mapy. Front pozostaje aktywny.",
      },
    ],
  };
}

function normalizeState(
  parsed: Partial<WorldStrategyState>
): WorldStrategyState {
  const defaults =
    createDefaultWorldStrategy();

  const bearControlled =
    Array.isArray(
      parsed.bearControlledLocations
    )
      ? parsed.bearControlledLocations
      : defaults.bearControlledLocations;

  const playerControlled =
    Array.isArray(
      parsed.playerControlledLocations
    )
      ? parsed.playerControlledLocations
      : defaults.playerControlledLocations;

  return {
    ...defaults,
    ...parsed,
    bearControlledLocations:
      unique(
        bearControlled.filter(
          id =>
            !PROTECTED_PLAYER_LOCATIONS.includes(
              id
            )
        )
      ),
    playerControlledLocations:
      unique([
        ...playerControlled,
        ...PROTECTED_PLAYER_LOCATIONS,
      ]).filter(
        id =>
          !bearControlled.includes(
            id
          )
      ),
    bearFortifiedLocations:
      Array.isArray(
        parsed.bearFortifiedLocations
      )
        ? parsed.bearFortifiedLocations
        : defaults.bearFortifiedLocations,
    contestedLocations:
      Array.isArray(
        parsed.contestedLocations
      )
        ? parsed.contestedLocations
        : [],
    bots:
      Array.isArray(parsed.bots)
        ? parsed.bots.map(bot => ({
            ...bot,
            homeLocationId:
              bot.homeLocationId ??
              bot.locationId,
          }))
        : defaults.bots,
    history:
      Array.isArray(
        parsed.history
      )
        ? parsed.history
        : defaults.history,
  };
}

export function loadWorldStrategy(): WorldStrategyState {
  try {
    const current =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (current) {
      return normalizeState(
        JSON.parse(current)
      );
    }

    for (
      const oldKey of
      OLD_STORAGE_KEYS
    ) {
      const raw =
        localStorage.getItem(
          oldKey
        );

      if (!raw) {
        continue;
      }

      const migrated =
        normalizeState(
          JSON.parse(raw)
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          migrated
        )
      );

      return migrated;
    }
  } catch (error) {
    console.error(
      "[WORLD STRATEGY] Load error:",
      error
    );
  }

  return createDefaultWorldStrategy();
}

export function saveWorldStrategy(
  state: WorldStrategyState
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      state
    )
  );
}

export function getEnemyFrontLocations(
  state: WorldStrategyState
) {
  return state.bearControlledLocations.filter(
    locationId =>
      getConnections(
        locationId
      ).some(
        neighbourId =>
          !state.bearControlledLocations.includes(
            neighbourId
          )
      )
  );
}

export function getPlayerFrontLocations(
  state: WorldStrategyState
) {
  return state.playerControlledLocations.filter(
    locationId =>
      getConnections(
        locationId
      ).some(
        neighbourId =>
          state.bearControlledLocations.includes(
            neighbourId
          )
      )
  );
}

function getEnemyExpansionCandidates(
  state: WorldStrategyState
) {
  const candidates: string[] = [];

  for (
    const sourceId of
    state.bearControlledLocations
  ) {
    for (
      const neighbourId of
      getConnections(sourceId)
    ) {
      if (
        PROTECTED_PLAYER_LOCATIONS.includes(
          neighbourId
        )
      ) {
        continue;
      }

      if (
        state.bearControlledLocations.includes(
          neighbourId
        )
      ) {
        continue;
      }

      candidates.push(
        neighbourId
      );
    }
  }

  return unique(
    candidates
  );
}

function scoreExpansionTarget(
  state: WorldStrategyState,
  locationId: string
) {
  let score =
    Math.random() * 10;

  const owner =
    territoryOwner(
      state,
      locationId
    );

  if (
    owner ===
    "player"
  ) {
    score += 20;
  }

  const location =
    getLocation(
      locationId
    );

  if (
    location?.type ===
    "battle"
  ) {
    score += 4;
  }

  if (
    location?.type ===
    "elite"
  ) {
    score += 2;
  }

  if (
    locationId ===
    "watchtower" ||
    locationId ===
    "stone-circle" ||
    locationId ===
    "old-bridge"
  ) {
    score += 6;
  }

  return score;
}

function chooseExpansionTargets(
  state: WorldStrategyState,
  count: number
) {
  return getEnemyExpansionCandidates(
    state
  )
    .sort(
      (a, b) =>
        scoreExpansionTarget(
          state,
          b
        ) -
        scoreExpansionTarget(
          state,
          a
        )
    )
    .slice(0, count);
}

function findNearestBearFrontBot(
  state: WorldStrategyState,
  targetId: string
) {
  const adjacentEnemyLocations =
    getConnections(
      targetId
    ).filter(id =>
      state.bearControlledLocations.includes(
        id
      )
    );

  return state.bots.find(
    bot =>
      bot.alive &&
      bot.faction ===
        "bear" &&
      adjacentEnemyLocations.includes(
        bot.locationId
      )
  );
}

function captureLocation(
  state: WorldStrategyState,
  locationId: string
) {
  if (
    PROTECTED_PLAYER_LOCATIONS.includes(
      locationId
    )
  ) {
    return state;
  }

  const previousOwner =
    territoryOwner(
      state,
      locationId
    );

  const bot =
    findNearestBearFrontBot(
      state,
      locationId
    );

  const next: WorldStrategyState = {
    ...state,
    bearControlledLocations:
      unique([
        ...state.bearControlledLocations,
        locationId,
      ]),
    playerControlledLocations:
      state.playerControlledLocations.filter(
        id =>
          id !==
          locationId
      ),
    contestedLocations:
      state.contestedLocations.filter(
        id =>
          id !==
          locationId
      ),
    bots:
      state.bots.map(item =>
        bot &&
        item.id ===
          bot.id
          ? {
              ...item,
              locationId,
            }
          : item
      ),
  };

  return {
    ...next,
    history:
      addHistory(
        next,
        previousOwner ===
        "player"
          ? `Bear Army odbiła teren: ${locationId}.`
          : `Bear Army zajęła neutralny teren: ${locationId}.`
      ),
  };
}

function respawnBots(
  state: WorldStrategyState
) {
  return {
    ...state,
    bots:
      state.bots.map(bot => {
        if (
          bot.alive ||
          !bot.respawnTurn ||
          state.turn <
            bot.respawnTurn
        ) {
          return bot;
        }

        return {
          ...bot,
          alive: true,
          respawnTurn:
            undefined,
          locationId:
            bot.homeLocationId,
          level:
            bot.level +
            1,
          strength:
            Math.round(
              bot.strength *
                1.12
            ),
        };
      }),
  };
}

function fortifyFront(
  state: WorldStrategyState
) {
  const front =
    getEnemyFrontLocations(
      state
    ).filter(
      id =>
        !state.bearFortifiedLocations.includes(
          id
        )
    );

  if (
    front.length ===
    0
  ) {
    return state;
  }

  const target =
    front[
      Math.floor(
        Math.random() *
          front.length
      )
    ];

  const next = {
    ...state,
    bearFortifiedLocations:
      unique([
        ...state.bearFortifiedLocations,
        target,
      ]),
  };

  return {
    ...next,
    history:
      addHistory(
        next,
        `Bear Army ufortyfikowała front: ${target}.`
      ),
  };
}

export function advanceWorldStrategyTurn(
  current: WorldStrategyState
): WorldStrategyState {
  const nextTurn =
    current.turn +
    1;

  let next: WorldStrategyState = {
    ...current,
    turn: nextTurn,
    bearResources:
      current.bearResources +
      8 +
      current.bearControlledLocations.length *
        2,
    bearAggression:
      Math.min(
        100,
        current.bearAggression +
          1
      ),
    contestedLocations: [],
  };

  next =
    respawnBots(
      next
    );

  if (
    nextTurn %
      10 ===
    0
  ) {
    next = {
      ...next,
      bearBaseLevel:
        Math.min(
          10,
          next.bearBaseLevel +
            1
        ),
      bearResources:
        next.bearResources +
        80,
      history:
        addHistory(
          next,
          `Ciemna Dolina osiągnęła poziom ${Math.min(
            10,
            next.bearBaseLevel +
              1
          )}.`
        ),
    };
  }

  if (
    nextTurn %
      6 ===
    0
  ) {
    next = {
      ...next,
      bots:
        next.bots.map(bot =>
          bot.faction ===
          "bear"
            ? {
                ...bot,
                strength:
                  Math.round(
                    bot.strength *
                      1.05
                  ),
              }
            : bot
        ),
    };
  }

  const expansionRoll =
    Math.random() *
    100;

  const expansionChance =
    Math.min(
      78,
      28 +
        next.bearAggression *
          0.45 +
        next.bearBaseLevel *
          2
    );

  if (
    expansionRoll <
    expansionChance
  ) {
    const captureCount =
      next.bearBaseLevel >=
        6 &&
      Math.random() <
        0.25
        ? 2
        : 1;

    const targets =
      chooseExpansionTargets(
        next,
        captureCount
      );

    for (
      const targetId of
      targets
    ) {
      if (
        next.bearResources <
        25
      ) {
        break;
      }

      next =
        captureLocation(
          next,
          targetId
        );

      next = {
        ...next,
        bearResources:
          Math.max(
            0,
            next.bearResources -
              25
          ),
      };
    }
  } else {
    next = {
      ...next,
      history:
        addHistory(
          next,
          "Ciemna Dolina wzmacnia pozycje i nie przesuwa frontu w tej turze."
        ),
    };
  }

  if (
    nextTurn %
      4 ===
      0 &&
    next.bearResources >=
      20
  ) {
    const fortified =
      fortifyFront(
        next
      );

    if (
      fortified !==
      next
    ) {
      next = {
        ...fortified,
        bearResources:
          Math.max(
            0,
            fortified.bearResources -
              20
          ),
      };
    }
  }

  saveWorldStrategy(
    next
  );

  return next;
}

export function getLivingBotsAtLocation(
  state: WorldStrategyState,
  locationId: string
) {
  return state.bots.filter(
    bot =>
      bot.alive &&
      bot.locationId ===
        locationId
  );
}

export function getStrategyBotReward(
  bot: StrategyBot
): GameReward {
  switch (
    bot.kind
  ) {
    case "bear-scout":
      return {
        xp:
          35 +
          bot.level *
            5,
        bearFragments: 1,
        intel: 1,
      };

    case "bear-warband":
      return {
        xp:
          65 +
          bot.level *
            10,
        bearFragments: 3,
        memeEnergy: 20,
      };

    case "bear-elite":
      return {
        xp:
          110 +
          bot.level *
            15,
        bearFragments: 4,
        relics: 1,
        cardFragments: 1,
      };

    case "harpy":
      return {
        xp:
          55 +
          bot.level *
            10,
        relics: 1,
      };

    case "water-serpent":
      return {
        xp:
          70 +
          bot.level *
            10,
        memeEnergy: 25,
        relics: 1,
      };

    case "wild-bear":
      return {
        xp:
          60 +
          bot.level *
            10,
        bearFragments: 2,
      };

    default:
      return {
        xp: 25,
      };
  }
}

export function defeatStrategyBot(
  state: WorldStrategyState,
  botId: string
): WorldStrategyState {
  const defeated =
    state.bots.find(
      bot =>
        bot.id ===
        botId
    );

  if (!defeated) {
    return state;
  }

  const respawnDelay =
    defeated.kind ===
    "bear-elite"
      ? 12
      : defeated.kind ===
          "bear-warband"
        ? 9
        : defeated.faction ===
            "bear"
          ? 7
          : 10;

  const next: WorldStrategyState = {
    ...state,
    bots:
      state.bots.map(bot =>
        bot.id ===
        botId
          ? {
              ...bot,
              alive: false,
              respawnTurn:
                state.turn +
                respawnDelay,
            }
          : bot
      ),
    history:
      addHistory(
        state,
        `${defeated.name} została pokonana w ${defeated.locationId}.`
      ),
  };

  saveWorldStrategy(
    next
  );

  return next;
}

export function reclaimLocationFromBear(
  state: WorldStrategyState,
  locationId: string
): WorldStrategyState {
  if (
    locationId ===
    "dark-valley"
  ) {
    return state;
  }

  if (
    !state.bearControlledLocations.includes(
      locationId
    )
  ) {
    const alreadyPlayer =
      state.playerControlledLocations.includes(
        locationId
      );

    if (
      alreadyPlayer
    ) {
      return state;
    }

    const next = {
      ...state,
      playerControlledLocations:
        unique([
          ...state.playerControlledLocations,
          locationId,
        ]),
    };

    saveWorldStrategy(
      next
    );

    return next;
  }

  const next: WorldStrategyState = {
    ...state,
    bearControlledLocations:
      state.bearControlledLocations.filter(
        id =>
          id !==
          locationId
      ),
    playerControlledLocations:
      unique([
        ...state.playerControlledLocations,
        locationId,
      ]),
    bearFortifiedLocations:
      state.bearFortifiedLocations.filter(
        id =>
          id !==
          locationId
      ),
    contestedLocations:
      state.contestedLocations.filter(
        id =>
          id !==
          locationId
      ),
    history:
      addHistory(
        state,
        `PolishPepe odbił teren: ${locationId}.`
      ),
  };

  saveWorldStrategy(
    next
  );

  return next;
}
