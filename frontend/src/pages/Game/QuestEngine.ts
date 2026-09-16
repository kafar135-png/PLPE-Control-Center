export type QuestState =
  | "locked"
  | "available"
  | "active"
  | "completed";

export type EncounterState =
  | "hidden"
  | "available"
  | "completed"
  | "cooldown";

export interface QuestReward {
  xp?: number;

  bocianXp?: number;

  memeEnergy?: number;

  relics?: number;

  intel?: number;

  bearFragments?: number;

  comicFragments?: number;

  cardFragments?: number;

  skillPoints?: number;
}

export interface QuestRequirement {
  minLevel?: number;

  intel?: number;

  relics?: number;

  bearFragments?: number;

  comicFragments?: number;

  cardFragments?: number;

  completedQuests?: string[];

  discoveries?: string[];

  rescuedNPCs?: string[];
}

export interface LocalizedQuestText {
  pl: string;
  en: string;
  de: string;
}

export type QuestStepType =
  | "story"
  | "explore"
  | "battle"
  | "elite"
  | "boss"
  | "rescue"
  | "collect"
  | "return"
  | "choice"
  | "puzzle"
  | "search";

export interface QuestStep {
  id: string;

  title: LocalizedQuestText;

  description: LocalizedQuestText;

  locationId: string;

  type: QuestStepType;

  puzzleId?: string;

  requirement?: QuestRequirement;

  reward?: QuestReward;
}

export interface WorldQuest {
  id: string;

  region: number;

  title: LocalizedQuestText;

  description: LocalizedQuestText;

  steps: QuestStep[];

  reward?: QuestReward;

  repeatable?: boolean;

  cooldownHours?: number;
}

export type RandomEncounterType =
  | "patrol"
  | "cache"
  | "traveller"
  | "ambush"
  | "resource"
  | "elite";

export interface RandomEncounter {
  id: string;

  locationId: string;

  title: LocalizedQuestText;

  description: LocalizedQuestText;

  type: RandomEncounterType;

  chance: number;

  cooldownHours?: number;

  reward?: QuestReward;
}

export interface QuestRuntimeState {
  activeQuestIds: string[];

  completedQuestIds: string[];

  completedStepIds: string[];

  encounterCooldowns: Record<
    string,
    number
  >;

  completedEncounters: string[];

  dailyClaimTimestamps: Record<
    string,
    number
  >;
}

export const DEFAULT_QUEST_RUNTIME_STATE: QuestRuntimeState =
  {
    activeQuestIds: [],

    completedQuestIds: [],

    completedStepIds: [],

    encounterCooldowns: {},

    completedEncounters: [],

    dailyClaimTimestamps: {},
  };

const QUEST_STORAGE_KEY =
  "plpe-world-quests-v1";

/* =========================================================
   LOAD
========================================================= */

export function loadQuestRuntime(): QuestRuntimeState {
  try {
    const raw =
      localStorage.getItem(
        QUEST_STORAGE_KEY
      );

    if (!raw) {
      return structuredClone(
        DEFAULT_QUEST_RUNTIME_STATE
      );
    }

    const parsed =
      JSON.parse(raw);

    return {
      ...DEFAULT_QUEST_RUNTIME_STATE,

      ...parsed,

      activeQuestIds:
        Array.isArray(
          parsed.activeQuestIds
        )
          ? parsed.activeQuestIds
          : [],

      completedQuestIds:
        Array.isArray(
          parsed.completedQuestIds
        )
          ? parsed.completedQuestIds
          : [],

      completedStepIds:
        Array.isArray(
          parsed.completedStepIds
        )
          ? parsed.completedStepIds
          : [],

      encounterCooldowns:
        typeof parsed.encounterCooldowns ===
          "object" &&
        parsed.encounterCooldowns !==
          null
          ? parsed.encounterCooldowns
          : {},

      completedEncounters:
        Array.isArray(
          parsed.completedEncounters
        )
          ? parsed.completedEncounters
          : [],

      dailyClaimTimestamps:
        typeof parsed.dailyClaimTimestamps ===
          "object" &&
        parsed.dailyClaimTimestamps !==
          null
          ? parsed.dailyClaimTimestamps
          : {},
    };
  } catch (error) {
    console.error(
      "[PLPE QUEST ENGINE] Load error:",
      error
    );

    return structuredClone(
      DEFAULT_QUEST_RUNTIME_STATE
    );
  }
}

/* =========================================================
   SAVE
========================================================= */

