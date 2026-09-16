import type {
  RandomEncounter,
  WorldQuest,
} from "./QuestEngine";

/* =========================================================
   REGION 1 MAIN QUESTS
========================================================= */

export const WORLD_QUESTS: WorldQuest[] = [
  /* =======================================================
     Q1
  ======================================================= */

  {
    id:
      "q-forest-signal",

    region: 1,

    title: {
      pl:
        "Ślady poza Klasztorem",

      en:
        "Tracks Beyond the Monastery",

      de:
        "Spuren hinter dem Kloster",
    },

    description: {
      pl:
        "Bocian zauważył nietypowy ruch poza murami. Sprawdź Leśną Przełęcz i dowiedz się, kto obserwuje Klasztor.",

      en:
        "Stork noticed unusual movement beyond the walls. Investigate Forest Pass and discover who is watching the Monastery.",

      de:
        "Der Storch hat ungewöhnliche Bewegungen außerhalb der Mauern bemerkt. Untersuche den Waldpass.",
    },

    steps: [
      {
        id:
          "q-forest-signal-1",

        locationId:
          "forest-pass",

        type:
          "story",

        title: {
          pl:
            "Dotrzyj do Leśnej Przełęczy",

          en:
            "Reach Forest Pass",

          de:
            "Erreiche den Waldpass",
        },

        description: {
          pl:
            "Opuść Klasztor i sprawdź pierwsze ślady.",

          en:
            "Leave the Monastery and investigate the first tracks.",

          de:
            "Verlasse das Kloster und untersuche die ersten Spuren.",
        },

        reward: {
          xp: 20,
        },
      },

      {
        id:
          "q-forest-signal-2",

        locationId:
          "forest-pass",

        type:
          "collect",

        title: {
          pl:
            "Zabezpiecz ślad",

          en:
            "Secure the Evidence",

          de:
            "Sichere die Spur",
        },

        description: {
          pl:
            "Zbadaj znaleziony fragment materiału Bear Army.",

          en:
            "Investigate the Bear Army cloth fragment.",

          de:
            "Untersuche das Stofffragment der Bear Army.",
        },

        reward: {
          intel: 1,
          xp: 20,
        },
      },

      {
        id:
          "q-forest-signal-3",

        locationId:
          "monastery",

        type:
          "return",

        title: {
          pl:
            "Wróć do Bociana",

          en:
            "Return to Stork",

          de:
            "Kehre zum Storch zurück",
        },

        description: {
          pl:
            "Przekaż Bocianowi informacje.",

          en:
            "Report your findings to Stork.",

          de:
            "Berichte dem Storch von deinen Erkenntnissen.",
        },

        reward: {
          bocianXp: 20,
          xp: 25,
        },
      },
    ],

    reward: {
      memeEnergy: 30,

      intel: 1,
    },
  },

  /* =======================================================
     Q2
  ======================================================= */

  {
    id:
      "q-mist-lake",

    region: 1,

    title: {
      pl:
        "Ślad prowadzi do jeziora",

      en:
        "The Trail Leads to the Lake",

      de:
        "Die Spur führt zum See",
    },

    description: {
      pl:
        "Wskazówki z Leśnej Przełęczy prowadzą w stronę Jeziora Mgły.",

      en:
        "The clues from Forest Pass lead toward Mist Lake.",

      de:
        "Die Hinweise vom Waldpass führen zum Nebelsee.",
    },

    steps: [
      {
        id:
          "q-mist-lake-1",

        locationId:
          "mist-lake",

        type:
          "explore",

        title: {
          pl:
            "Zbadaj Jezioro Mgły",

          en:
            "Explore Mist Lake",

          de:
            "Erkunde den Nebelsee",
        },

        description: {
          pl:
            "Przeszukaj brzeg i okolice jeziora.",

          en:
            "Search the shore and surrounding area.",

          de:
            "Durchsuche das Ufer und die Umgebung.",
        },

        reward: {
          xp: 25,
        },
      },

      {
        id:
          "q-mist-lake-2",

        locationId:
          "mist-lake",

        type:
          "collect",

        title: {
          pl:
            "Znajdź zatopioną skrzynię",

          en:
            "Find the Sunken Chest",

          de:
            "Finde die versunkene Truhe",
        },

        description: {
          pl:
            "Coś błyszczy pod powierzchnią wody.",

          en:
            "Something shines beneath the water.",

          de:
            "Etwas glänzt unter der Wasseroberfläche.",
        },

        reward: {
          relics: 1,

          memeEnergy: 20,
        },
      },
    ],

    reward: {
      xp: 30,
    },
  },

  /* =======================================================
     Q3
  ======================================================= */

  {
    id:
      "q-rescue-scout",

    region: 1,

    title: {
      pl:
        "Zaginiony Zwiadowca",

      en:
        "The Missing Scout",

      de:
        "Der vermisste Späher",
    },

    description: {
      pl:
        "Bocian stracił kontakt z jednym ze zwiadowców. Ostatnio widziano go w Lesie Mgły.",

      en:
        "Stork lost contact with one of the scouts. He was last seen in Mist Forest.",

      de:
        "Der Storch hat den Kontakt zu einem Späher verloren. Zuletzt wurde er im Nebelwald gesehen.",
    },

    steps: [
      {
        id:
          "q-rescue-scout-1",

        locationId:
          "mist-forest",

        type:
          "explore",

        title: {
          pl:
            "Przeszukaj Las Mgły",

          en:
            "Search Mist Forest",

          de:
            "Durchsuche den Nebelwald",
        },

        description: {
          pl:
            "Szukaj śladów zaginionego zwiadowcy.",

          en:
            "Search for signs of the missing scout.",

          de:
            "Suche nach Spuren des vermissten Spähers.",
        },
      },

      {
        id:
          "q-rescue-scout-2",

        locationId:
          "mist-forest",

        type:
          "rescue",

        title: {
          pl:
            "Uratuj Zwiadowcę",

          en:
            "Rescue the Scout",

          de:
            "Rette den Späher",
        },

        description: {
          pl:
            "Ranny zwiadowca ukrywa się przed patrolem.",

          en:
            "The wounded scout is hiding from a patrol.",

          de:
            "Der verletzte Späher versteckt sich vor einer Patrouille.",
        },

        reward: {
          intel: 1,

          xp: 40,
        },
      },

      {
        id:
          "q-rescue-scout-3",

        locationId:
          "monastery",

        type:
          "return",

        title: {
          pl:
            "Odprowadź Zwiadowcę",

          en:
            "Escort the Scout Home",

          de:
            "Bringe den Späher zurück",
        },

        description: {
          pl:
            "Wróć z nim bezpiecznie do Klasztoru.",

          en:
            "Return safely to the Monastery.",

          de:
            "Kehre sicher zum Kloster zurück.",
        },

        reward: {
          bocianXp: 30,
        },
      },
    ],

    reward: {
      xp: 60,

      memeEnergy: 40,
    },
  },

  /* =======================================================
     Q4
  ======================================================= */

  {
    id:
      "q-old-bridge",

    region: 1,

    title: {
      pl:
        "Przeprawa",

      en:
        "The Crossing",

      de:
        "Die Überquerung",
    },

    description: {
      pl:
        "Droga prowadzi przez uszkodzony Stary Most.",

      en:
        "The route continues across the damaged Old Bridge.",

      de:
        "Der Weg führt über die beschädigte Alte Brücke.",
    },

    steps: [
      {
        id:
          "q-old-bridge-1",

        locationId:
          "old-bridge",

        type:
          "choice",

        title: {
          pl:
            "Wybierz drogę",

          en:
            "Choose a Route",

          de:
            "Wähle einen Weg",
        },

        description: {
          pl:
            "Możesz przejść po uszkodzonym moście albo poszukać dłuższego objazdu.",

          en:
            "Cross the damaged bridge or search for a longer route around it.",

          de:
            "Überquere die beschädigte Brücke oder suche einen längeren Umweg.",
        },
      },

      {
        id:
          "q-old-bridge-2",

        locationId:
          "old-bridge",

        type:
          "battle",

        title: {
          pl:
            "Zasadzka",

          en:
            "Ambush",

          de:
            "Hinterhalt",
        },

        description: {
          pl:
            "Patrol Bear Army wykorzystał przeprawę jako miejsce zasadzki.",

          en:
            "A Bear Army patrol uses the crossing as an ambush point.",

          de:
            "Eine Patrouille der Bear Army nutzt die Überquerung für einen Hinterhalt.",
        },

        reward: {
          xp: 45,

          bearFragments: 1,
        },
      },
    ],

    reward: {
      memeEnergy: 30,
    },
  },

  /* =======================================================
     Q5
  ======================================================= */

  {
    id:
      "q-stone-circle",

    region: 1,

    title: {
      pl:
        "Znaki w kamieniu",

      en:
        "Signs in Stone",

      de:
        "Zeichen im Stein",
    },

    description: {
      pl:
        "Kamienny Krąg zawiera symbole, które PolishPepe rozpoznaje z przebłysków pamięci.",

      en:
        "The Stone Circle contains symbols PolishPepe recognizes from flashes of memory.",

      de:
        "Der Steinkreis enthält Symbole, die PolishPepe aus seinen Erinnerungsblitzen kennt.",
    },

    steps: [
      {
        id:
          "q-stone-circle-1",

        locationId:
          "stone-circle",

        type:
          "explore",

        title: {
          pl:
            "Zbadaj symbole",

          en:
            "Study the Symbols",

          de:
            "Untersuche die Symbole",
        },

        description: {
          pl:
            "Przyjrzyj się centralnemu kamieniowi.",

          en:
            "Inspect the central stone.",

          de:
            "Untersuche den zentralen Stein.",
        },
      },

      {
        id:
          "q-stone-circle-2",

        locationId:
          "stone-circle",

        type:
          "collect",

        title: {
          pl:
            "Odkryj fragment komiksu",

          en:
            "Discover the Comic Fragment",

          de:
            "Entdecke das Comicfragment",
        },

        description: {
          pl:
            "Symbol jest powiązany z ukrytą wiedzą PLPE.",

          en:
            "The symbol is connected to hidden PLPE knowledge.",

          de:
            "Das Symbol ist mit verborgenem PLPE-Wissen verbunden.",
        },

        reward: {
          comicFragments: 1,

          intel: 1,

          xp: 50,
        },
      },
    ],

    reward: {
      relics: 1,
    },
  },

  /* =======================================================
     Q6
  ======================================================= */

  {
    id:
      "q-watchtower",

    region: 1,

    title: {
      pl:
        "Oczy Niedźwiedzia",

      en:
        "Eyes of the Bear",

      de:
        "Die Augen des Bären",
    },

    description: {
      pl:
        "Ruiny Strażnicy zostały zajęte przez Bear Army.",

      en:
        "The Watchtower Ruins have been occupied by the Bear Army.",

      de:
        "Die Ruinen des Wachturms wurden von der Bear Army besetzt.",
    },

    steps: [
      {
        id:
          "q-watchtower-1",

        locationId:
          "watchtower",

        type:
          "battle",

        title: {
          pl:
            "Oczyść Strażnicę",

          en:
            "Clear the Watchtower",

          de:
            "Säubere den Wachturm",
        },

        description: {
          pl:
            "Pokonaj patrol obserwujący Klasztor.",

          en:
            "Defeat the patrol watching the Monastery.",

          de:
            "Besiege die Patrouille, die das Kloster beobachtet.",
        },

        reward: {
          xp: 70,

          bearFragments: 2,
        },
      },

      {
        id:
          "q-watchtower-2",

        locationId:
          "watchtower",

        type:
          "collect",

        title: {
          pl:
            "Zdobądź rozkazy",

          en:
            "Recover the Orders",

          de:
            "Beschaffe die Befehle",
        },

        description: {
          pl:
            "Przeszukaj posterunek Bear Army.",

          en:
            "Search the Bear Army observation post.",

          de:
            "Durchsuche den Beobachtungsposten der Bear Army.",
        },

        reward: {
          intel: 1,
        },
      },
    ],

    reward: {
      memeEnergy: 40,

      bocianXp: 20,
    },
  },

  /* =======================================================
     Q7
  ======================================================= */

  {
    id:
      "q-abandoned-village",

    region: 1,

    title: {
      pl:
        "Cisza w Osadzie",

      en:
        "Silence in the Village",

      de:
        "Stille im Dorf",
    },

    description: {
      pl:
        "Opuszczona Osada nie jest tak pusta, jak wygląda.",

      en:
        "The Abandoned Village is not as empty as it appears.",

      de:
        "Das verlassene Dorf ist nicht so leer, wie es scheint.",
    },

    steps: [
      {
        id:
          "q-abandoned-village-1",

        locationId:
          "abandoned-village",

        type:
          "explore",

        title: {
          pl:
            "Przeszukaj domy",

          en:
            "Search the Houses",

          de:
            "Durchsuche die Häuser",
        },

        description: {
          pl:
            "Sprawdź, co wydarzyło się w osadzie.",

          en:
            "Discover what happened to the settlement.",

          de:
            "Finde heraus, was mit der Siedlung geschehen ist.",
        },
      },

      {
        id:
          "q-abandoned-village-2",

        locationId:
          "abandoned-village",

        type:
          "rescue",

        title: {
          pl:
            "Uwolnij więźnia",

          en:
            "Free the Prisoner",

          de:
            "Befreie den Gefangenen",
        },

        description: {
          pl:
            "Ktoś został zamknięty w piwnicy.",

          en:
            "Someone has been locked inside a cellar.",

          de:
            "Jemand wurde in einem Keller eingeschlossen.",
        },

        reward: {
          xp: 50,

          intel: 1,
        },
      },
    ],

    reward: {
      relics: 1,

      memeEnergy: 30,
    },
  },

  /* =======================================================
     Q8
  ======================================================= */

  {
    id:
      "q-bear-camp",

    region: 1,

    title: {
      pl:
        "Obóz Bear Army",

      en:
        "Bear Army Camp",

      de:
        "Lager der Bear Army",
    },

    description: {
      pl:
        "Zwiadowca wskazał główny obóz patrolowy Bear Army.",

      en:
        "The rescued scout revealed the main Bear Army patrol camp.",

      de:
        "Der gerettete Späher hat das Hauptlager der Bear Army entdeckt.",
    },

    steps: [
      {
        id:
          "q-bear-camp-1",

        locationId:
          "bear-camp",

        type:
          "battle",

        title: {
          pl:
            "Przełam obronę",

          en:
            "Break the Defense",

          de:
            "Durchbrich die Verteidigung",
        },

        description: {
          pl:
            "Pokonaj zewnętrzny patrol.",

          en:
            "Defeat the outer patrol.",

          de:
            "Besiege die äußere Patrouille.",
        },

        reward: {
          xp: 60,

          bearFragments: 2,
        },
      },

      {
        id:
          "q-bear-camp-2",

        locationId:
          "bear-camp",

        type:
          "elite",

        title: {
          pl:
            "Dowódca Patrolu",

          en:
            "Patrol Commander",

          de:
            "Patrouillenkommandant",
        },

        description: {
          pl:
            "Pokonaj elitarną jednostkę dowodzącą obozem.",

          en:
            "Defeat the elite unit commanding the camp.",

          de:
            "Besiege die Eliteeinheit, die das Lager führt.",
        },

        reward: {
          xp: 100,

          bearFragments: 4,

          cardFragments: 1,
        },
      },

      {
        id:
          "q-bear-camp-3",

        locationId:
          "bear-camp",

        type:
          "collect",

        title: {
          pl:
            "Zdobądź mapę",

          en:
            "Recover the Map",

          de:
            "Beschaffe die Karte",
        },

        description: {
          pl:
            "Znajdź mapę prowadzącą do Ciemnej Doliny.",

          en:
            "Find the map leading toward Dark Valley.",

          de:
            "Finde die Karte, die zum Dunklen Tal führt.",
        },

        reward: {
          intel: 2,
        },
      },
    ],

    reward: {
      memeEnergy: 60,

      relics: 1,

      bocianXp: 30,
    },
  },

  /* =======================================================
     Q9
  ======================================================= */

  {
    id:
      "q-dark-gate",

    region: 2,

    title: {
      pl:
        "Brama Ciemnej Doliny",

      en:
        "Gate of Dark Valley",

      de:
        "Tor zum Dunklen Tal",
    },

    description: {
      pl:
        "Do wejścia na terytorium Niedźwiedzi potrzebujesz odpowiedniej wiedzy i przygotowania.",

      en:
        "Entering Bear territory requires intelligence and preparation.",

      de:
        "Für den Eintritt in das Gebiet der Bären sind Informationen und Vorbereitung nötig.",
    },

    steps: [
      {
        id:
          "q-dark-gate-1",

        locationId:
          "dark-gate",

        type:
          "story",

        title: {
          pl:
            "Przygotuj wejście",

          en:
            "Prepare the Entry",

          de:
            "Bereite den Eintritt vor",
        },

        description: {
          pl:
            "Musisz posiadać 3 Intel, 1 Comic Fragment i uratowanego Zwiadowcę.",

          en:
            "You need 3 Intel, 1 Comic Fragment, and the rescued Scout.",

          de:
            "Du benötigst 3 Intel, 1 Comicfragment und den geretteten Späher.",
        },

        requirement: {
          intel: 3,

          comicFragments: 1,

          rescuedNPCs: [
            "monastery-scout",
          ],
        },
      },
    ],

    reward: {
      xp: 80,
    },
  },

  /* =======================================================
     Q10
  ======================================================= */

  {
    id:
      "q-dark-valley",

    region: 2,

    title: {
      pl:
        "Ciemna Dolina",

      en:
        "Dark Valley",

      de:
        "Dunkles Tal",
    },

    description: {
      pl:
        "Pierwszy duży finał ekspedycji.",

      en:
        "The first major expedition finale.",

      de:
        "Das erste große Finale der Expedition.",
    },

    steps: [
      {
        id:
          "q-dark-valley-1",

        locationId:
          "dark-valley",

        type:
          "battle",

        title: {
          pl:
            "Patrol Doliny",

          en:
            "Valley Patrol",

          de:
            "Talpatrouille",
        },

        description: {
          pl:
            "Pokonaj pierwszą linię obrony.",

          en:
            "Defeat the first defensive line.",

          de:
            "Besiege die erste Verteidigungslinie.",
        },
      },

      {
        id:
          "q-dark-valley-2",

        locationId:
          "dark-valley",

        type:
          "elite",

        title: {
          pl:
            "Strażnik Doliny",

          en:
            "Valley Guardian",

          de:
            "Wächter des Tals",
        },

        description: {
          pl:
            "Pokonaj elitarną jednostkę pilnującą wejścia do twierdzy.",

          en:
            "Defeat the elite unit guarding the fortress approach.",

          de:
            "Besiege die Eliteeinheit vor der Festung.",
        },
      },

      {
        id:
          "q-dark-valley-3",

        locationId:
          "dark-valley",

        type:
          "boss",

        title: {
          pl:
            "Dowódca Niedźwiedzi",

          en:
            "Bear Commander",

          de:
            "Bärenkommandant",
        },

        description: {
          pl:
            "Pokonaj dowódcę odpowiedzialnego za działania przeciw Klasztorowi.",

          en:
            "Defeat the commander responsible for operations against the Monastery.",

          de:
            "Besiege den Kommandanten, der für die Angriffe auf das Kloster verantwortlich ist.",
        },

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

    reward: {
      bocianXp: 100,

      comicFragments: 1,
    },
  },
];

/* =========================================================
   RANDOM / REPEATABLE ENCOUNTERS
========================================================= */

export const WORLD_RANDOM_ENCOUNTERS: RandomEncounter[] = [
  {
    id:
      "forest-bear-patrol",

    locationId:
      "forest-pass",

    title: {
      pl:
        "Patrol Bear Army",

      en:
        "Bear Army Patrol",

      de:
        "Patrouille der Bear Army",
    },

    description: {
      pl:
        "Mały patrol pojawił się na górskim szlaku.",

      en:
        "A small patrol appeared on the mountain trail.",

      de:
        "Eine kleine Patrouille ist auf dem Bergweg aufgetaucht.",
    },

    type:
      "patrol",

    chance:
      0.35,

    cooldownHours:
      3,

    reward: {
      xp: 20,

      bearFragments: 1,
    },
  },

  {
    id:
      "mist-lake-daily",

    locationId:
      "mist-lake",

    title: {
      pl:
        "Poszukiwanie przy brzegu",

      en:
        "Search the Shore",

      de:
        "Durchsuche das Ufer",
    },

    description: {
      pl:
        "Raz dziennie możesz przeszukać okolice jeziora.",

      en:
        "Once per day you may search the lake shore.",

      de:
        "Einmal täglich kannst du das Seeufer durchsuchen.",
    },

    type:
      "resource",

    chance:
      1,

    cooldownHours:
      24,

    reward: {
      memeEnergy: 15,

      relics: 1,
    },
  },

  {
    id:
      "mist-forest-patrol",

    locationId:
      "mist-forest",

    title: {
      pl:
        "Patrol we mgle",

      en:
        "Patrol in the Mist",

      de:
        "Patrouille im Nebel",
    },

    description: {
      pl:
        "We mgle porusza się oddział Bear Army.",

      en:
        "A Bear Army unit moves through the mist.",

      de:
        "Eine Einheit der Bear Army bewegt sich durch den Nebel.",
    },

    type:
      "ambush",

    chance:
      0.4,

    cooldownHours:
      4,

    reward: {
      xp: 30,

      bearFragments: 1,
    },
  },

  {
    id:
      "old-bridge-cache",

    locationId:
      "old-bridge",

    title: {
      pl:
        "Nowe zapasy",

      en:
        "New Supplies",

      de:
        "Neue Vorräte",
    },

    description: {
      pl:
        "Podróżnicy czasem zostawiają zapasy przy przeprawie.",

      en:
        "Travellers sometimes leave supplies near the crossing.",

      de:
        "Reisende lassen manchmal Vorräte an der Überquerung zurück.",
    },

    type:
      "cache",

    chance:
      0.3,

    cooldownHours:
      6,

    reward: {
      memeEnergy: 20,
    },
  },

  {
    id:
      "watchtower-repeat",

    locationId:
      "watchtower",

    title: {
      pl:
        "Nowy patrol Strażnicy",

      en:
        "New Watchtower Patrol",

      de:
        "Neue Wachturmpatrouille",
    },

    description: {
      pl:
        "Bear Army ponownie próbuje wykorzystać Strażnicę.",

      en:
        "The Bear Army is attempting to occupy the Watchtower again.",

      de:
        "Die Bear Army versucht erneut, den Wachturm zu besetzen.",
    },

    type:
      "patrol",

    chance:
      1,

    cooldownHours:
      3,

    reward: {
      xp: 45,

      memeEnergy: 15,

      bearFragments: 2,
    },
  },

  {
    id:
      "village-traveller",

    locationId:
      "abandoned-village",

    title: {
      pl:
        "Wędrowny handlarz",

      en:
        "Travelling Merchant",

      de:
        "Wandernder Händler",
    },

    description: {
      pl:
        "Czasem przez osadę przechodzi samotny handlarz.",

      en:
        "A lone merchant occasionally passes through the village.",

      de:
        "Gelegentlich zieht ein einsamer Händler durch das Dorf.",
    },

    type:
      "traveller",

    chance:
      0.25,

    cooldownHours:
      6,
  },

  {
    id:
      "bear-camp-repeat",

    locationId:
      "bear-camp",

    title: {
      pl:
        "Odbudowany patrol",

      en:
        "Reinforced Patrol",

      de:
        "Verstärkte Patrouille",
    },

    description: {
      pl:
        "Po kilku godzinach do obozu docierają nowe jednostki.",

      en:
        "After several hours new units arrive at the camp.",

      de:
        "Nach einigen Stunden treffen neue Einheiten im Lager ein.",
    },

    type:
      "elite",

    chance:
      1,

    cooldownHours:
      4,

    reward: {
      xp: 70,

      bearFragments: 3,

      cardFragments: 1,
    },
  },

  {
    id:
      "dark-valley-repeat",

    locationId:
      "dark-valley",

    title: {
      pl:
        "Ekspedycja do Doliny",

      en:
        "Valley Expedition",

      de:
        "Talexpedition",
    },

    description: {
      pl:
        "Po pokonaniu bossa można wracać po rzadsze zasoby.",

      en:
        "After defeating the boss, you can return for rarer resources.",

      de:
        "Nach dem Sieg über den Boss kannst du für seltenere Ressourcen zurückkehren.",
    },

    type:
      "elite",

    chance:
      1,

    cooldownHours:
      6,

    reward: {
      xp: 90,

      memeEnergy: 30,

      relics: 1,

      bearFragments: 3,
    },
  },
];