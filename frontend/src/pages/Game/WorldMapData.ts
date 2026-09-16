export interface LocalizedText {
  pl: string;
  en: string;
  de: string;
}

export type LocationType =
  | "start"
  | "story"
  | "event"
  | "secret"
  | "battle"
  | "elite"
  | "boss";

export type DiscoveryType =
  | "cache"
  | "lore"
  | "npc"
  | "comic"
  | "intel"
  | "resource"
  | "card"
  | "secret";

export type MapActivityType =
  | "search"
  | "puzzle"
  | "battle"
  | "elite"
  | "boss"
  | "rescue"
  | "choice"
  | "resource"
  | "event";

export interface GameReward {
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

export interface GameRequirement {
  intel?: number;

  relics?: number;

  bearFragments?: number;

  comicFragments?: number;

  cardFragments?: number;

  rescuedNPCs?: string[];

  discoveries?: string[];

  completedQuests?: string[];
}

export interface MapActivity {
  id: string;

  type: MapActivityType;

  title: LocalizedText;

  description: LocalizedText;

  repeatable?: boolean;

  cooldownHours?: number;

  puzzleId?: string;

  requirement?: GameRequirement;

  reward?: GameReward;
}

export interface MapLocation {
  id: string;

  titleLocalized: LocalizedText;

  descriptionLocalized: LocalizedText;

  region: number;

  type: LocationType;

  x: number;

  y: number;

  repeatable?: boolean;

  reward?: GameReward;

  requirement?: GameRequirement;

  missionId?: string;

  unlockAfter?: string[];

  connections?: string[];

  activities?: MapActivity[];
}

export interface MapDiscovery {
  id: string;

  locationId: string;

  type: DiscoveryType;

  titleLocalized: LocalizedText;

  descriptionLocalized: LocalizedText;

  x: number;

  y: number;

  reward?: GameReward;

  npcId?: string;

