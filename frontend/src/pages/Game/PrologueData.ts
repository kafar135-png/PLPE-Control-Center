export type PrologueSpeaker =
  | "narrator"
  | "pepe"
  | "bocian";

export type PrologueSceneId =
  | "awakening"
  | "map-clue"
  | "first-days"
  | "wandering"
  | "months"
  | "mountains"
  | "monastery-reveal"
  | "gate";

export interface PrologueDialogueLine {
  speaker: PrologueSpeaker;

  pl: string;
  en: string;
  de: string;
}

export interface PrologueScene {
  id: PrologueSceneId;

  chapter: string;

  title: {
    pl: string;
    en: string;
    de: string;
  };

  subtitle: {
    pl: string;
    en: string;
    de: string;
  };

  dialogue: PrologueDialogueLine[];
}

export const PROLOGUE_SCENES: PrologueScene[] = [
  {
    id: "awakening",

    chapter: "PROLOGUE 01",

    title: {
      pl: "Przebudzenie",
      en: "Awakening",
      de: "Erwachen",
    },

    subtitle: {
      pl: "Rozbity balon",
      en: "The crashed balloon",
      de: "Der abgestürzte Ballon",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "PolishPepe budzi się pośród mokrych drzew. Wokół niego leżą porwane liny, metalowe elementy i resztki rozbitego balonu.",

        en:
          "PolishPepe wakes among wet trees. Torn ropes, metal parts, and the remains of a crashed balloon are scattered around him.",

        de:
          "PolishPepe erwacht zwischen nassen Bäumen. Zerrissene Seile, Metallteile und die Überreste eines abgestürzten Ballons liegen um ihn herum.",
      },

      {
        speaker: "pepe",

        pl:
          "Co... się stało?",

        en:
          "What... happened?",

        de:
          "Was... ist passiert?",
      },

      {
        speaker: "narrator",

        pl:
          "Nie pamięta katastrofy. Nie pamięta lotu. Nie pamięta nawet, skąd przybył.",

        en:
          "He does not remember the crash. He does not remember the flight. He does not even remember where he came from.",

        de:
          "Er erinnert sich weder an den Absturz noch an den Flug. Nicht einmal daran, woher er gekommen ist.",
      },

      {
        speaker: "pepe",

        pl:
          "Kim ja jestem?",

        en:
          "Who am I?",

        de:
          "Wer bin ich?",
      },
    ],
  },

  {
    id: "map-clue",

    chapter: "PROLOGUE 02",

    title: {
      pl: "Pierwsza wskazówka",
      en: "The First Clue",
      de: "Der erste Hinweis",
    },

    subtitle: {
      pl: "Mapa bez odpowiedzi",
      en: "A map without answers",
      de: "Eine Karte ohne Antworten",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Wśród rzeczy ocalałych z katastrofy znajduje stary plecak. W środku: uszkodzony kompas i ręcznie narysowana mapa.",

        en:
          "Among the belongings that survived the crash, he finds an old backpack. Inside: a damaged compass and a hand-drawn map.",

        de:
          "Unter den Dingen, die den Absturz überstanden haben, findet er einen alten Rucksack. Darin: ein beschädigter Kompass und eine handgezeichnete Karte.",
      },

      {
        speaker: "narrator",

        pl:
          "Większość mapy jest zniszczona. Pozostał tylko jeden wyraźnie zaznaczony punkt wysoko w górach.",

        en:
          "Most of the map is destroyed. Only one clearly marked point remains high in the mountains.",

        de:
          "Der größte Teil der Karte ist zerstört. Nur ein deutlich markierter Punkt hoch in den Bergen ist erhalten geblieben.",
      },

      {
        speaker: "pepe",

        pl:
          "Nie wiem, co tam jest.",

        en:
          "I don't know what's there.",

        de:
          "Ich weiß nicht, was dort ist.",
      },

      {
        speaker: "pepe",

        pl:
          "Ale ktoś bardzo chciał, żebym tam dotarł.",

        en:
          "But someone really wanted me to get there.",

        de:
          "Aber jemand wollte unbedingt, dass ich dorthin komme.",
      },
    ],
  },

  {
    id: "first-days",

    chapter: "PROLOGUE 03",

    title: {
      pl: "Pierwsze dni",
      en: "The First Days",
      de: "Die ersten Tage",
    },

    subtitle: {
      pl: "Przetrwanie",
      en: "Survival",
      de: "Überleben",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Pierwsze dni są chaotyczne. PolishPepe szuka wody, jedzenia i próbuje zrozumieć mapę.",

        en:
          "The first days are chaotic. PolishPepe searches for water, food, and tries to understand the map.",

        de:
          "Die ersten Tage sind chaotisch. PolishPepe sucht Wasser und Nahrung und versucht, die Karte zu verstehen.",
      },

      {
        speaker: "narrator",

        pl:
          "Kilka razy wybiera złą drogę. Kilka razy wraca do tego samego miejsca.",

        en:
          "Several times he chooses the wrong road. Several times he returns to the same place.",

        de:
          "Mehrmals wählt er den falschen Weg. Mehrmals kehrt er an denselben Ort zurück.",
      },

      {
        speaker: "pepe",

        pl:
          "Świetnie. Nawet mapa nie chce ze mną współpracować.",

        en:
          "Great. Even the map doesn't want to cooperate with me.",

        de:
          "Großartig. Nicht einmal die Karte will mit mir zusammenarbeiten.",
      },
    ],
  },

  {
    id: "wandering",

    chapter: "PROLOGUE 04",

    title: {
      pl: "Tygodnie błądzenia",
      en: "Weeks of Wandering",
      de: "Wochen des Umherirrens",
    },

    subtitle: {
      pl: "Ślady bez znaczenia",
      en: "Clues without meaning",
      de: "Spuren ohne Bedeutung",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Dni zmieniają się w tygodnie. Las ustępuje ruinom, ruiny mokrym dolinom, a doliny górskim drogom.",

        en:
          "Days become weeks. Forests give way to ruins, ruins to wet valleys, and valleys to mountain roads.",

        de:
          "Tage werden zu Wochen. Wälder weichen Ruinen, Ruinen feuchten Tälern und Täler Bergwegen.",
      },

      {
        speaker: "narrator",

        pl:
          "W nocy przychodzą przebłyski. PLPE. Biały orzeł. Sieć. Światło. Głosy ludzi.",

        en:
          "At night, flashes come. PLPE. A white eagle. A network. Light. Human voices.",

        de:
          "Nachts kommen kurze Bilder. PLPE. Ein weißer Adler. Ein Netzwerk. Licht. Stimmen von Menschen.",
      },

      {
        speaker: "pepe",

        pl:
          "To są wspomnienia... czy tylko mój mózg zaczyna wariować?",

        en:
          "Are these memories... or is my brain just starting to fall apart?",

        de:
          "Sind das Erinnerungen... oder dreht mein Kopf einfach durch?",
      },
    ],
  },

  {
    id: "months",

    chapter: "PROLOGUE 05",

    title: {
      pl: "Miesiące",
      en: "Months",
      de: "Monate",
    },

    subtitle: {
      pl: "Wędrowiec",
      en: "The Wanderer",
      de: "Der Wanderer",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Tygodnie zmieniają się w miesiące. PolishPepe staje się coraz bardziej doświadczonym wędrowcem.",

        en:
          "Weeks become months. PolishPepe becomes a more experienced wanderer.",

        de:
          "Wochen werden zu Monaten. PolishPepe wird zu einem immer erfahreneren Wanderer.",
      },

      {
        speaker: "narrator",

        pl:
          "Naprawia ubranie, zdobywa lepszy sprzęt i uczy się przetrwać tam, gdzie wcześniej ledwo dawał sobie radę.",

        en:
          "He repairs his clothes, finds better equipment, and learns to survive where he once barely managed.",

        de:
          "Er repariert seine Kleidung, findet bessere Ausrüstung und lernt dort zu überleben, wo er zuvor kaum zurechtkam.",
      },

      {
        speaker: "narrator",

        pl:
          "W opuszczonym schronieniu znajduje symbol identyczny jak znak obok punktu na mapie.",

        en:
          "In an abandoned shelter, he finds a symbol identical to the mark beside the point on his map.",

        de:
          "In einer verlassenen Unterkunft findet er ein Symbol, das genau dem Zeichen neben dem Punkt auf seiner Karte entspricht.",
      },

      {
        speaker: "pepe",

        pl:
          "Czyli to miejsce naprawdę istnieje.",

        en:
          "So this place really exists.",

        de:
          "Also existiert dieser Ort wirklich.",
      },
    ],
  },

  {
    id: "mountains",

    chapter: "PROLOGUE 06",

    title: {
      pl: "Góry",
      en: "The Mountains",
      de: "Die Berge",
    },

    subtitle: {
      pl: "Mapa zaczyna mieć sens",
      en: "The map begins to make sense",
      de: "Die Karte beginnt Sinn zu ergeben",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Po miesiącach wędrówki dociera do wysokich gór. Po raz pierwszy układ szczytów zgadza się z liniami na mapie.",

        en:
          "After months of wandering, he reaches the high mountains. For the first time, the shape of the peaks matches the lines on the map.",

        de:
          "Nach Monaten der Wanderung erreicht er das Hochgebirge. Zum ersten Mal entspricht die Form der Gipfel den Linien auf der Karte.",
      },

      {
        speaker: "pepe",

        pl:
          "Wreszcie.",

        en:
          "Finally.",

        de:
          "Endlich.",
      },

      {
        speaker: "narrator",

        pl:
          "Im wyżej się wspina, tym silniejsze staje się dziwne poczucie, że już kiedyś widział te góry.",

        en:
          "The higher he climbs, the stronger the strange feeling becomes that he has seen these mountains before.",

        de:
          "Je höher er steigt, desto stärker wird das seltsame Gefühl, diese Berge schon einmal gesehen zu haben.",
      },
    ],
  },

  {
    id: "monastery-reveal",

    chapter: "PROLOGUE 07",

    title: {
      pl: "Pierwszy widok Klasztoru",
      en: "First Sight of the Monastery",
      de: "Der erste Blick auf das Kloster",
    },

    subtitle: {
      pl: "Koniec drogi?",
      en: "The end of the road?",
      de: "Das Ende des Weges?",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Wychodzi ponad warstwę chmur. Na skalnym zboczu stoi ogromny klasztor, dokładnie w miejscu zaznaczonym na mapie.",

        en:
          "He climbs above the clouds. A massive monastery stands on the rocky mountainside, exactly where the point was marked on the map.",

        de:
          "Er steigt über die Wolkendecke. Auf einem felsigen Berghang steht ein gewaltiges Kloster, genau an der Stelle, die auf der Karte markiert war.",
      },

      {
        speaker: "pepe",

        pl:
          "Więc to tutaj.",

        en:
          "So this is it.",

        de:
          "Also ist es hier.",
      },

      {
        speaker: "pepe",

        pl:
          "Nie wiem, kim jestem. Nie wiem, kto zaznaczył to miejsce... ale ktoś bardzo chciał, żebym tu dotarł.",

        en:
          "I don't know who I am. I don't know who marked this place... but someone really wanted me to reach it.",

        de:
          "Ich weiß nicht, wer ich bin. Ich weiß nicht, wer diesen Ort markiert hat... aber jemand wollte unbedingt, dass ich ihn erreiche.",
      },
    ],
  },

  {
    id: "gate",

    chapter: "CHAPTER 01",

    title: {
      pl: "Brama",
      en: "The Gate",
      de: "Das Tor",
    },

    subtitle: {
      pl: "Pierwsze spotkanie",
      en: "The First Meeting",
      de: "Die erste Begegnung",
    },

    dialogue: [
      {
        speaker: "narrator",

        pl:
          "Przy bramie czeka samotna postać w ciemnej szacie.",

        en:
          "A lone figure in a dark robe waits at the gate.",

        de:
          "Am Tor wartet eine einsame Gestalt in einer dunklen Robe.",
      },

      {
        speaker: "bocian",

        pl:
          "W końcu dotarłeś.",

        en:
          "You finally made it.",

        de:
          "Du hast es endlich geschafft.",
      },

      {
        speaker: "pepe",

        pl:
          "Znasz mnie?",

        en:
          "You know me?",

        de:
          "Du kennst mich?",
      },

      {
        speaker: "bocian",

        pl:
          "Znam twoje imię.",

        en:
          "I know your name.",

        de:
          "Ich kenne deinen Namen.",
      },

      {
        speaker: "pepe",

        pl:
          "Skąd?",

        en:
          "How?",

        de:
          "Woher?",
      },

      {
        speaker: "bocian",

        pl:
          "Pytanie brzmi raczej... dlaczego ty go nie pamiętasz.",

        en:
          "The better question is... why don't you remember it?",

        de:
          "Die bessere Frage lautet... warum erinnerst du dich nicht daran?",
      },

      {
        speaker: "bocian",

        pl:
          "Wejdź, PolishPepe. Jeżeli naprawdę chcesz odpowiedzi, musimy zacząć od początku.",

        en:
          "Come inside, PolishPepe. If you truly want answers, we must begin at the beginning.",

        de:
          "Komm herein, PolishPepe. Wenn du wirklich Antworten willst, müssen wir ganz von vorne anfangen.",
      },
    ],
  },
];