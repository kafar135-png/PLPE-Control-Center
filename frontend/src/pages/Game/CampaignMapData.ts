/** Pełna kampania: 35 punktów z rysunku, 105 etapów, jedna trasa bez rozgałęzień. */
import type { GameReward, ResourceCost } from "./Progress";
export type CampaignPuzzleKind = "compare" | "memory" | "sequence" | "lights" | "timing" | "slide";
export type CampaignTaskKind = CampaignPuzzleKind | "battle";
export interface CampaignTask { id: string; kind: CampaignTaskKind; title: string; }
export interface CampaignMission {
  id: string; order: number; act: number; title: string; shortTitle: string; locationId: string;
  x: number; y: number; briefing: string; outcome: string; tasks: CampaignTask[];
  enemyGroupId: string; enemyLevel: number; reward: GameReward;
  discoveryId?: string; rescuedNpcId?: string;
}
export const CAMPAIGN_VERSION = 10;
export const BASE_POSITION = { x: 15.5, y: 50 };
export const TOWER_COST: ResourceCost = { memeEnergy: 60, relics: 1, crowns: 40 };
export const GUARD_COST: ResourceCost = { memeEnergy: 15, crowns: 35 };
export const TOWER_UPGRADE_COST: ResourceCost = { memeEnergy: 80, relics: 2, crowns: 75 };
export const CAMPAIGN_ACTS = [
  {
    "id": 1,
    "title": "Pierwszy ślad",
    "subtitle": "Zaginiony ładunek",
    "introduction": "Fragment mapy z rozbitego balonu prowadzi poza mury. Bocian rozpoznaje znaki dawnej sieci strażnic. Aby odzyskać pamięć, Pepe musi odzyskać jej kolejne punkty."
  },
  {
    "id": 2,
    "title": "Ponad chmurami",
    "subtitle": "Ślady ostatniego lotu",
    "introduction": "Na grani pozostała stacja balonowa. Jej dziennik ujawni, dokąd leciał Pepe. Harpie i uszkodzone mechanizmy odcinają dojście."
  },
  {
    "id": 3,
    "title": "Pod korzeniami",
    "subtitle": "Energia dawnych wież",
    "introduction": "Myśliwy wskazuje kopalnię, z której klan wywozi relikty. Przywrócenie jej mechanizmów otworzy drogę ku starej Strażnicy."
  },
  {
    "id": 4,
    "title": "Złamana przysięga",
    "subtitle": "Strażnicy i kurierzy",
    "introduction": "W zapiskach Strażnicy ukryto sposób otwarcia Kamiennego Kręgu. Odzyskanie meldunków przerwie pierwszą linię zaopatrzenia wroga."
  },
  {
    "id": 5,
    "title": "Głos wybrzeża",
    "subtitle": "Ładunek z zatopionych statków",
    "introduction": "Na wybrzeżu zachowały się imiona dawnych opiekunów doliny. Trzeba uruchomić latarnię i odzyskać pieczęć z groty."
  },
  {
    "id": 6,
    "title": "Front niedźwiedzi",
    "subtitle": "Przeciąć dostawy",
    "introduction": "Od tej chwili klan broni własnych wież. Zwycięstwo oczyszcza punkt, ale dopiero Twoja wieża i jej załoga pozwolą utrzymać teren."
  },
  {
    "id": 7,
    "title": "Ciemna Dolina",
    "subtitle": "Trzy pieczęcie",
    "introduction": "Dziennik lotu, pieczęć kopalni i znak wybrzeża prowadzą pod ostatnią bramę. Odbierz kuźnię, ucisz strażnicę i zamknij źródło wojny."
  }
];

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    "id": "route-01",
    "order": 1,
    "act": 1,
    "title": "Leśna Przełęcz",
    "shortTitle": "Leśna Przełęcz",
    "locationId": "forest-pass",
    "x": 26,
    "y": 48,
    "briefing": "Pod mostem leży kawałek czerwonej tkaniny. Na nim wyhaftowano dwa niemal identyczne rozkazy. Jeden jest fałszywy.",
    "outcome": "Prawdziwy rozkaz wskazuje Sosnową Polanę. Bocian zaznacza miejsce pod pierwszą wieżę.",
    "tasks": [
      {
        "id": "route-01-1",
        "kind": "compare",
        "title": "Rozpoznaj fałszywy rozkaz"
      },
      {
        "id": "route-01-2",
        "kind": "sequence",
        "title": "Odtwórz znak kuriera"
      },
      {
        "id": "route-01-3",
        "kind": "battle",
        "title": "Odpędź patrol od mostu"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 1,
    "reward": {
      "xp": 80,
      "bocianXp": 45,
      "memeEnergy": 110,
      "relics": 2,
      "crowns": 105,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    },
    "discoveryId": "bocian-note"
  },
  {
    "id": "route-02",
    "order": 2,
    "act": 1,
    "title": "Sosnowa Polana",
    "shortTitle": "Sosnowa Polana",
    "locationId": "pine-clearing",
    "x": 32.6,
    "y": 44.3,
    "briefing": "Kurier zostawił skrytkę w kręgu drzew. Jej zamek reaguje na kolejność wyrytych znaków, a zasuwę trzeba zatrzymać w dobrym momencie.",
    "outcome": "W skrzynce znajduje się mokry dziennik. Jego kartki pachną wodą Jeziora Mgły.",
    "tasks": [
      {
        "id": "route-02-1",
        "kind": "memory",
        "title": "Połącz znaki na korze"
      },
      {
        "id": "route-02-2",
        "kind": "timing",
        "title": "Zatrzymaj zasuwę skrytki"
      },
      {
        "id": "route-02-3",
        "kind": "lights",
        "title": "Rozświetl pieczęć skrytki"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 1,
    "reward": {
      "xp": 80,
      "bocianXp": 45,
      "memeEnergy": 110,
      "relics": 2,
      "crowns": 105,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-03",
    "order": 3,
    "act": 1,
    "title": "Jezioro Mgły",
    "shortTitle": "Jezioro Mgły",
    "locationId": "mist-lake",
    "x": 29.3,
    "y": 31,
    "briefing": "Dziennik urywa się przy wzmiance o ładunku wrzuconym do jeziora. Pod pomostem widać ogniwa starego mechanizmu.",
    "outcome": "Odzyskany fragment mapy pokazuje drogę na Orlą Półkę. Węże pilnowały tego samego ładunku.",
    "tasks": [
      {
        "id": "route-03-1",
        "kind": "slide",
        "title": "Złóż fragment mapy jeziora"
      },
      {
        "id": "route-03-2",
        "kind": "timing",
        "title": "Wyciągnij zatopiony ładunek"
      },
      {
        "id": "route-03-3",
        "kind": "battle",
        "title": "Pokonaj strażników wody"
      }
    ],
    "enemyGroupId": "serpent-pack",
    "enemyLevel": 1,
    "reward": {
      "xp": 80,
      "bocianXp": 45,
      "memeEnergy": 110,
      "relics": 2,
      "crowns": 105,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-04",
    "order": 4,
    "act": 1,
    "title": "Orla Półka",
    "shortTitle": "Orla Półka",
    "locationId": "eagle-ledge",
    "x": 22.6,
    "y": 25,
    "briefing": "Dwie kamienne tablice pokazują drogę na szczyt. Wiatr starł z jednej z nich znaki. Porównaj pozostałe ślady i uruchom sygnalizator.",
    "outcome": "Sygnalizator odpowiada światłem z północnego gniazda. Ktoś korzystał z tej drogi po katastrofie balonu.",
    "tasks": [
      {
        "id": "route-04-1",
        "kind": "compare",
        "title": "Porównaj tablice szlaku"
      },
      {
        "id": "route-04-2",
        "kind": "lights",
        "title": "Uruchom sygnalizator"
      },
      {
        "id": "route-04-3",
        "kind": "battle",
        "title": "Przepędź harpie z półki"
      }
    ],
    "enemyGroupId": "harpy-flock",
    "enemyLevel": 1,
    "reward": {
      "xp": 80,
      "bocianXp": 45,
      "memeEnergy": 110,
      "relics": 2,
      "crowns": 105,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-05",
    "order": 5,
    "act": 1,
    "title": "Gniazda Wichru",
    "shortTitle": "Gniazda Wichru",
    "locationId": "north-ridge",
    "x": 21.2,
    "y": 9.6,
    "briefing": "W gniazdach leżą skradzione części balonu. Nie wystarczy sięgnąć po nie: trzeba odwrócić uwagę stada i odzyskać skrzynkę lotnika.",
    "outcome": "W skrzynce jest klucz do stacji balonowej. Prowadzi do niej Kamienny Szlak.",
    "tasks": [
      {
        "id": "route-05-1",
        "kind": "sequence",
        "title": "Powtórz gwizd przewodnika"
      },
      {
        "id": "route-05-2",
        "kind": "memory",
        "title": "Dobierz części uprzęży"
      },
      {
        "id": "route-05-3",
        "kind": "battle",
        "title": "Oczyść gniazda harpii"
      }
    ],
    "enemyGroupId": "harpy-flock",
    "enemyLevel": 1,
    "reward": {
      "xp": 80,
      "bocianXp": 45,
      "memeEnergy": 110,
      "relics": 3,
      "crowns": 105,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 1
    }
  },
  {
    "id": "route-06",
    "order": 6,
    "act": 2,
    "title": "Kamienny Szlak",
    "shortTitle": "Kamienny Szlak",
    "locationId": "mountain-pass",
    "x": 29.6,
    "y": 10.2,
    "briefing": "Mostki nad rozpadliną trzymają się na ruchomych podporach. Bocian odczytuje rytm mechanizmu, a Pepe musi odtworzyć układ.",
    "outcome": "Ostatnia podpora opada na miejsce. Po drugiej stronie stoi opuszczona stacja balonowa.",
    "tasks": [
      {
        "id": "route-06-1",
        "kind": "timing",
        "title": "Ustaw ruchome podpory"
      },
      {
        "id": "route-06-2",
        "kind": "slide",
        "title": "Odtwórz plan przejścia"
      },
      {
        "id": "route-06-3",
        "kind": "lights",
        "title": "Przywróć zasilanie mostków"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 1,
    "reward": {
      "xp": 100,
      "bocianXp": 55,
      "memeEnergy": 120,
      "relics": 2,
      "crowns": 120,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-07",
    "order": 7,
    "act": 2,
    "title": "Stacja Balonowa",
    "shortTitle": "Stacja Balonowa",
    "locationId": "ridge-station",
    "x": 41,
    "y": 5.7,
    "briefing": "Dawny dziennik lotów ma wyrwane strony. Na ocalałych tablicach zapisano sygnały z dnia katastrofy.",
    "outcome": "Pepe odczytuje numer własnego balonu. Ładunek przeładowano przy jaskini za wodospadem.",
    "tasks": [
      {
        "id": "route-07-1",
        "kind": "compare",
        "title": "Odszukaj numer balonu"
      },
      {
        "id": "route-07-2",
        "kind": "sequence",
        "title": "Odtwórz ostatni sygnał"
      },
      {
        "id": "route-07-3",
        "kind": "lights",
        "title": "Otwórz archiwum stacji"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 2,
    "reward": {
      "xp": 100,
      "bocianXp": 55,
      "memeEnergy": 120,
      "relics": 2,
      "crowns": 120,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-08",
    "order": 8,
    "act": 2,
    "title": "Jaskinia Wodospadu",
    "shortTitle": "Jaskinia Wodospadu",
    "locationId": "hidden-cave",
    "x": 43.2,
    "y": 19.2,
    "briefing": "Przejście odsłania się tylko pomiędzy falami wody. Wewnątrz leży relikt zamknięty w kamiennym zamku.",
    "outcome": "Relikt pasuje do rysunku w dzienniku lotów. Druga część ładunku trafiła do przystani.",
    "tasks": [
      {
        "id": "route-08-1",
        "kind": "timing",
        "title": "Przejdź za kurtyną wody"
      },
      {
        "id": "route-08-2",
        "kind": "lights",
        "title": "Otwórz kamienny zamek"
      },
      {
        "id": "route-08-3",
        "kind": "battle",
        "title": "Pokonaj górskie niedźwiedzie"
      }
    ],
    "enemyGroupId": "mountain-bear-family",
    "enemyLevel": 2,
    "reward": {
      "xp": 100,
      "bocianXp": 55,
      "memeEnergy": 120,
      "relics": 2,
      "crowns": 120,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    },
    "discoveryId": "waterfall-relic"
  },
  {
    "id": "route-09",
    "order": 9,
    "act": 2,
    "title": "Zatopiona Przystań",
    "shortTitle": "Zatopiona Przystań",
    "locationId": "waterfall-path",
    "x": 37.1,
    "y": 30,
    "briefing": "Zawalone pomosty skrywają skrzynię przewoźnika. Rozpoznaj właściwe znaki cumowania i ułóż plan bezpiecznego podejścia.",
    "outcome": "Lista pasażerów wymienia myśliwego. To jedyny świadek, który mógł rozpoznać Pepe.",
    "tasks": [
      {
        "id": "route-09-1",
        "kind": "compare",
        "title": "Wskaż prawdziwą cumę"
      },
      {
        "id": "route-09-2",
        "kind": "slide",
        "title": "Odtwórz plan pomostu"
      },
      {
        "id": "route-09-3",
        "kind": "battle",
        "title": "Oczyść wodną przystań"
      }
    ],
    "enemyGroupId": "serpent-pack",
    "enemyLevel": 2,
    "reward": {
      "xp": 100,
      "bocianXp": 55,
      "memeEnergy": 120,
      "relics": 2,
      "crowns": 120,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-10",
    "order": 10,
    "act": 2,
    "title": "Chata Myśliwego",
    "shortTitle": "Chata Myśliwego",
    "locationId": "hunter-hut",
    "x": 40.6,
    "y": 45,
    "briefing": "Myśliwy nie ufa nieznajomym. Poprosi o odtworzenie leśnych znaków, zanim odda szkic ostatniego lotu balonu.",
    "outcome": "Świadek pamięta błysk nad kamieniołomem. Oddaje mapę i ostrzega przed konwojami z kopalni.",
    "tasks": [
      {
        "id": "route-10-1",
        "kind": "memory",
        "title": "Dobierz leśne tropy"
      },
      {
        "id": "route-10-2",
        "kind": "sequence",
        "title": "Powtórz znaki myśliwego"
      },
      {
        "id": "route-10-3",
        "kind": "lights",
        "title": "Otwórz skrytkę świadka"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 2,
    "reward": {
      "xp": 100,
      "bocianXp": 55,
      "memeEnergy": 120,
      "relics": 3,
      "crowns": 120,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 1
    },
    "discoveryId": "hunter-map"
  },
  {
    "id": "route-11",
    "order": 11,
    "act": 3,
    "title": "Stary Kamieniołom",
    "shortTitle": "Kamieniołom",
    "locationId": "old-quarry",
    "x": 40.7,
    "y": 64.7,
    "briefing": "Na dnie wyrobiska niedźwiedzie porzuciły wagony z reliktami. Hamulec nadal pracuje, a płyty sterujące są rozsypane.",
    "outcome": "Plan wagonów pokazuje wejście do kopalni. Klan wykorzystuje relikty do zasilania swoich wież.",
    "tasks": [
      {
        "id": "route-11-1",
        "kind": "timing",
        "title": "Zatrzymaj wagon z reliktami"
      },
      {
        "id": "route-11-2",
        "kind": "slide",
        "title": "Ułóż plan wyrobiska"
      },
      {
        "id": "route-11-3",
        "kind": "battle",
        "title": "Pokonaj ochronę konwoju"
      }
    ],
    "enemyGroupId": "bear-standard-patrol",
    "enemyLevel": 2,
    "reward": {
      "xp": 120,
      "bocianXp": 65,
      "memeEnergy": 130,
      "relics": 2,
      "crowns": 135,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-12",
    "order": 12,
    "act": 3,
    "title": "Wejście do Kopalni",
    "shortTitle": "Wejście Kopalni",
    "locationId": "mine-entrance",
    "x": 48.2,
    "y": 80,
    "briefing": "Brama szybu nie otworzy się bez przywrócenia obiegu energii. Znaki górników określają bezpieczną kolejność dźwigni.",
    "outcome": "Szyb jest drożny. Ze środka dobiega głuchy rytm głównego generatora.",
    "tasks": [
      {
        "id": "route-12-1",
        "kind": "lights",
        "title": "Przywróć obieg energii"
      },
      {
        "id": "route-12-2",
        "kind": "sequence",
        "title": "Ustaw dźwignie górników"
      },
      {
        "id": "route-12-3",
        "kind": "lights",
        "title": "Uruchom windę szybową"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 2,
    "reward": {
      "xp": 120,
      "bocianXp": 65,
      "memeEnergy": 130,
      "relics": 2,
      "crowns": 135,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-13",
    "order": 13,
    "act": 3,
    "title": "Serce Kopalni",
    "shortTitle": "Serce Kopalni",
    "locationId": "deep-mine",
    "x": 53.2,
    "y": 65.3,
    "briefing": "Przy generatorze pracowała ostatnia zmiana górników. Ich znaki ostrzegają przed przeciążeniem. Straż klanu wraca po rdzeń.",
    "outcome": "Rdzeń jest bezpieczny. Na obudowie wyryto znak Leśnej Kaplicy i pierwszą z trzech pieczęci.",
    "tasks": [
      {
        "id": "route-13-1",
        "kind": "compare",
        "title": "Odczytaj ostrzeżenia górników"
      },
      {
        "id": "route-13-2",
        "kind": "timing",
        "title": "Ustabilizuj rdzeń reliktów"
      },
      {
        "id": "route-13-3",
        "kind": "battle",
        "title": "Pokonaj straż kopalni"
      }
    ],
    "enemyGroupId": "bear-heavy-patrol",
    "enemyLevel": 3,
    "reward": {
      "xp": 120,
      "bocianXp": 65,
      "memeEnergy": 130,
      "relics": 2,
      "crowns": 135,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-14",
    "order": 14,
    "act": 3,
    "title": "Leśna Kaplica",
    "shortTitle": "Leśna Kaplica",
    "locationId": "forest-shrine",
    "x": 47.1,
    "y": 52.2,
    "briefing": "W kaplicy składano przysięgę opiekunów doliny. Zniszczona mozaika przedstawia most i ukryte archiwum.",
    "outcome": "Bocian rozpoznaje pierwszą pieczęć. Położenie drugiej zapisano w archiwum Strażnicy.",
    "tasks": [
      {
        "id": "route-14-1",
        "kind": "slide",
        "title": "Złóż mozaikę opiekunów"
      },
      {
        "id": "route-14-2",
        "kind": "memory",
        "title": "Połącz znaki przysięgi"
      },
      {
        "id": "route-14-3",
        "kind": "lights",
        "title": "Ożyw światło kaplicy"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 3,
    "reward": {
      "xp": 120,
      "bocianXp": 65,
      "memeEnergy": 130,
      "relics": 2,
      "crowns": 135,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-15",
    "order": 15,
    "act": 3,
    "title": "Stary Most",
    "shortTitle": "Stary Most",
    "locationId": "old-bridge",
    "x": 48.2,
    "y": 34.4,
    "briefing": "Niedźwiedzie rozłączyły mechanizm zwodzonego mostu. Fałszywe oznaczenia mają skierować podróżnych do rzeki.",
    "outcome": "Most został opuszczony. Na drugim brzegu widać wejście do archiwum Strażnicy.",
    "tasks": [
      {
        "id": "route-15-1",
        "kind": "compare",
        "title": "Wykryj fałszywe oznaczenia"
      },
      {
        "id": "route-15-2",
        "kind": "lights",
        "title": "Połącz mechanizm mostu"
      },
      {
        "id": "route-15-3",
        "kind": "battle",
        "title": "Odbij strażnicę mostową"
      }
    ],
    "enemyGroupId": "bear-standard-patrol",
    "enemyLevel": 3,
    "reward": {
      "xp": 120,
      "bocianXp": 65,
      "memeEnergy": 130,
      "relics": 3,
      "crowns": 135,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 1
    }
  },
  {
    "id": "route-16",
    "order": 16,
    "act": 4,
    "title": "Archiwum Strażnicy",
    "shortTitle": "Archiwum Strażnicy",
    "locationId": "watchtower-cellar",
    "x": 48.6,
    "y": 17.8,
    "briefing": "W podziemiach zachowały się księgi trzech strażnic. Kartki są przemieszane; tylko prawidłowa kolejność wskaże przełęcz.",
    "outcome": "Księga opisuje sygnał uratowanego zwiadowcy. Trzeba szukać go na Północnej Grani.",
    "tasks": [
      {
        "id": "route-16-1",
        "kind": "memory",
        "title": "Dopasuj pieczęcie ksiąg"
      },
      {
        "id": "route-16-2",
        "kind": "sequence",
        "title": "Odczytaj meldunek zwiadowcy"
      },
      {
        "id": "route-16-3",
        "kind": "lights",
        "title": "Otwórz zamkniętą księgę"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 3,
    "reward": {
      "xp": 140,
      "bocianXp": 75,
      "memeEnergy": 140,
      "relics": 2,
      "crowns": 150,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 0
    },
    "discoveryId": "bear-orders"
  },
  {
    "id": "route-17",
    "order": 17,
    "act": 4,
    "title": "Północna Grań",
    "shortTitle": "Północna Grań",
    "locationId": "ridge-lookout",
    "x": 54.1,
    "y": 11,
    "briefing": "Zwiadowca ukrywa się pomiędzy skalnymi iglicami. Sygnały harpii mieszają się z jego wołaniem o pomoc.",
    "outcome": "Zwiadowca dołącza do ocalałych. Zna drogę przez wartownię do rozbitej karawany.",
    "tasks": [
      {
        "id": "route-17-1",
        "kind": "compare",
        "title": "Rozpoznaj sygnał zwiadowcy"
      },
      {
        "id": "route-17-2",
        "kind": "timing",
        "title": "Przeciągnij linę ratunkową"
      },
      {
        "id": "route-17-3",
        "kind": "battle",
        "title": "Pokonaj straż gniazda"
      }
    ],
    "enemyGroupId": "harpy-nest",
    "enemyLevel": 3,
    "reward": {
      "xp": 140,
      "bocianXp": 75,
      "memeEnergy": 140,
      "relics": 2,
      "crowns": 150,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    },
    "discoveryId": "ridge-spyglass",
    "rescuedNpcId": "monastery-scout"
  },
  {
    "id": "route-18",
    "order": 18,
    "act": 4,
    "title": "Wartownia Przełęczy",
    "shortTitle": "Wartownia",
    "locationId": "ridge-guard",
    "x": 57.1,
    "y": 29.8,
    "briefing": "Klan podmienił rozkazy na bramie. Połączenie prawdziwych pieczęci pozwoli otworzyć przejście bez alarmowania całej doliny.",
    "outcome": "Wartownia milczy. Ślady wozów prowadzą w dół ku porzuconej karawanie.",
    "tasks": [
      {
        "id": "route-18-1",
        "kind": "memory",
        "title": "Połącz pieczęcie rozkazów"
      },
      {
        "id": "route-18-2",
        "kind": "sequence",
        "title": "Wyłącz dzwony alarmowe"
      },
      {
        "id": "route-18-3",
        "kind": "battle",
        "title": "Odbij wartownię"
      }
    ],
    "enemyGroupId": "bear-elite",
    "enemyLevel": 3,
    "reward": {
      "xp": 140,
      "bocianXp": 75,
      "memeEnergy": 140,
      "relics": 2,
      "crowns": 150,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-19",
    "order": 19,
    "act": 4,
    "title": "Rozbita Karawana",
    "shortTitle": "Rozbita Karawana",
    "locationId": "broken-cart",
    "x": 60.3,
    "y": 47.4,
    "briefing": "Ocalały kupiec ukrył ładunek pod wozem. Zamek skrzyni nosi ten sam znak, który Pepe widział na swoim balonie.",
    "outcome": "W ładunku leży plan Kamiennego Kręgu. Dziennik kupca opisuje transport trzech pieczęci.",
    "tasks": [
      {
        "id": "route-19-1",
        "kind": "slide",
        "title": "Złóż plan rozbitego wozu"
      },
      {
        "id": "route-19-2",
        "kind": "lights",
        "title": "Odblokuj skrzynię kupca"
      },
      {
        "id": "route-19-3",
        "kind": "battle",
        "title": "Obroń ocalałego kupca"
      }
    ],
    "enemyGroupId": "bear-standard-patrol",
    "enemyLevel": 4,
    "reward": {
      "xp": 140,
      "bocianXp": 75,
      "memeEnergy": 140,
      "relics": 2,
      "crowns": 150,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    },
    "rescuedNpcId": "lost-merchant"
  },
  {
    "id": "route-20",
    "order": 20,
    "act": 4,
    "title": "Kamienny Krąg",
    "shortTitle": "Kamienny Krąg",
    "locationId": "stone-circle",
    "x": 64,
    "y": 63,
    "briefing": "Krąg reaguje na rdzeń kopalni. Ołtarze trzeba uruchomić w kolejności opisanej przez opiekunów, nie przez klan.",
    "outcome": "Krąg odsłania imiona dawnych strażników. Ich groby wskażą drogę ku wybrzeżu.",
    "tasks": [
      {
        "id": "route-20-1",
        "kind": "sequence",
        "title": "Uruchom ołtarze kręgu"
      },
      {
        "id": "route-20-2",
        "kind": "compare",
        "title": "Odróżnij znaki opiekunów"
      },
      {
        "id": "route-20-3",
        "kind": "lights",
        "title": "Połącz krąg z rdzeniem"
      }
    ],
    "enemyGroupId": "bear-scout",
    "enemyLevel": 4,
    "reward": {
      "xp": 140,
      "bocianXp": 75,
      "memeEnergy": 140,
      "relics": 3,
      "crowns": 150,
      "intel": 1,
      "bearFragments": 0,
      "cardFragments": 1,
      "comicFragments": 1
    },
    "discoveryId": "comic-symbol-01"
  },
  {
    "id": "route-21",
    "order": 21,
    "act": 5,
    "title": "Stare Cmentarzysko",
    "shortTitle": "Cmentarzysko",
    "locationId": "graveyard",
    "x": 69,
    "y": 76,
    "briefing": "Na nagrobkach zatarto imiona, ale zostały symbole. Przyporządkuj je rodzinom opiekunów i odnajdź klucz do portu.",
    "outcome": "Klucz otwiera magazyn portowy. Na wieży klanu pojawia się czerwone światło ostrzegawcze.",
    "tasks": [
      {
        "id": "route-21-1",
        "kind": "memory",
        "title": "Przyporządkuj imiona"
      },
      {
        "id": "route-21-2",
        "kind": "compare",
        "title": "Znajdź znak portowego strażnika"
      },
      {
        "id": "route-21-3",
        "kind": "battle",
        "title": "Pokonaj patrol cmentarza"
      }
    ],
    "enemyGroupId": "bear-elite",
    "enemyLevel": 4,
    "reward": {
      "xp": 160,
      "bocianXp": 85,
      "memeEnergy": 150,
      "relics": 2,
      "crowns": 165,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    },
    "discoveryId": "graveyard-key"
  },
  {
    "id": "route-22",
    "order": 22,
    "act": 5,
    "title": "Opuszczony Port",
    "shortTitle": "Opuszczony Port",
    "locationId": "abandoned-port",
    "x": 77,
    "y": 84.4,
    "briefing": "Dźwig portowy zastygł nad rozbitym statkiem. Jego manifest opisuje ładunek pieczęci, którego nie odebrał żaden kupiec.",
    "outcome": "Manifest potwierdza, że latarnia prowadziła transporty klanu. Trzeba odciąć jej sygnał.",
    "tasks": [
      {
        "id": "route-22-1",
        "kind": "timing",
        "title": "Uruchom dźwig portowy"
      },
      {
        "id": "route-22-2",
        "kind": "slide",
        "title": "Odtwórz manifest statku"
      },
      {
        "id": "route-22-3",
        "kind": "battle",
        "title": "Odbij portowy posterunek"
      }
    ],
    "enemyGroupId": "bear-heavy-patrol",
    "enemyLevel": 4,
    "reward": {
      "xp": 160,
      "bocianXp": 85,
      "memeEnergy": 150,
      "relics": 2,
      "crowns": 165,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-23",
    "order": 23,
    "act": 5,
    "title": "Latarnia Wybrzeża",
    "shortTitle": "Latarnia",
    "locationId": "coastal-beacon",
    "x": 88,
    "y": 89,
    "briefing": "Soczewka latarni wysyła fałszywe sygnały. Pod nią leży księga dawnego latarnika i mapa podwodnej groty.",
    "outcome": "Latarnia znów prowadzi bezpiecznie. W księdze zaznaczono grotę z drugą pieczęcią.",
    "tasks": [
      {
        "id": "route-23-1",
        "kind": "lights",
        "title": "Przestaw soczewki latarni"
      },
      {
        "id": "route-23-2",
        "kind": "sequence",
        "title": "Odtwórz sygnał latarnika"
      },
      {
        "id": "route-23-3",
        "kind": "battle",
        "title": "Odbij wieżę latarni"
      }
    ],
    "enemyGroupId": "bear-elite",
    "enemyLevel": 4,
    "reward": {
      "xp": 160,
      "bocianXp": 85,
      "memeEnergy": 150,
      "relics": 2,
      "crowns": 165,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-24",
    "order": 24,
    "act": 5,
    "title": "Grota Węży",
    "shortTitle": "Grota Węży",
    "locationId": "serpent-grotto",
    "x": 83,
    "y": 75.7,
    "briefing": "Pieczęć leży w komorze zalewanej podczas przypływu. Trzeba porównać znaki na ścianach, a potem zatrzymać śluzę.",
    "outcome": "Druga pieczęć jest odzyskana. Z groty wyprowadzono też skrzynie z oznaczeniem magazynu klanu.",
    "tasks": [
      {
        "id": "route-24-1",
        "kind": "compare",
        "title": "Odczytaj znaki przypływu"
      },
      {
        "id": "route-24-2",
        "kind": "timing",
        "title": "Zamknij zalewającą śluzę"
      },
      {
        "id": "route-24-3",
        "kind": "battle",
        "title": "Pokonaj pradawnego węża"
      }
    ],
    "enemyGroupId": "ancient-serpent-pack",
    "enemyLevel": 4,
    "reward": {
      "xp": 160,
      "bocianXp": 85,
      "memeEnergy": 150,
      "relics": 2,
      "crowns": 165,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-25",
    "order": 25,
    "act": 5,
    "title": "Magazyn Niedźwiedzi",
    "shortTitle": "Magazyn Klanu",
    "locationId": "bear-supply-yard",
    "x": 74.4,
    "y": 59.8,
    "briefing": "Skrzynie z reliktami mają podwójne plomby. Otwórz właściwe zamki i przechwyć harmonogram dostaw do Strażnicy.",
    "outcome": "Dostawy są przerwane. Oddział z zachodniego posterunku nie otrzyma nowych zapasów.",
    "tasks": [
      {
        "id": "route-25-1",
        "kind": "memory",
        "title": "Dopasuj plomby skrzyń"
      },
      {
        "id": "route-25-2",
        "kind": "slide",
        "title": "Odtwórz plan dostaw"
      },
      {
        "id": "route-25-3",
        "kind": "battle",
        "title": "Pokonaj ochronę magazynu"
      }
    ],
    "enemyGroupId": "bear-heavy-patrol",
    "enemyLevel": 5,
    "reward": {
      "xp": 160,
      "bocianXp": 85,
      "memeEnergy": 150,
      "relics": 3,
      "crowns": 165,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 1
    }
  },
  {
    "id": "route-26",
    "order": 26,
    "act": 6,
    "title": "Zachodni Posterunek",
    "shortTitle": "Zachodni Posterunek",
    "locationId": "bear-outpost-west",
    "x": 67.4,
    "y": 43,
    "briefing": "Posterunek osłania dojście do ruin. Dzwony alarmowe są połączone szeregiem przełączników; trzeba je wyłączyć przed szturmem.",
    "outcome": "Posterunek jest oczyszczony. Drużyna może podejść do dziedzińca Strażnicy bez flankującego oddziału.",
    "tasks": [
      {
        "id": "route-26-1",
        "kind": "lights",
        "title": "Przerwij sieć alarmu"
      },
      {
        "id": "route-26-2",
        "kind": "compare",
        "title": "Rozpoznaj drogę patrolu"
      },
      {
        "id": "route-26-3",
        "kind": "battle",
        "title": "Pokonaj załogę posterunku"
      }
    ],
    "enemyGroupId": "bear-elite",
    "enemyLevel": 5,
    "reward": {
      "xp": 180,
      "bocianXp": 95,
      "memeEnergy": 160,
      "relics": 2,
      "crowns": 180,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-27",
    "order": 27,
    "act": 6,
    "title": "Dziedziniec Strażnicy",
    "shortTitle": "Dziedziniec",
    "locationId": "watchtower",
    "x": 62.4,
    "y": 27,
    "briefing": "Na dziedzińcu klan składuje przejęte znaki opiekunów. Odzyskaj je, zanim dowódca zniszczy przejście do wielkiej bramy.",
    "outcome": "Strażnica wraca w ręce opiekunów. W fundamentach zapisano trasę prowadzącą do obozu klanu.",
    "tasks": [
      {
        "id": "route-27-1",
        "kind": "sequence",
        "title": "Ustaw znaki opiekunów"
      },
      {
        "id": "route-27-2",
        "kind": "timing",
        "title": "Zabezpiecz bramę dziedzińca"
      },
      {
        "id": "route-27-3",
        "kind": "battle",
        "title": "Pokonaj dowódcę Strażnicy"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 5,
    "reward": {
      "xp": 180,
      "bocianXp": 95,
      "memeEnergy": 160,
      "relics": 2,
      "crowns": 180,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-28",
    "order": 28,
    "act": 6,
    "title": "Ruiny Wielkiej Bramy",
    "shortTitle": "Wielka Brama",
    "locationId": "great-gate-ruins",
    "x": 64.6,
    "y": 12.5,
    "briefing": "Łuk bramy pękł podczas dawnej wojny. Zestaw kamienne płyty tak, aby pozostały mechanizm odsłonił tajne przejście.",
    "outcome": "Brama odsłania przejście prosto do obozu. Teraz klan nie może ukryć głównego transportu.",
    "tasks": [
      {
        "id": "route-28-1",
        "kind": "slide",
        "title": "Ułóż płyty wielkiej bramy"
      },
      {
        "id": "route-28-2",
        "kind": "memory",
        "title": "Dobierz zamki mechanizmu"
      },
      {
        "id": "route-28-3",
        "kind": "battle",
        "title": "Odbij ruiny bramy"
      }
    ],
    "enemyGroupId": "bear-heavy-patrol",
    "enemyLevel": 5,
    "reward": {
      "xp": 180,
      "bocianXp": 95,
      "memeEnergy": 160,
      "relics": 2,
      "crowns": 180,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-29",
    "order": 29,
    "act": 6,
    "title": "Obóz Niedźwiedzi",
    "shortTitle": "Obóz Niedźwiedzi",
    "locationId": "bear-camp",
    "x": 72.1,
    "y": 25.4,
    "briefing": "Pod głównym namiotem ukryto rozkazy dotyczące katastrofy balonu. Dowódca przygotowuje odwrót przez spaloną osadę.",
    "outcome": "Rozkazy wskazują, że balon przewoził światło pieczęci. Klan chciał wykorzystać je do własnych wież.",
    "tasks": [
      {
        "id": "route-29-1",
        "kind": "compare",
        "title": "Wybierz prawdziwe rozkazy"
      },
      {
        "id": "route-29-2",
        "kind": "sequence",
        "title": "Otwórz sejf dowódcy"
      },
      {
        "id": "route-29-3",
        "kind": "battle",
        "title": "Pokonaj oddział dowodzenia"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 5,
    "reward": {
      "xp": 180,
      "bocianXp": 95,
      "memeEnergy": 160,
      "relics": 2,
      "crowns": 180,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    },
    "discoveryId": "bear-camp-map"
  },
  {
    "id": "route-30",
    "order": 30,
    "act": 6,
    "title": "Spalona Osada",
    "shortTitle": "Spalona Osada",
    "locationId": "burned-village",
    "x": 78.8,
    "y": 43.5,
    "briefing": "Ocalałe piwnice kryją zapiski mieszkańców. Ich symbole pozwolą ominąć zasadzki na drodze do mostu nad lawą.",
    "outcome": "Mieszkańcy ukryli trzeci znak w Popielnej Kuźni. Tylko most nad lawą pozwala do niej dotrzeć.",
    "tasks": [
      {
        "id": "route-30-1",
        "kind": "memory",
        "title": "Połącz zapiski mieszkańców"
      },
      {
        "id": "route-30-2",
        "kind": "lights",
        "title": "Odblokuj piwniczne przejście"
      },
      {
        "id": "route-30-3",
        "kind": "battle",
        "title": "Pokonaj tylną straż klanu"
      }
    ],
    "enemyGroupId": "bear-heavy-patrol",
    "enemyLevel": 5,
    "reward": {
      "xp": 180,
      "bocianXp": 95,
      "memeEnergy": 160,
      "relics": 3,
      "crowns": 180,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 1
    }
  },
  {
    "id": "route-31",
    "order": 31,
    "act": 7,
    "title": "Most Nad Lawą",
    "shortTitle": "Most Nad Lawą",
    "locationId": "lava-bridge",
    "x": 89.5,
    "y": 60,
    "briefing": "Kamienne przęsła poruszają się nad szczeliną. Pełny plan mostu i prawidłowy rytm blokad dają szansę bezpiecznego przejścia.",
    "outcome": "Przejście jest zabezpieczone. Z Popielnej Kuźni dochodzi rytm ostatniego generatora wież klanu.",
    "tasks": [
      {
        "id": "route-31-1",
        "kind": "slide",
        "title": "Ułóż plan przęseł"
      },
      {
        "id": "route-31-2",
        "kind": "timing",
        "title": "Zatrzymaj blokady mostu"
      },
      {
        "id": "route-31-3",
        "kind": "battle",
        "title": "Pokonaj straż lawowego mostu"
      }
    ],
    "enemyGroupId": "bear-elite",
    "enemyLevel": 6,
    "reward": {
      "xp": 200,
      "bocianXp": 105,
      "memeEnergy": 170,
      "relics": 2,
      "crowns": 195,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-32",
    "order": 32,
    "act": 7,
    "title": "Popielna Kuźnia",
    "shortTitle": "Popielna Kuźnia",
    "locationId": "ash-pits",
    "x": 92,
    "y": 42.4,
    "briefing": "W kuźni przetapiają relikty na czerwone rdzenie. Trzeci znak opiekunów tkwi wewnątrz centralnego mechanizmu.",
    "outcome": "Trzecia pieczęć jest odzyskana. Czerwona energia przestaje płynąć ku Czarnej Strażnicy.",
    "tasks": [
      {
        "id": "route-32-1",
        "kind": "lights",
        "title": "Odłącz czerwone rdzenie"
      },
      {
        "id": "route-32-2",
        "kind": "sequence",
        "title": "Wysuń trzecią pieczęć"
      },
      {
        "id": "route-32-3",
        "kind": "battle",
        "title": "Pokonaj mistrza ochrony kuźni"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 6,
    "reward": {
      "xp": 200,
      "bocianXp": 105,
      "memeEnergy": 170,
      "relics": 2,
      "crowns": 195,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-33",
    "order": 33,
    "act": 7,
    "title": "Czarna Strażnica",
    "shortTitle": "Czarna Strażnica",
    "locationId": "dark-watch",
    "x": 85,
    "y": 28,
    "briefing": "Ostatnia strażnica porównuje pieczęcie z fałszywymi kopiami. Usuń podmienione znaki i przerwij jej sygnał bojowy.",
    "outcome": "Strażnica milknie. Wszystkie trzy pieczęcie odpowiadają na światło z Bramy Ciemnej Doliny.",
    "tasks": [
      {
        "id": "route-33-1",
        "kind": "compare",
        "title": "Wykryj fałszywe pieczęcie"
      },
      {
        "id": "route-33-2",
        "kind": "timing",
        "title": "Przerwij ostatni sygnał"
      },
      {
        "id": "route-33-3",
        "kind": "battle",
        "title": "Odbij Czarną Strażnicę"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 6,
    "reward": {
      "xp": 200,
      "bocianXp": 105,
      "memeEnergy": 170,
      "relics": 2,
      "crowns": 195,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 0
    }
  },
  {
    "id": "route-34",
    "order": 34,
    "act": 7,
    "title": "Brama Ciemnej Doliny",
    "shortTitle": "Brama Doliny",
    "locationId": "dark-gate",
    "x": 80.3,
    "y": 10,
    "briefing": "Brama przyjmuje trzy znaki, ale tylko w układzie pokazanym przez dziennik lotu. Klan zbiera ostatnią załogę do obrony.",
    "outcome": "Brama została otwarta. Za nią znajduje się źródło światła zabrane z balonu Pepe.",
    "tasks": [
      {
        "id": "route-34-1",
        "kind": "slide",
        "title": "Złóż trzy pieczęcie"
      },
      {
        "id": "route-34-2",
        "kind": "memory",
        "title": "Połącz znaki ostatniego lotu"
      },
      {
        "id": "route-34-3",
        "kind": "battle",
        "title": "Pokonaj straż bramy"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 6,
    "reward": {
      "xp": 200,
      "bocianXp": 105,
      "memeEnergy": 170,
      "relics": 2,
      "crowns": 195,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 1,
      "comicFragments": 0
    }
  },
  {
    "id": "route-35",
    "order": 35,
    "act": 7,
    "title": "Serce Ciemnej Doliny",
    "shortTitle": "Ciemna Dolina",
    "locationId": "dark-valley",
    "x": 89.1,
    "y": 15.1,
    "briefing": "Pepe rozpoznaje rdzeń z własnego balonu. Trzeba odwrócić jego połączenia i odebrać klanowi kontrolę nad doliną.",
    "outcome": "Źródło wojny zostało wyłączone. Własna wieża zamyka szlak opiekunów. Pepe odzyskuje pierwszy pewny fragment pamięci: nie przybył tutaj przypadkiem.",
    "tasks": [
      {
        "id": "route-35-1",
        "kind": "sequence",
        "title": "Odtwórz ostatni lot"
      },
      {
        "id": "route-35-2",
        "kind": "lights",
        "title": "Odwróć połączenia rdzenia"
      },
      {
        "id": "route-35-3",
        "kind": "battle",
        "title": "Pokonaj dowódców Ciemnej Doliny"
      }
    ],
    "enemyGroupId": "bear-command-group",
    "enemyLevel": 6,
    "reward": {
      "xp": 200,
      "bocianXp": 105,
      "memeEnergy": 170,
      "relics": 3,
      "crowns": 195,
      "intel": 1,
      "bearFragments": 2,
      "cardFragments": 0,
      "comicFragments": 1
    }
  }
];
export function missionAt(order: number): CampaignMission | undefined { return CAMPAIGN_MISSIONS[order - 1]; }
export function taskReward(mission: CampaignMission, taskIndex: number): GameReward {
  // Division preserves the exact total, including indivisible relics/fragments.
  const reward: GameReward = {};
  for (const [key, value] of Object.entries(mission.reward)) {
    const k = key as keyof GameReward;
    reward[k] = Math.floor((value ?? 0) * (taskIndex + 1) / 3) - Math.floor((value ?? 0) * taskIndex / 3);
  }
  return reward;
}