export function saveQuestRuntime(
  state: QuestRuntimeState
) {
  try {
    localStorage.setItem(
      QUEST_STORAGE_KEY,

      JSON.stringify(
        state
      )
    );
  } catch (error) {
    console.error(
      "[PLPE QUEST ENGINE] Save error:",
      error
    );
  }
}

/* =========================================================
   QUEST STATE
========================================================= */

export function getQuestState(
  questId: string,

  runtime: QuestRuntimeState
): QuestState {
  if (
    runtime.completedQuestIds.includes(
      questId
    )
  ) {
    return "completed";
  }

  if (
    runtime.activeQuestIds.includes(
      questId
    )
  ) {
    return "active";
  }

  return "available";
}

/* =========================================================
   START QUEST
========================================================= */

export function startQuest(
  questId: string,

  runtime: QuestRuntimeState
): QuestRuntimeState {
  if (
    runtime.completedQuestIds.includes(
      questId
    )
  ) {
    return runtime;
  }

  if (
    runtime.activeQuestIds.includes(
      questId
    )
  ) {
    return runtime;
  }

  return {
    ...runtime,

    activeQuestIds: [
      ...runtime.activeQuestIds,

      questId,
    ],
  };
}

/* =========================================================
   COMPLETE STEP
========================================================= */

export function completeQuestStep(
  stepId: string,

  runtime: QuestRuntimeState
): QuestRuntimeState {
  if (
    runtime.completedStepIds.includes(
      stepId
    )
  ) {
    return runtime;
  }

  return {
    ...runtime,

    completedStepIds: [
      ...runtime.completedStepIds,

      stepId,
    ],
  };
}

/* =========================================================
   COMPLETE QUEST
========================================================= */

export function completeQuest(
  questId: string,

  runtime: QuestRuntimeState
): QuestRuntimeState {
  return {
    ...runtime,

    activeQuestIds:
      runtime.activeQuestIds.filter(
        (
          id
        ) =>
          id !==
          questId
      ),

    completedQuestIds:
      runtime.completedQuestIds.includes(
        questId
      )
        ? runtime.completedQuestIds
        : [
            ...runtime.completedQuestIds,

            questId,
          ],
  };
}

/* =========================================================
   COOLDOWN
========================================================= */

export function getCooldownRemainingMs(
  id: string,

  runtime: QuestRuntimeState
) {
  const until =
    runtime.encounterCooldowns[
      id
    ];

  if (!until) {
    return 0;
  }

  return Math.max(
    0,

    until -
      Date.now()
  );
}

export function setEncounterCooldown(
  id: string,

  hours: number,

  runtime: QuestRuntimeState
): QuestRuntimeState {
  if (
    hours <= 0
  ) {
    return runtime;
  }

  const until =
    Date.now() +
    hours *
      60 *
      60 *
      1000;

  return {
    ...runtime,

    encounterCooldowns: {
      ...runtime.encounterCooldowns,

      [id]:
        until,
    },
  };
}

/* =========================================================
   DAILY
========================================================= */

export function canClaimDaily(
  id: string,

  runtime: QuestRuntimeState
) {
  const previous =
    runtime.dailyClaimTimestamps[
      id
    ];

  if (!previous) {
    return true;
  }

  const elapsed =
    Date.now() -
    previous;

  return (
    elapsed >=
    24 *
      60 *
      60 *
      1000
  );
}

export function claimDaily(
  id: string,

  runtime: QuestRuntimeState
): QuestRuntimeState {
  return {
    ...runtime,

    dailyClaimTimestamps: {
      ...runtime.dailyClaimTimestamps,

      [id]:
        Date.now(),
    },
  };
}

/* =========================================================
   RANDOM ENCOUNTER
========================================================= */

export function rollEncounter(
  encounter: RandomEncounter
) {
  const chance =
    Math.max(
      0,
      Math.min(
        1,
        encounter.chance
      )
    );

  return (
    Math.random() <=
    chance
  );
}

/* =========================================================
   TIME
========================================================= */

export function formatCooldown(
  milliseconds: number
) {
  if (
    milliseconds <= 0
  ) {
    return "READY";
  }

  const totalMinutes =
    Math.ceil(
      milliseconds /
        60000
    );

  const hours =
    Math.floor(
      totalMinutes /
        60
    );

  const minutes =
    totalMinutes %
    60;

  if (
    hours <= 0
  ) {
    return `${minutes}m`;
  }

  if (
    minutes <= 0
  ) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}