  npcNameLocalized?: LocalizedText;
}

/* =========================================================
   LOCATIONS
========================================================= */

export const WORLD_MAP_LOCATIONS: MapLocation[] = [
  /* =======================================================
     REGION 1 — GÓRY BOCIANA
  ======================================================= */

  {
    id: "monastery",

    titleLocalized: {
      pl: "Klasztor Bociana",
      en: "Stork Monastery",
      de: "Kloster des Storchs",
    },

    descriptionLocalized: {
      pl:
        "Główna baza PolishPepe. Tutaj odpoczywasz, rozwijasz postać, ulepszasz budynki i rozmawiasz z Bocianem.",

      en:
        "PolishPepe's main base. Rest, upgrade buildings and speak with Stork here.",

      de:
        "PolishPepes Hauptbasis. Hier kannst du dich erholen und Gebäude verbessern.",
    },

    region: 1,

    type: "start",

    x: 15.5,
    y: 53,

    connections: [
      "lower-road",
      "forest-pass",
      "monastery-cliffs",
    ],

    activities: [
      {
        id: "monastery-training-cache",

        type: "event",

        title: {
          pl: "Raport Bociana",
          en: "Stork Report",
          de: "Bericht des Storchs",
        },

        description: {
          pl:
            "Bocian analizuje informacje zdobyte podczas wypraw.",

          en:
            "Stork analyzes intelligence gathered during expeditions.",

          de:
            "Der Storch analysiert die während Expeditionen gesammelten Informationen.",
        },

        repeatable: true,

        cooldownHours: 6,

        reward: {
          bocianXp: 10,
        },
      },
    ],
  },

  {
    id: "lower-road",

    titleLocalized: {
      pl: "Dolna Droga",
      en: "Lower Road",
      de: "Unterer Weg",
    },

    descriptionLocalized: {
      pl:
        "Stara droga prowadząca z Klasztoru w stronę doliny.",

      en:
        "An old road descending from the Monastery.",

      de:
        "Ein alter Weg vom Kloster hinunter ins Tal.",
    },

    region: 1,

    type: "event",

    x: 21,
    y: 60,

    unlockAfter: ["monastery"],

    connections: [
      "monastery",
      "forest-camp",
      "broken-cart",
    ],

    activities: [
      {
        id: "lower-road-search",

        type: "search",

        title: {
          pl: "Ślady na drodze",
          en: "Tracks on the Road",
          de: "Spuren auf dem Weg",
        },

        description: {
          pl:
            "Sprawdź błoto i ślady pozostawione przez podróżnych.",

          en:
            "Inspect the mud and tracks left by travelers.",

          de:
            "Untersuche Schlamm und Spuren der Reisenden.",
        },

        reward: {
          intel: 1,
        },
      },
    ],
  },

  {
    id: "monastery-cliffs",

    titleLocalized: {
      pl: "Klify Klasztoru",
      en: "Monastery Cliffs",
      de: "Klosterklippen",
    },

    descriptionLocalized: {
      pl:
        "Wąska ścieżka prowadzi wzdłuż urwiska ponad chmurami.",

      en:
        "A narrow path follows the cliffs above the clouds.",

      de:
        "Ein schmaler Weg führt entlang der Klippen über den Wolken.",
    },

    region: 1,

    type: "secret",

    x: 18,
    y: 42,

    unlockAfter: ["monastery"],

    connections: [
      "monastery",
      "eagle-ledge",
    ],

    activities: [
      {
        id: "cliff-balance",

        type: "puzzle",

        puzzleId: "cliff-path",

        title: {
          pl: "Niebezpieczna ścieżka",
          en: "Dangerous Path",
          de: "Gefährlicher Pfad",
        },

        description: {
          pl:
            "Trzeba wybrać bezpieczne fragmenty skały.",

          en:
            "Choose the stable sections of the cliff path.",

          de:
            "Wähle die sicheren Teile des Klippenwegs.",
        },

        reward: {
          xp: 25,
          relics: 1,
        },
      },
    ],
  },

  {
    id: "eagle-ledge",

    titleLocalized: {
      pl: "Półka Orła",
      en: "Eagle Ledge",
      de: "Adlerfels",
    },

    descriptionLocalized: {
      pl:
        "Ukryty punkt widokowy wysoko ponad Klasztorem.",

      en:
        "A hidden viewpoint high above the Monastery.",

      de:
        "Ein versteckter Aussichtspunkt hoch über dem Kloster.",
    },

    region: 1,

    type: "secret",

    x: 24,
    y: 34,

    unlockAfter: [
      "monastery-cliffs",
    ],

    connections: [
      "monastery-cliffs",
      "high-trail",
    ],

    reward: {
      intel: 1,
      relics: 1,
    },
  },

  {
    id: "forest-pass",

    titleLocalized: {
      pl: "Leśna Przełęcz",
      en: "Forest Pass",
      de: "Waldpass",
    },

    descriptionLocalized: {
      pl:
        "Pierwsza droga prowadząca z Klasztoru w głąb Gór Bociana.",

      en:
        "The first route leading deeper into the Stork Mountains.",

      de:
        "Der erste Weg tiefer in die Berge des Storchs.",
    },

    region: 1,

    type: "story",

    x: 27,
    y: 47,

    missionId:
      "q-forest-signal",

    unlockAfter: ["monastery"],

    connections: [
      "monastery",
      "forest-camp",
      "mist-lake",
      "pine-clearing",
    ],

    activities: [
      {
        id: "forest-pass-tracks",

        type: "puzzle",

        puzzleId: "forest-tracks",

        title: {
          pl: "Świeże ślady",
          en: "Fresh Tracks",
          de: "Frische Spuren",
        },

        description: {
          pl:
            "Rozpoznaj właściwy trop pozostawiony przez Bear Army.",

          en:
            "Identify the correct trail left by the Bear Army.",

          de:
            "Identifiziere die richtige Spur der Bear Army.",
        },

        reward: {
          xp: 25,
          intel: 1,
        },
      },

      {
        id: "forest-pass-patrol",

        type: "battle",

        title: {
          pl: "Patrol na szlaku",
          en: "Trail Patrol",
          de: "Patrouille auf dem Pfad",
        },

        description: {
          pl:
            "Mały oddział Bear Army patroluje przełęcz.",

          en:
            "A small Bear Army unit patrols the pass.",

          de:
            "Eine kleine Einheit der Bear Army patrouilliert den Pass.",
        },

        repeatable: true,

        cooldownHours: 3,

        reward: {
          xp: 25,
          bearFragments: 1,
        },
      },
    ],
  },

  {
    id: "forest-camp",

    titleLocalized: {
      pl: "Leśne Obozowisko",
      en: "Forest Camp",
      de: "Waldlager",
    },

    descriptionLocalized: {
      pl:
        "Stare miejsce odpoczynku podróżników.",

      en:
        "An abandoned camp once used by travelers.",

      de:
        "Ein verlassenes Lager ehemaliger Reisender.",
    },

    region: 1,

    type: "event",

    x: 27,
    y: 59,

    unlockAfter: [
      "lower-road",
      "forest-pass",
    ],

    connections: [
      "lower-road",
      "forest-pass",
      "broken-cart",
      "hunter-hut",
    ],

    activities: [
      {
        id: "forest-camp-fire",

        type: "search",

        title: {
          pl: "Dogasające ognisko",
          en: "Dying Campfire",
          de: "Erlöschendes Lagerfeuer",
        },

        description: {
          pl:
            "Ognisko jest jeszcze ciepłe. Ktoś był tu niedawno.",

          en:
            "The fire is still warm. Someone was here recently.",

          de:
            "Das Feuer ist noch warm. Jemand war kürzlich hier.",
        },

        reward: {
          intel: 1,
        },
      },
    ],
  },

  {
    id: "broken-cart",

    titleLocalized: {
      pl: "Rozbita Karawana",
      en: "Broken Caravan",
      de: "Zerstörter Wagen",
    },

    descriptionLocalized: {
      pl:
        "Porzucony wóz leży przewrócony obok drogi.",

      en:
        "An abandoned wagon lies overturned beside the road.",

      de:
        "Ein verlassener Wagen liegt umgestürzt neben dem Weg.",
    },

    region: 1,

    type: "event",

    x: 31,
    y: 67,

    unlockAfter: ["forest-camp"],

    connections: [
      "forest-camp",
      "old-quarry",
    ],

    activities: [
      {
        id: "broken-cart-search",

        type: "search",

        title: {
          pl: "Przeszukaj karawanę",
          en: "Search the Caravan",
          de: "Durchsuche den Wagen",
        },

        description: {
          pl:
            "Część skrzyń nadal jest zamknięta.",

          en:
            "Some of the crates are still sealed.",

          de:
            "Einige Kisten sind noch verschlossen.",
        },

        reward: {
          memeEnergy: 25,
          cardFragments: 1,
        },
      },
    ],
  },

  {
    id: "pine-clearing",

    titleLocalized: {
      pl: "Sosnowa Polana",
      en: "Pine Clearing",
      de: "Kiefernlichtung",
    },

    descriptionLocalized: {
      pl:
        "Spokojna polana pośród gęstych sosen.",

      en:
        "A quiet clearing surrounded by dense pine forest.",

      de:
        "Eine ruhige Lichtung zwischen dichten Kiefern.",
    },

    region: 1,

    type: "event",

    x: 32,
    y: 43,

    unlockAfter: [
      "forest-pass",
    ],

    connections: [
      "forest-pass",
      "hunter-hut",
      "mist-lake",
    ],

    activities: [
      {
        id: "pine-clearing-herbs",

        type: "resource",

        title: {
          pl: "Zbieranie ziół",
          en: "Gather Herbs",
          de: "Kräuter sammeln",
        },

        description: {
          pl:
            "Na polanie rosną rośliny wykorzystywane przez Bociana.",

          en:
            "Useful plants grow throughout the clearing.",

          de:
            "Auf der Lichtung wachsen nützliche Pflanzen.",
        },

        repeatable: true,

        cooldownHours: 6,

        reward: {
          memeEnergy: 15,
        },
      },
    ],
  },

  {
    id: "hunter-hut",

    titleLocalized: {
      pl: "Chata Myśliwego",
      en: "Hunter's Hut",
      de: "Jägerhütte",
    },

    descriptionLocalized: {
      pl:
        "Samotna drewniana chata ukryta pomiędzy drzewami.",

      en:
        "A lonely wooden hut hidden among the trees.",

      de:
        "Eine einsame Holzhütte zwischen den Bäumen.",
    },

    region: 1,

    type: "secret",

    x: 36,
    y: 55,

    unlockAfter: [
      "forest-camp",
      "pine-clearing",
    ],

    connections: [
      "forest-camp",
      "pine-clearing",
      "mist-forest",
    ],

    activities: [
      {
        id: "hunter-lock",

        type: "puzzle",

        puzzleId: "hunter-lock",

        title: {
          pl: "Mechanizm skrzyni",
          en: "Chest Mechanism",
          de: "Truhenmechanismus",
        },

        description: {
          pl:
            "Stara skrzynia posiada przesuwane drewniane symbole.",

          en:
            "An old chest is locked with sliding wooden symbols.",

          de:
            "Eine alte Truhe ist mit verschiebbaren Holzsymbolen verschlossen.",
        },

        reward: {
          relics: 1,
          cardFragments: 1,
        },
      },
    ],
  },

  {
    id: "mist-lake",

    titleLocalized: {
      pl: "Jezioro Mgły",
      en: "Mist Lake",
      de: "Nebelsee",
    },

    descriptionLocalized: {
      pl:
        "Turkusowe jezioro przykryte chłodną mgłą.",

      en:
        "A turquoise lake covered by cold mist.",

      de:
        "Ein türkisfarbener See unter kaltem Nebel.",
    },

    region: 1,

    type: "secret",

    x: 35.5,
    y: 38,

    missionId:
      "q-mist-lake",

    unlockAfter: [
      "forest-pass",
    ],

    connections: [
      "forest-pass",
      "pine-clearing",
      "waterfall-path",
      "mist-forest",
    ],

    activities: [
      {
        id: "lake-shore-search",

        type: "search",

        title: {
          pl: "Przeszukaj brzeg",
          en: "Search the Shore",
          de: "Durchsuche das Ufer",
        },

        description: {
          pl:
            "Wśród kamieni mogą znajdować się przedmioty przyniesione przez wodę.",

          en:
            "Items may have washed ashore among the rocks.",

          de:
            "Zwischen den Steinen könnten Gegenstände angeschwemmt worden sein.",
        },

        repeatable: true,

        cooldownHours: 24,

        reward: {
          memeEnergy: 20,
          relics: 1,
        },
      },
    ],
  },

  {
    id: "waterfall-path",

    titleLocalized: {
      pl: "Ścieżka Wodospadu",
      en: "Waterfall Path",
      de: "Wasserfallpfad",
    },

    descriptionLocalized: {
      pl:
        "Wilgotna ścieżka prowadzi za wielki wodospad.",

      en:
        "A wet path leads behind the great waterfall.",

      de:
        "Ein nasser Pfad führt hinter den großen Wasserfall.",
    },

    region: 1,

    type: "secret",

    x: 41,
    y: 31,

    unlockAfter: ["mist-lake"],

    connections: [
      "mist-lake",
      "hidden-cave",
    ],

    activities: [
      {
        id: "waterfall-rocks",

        type: "puzzle",

        puzzleId: "waterfall-stones",

        title: {
          pl: "Kamienie w nurcie",
          en: "River Stones",
          de: "Steine im Wasser",
        },

        description: {
          pl:
            "Trzeba ustawić kamienie tak, by utworzyć bezpieczne przejście.",

          en:
            "Move the stones to create a safe crossing.",

          de:
            "Verschiebe die Steine, um einen sicheren Übergang zu schaffen.",
        },

        reward: {
          xp: 30,
        },
      },
    ],
  },

  {
    id: "hidden-cave",

    titleLocalized: {
      pl: "Jaskinia za Wodospadem",
      en: "Waterfall Cave",
      de: "Höhle hinter dem Wasserfall",
    },

    descriptionLocalized: {
      pl:
        "Ukryta komora znajduje się bezpośrednio za wodospadem.",

      en:
        "A hidden chamber lies behind the waterfall.",

      de:
        "Eine versteckte Kammer liegt hinter dem Wasserfall.",
    },

    region: 1,

    type: "secret",

    x: 45,
    y: 27,

    unlockAfter: [
      "waterfall-path",
    ],

    connections: [
      "waterfall-path",
      "high-trail",
    ],

    activities: [
      {
        id: "cave-runes",

        type: "puzzle",

        puzzleId: "cave-runes",

        title: {
          pl: "Kamienne runy",
          en: "Stone Runes",
          de: "Steinrunen",
        },

        description: {
          pl:
            "Połącz symbole na ścianie w odpowiedniej kolejności.",

          en:
            "Connect the wall symbols in the correct order.",

          de:
            "Verbinde die Symbole an der Wand in der richtigen Reihenfolge.",
        },

        reward: {
          comicFragments: 1,
          intel: 1,
        },
      },
    ],
  },

  {
    id: "high-trail",

    titleLocalized: {
      pl: "Wysoki Szlak",
      en: "High Trail",
      de: "Hochpfad",
    },

    descriptionLocalized: {
      pl:
        "Górski szlak biegnący ponad jeziorem.",

      en:
        "A mountain trail running above the lake.",

      de:
        "Ein Bergpfad oberhalb des Sees.",
    },

    region: 1,

    type: "event",

    x: 48,
    y: 23,

    unlockAfter: [
      "hidden-cave",
      "eagle-ledge",
    ],

    connections: [
      "hidden-cave",
      "eagle-ledge",
      "watchtower",
    ],

    activities: [
      {
        id: "high-trail-ambush",

        type: "battle",

        title: {
          pl: "Zasadzka na grani",
          en: "Ridge Ambush",
          de: "Hinterhalt am Grat",
        },

        description: {
          pl:
            "Bear Army wykorzystuje przewężenie szlaku jako pułapkę.",

          en:
            "The Bear Army uses the narrow ridge as an ambush point.",

          de:
            "Die Bear Army nutzt den schmalen Grat für einen Hinterhalt.",
        },

        repeatable: true,

        cooldownHours: 4,

        reward: {
          xp: 40,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "mist-forest",

    titleLocalized: {
      pl: "Las Mgły",
      en: "Mist Forest",
      de: "Nebelwald",
    },

    descriptionLocalized: {
      pl:
        "Gęsty las, w którym łatwo stracić orientację.",

      en:
        "A dense forest where it is easy to lose direction.",

      de:
        "Ein dichter Wald, in dem man leicht die Orientierung verliert.",
    },

    region: 1,

    type: "event",

    x: 45.5,
    y: 46,

    missionId:
      "q-rescue-scout",

    unlockAfter: [
      "mist-lake",
      "hunter-hut",
    ],

    connections: [
      "mist-lake",
      "hunter-hut",
      "old-bridge",
      "forest-shrine",
      "fog-marsh",
    ],

    activities: [
      {
        id: "mist-forest-navigation",

        type: "puzzle",

        puzzleId: "mist-navigation",

        title: {
          pl: "Droga przez mgłę",
          en: "Path Through the Mist",
          de: "Weg durch den Nebel",
        },

        description: {
          pl:
            "Wybierz właściwe punkty orientacyjne, aby nie wrócić w to samo miejsce.",

          en:
            "Choose the correct landmarks to avoid walking in circles.",

          de:
            "Wähle die richtigen Orientierungspunkte.",
        },

        reward: {
          xp: 35,
        },
      },

      {
        id: "mist-bear-patrol",

        type: "battle",

        title: {
          pl: "Patrol we mgle",
          en: "Patrol in the Mist",
          de: "Patrouille im Nebel",
        },

        description: {
          pl:
            "Bear Army przemierza las w poszukiwaniu zwiadowców.",

          en:
            "The Bear Army is searching the forest for scouts.",

          de:
            "Die Bear Army sucht im Wald nach Spähern.",
        },

        repeatable: true,

        cooldownHours: 4,

        reward: {
          xp: 35,
          bearFragments: 1,
        },
      },
    ],
  },

  {
    id: "forest-shrine",

    titleLocalized: {
      pl: "Leśna Kaplica",
      en: "Forest Shrine",
      de: "Waldschrein",
    },

    descriptionLocalized: {
      pl:
        "Mała kamienna kaplica zarosła mchem.",

      en:
        "A small stone shrine covered in moss.",

      de:
        "Ein kleiner steinerner Schrein, bedeckt mit Moos.",
    },

    region: 1,

    type: "secret",

    x: 48,
    y: 55,

    unlockAfter: [
      "mist-forest",
    ],

    connections: [
      "mist-forest",
      "graveyard",
    ],

    activities: [
      {
        id: "forest-shrine-offering",

        type: "puzzle",

        puzzleId: "shrine-offering",

        title: {
          pl: "Kamienne misy",
          en: "Stone Bowls",
          de: "Steinschalen",
        },

        description: {
          pl:
            "Trzy misy należy ustawić i napełnić w odpowiedniej kolejności.",

          en:
            "Three bowls must be arranged in the correct order.",

          de:
            "Drei Schalen müssen richtig angeordnet werden.",
        },

        reward: {
          relics: 1,
          memeEnergy: 20,
        },
      },
    ],
  },

  {
    id: "fog-marsh",

    titleLocalized: {
      pl: "Bagno Mgły",
      en: "Fog Marsh",
      de: "Nebelsumpf",
    },

    descriptionLocalized: {
      pl:
        "Podmokły teren pomiędzy lasem i rzeką.",

      en:
        "A flooded area between the forest and the river.",

      de:
        "Ein sumpfiges Gebiet zwischen Wald und Fluss.",
    },

    region: 1,

    type: "event",

    x: 49,
    y: 62,

    unlockAfter: [
      "mist-forest",
    ],

    connections: [
      "mist-forest",
      "old-bridge",
      "old-quarry",
    ],

    activities: [
      {
        id: "marsh-planks",

        type: "puzzle",

        puzzleId: "marsh-planks",

        title: {
          pl: "Przeprawa przez bagno",
          en: "Cross the Marsh",
          de: "Durchquere den Sumpf",
        },

        description: {
          pl:
            "Przenoś deski pomiędzy zatopionymi platformami, aby przejść dalej.",

          en:
            "Move planks between platforms to cross the marsh.",

          de:
            "Verschiebe Bretter zwischen Plattformen, um den Sumpf zu überqueren.",
        },

        reward: {
          xp: 40,
          memeEnergy: 20,
        },
      },
    ],
  },

  {
    id: "old-quarry",

    titleLocalized: {
      pl: "Stary Kamieniołom",
      en: "Old Quarry",
      de: "Alter Steinbruch",
    },

    descriptionLocalized: {
      pl:
        "Porzucony kamieniołom pełen starych narzędzi i tuneli.",

      en:
        "An abandoned quarry filled with old tools and tunnels.",

      de:
        "Ein verlassener Steinbruch mit alten Werkzeugen und Tunneln.",
    },

    region: 1,

    type: "event",

    x: 42,
    y: 71,

    unlockAfter: [
      "broken-cart",
      "fog-marsh",
    ],

    connections: [
      "broken-cart",
      "fog-marsh",
      "mine-entrance",
      "stone-circle",
    ],

    activities: [
      {
        id: "quarry-rockfall",

        type: "puzzle",

        puzzleId: "rockfall",

        title: {
          pl: "Zawalona droga",
          en: "Rockfall",
          de: "Felssturz",
        },

        description: {
          pl:
            "Przesuń kamienie w odpowiedniej kolejności, aby otworzyć drogę.",

          en:
            "Move the rocks in the correct order to clear the path.",

          de:
            "Verschiebe die Steine in der richtigen Reihenfolge.",
        },

        reward: {
          relics: 1,
          xp: 35,
        },
      },
    ],
  },

  {
    id: "mine-entrance",

    titleLocalized: {
      pl: "Wejście do Kopalni",
      en: "Mine Entrance",
      de: "Mineneingang",
    },

    descriptionLocalized: {
      pl:
        "Ciemny szyb prowadzący głęboko pod góry.",

      en:
        "A dark shaft descending deep beneath the mountains.",

      de:
        "Ein dunkler Schacht führt tief unter die Berge.",
    },

    region: 1,

    type: "secret",

    x: 49,
    y: 76,

    unlockAfter: [
      "old-quarry",
    ],

    connections: [
      "old-quarry",
      "deep-mine",
    ],

    activities: [
      {
        id: "mine-lift",

        type: "puzzle",

        puzzleId: "mine-gears",

        title: {
          pl: "Stara winda",
          en: "Old Lift",
          de: "Alter Aufzug",
        },

        description: {
          pl:
            "Połącz koła zębate tak, aby uruchomić platformę.",

          en:
            "Connect the gears to restore the lift.",

          de:
            "Verbinde die Zahnräder, um den Aufzug zu starten.",
        },

        reward: {
          xp: 40,
        },
      },
    ],
  },

  {
    id: "deep-mine",

    titleLocalized: {
      pl: "Głęboka Kopalnia",
      en: "Deep Mine",
      de: "Tiefe Mine",
    },

    descriptionLocalized: {
      pl:
        "Stare tunele zawierają zasoby i ślady działalności Bear Army.",

      en:
        "Old tunnels contain resources and signs of Bear Army activity.",

      de:
        "Alte Tunnel enthalten Ressourcen und Spuren der Bear Army.",
    },

    region: 1,

    type: "elite",

    x: 56,
    y: 80,

    unlockAfter: [
      "mine-entrance",
    ],

    connections: [
      "mine-entrance",
      "stone-circle",
    ],

    activities: [
      {
        id: "mine-elite",

        type: "elite",

        title: {
          pl: "Strażnik Kopalni",
          en: "Mine Guardian",
          de: "Minenwächter",
        },

        description: {
          pl:
            "Elitarny Bear pilnuje składu wydobytych materiałów.",

          en:
            "An elite Bear guards the stockpile.",

          de:
            "Ein Elite-Bär bewacht die Vorräte.",
        },

        repeatable: true,

        cooldownHours: 6,

        reward: {
          xp: 75,
          relics: 1,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "old-bridge",

    titleLocalized: {
      pl: "Stary Most",
      en: "Old Bridge",
      de: "Alte Brücke",
    },

    descriptionLocalized: {
      pl:
        "Uszkodzona przeprawa nad rwącą rzeką.",

      en:
        "A damaged bridge above the rushing river.",

      de:
        "Eine beschädigte Brücke über einem reißenden Fluss.",
    },

    region: 1,

    type: "event",

    x: 54.5,
    y: 55,

    missionId:
      "q-old-bridge",

    unlockAfter: [
      "mist-forest",
      "fog-marsh",
    ],

    connections: [
      "mist-forest",
      "fog-marsh",
      "river-crossing",
      "stone-circle",
      "watchtower",
    ],

    activities: [
      {
        id: "bridge-choice",

        type: "choice",

        title: {
          pl: "Przeprawa",
          en: "Crossing",
          de: "Überquerung",
        },

        description: {
          pl:
            "Możesz naprawić most, ryzykować przejście lub znaleźć objazd.",

          en:
            "Repair the bridge, risk crossing it, or find another route.",

          de:
            "Repariere die Brücke, riskiere den Übergang oder suche einen Umweg.",
        },

        reward: {
          xp: 30,
        },
      },

      {
        id: "bridge-ambush",

        type: "battle",

        title: {
          pl: "Zasadzka Bear Army",
          en: "Bear Army Ambush",
          de: "Hinterhalt der Bear Army",
        },

        description: {
          pl:
            "Patrol wykorzystuje most jako punkt zasadzki.",

          en:
            "A patrol uses the bridge as an ambush point.",

          de:
            "Eine Patrouille nutzt die Brücke für einen Hinterhalt.",
        },

        repeatable: true,

        cooldownHours: 4,

        reward: {
          xp: 45,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "river-crossing",

    titleLocalized: {
      pl: "Brodowisko",
      en: "River Ford",
      de: "Flussfurt",
    },

    descriptionLocalized: {
      pl:
        "Płytszy fragment rzeki pozwala ominąć Stary Most.",

      en:
        "A shallow section offers another way across.",

      de:
        "Eine flache Stelle bietet einen alternativen Übergang.",
    },

    region: 1,

    type: "event",

    x: 59,
    y: 61,

    unlockAfter: [
      "old-bridge",
    ],

    connections: [
      "old-bridge",
      "stone-circle",
      "abandoned-village",
    ],

    activities: [
      {
        id: "river-logs",

        type: "puzzle",

        puzzleId: "river-logs",

        title: {
          pl: "Pnie w rzece",
          en: "River Logs",
          de: "Baumstämme im Fluss",
        },

        description: {
          pl:
            "Ułóż pnie tak, żeby utworzyć stabilną przeprawę.",

          en:
            "Arrange the logs to create a stable crossing.",

          de:
            "Ordne die Baumstämme zu einer stabilen Überquerung.",
        },

        reward: {
          xp: 35,
        },
      },
    ],
  },

  {
    id: "stone-circle",

    titleLocalized: {
      pl: "Kamienny Krąg",
      en: "Stone Circle",
      de: "Steinkreis",
    },

    descriptionLocalized: {
      pl:
        "Starożytny krąg pokryty symbolami przypominającymi znaki z mapy PolishPepe.",

      en:
        "An ancient circle covered with symbols resembling Pepe's map.",

      de:
        "Ein alter Steinkreis mit Symbolen von Pepes Karte.",
    },

    region: 1,

    type: "secret",

    x: 61.5,
    y: 68,

    missionId:
      "q-stone-circle",

    unlockAfter: [
      "old-bridge",
      "old-quarry",
      "river-crossing",
    ],

    connections: [
      "old-bridge",
      "old-quarry",
      "deep-mine",
      "river-crossing",
      "graveyard",
      "bear-outpost-west",
    ],

    activities: [
      {
        id: "stone-symbols",

        type: "puzzle",

        puzzleId: "stone-circle",

        title: {
          pl: "Znaki w Kamieniu",
          en: "Signs in Stone",
          de: "Zeichen im Stein",
        },

        description: {
          pl:
            "Połącz symbole zgodnie ze wskazówkami znalezionymi wcześniej.",

          en:
            "Connect the symbols using clues found earlier.",

          de:
            "Verbinde die Symbole anhand früherer Hinweise.",
        },

        reward: {
          comicFragments: 1,
          intel: 1,
          xp: 60,
        },
      },
    ],
  },

  {
    id: "graveyard",

    titleLocalized: {
      pl: "Stare Cmentarzysko",
      en: "Old Graveyard",
      de: "Alter Friedhof",
    },

    descriptionLocalized: {
      pl:
        "Kamienne nagrobki pochodzą z czasów sprzed powstania Klasztoru.",

      en:
        "Stone graves predate the Monastery.",

      de:
        "Die Steingräber sind älter als das Kloster.",
    },

    region: 1,

    type: "secret",

    x: 58,
    y: 59,

    unlockAfter: [
      "forest-shrine",
      "stone-circle",
    ],

    connections: [
      "forest-shrine",
      "stone-circle",
      "abandoned-village",
    ],

    activities: [
      {
        id: "graveyard-statues",

        type: "puzzle",

        puzzleId: "grave-statues",

        title: {
          pl: "Kamienne figury",
          en: "Stone Statues",
          de: "Steinstatuen",
        },

        description: {
          pl:
            "Obróć trzy figury tak, aby patrzyły w odpowiednie strony.",

          en:
            "Rotate the statues so they face the correct directions.",

          de:
            "Drehe die Statuen in die richtigen Richtungen.",
        },

        reward: {
          relics: 2,
        },
      },
    ],
  },

  {
    id: "watchtower",

    titleLocalized: {
      pl: "Ruiny Strażnicy",
      en: "Watchtower Ruins",
      de: "Ruinen des Wachturms",
    },

    descriptionLocalized: {
      pl:
        "Zrujnowana wieża kontroluje przejścia przez centralną część doliny.",

      en:
        "A ruined tower controls the central valley routes.",

      de:
        "Ein zerstörter Turm kontrolliert die Wege durch das Tal.",
    },

    region: 1,

    type: "battle",

    x: 64.5,
    y: 32,

    missionId:
      "q-watchtower",

    repeatable: true,

    unlockAfter: [
      "old-bridge",
      "high-trail",
    ],

    connections: [
      "old-bridge",
      "high-trail",
      "watchtower-cellar",
      "north-ridge",
      "bear-outpost-west",
    ],

    activities: [
      {
        id: "watchtower-patrol",

        type: "battle",

        title: {
          pl: "Załoga Strażnicy",
          en: "Watchtower Guard",
          de: "Wachturmwache",
        },

        description: {
          pl:
            "Oddział Bear Army utrzymuje posterunek w ruinach.",

          en:
            "A Bear Army unit occupies the ruins.",

          de:
            "Eine Einheit der Bear Army hält die Ruinen besetzt.",
        },

        repeatable: true,

        cooldownHours: 3,

        reward: {
          xp: 50,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "watchtower-cellar",

    titleLocalized: {
      pl: "Piwnice Strażnicy",
      en: "Watchtower Cellar",
      de: "Keller des Wachturms",
    },

    descriptionLocalized: {
      pl:
        "Pod ruinami znajduje się zapomniany magazyn.",

      en:
        "A forgotten storage chamber lies beneath the ruins.",

      de:
        "Unter den Ruinen liegt ein vergessenes Lager.",
    },

    region: 1,

    type: "secret",

    x: 68,
    y: 36,

    unlockAfter: [
      "watchtower",
    ],

    connections: [
      "watchtower",
      "north-ridge",
    ],

    activities: [
      {
        id: "watchtower-levers",

        type: "puzzle",

        puzzleId: "watchtower-levers",

        title: {
          pl: "Stary mechanizm",
          en: "Old Mechanism",
          de: "Alter Mechanismus",
        },

        description: {
          pl:
            "Trzy dźwignie otwierają zamkniętą część magazynu.",

          en:
            "Three levers control the sealed storage room.",

          de:
            "Drei Hebel kontrollieren den verschlossenen Lagerraum.",
        },

        reward: {
          intel: 1,
          cardFragments: 1,
        },
      },
    ],
  },

  {
    id: "north-ridge",

    titleLocalized: {
      pl: "Północna Grań",
      en: "Northern Ridge",
      de: "Nordgrat",
    },

    descriptionLocalized: {
      pl:
        "Wysoka grań oferuje widok na większą część mapy.",

      en:
        "A high ridge overlooking most of the region.",

      de:
        "Ein hoher Grat mit Blick über fast die gesamte Region.",
    },

    region: 1,

    type: "event",

    x: 70,
    y: 25,

    unlockAfter: [
      "watchtower",
    ],

    connections: [
      "watchtower",
      "watchtower-cellar",
      "mountain-pass",
    ],

    activities: [
      {
        id: "north-ridge-scout",

        type: "event",

        title: {
          pl: "Obserwacja doliny",
          en: "Observe the Valley",
          de: "Tal beobachten",
        },

        description: {
          pl:
            "Zaznacz pozycje patroli Bear Army.",

          en:
            "Mark Bear Army patrol positions.",

          de:
            "Markiere die Positionen der Bear-Army-Patrouillen.",
        },

        repeatable: true,

        cooldownHours: 8,

        reward: {
          intel: 1,
        },
      },
    ],
  },

  {
    id: "mountain-pass",

    titleLocalized: {
      pl: "Górska Przełęcz",
      en: "Mountain Pass",
      de: "Bergpass",
    },

    descriptionLocalized: {
      pl:
        "Wąski szlak pomiędzy wysokimi skałami.",

      en:
        "A narrow path between towering cliffs.",

      de:
        "Ein schmaler Pfad zwischen hohen Felsen.",
    },

    region: 1,

    type: "elite",

    x: 76,
    y: 29,

    unlockAfter: [
      "north-ridge",
    ],

    connections: [
      "north-ridge",
      "dark-gate",
      "bear-lookout",
    ],

    activities: [
      {
        id: "mountain-elite",

        type: "elite",

        title: {
          pl: "Strażnicy przełęczy",
          en: "Pass Guardians",
          de: "Wächter des Passes",
        },

        description: {
          pl:
            "Elitarny oddział blokuje górskie przejście.",

          en:
            "An elite unit blocks the mountain route.",

          de:
            "Eine Eliteeinheit blockiert den Bergpass.",
        },

        repeatable: true,

        cooldownHours: 6,

        reward: {
          xp: 90,
          bearFragments: 3,
        },
      },
    ],
  },

  {
    id: "bear-lookout",

    titleLocalized: {
      pl: "Punkt Obserwacyjny Bear Army",
      en: "Bear Lookout",
      de: "Beobachtungsposten",
    },

    descriptionLocalized: {
      pl:
        "Mały posterunek obserwujący drogę do Ciemnej Doliny.",

      en:
        "A small outpost watching the route toward Dark Valley.",

      de:
        "Ein kleiner Posten überwacht den Weg ins Dunkle Tal.",
    },

    region: 1,

    type: "battle",

    x: 80,
    y: 35,

    unlockAfter: [
      "mountain-pass",
    ],

    connections: [
      "mountain-pass",
      "dark-gate",
      "bear-camp",
    ],

    activities: [
      {
        id: "lookout-battle",

        type: "battle",

        title: {
          pl: "Usuń obserwatorów",
          en: "Clear the Lookout",
          de: "Räume den Posten",
        },

        description: {
          pl:
            "Pokonaj oddział zanim zaalarmuje główny obóz.",

          en:
            "Defeat the unit before it alerts the main camp.",

          de:
            "Besiege die Einheit, bevor sie das Hauptlager warnt.",
        },

        reward: {
          xp: 60,
          intel: 1,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "bear-outpost-west",

    titleLocalized: {
      pl: "Zachodni Posterunek",
      en: "Western Outpost",
      de: "Westlicher Außenposten",
    },

    descriptionLocalized: {
      pl:
        "Mały ufortyfikowany punkt pomiędzy kręgiem i osadą.",

      en:
        "A small fortified position between the circle and village.",

      de:
        "Ein kleiner befestigter Posten zwischen Steinkreis und Dorf.",
    },

    region: 1,

    type: "battle",

    x: 66,
    y: 56,

    unlockAfter: [
      "stone-circle",
      "watchtower",
    ],

    connections: [
      "stone-circle",
      "watchtower",
      "abandoned-village",
      "bear-camp",
    ],

    activities: [
      {
        id: "west-outpost-battle",

        type: "battle",

        title: {
          pl: "Posterunek Bear Army",
          en: "Bear Army Outpost",
          de: "Außenposten der Bear Army",
        },

        description: {
          pl:
            "Pokonaj patrol i przejmij zapasy.",

          en:
            "Defeat the patrol and capture its supplies.",

          de:
            "Besiege die Patrouille und erobere die Vorräte.",
        },

        repeatable: true,

        cooldownHours: 4,

        reward: {
          xp: 45,
          memeEnergy: 20,
          bearFragments: 2,
        },
      },
    ],
  },

  {
    id: "abandoned-village",

    titleLocalized: {
      pl: "Opuszczona Osada",
      en: "Abandoned Village",
      de: "Verlassenes Dorf",
    },

    descriptionLocalized: {
      pl:
        "Zniszczone domy i puste ulice skrywają ślady niedawnej walki.",

      en:
        "Ruined houses and empty streets hide signs of recent fighting.",

      de:
        "Zerstörte Häuser und leere Straßen zeigen Spuren eines Kampfes.",
    },

    region: 1,

    type: "event",

    x: 70,
    y: 55,

    missionId:
      "q-abandoned-village",

    unlockAfter: [
      "river-crossing",
      "graveyard",
      "bear-outpost-west",
    ],

    connections: [
      "river-crossing",
      "graveyard",
      "bear-outpost-west",
      "village-cellar",
      "old-chapel",
      "bear-camp",
    ],

    activities: [
      {
        id: "village-search",

        type: "search",

        title: {
          pl: "Przeszukaj domy",
          en: "Search the Houses",
          de: "Durchsuche die Häuser",
        },

        description: {
          pl:
            "W opuszczonych budynkach mogą znajdować się zapasy albo ocalałe osoby.",

          en:
            "The abandoned buildings may contain supplies or survivors.",

          de:
            "In den verlassenen Häusern könnten Vorräte oder Überlebende sein.",
        },

        reward: {
          memeEnergy: 25,
          intel: 1,
        },
      },
    ],
  },

  {
    id: "village-cellar",

    titleLocalized: {
      pl: "Piwnice Osady",
      en: "Village Cellar",
      de: "Dorfkeller",
    },

    descriptionLocalized: {
      pl:
        "Pod jednym z domów znajduje się zamknięta piwnica.",

      en:
        "A locked cellar lies beneath one of the ruined houses.",

      de:
        "Unter einem der Häuser befindet sich ein verschlossener Keller.",
    },

    region: 1,

    type: "secret",

    x: 72,
    y: 61,

    unlockAfter: [
      "abandoned-village",
    ],

    connections: [
      "abandoned-village",
      "old-chapel",
    ],

    activities: [
      {
        id: "village-cellar-lock",

        type: "puzzle",

        puzzleId: "cellar-lock",

        title: {
          pl: "Zamek piwnicy",
          en: "Cellar Lock",
          de: "Kellerschloss",
        },

        description: {
          pl:
            "Przesuwaj metalowe elementy, aby zwolnić zamek.",

          en:
            "Slide the metal pieces to unlock the door.",

          de:
            "Verschiebe die Metallteile, um das Schloss zu öffnen.",
        },

        reward: {
          cardFragments: 1,
          memeEnergy: 30,
        },
      },
    ],
  },

  {
    id: "old-chapel",

    titleLocalized: {
      pl: "Zrujnowana Kaplica",
      en: "Ruined Chapel",
      de: "Zerstörte Kapelle",
    },

    descriptionLocalized: {
      pl:
        "Mała świątynia na obrzeżu osady.",

      en:
        "A small ruined chapel near the village.",

      de:
        "Eine kleine zerstörte Kapelle am Dorfrand.",
    },

    region: 1,

    type: "secret",

    x: 75,
    y: 56,

    unlockAfter: [
      "abandoned-village",
    ],

    connections: [
      "abandoned-village",
      "village-cellar",
      "bear-camp",
    ],

    activities: [
      {
        id: "chapel-mosaic",

        type: "puzzle",

        puzzleId: "chapel-mosaic",

        title: {
          pl: "Rozbita mozaika",
          en: "Broken Mosaic",
          de: "Zerbrochenes Mosaik",
        },

        description: {
          pl:
            "Ułóż fragmenty mozaiki, aby odsłonić ukryty symbol.",

          en:
            "Arrange the mosaic pieces to reveal a hidden symbol.",

          de:
            "Setze die Mosaikteile zusammen.",
        },

        reward: {
          comicFragments: 1,
        },
      },
    ],
  },

  {
    id: "bear-camp",

    titleLocalized: {
      pl: "Obóz Niedźwiedzi",
      en: "Bear Camp",
      de: "Bärenlager",
    },

    descriptionLocalized: {
      pl:
        "Największy posterunek Bear Army w Regionie 1.",

      en:
        "The largest Bear Army position in Region 1.",

      de:
        "Der größte Posten der Bear Army in Region 1.",
    },

    region: 1,

    type: "elite",

    x: 77,
    y: 67,

    missionId:
      "q-bear-camp",

    repeatable: true,

    unlockAfter: [
      "bear-outpost-west",
      "abandoned-village",
      "old-chapel",
      "bear-lookout",
    ],

    connections: [
      "bear-outpost-west",
      "abandoned-village",
      "old-chapel",
      "bear-lookout",
      "bear-supply-yard",
      "dark-gate",
    ],

    activities: [
      {
        id: "bear-camp-patrol",

        type: "battle",

        title: {
          pl: "Zewnętrzny patrol",
          en: "Outer Patrol",
          de: "Äußere Patrouille",
        },

        description: {
          pl:
            "Przełam pierwszą linię obrony obozu.",

          en:
            "Break through the camp's first defensive line.",

          de:
            "Durchbrich die erste Verteidigungslinie.",
        },

        repeatable: true,

        cooldownHours: 4,

        reward: {
          xp: 55,
          bearFragments: 2,
        },
      },

      {
        id: "bear-camp-elite",

        type: "elite",

        title: {
          pl: "Dowódca obozu",
          en: "Camp Commander",
          de: "Lagerkommandant",
        },

        description: {
          pl:
            "Elitarny Bear dowodzi lokalnymi patrolami.",

          en:
            "An elite Bear commands the local patrols.",

          de:
            "Ein Elite-Bär befehligt die lokalen Patrouillen.",
        },

        repeatable: true,

        cooldownHours: 8,

        reward: {
          xp: 100,
          bearFragments: 4,
          cardFragments: 1,
        },
      },
    ],
  },

  {
    id: "bear-supply-yard",

    titleLocalized: {
      pl: "Magazyn Obozu",
      en: "Camp Supply Yard",
      de: "Versorgungslager",
    },

    descriptionLocalized: {
      pl:
        "Skrzynie z wyposażeniem i zapasami Bear Army.",

      en:
        "Crates of Bear Army equipment and supplies.",

      de:
        "Kisten mit Ausrüstung und Vorräten der Bear Army.",
    },

    region: 1,

    type: "secret",

    x: 82,
    y: 70,

    unlockAfter: [
      "bear-camp",
    ],

    connections: [
      "bear-camp",
      "dark-gate",
    ],

    activities: [
      {
        id: "supply-yard-crates",

        type: "search",

        title: {
          pl: "Przejmij zapasy",
          en: "Capture Supplies",
          de: "Vorräte erbeuten",
        },

        description: {
          pl:
            "Przeszukaj skrzynie zanim patrol wróci.",

          en:
            "Search the crates before the patrol returns.",

          de:
            "Durchsuche die Kisten, bevor die Patrouille zurückkehrt.",
        },

        repeatable: true,

        cooldownHours: 12,

        reward: {
          memeEnergy: 40,
          bearFragments: 2,
          cardFragments: 1,
        },
      },
    ],
  },

  /* =======================================================
     REGION 2 — CIEMNA DOLINA
  ======================================================= */

  {
    id: "dark-gate",

    titleLocalized: {
      pl: "Brama Ciemnej Doliny",
      en: "Dark Valley Gate",
      de: "Tor zum Dunklen Tal",
    },

    descriptionLocalized: {
      pl:
        "Monumentalna brama zabezpieczająca wejście do terytorium Bear Army.",

      en:
        "A monumental gate sealing Bear Army territory.",

      de:
        "Ein monumentales Tor zum Gebiet der Bear Army.",
    },

    region: 2,

    type: "story",

    x: 81,
    y: 42,

    missionId:
      "q-dark-gate",

    unlockAfter: [
      "bear-camp",
      "mountain-pass",
      "bear-lookout",
    ],

    connections: [
      "bear-camp",
      "bear-supply-yard",
      "mountain-pass",
      "bear-lookout",
      "dark-crossroads",
    ],

    requirement: {
      intel: 3,
      comicFragments: 1,
      rescuedNPCs: [
        "monastery-scout",
      ],
    },

    activities: [
      {
        id: "dark-gate-mechanism",

        type: "puzzle",

        puzzleId: "dark-gate",

        title: {
          pl: "Mechanizm Bramy",
          en: "Gate Mechanism",
          de: "Tormechanismus",
        },

        description: {
          pl:
            "Połącz wiedzę Zwiadowcy, Intel i Comic Fragment.",

          en:
            "Combine Scout knowledge, Intel and the Comic Fragment.",

          de:
            "Kombiniere Späherwissen, Intel und Comicfragment.",
        },

        reward: {
          xp: 80,
        },
      },
    ],
  },

  {
    id: "dark-crossroads",

    titleLocalized: {
      pl: "Czarne Rozdroże",
      en: "Black Crossroads",
      de: "Schwarze Kreuzung",
    },

    descriptionLocalized: {
      pl:
        "Kilka dróg przecina się pod cieniem Ciemnej Cytadeli.",

      en:
        "Several roads intersect beneath the shadow of the Dark Citadel.",

      de:
        "Mehrere Wege kreuzen sich im Schatten der Dunklen Zitadelle.",
    },

    region: 2,

    type: "event",

    x: 84,
    y: 48,

    unlockAfter: [
      "dark-gate",
    ],

    connections: [
      "dark-gate",
      "burned-village",
      "lava-bridge",
      "dark-watch",
    ],
  },

  {
    id: "burned-village",

    titleLocalized: {
      pl: "Spalona Osada",
      en: "Burned Village",
      de: "Verbranntes Dorf",
    },

    descriptionLocalized: {
      pl:
        "Ruiny osady zniszczonej przez Bear Army.",

      en:
        "Ruins of a settlement destroyed by the Bear Army.",

      de:
        "Ruinen eines von der Bear Army zerstörten Dorfes.",
    },

    region: 2,

    type: "event",

    x: 82,
    y: 56,

    unlockAfter: [
      "dark-crossroads",
    ],

    connections: [
      "dark-crossroads",
      "lava-bridge",
      "ash-pits",
    ],

    activities: [
      {
        id: "burned-village-rescue",

        type: "rescue",

        title: {
          pl: "Ocalały",
          en: "Survivor",
          de: "Überlebender",
        },

        description: {
          pl:
            "Ktoś ukrywa się w ruinach.",

          en:
            "Someone is hiding among the ruins.",

          de:
            "Jemand versteckt sich zwischen den Ruinen.",
        },

        reward: {
          intel: 1,
          xp: 60,
        },
      },
    ],
  },

  {
    id: "lava-bridge",

    titleLocalized: {
      pl: "Most nad Lawą",
      en: "Lava Bridge",
      de: "Lavabrücke",
    },

    descriptionLocalized: {
      pl:
        "Kamienny most przecina rozgrzaną szczelinę.",

      en:
        "A stone bridge crosses a burning chasm.",

      de:
        "Eine Steinbrücke führt über eine glühende Schlucht.",
    },

    region: 2,

    type: "event",

    x: 87,
    y: 54,

    unlockAfter: [
      "dark-crossroads",
    ],

    connections: [
      "dark-crossroads",
      "burned-village",
      "dark-watch",
      "dark-valley",
    ],

    activities: [
      {
        id: "lava-valves",

        type: "puzzle",

        puzzleId: "lava-valves",

        title: {
          pl: "Zawory chłodzące",
          en: "Cooling Valves",
          de: "Kühlventile",
        },

        description: {
          pl:
            "Uruchom zawory w odpowiedniej kolejności, aby schłodzić przejście.",

          en:
            "Activate the valves in the correct order to cool the crossing.",

          de:
            "Aktiviere die Ventile in der richtigen Reihenfolge.",
        },

        reward: {
          xp: 70,
        },
      },
    ],
  },

  {
    id: "ash-pits",

    titleLocalized: {
      pl: "Doły Popiołu",
      en: "Ash Pits",
      de: "Aschegruben",
    },

    descriptionLocalized: {
      pl:
        "Teren pełen gorącego popiołu i opuszczonych tuneli.",

      en:
        "A field of hot ash and abandoned tunnels.",

      de:
        "Ein Gebiet aus heißer Asche und verlassenen Tunneln.",
    },

    region: 2,

    type: "secret",

    x: 84,
    y: 64,

    unlockAfter: [
      "burned-village",
    ],

    connections: [
      "burned-village",
      "dark-valley",
    ],

    activities: [
      {
        id: "ash-search",

        type: "search",

        title: {
          pl: "Przeszukaj tunele",
          en: "Search the Tunnels",
          de: "Durchsuche die Tunnel",
        },

        description: {
          pl:
            "Stare tunele mogą skrywać wyposażenie Bear Army.",

          en:
            "Old tunnels may contain Bear Army equipment.",

          de:
            "Die alten Tunnel könnten Ausrüstung enthalten.",
        },

        reward: {
          relics: 1,
          cardFragments: 1,
        },
      },
    ],
  },

  {
    id: "dark-watch",

    titleLocalized: {
      pl: "Czarna Strażnica",
      en: "Dark Watch",
      de: "Dunkler Wachturm",
    },

    descriptionLocalized: {
      pl:
        "Silnie broniony posterunek przed Cytadelą.",

      en:
        "A heavily defended post before the Citadel.",

      de:
        "Ein stark befestigter Posten vor der Zitadelle.",
    },

    region: 2,

    type: "elite",

    x: 90,
    y: 42,

    unlockAfter: [
      "dark-crossroads",
      "lava-bridge",
    ],

    connections: [
      "dark-crossroads",
      "lava-bridge",
      "dark-valley",
    ],

    activities: [
      {
        id: "dark-watch-elite",

        type: "elite",

        title: {
          pl: "Elitarna Straż",
          en: "Elite Guard",
          de: "Elitewache",
        },

        description: {
          pl:
            "Jednostka chroni drogę prowadzącą do Cytadeli.",

          en:
            "An elite unit guards the route to the Citadel.",

          de:
            "Eine Eliteeinheit bewacht den Weg zur Zitadelle.",
        },

        repeatable: true,

        cooldownHours: 6,

        reward: {
          xp: 110,
          bearFragments: 4,
        },
      },
    ],
  },

  {
    id: "dark-valley",

    titleLocalized: {
      pl: "Ciemna Dolina Niedźwiedzia",
      en: "Bear's Dark Valley",
      de: "Dunkles Tal des Bären",
    },

    descriptionLocalized: {
      pl:
        "Serce pierwszego terytorium Bear Army.",

      en:
        "The heart of the first Bear Army territory.",

      de:
        "Das Herz des ersten Gebiets der Bear Army.",
    },

    region: 2,

    type: "boss",

    x: 94,
    y: 31,

    missionId:
      "q-dark-valley",

    repeatable: true,

    unlockAfter: [
      "lava-bridge",
      "dark-watch",
      "ash-pits",
    ],

    connections: [
      "lava-bridge",
      "dark-watch",
      "ash-pits",
    ],

    activities: [
      {
        id: "dark-valley-boss",

        type: "boss",

        title: {
          pl: "Dowódca Niedźwiedzi",
          en: "Bear Commander",
          de: "Bärenkommandant",
        },

        description: {
          pl:
            "Pokonaj pierwszego głównego dowódcę Bear Army.",

          en:
            "Defeat the first major Bear Army commander.",

          de:
            "Besiege den ersten großen Kommandanten der Bear Army.",
        },

        repeatable: true,

        cooldownHours: 12,

        reward: {
          xp: 250,
          memeEnergy: 100,
          relics: 3,
          bearFragments: 8,
          cardFragments: 2,
          skillPoints: 1,
        },
      },
    ],
  },
];

/* =========================================================
   DISCOVERIES
========================================================= */

export const WORLD_MAP_DISCOVERIES: MapDiscovery[] = [
  {
    id: "bocian-note",

    locationId: "monastery",

    type: "lore",

    titleLocalized: {
      pl: "Notatka Bociana",
      en: "Stork's Note",
      de: "Notiz des Storchs",
    },

    descriptionLocalized: {
      pl:
        "Krótka wiadomość dotycząca szlaków wokół Klasztoru.",

      en:
        "A short note about routes around the Monastery.",

      de:
        "Eine kurze Notiz über Wege rund um das Kloster.",
    },

    x: 13.5,
    y: 48,

    reward: {
      intel: 1,
    },
  },

  {
    id: "forest-hidden-pack",

    locationId: "forest-pass",

    type: "cache",

    titleLocalized: {
      pl: "Ukryty plecak",
      en: "Hidden Backpack",
      de: "Versteckter Rucksack",
    },

    descriptionLocalized: {
      pl:
        "Plecak został ukryty pod korzeniami drzewa.",

      en:
        "A backpack hidden beneath tree roots.",

      de:
        "Ein Rucksack unter Baumwurzeln.",
    },

    x: 29,
    y: 45,

    reward: {
      memeEnergy: 15,
    },
  },

  {
    id: "hunter-map",

    locationId: "hunter-hut",

    type: "intel",

    titleLocalized: {
      pl: "Mapa Myśliwego",
      en: "Hunter's Map",
      de: "Jägerkarte",
    },

    descriptionLocalized: {
      pl:
        "Mapa pokazuje starą drogę w stronę Kamieniołomu.",

      en:
        "A map showing an old route toward the Quarry.",

      de:
        "Eine Karte mit einem alten Weg zum Steinbruch.",
    },

    x: 37,
    y: 53,

    reward: {
      intel: 1,
    },
  },

  {
    id: "mist-lake-cache",

    locationId: "mist-lake",

    type: "cache",

    titleLocalized: {
      pl: "Skrzynia nad jeziorem",
      en: "Lake Chest",
      de: "Truhe am See",
    },

    descriptionLocalized: {
      pl:
        "Stara skrzynia zaklinowała się między skałami.",

      en:
        "An old chest wedged between rocks.",

      de:
        "Eine alte Truhe zwischen Felsen.",
    },

    x: 37,
    y: 40,

    reward: {
      relics: 1,
      memeEnergy: 20,
    },
  },

  {
    id: "lost-scout",

    locationId: "mist-forest",

    type: "npc",

    titleLocalized: {
      pl: "Zaginiony Zwiadowca",
      en: "Missing Scout",
      de: "Vermisster Späher",
    },

    descriptionLocalized: {
      pl:
        "Ranny zwiadowca ukrywa się wśród drzew.",

      en:
        "An injured scout is hiding among the trees.",

      de:
        "Ein verletzter Späher versteckt sich zwischen den Bäumen.",
    },

    x: 46.5,
    y: 48,

    npcId:
      "monastery-scout",

    npcNameLocalized: {
      pl: "Zwiadowca Klasztoru",
      en: "Monastery Scout",
      de: "Klosterspäher",
    },

    reward: {
      intel: 1,
    },
  },

  {
    id: "mist-herbs",

    locationId: "mist-forest",

    type: "resource",

    titleLocalized: {
      pl: "Rzadkie zioła",
      en: "Rare Herbs",
      de: "Seltene Kräuter",
    },

    descriptionLocalized: {
      pl:
        "Rośliny używane przez Bociana do przygotowania mikstur.",

      en:
        "Plants used by Stork to prepare mixtures.",

      de:
        "Pflanzen für die Mischungen des Storchs.",
    },

    x: 44,
    y: 43,

    reward: {
      memeEnergy: 10,
    },
  },

  {
    id: "waterfall-relic",

    locationId: "hidden-cave",

    type: "secret",

    titleLocalized: {
      pl: "Relikt z Jaskini",
      en: "Cave Relic",
      de: "Höhlenrelikt",
    },

    descriptionLocalized: {
      pl:
        "Przedmiot ukryty za kamiennym panelem.",

      en:
        "An object hidden behind a stone panel.",

      de:
        "Ein Gegenstand hinter einer Steinplatte.",
    },

    x: 46,
    y: 28,

    reward: {
      relics: 2,
    },
  },

  {
    id: "old-wagon",

    locationId: "old-bridge",

    type: "cache",

    titleLocalized: {
      pl: "Porzucony wóz",
      en: "Abandoned Wagon",
      de: "Verlassener Wagen",
    },

    descriptionLocalized: {
      pl:
        "Resztki zapasów pozostały na brzegu.",

      en:
        "Some supplies remain near the bridge.",

      de:
        "Einige Vorräte liegen noch an der Brücke.",
    },

    x: 53,
    y: 58,

    reward: {
      memeEnergy: 30,
    },
  },

  {
    id: "bridge-bear-token",

    locationId: "old-bridge",

    type: "card",

    titleLocalized: {
      pl: "Żeton Bear Army",
      en: "Bear Army Token",
      de: "Bear-Army-Marke",
    },

    descriptionLocalized: {
      pl:
        "Metalowy znak znaleziony przy jednym z pokonanych patroli.",

      en:
        "A metal token found near the patrol route.",

      de:
        "Eine Metallmarke aus dem Patrouillengebiet.",
    },

    x: 56,
    y: 53,

    reward: {
      bearFragments: 1,
      cardFragments: 1,
    },
  },

  {
    id: "comic-symbol-01",

    locationId: "stone-circle",

    type: "comic",

    titleLocalized: {
      pl: "Fragment Komiksu I",
      en: "Comic Fragment I",
      de: "Comicfragment I",
    },

    descriptionLocalized: {
      pl:
        "Fragment zawiera symbol powiązany z historią PolishPepe.",

      en:
        "A fragment containing a symbol linked to PolishPepe's history.",

      de:
        "Ein Fragment mit einem Symbol aus PolishPepes Geschichte.",
    },

    x: 62,
    y: 65,

    reward: {
      comicFragments: 1,
      intel: 1,
    },
  },

  {
    id: "stone-circle-relic",

    locationId: "stone-circle",

    type: "secret",

    titleLocalized: {
      pl: "Kamienny Relikt",
      en: "Stone Relic",
      de: "Steinrelikt",
    },

    descriptionLocalized: {
      pl:
        "Mały przedmiot ukryty pod centralnym kamieniem.",

      en:
        "A small object hidden beneath the central stone.",

      de:
        "Ein kleiner Gegenstand unter dem zentralen Stein.",
    },

    x: 60,
    y: 70,

    reward: {
      relics: 1,
    },
  },

  {
    id: "graveyard-key",

    locationId: "graveyard",

    type: "secret",

    titleLocalized: {
      pl: "Stary Klucz",
      en: "Old Key",
      de: "Alter Schlüssel",
    },

    descriptionLocalized: {
      pl:
        "Klucz należał do jednego z dawnych mieszkańców osady.",

      en:
        "A key once belonging to a village resident.",

      de:
        "Ein Schlüssel eines ehemaligen Dorfbewohners.",
    },

    x: 59,
    y: 57,

    reward: {
      intel: 1,
    },
  },

  {
    id: "bear-orders",

    locationId: "watchtower",

    type: "intel",

    titleLocalized: {
      pl: "Rozkazy Bear Army",
      en: "Bear Army Orders",
      de: "Befehle der Bear Army",
    },

    descriptionLocalized: {
      pl:
        "Dokumenty zawierają informacje o patrolach i obozie.",

      en:
        "Documents contain information about patrols and the camp.",

      de:
        "Dokumente enthalten Informationen über Patrouillen.",
    },

    x: 65,
    y: 35,

    reward: {
      intel: 1,
      bearFragments: 2,
    },
  },

  {
    id: "watchtower-hidden-chest",

    locationId: "watchtower-cellar",

    type: "cache",

    titleLocalized: {
      pl: "Skrzynia Strażnicy",
      en: "Watchtower Chest",
      de: "Wachturmtruhe",
    },

    descriptionLocalized: {
      pl:
        "Zapomniana skrzynia znajduje się pod schodami.",

      en:
        "A forgotten chest beneath the stairs.",

      de:
        "Eine vergessene Truhe unter der Treppe.",
    },

    x: 68,
    y: 38,

    reward: {
      memeEnergy: 25,
      relics: 1,
    },
  },

  {
    id: "ridge-spyglass",

    locationId: "north-ridge",

    type: "intel",

    titleLocalized: {
      pl: "Stara Luneta",
      en: "Old Spyglass",
      de: "Altes Fernrohr",
    },

    descriptionLocalized: {
      pl:
        "Luneta pozwala zobaczyć ruch wojsk w oddali.",

      en:
        "The spyglass reveals troop movements in the distance.",

      de:
        "Das Fernrohr zeigt Truppenbewegungen in der Ferne.",
    },

    x: 71,
    y: 24,

    reward: {
      intel: 1,
    },
  },

  {
    id: "village-prisoner",

    locationId: "abandoned-village",

    type: "npc",

    titleLocalized: {
      pl: "Uwięziony Wędrowiec",
      en: "Imprisoned Traveller",
      de: "Gefangener Reisender",
    },

    descriptionLocalized: {
      pl:
        "Pod jednym z domów ktoś woła o pomoc.",

      en:
        "Someone is calling for help beneath one of the houses.",

      de:
        "Unter einem der Häuser ruft jemand um Hilfe.",
    },

    x: 71,
    y: 57,

    npcId:
      "rescued-traveller",

    npcNameLocalized: {
      pl: "Wędrowiec",
      en: "Traveller",
      de: "Reisender",
    },

    reward: {
      relics: 1,
      intel: 1,
    },
  },

  {
    id: "village-cellar-cache",

    locationId: "village-cellar",

    type: "cache",

    titleLocalized: {
      pl: "Zapasy mieszkańców",
      en: "Village Supplies",
      de: "Dorfvorräte",
    },

    descriptionLocalized: {
      pl:
        "Kilka skrzyń przetrwało atak.",

      en:
        "Several crates survived the attack.",

      de:
        "Einige Kisten haben den Angriff überstanden.",
    },

    x: 72,
    y: 63,

    reward: {
      memeEnergy: 30,
      cardFragments: 1,
    },
  },

  {
    id: "bear-supply-crate",

    locationId: "bear-camp",

    type: "cache",

    titleLocalized: {
      pl: "Skrzynia Bear Army",
      en: "Bear Army Crate",
      de: "Bear-Army-Kiste",
    },

    descriptionLocalized: {
      pl:
        "Ciężka skrzynia z wyposażeniem bojowym.",

      en:
        "A heavy crate of military equipment.",

      de:
        "Eine schwere Kiste mit militärischer Ausrüstung.",
    },

    x: 78,
    y: 65,

    reward: {
      memeEnergy: 40,
      bearFragments: 3,
    },
  },

  {
    id: "bear-camp-map",

    locationId: "bear-camp",

    type: "intel",

    titleLocalized: {
      pl: "Mapa Ciemnej Doliny",
      en: "Dark Valley Map",
      de: "Karte des Dunklen Tals",
    },

    descriptionLocalized: {
      pl:
        "Mapa pokazuje wejścia i posterunki po drugiej stronie Bramy.",

      en:
        "A map showing routes beyond the Dark Gate.",

      de:
        "Eine Karte mit Wegen hinter dem Dunklen Tor.",
    },

    x: 80,
    y: 67,

    reward: {
      intel: 2,
    },
  },

  {
    id: "dark-gate-cache",

    locationId: "dark-gate",

    type: "cache",

    titleLocalized: {
      pl: "Skrytka przy Bramie",
      en: "Gate Cache",
      de: "Versteck am Tor",
    },

    descriptionLocalized: {
      pl:
        "Ukryta skrytka znajduje się w skalnej szczelinie.",

      en:
        "A hidden cache sits inside a rock crack.",

      de:
        "Ein Versteck befindet sich in einer Felsspalte.",
    },

    x: 82,
    y: 44,

    reward: {
      relics: 1,
      memeEnergy: 30,
    },
  },

  {
    id: "dark-village-survivor",

    locationId: "burned-village",

    type: "npc",

    titleLocalized: {
      pl: "Ocalały z Ciemnej Doliny",
      en: "Dark Valley Survivor",
      de: "Überlebender des Dunklen Tals",
    },

    descriptionLocalized: {
      pl:
        "Ocalały zna ukryte przejścia prowadzące do Cytadeli.",

      en:
        "A survivor knows hidden routes toward the Citadel.",

      de:
        "Ein Überlebender kennt geheime Wege zur Zitadelle.",
    },

    x: 82,
    y: 59,

    npcId:
      "dark-survivor",

    npcNameLocalized: {
      pl: "Ocalały",
      en: "Survivor",
      de: "Überlebender",
    },

    reward: {
      intel: 2,
    },
  },

  {
    id: "dark-commander-cache",

    locationId: "dark-valley",

    type: "card",

    titleLocalized: {
      pl: "Fragment Karty Dowódcy",
      en: "Commander Card Fragment",
      de: "Kartenfragment des Kommandanten",
    },

    descriptionLocalized: {
      pl:
        "Fragment wyjątkowej karty zdobywany po pokonaniu głównego dowódcy.",

      en:
        "A rare card fragment obtained from the commander.",

      de:
        "Ein seltenes Kartenfragment des Kommandanten.",
    },

    x: 93,
    y: 34,

    reward: {
      cardFragments: 2,
      bearFragments: 3,
    },
  },
];