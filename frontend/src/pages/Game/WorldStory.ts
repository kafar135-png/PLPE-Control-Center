export interface WorldStoryDialogueLine {
  speaker: "PolishPepe" | "Bocian" | "Zwiadowca" | "Narrator";
  text: string;
  textEn?: string;
}

export interface WorldStoryScene {
  id: string;
  title: string;
  titleEn?: string;
  speaker: string;
  text: string[];
  textEn?: string[];
  dialogue?: WorldStoryDialogueLine[];
  note: string;
  trigger: {
    minTurn?: number;
    locationId?: string;
    discoveryId?: string;
    rescuedNpcId?: string;
  };
}

export interface WorldStoryState {
  seenSceneIds: string[];
}

const STORAGE_KEY = "plpe-world-story-v1";

export const WORLD_STORY_SCENES: WorldStoryScene[] = [
  {
    id: "story-forest-first-road",
    title: "Pierwszy szlak",
    titleEn: "First Trail",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Jeżeli ta mapa naprawdę prowadzi do mojego balonu, chcę iść dalej bez postoju.", textEn: "If this map really leads to my balloon, I want to keep moving without stopping." },
      { speaker: "Bocian", text: "I dlatego właśnie ja idę z tobą. Kto biegnie za odpowiedzią, zwykle pierwszy wpada w pułapkę.", textEn: "And that is exactly why I am coming with you. Whoever runs after an answer usually falls into the trap first." },
      { speaker: "PolishPepe", text: "Czyli plan brzmi: ja wpadam w pułapkę, ty mówisz «a nie mówiłem»?", textEn: "So the plan is: I fall into the trap, and you say 'I told you so'?" },
      { speaker: "Bocian", text: "Nie. Plan brzmi: tym razem zauważymy ją wcześniej.", textEn: "No. The plan is that this time we notice it first." },
    ],
    note: "Bocian traktuje wyprawę jak śledztwo, Pepe jak drogę do odzyskania pamięci.",
    trigger: { locationId: "forest-pass" },
  },
  {
    id: "story-mist-lake",
    title: "Coś pod powierzchnią",
    titleEn: "Something Beneath the Surface",
    speaker: "PolishPepe",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Woda jest zbyt spokojna. Nawet wiatr jej nie rusza.", textEn: "The water is too calm. Even the wind does not move it." },
      { speaker: "Bocian", text: "Bo wiatr omija miejsca, których nie rozumie.", textEn: "Because the wind avoids places it does not understand." },
      { speaker: "PolishPepe", text: "To miało zabrzmieć mądrze czy niepokojąco?", textEn: "Was that supposed to sound wise or unsettling?" },
      { speaker: "Bocian", text: "Jedno nie wyklucza drugiego. Trzymaj broń blisko.", textEn: "One does not exclude the other. Keep your weapon close." },
    ],
    note: "Jezioro Mgły skrywa ślady zatopionego ładunku i wodne bestie.",
    trigger: { locationId: "mist-lake" },
  },
  {
    id: "story-mountain-pass",
    title: "Dwie drogi",
    titleEn: "Two Roads",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "Bocian", text: "Za przełęczą zaczyna się teren, którego nie kontroluje Klasztor.", textEn: "Beyond the pass begins territory the Monastery does not control." },
      { speaker: "PolishPepe", text: "Czyli wreszcie robi się ciekawie.", textEn: "So things are finally getting interesting." },
      { speaker: "Bocian", text: "Ciekawie to słowo używane przez ludzi, którzy nie muszą później zszywać ran.", textEn: "Interesting is a word used by people who do not have to stitch the wounds afterward." },
      { speaker: "PolishPepe", text: "Dobrze. W takim razie robi się strategicznie.", textEn: "Fine. Then things are getting strategic." },
    ],
    note: "Dalsza droga wymaga nie tylko siły, ale rozwiniętej bazy i ekwipunku.",
    trigger: { locationId: "mountain-pass" },
  },
  {
    id: "story-hidden-cave",
    title: "Ślad sprzed katastrofy",
    titleEn: "A Trace from Before the Crash",
    speaker: "PolishPepe",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Te znaki... widziałem je wcześniej. Jeszcze przed katastrofą.", textEn: "These marks... I have seen them before. Before the crash." },
      { speaker: "Bocian", text: "Pamięć wraca fragmentami, kiedy miejsce pasuje do śladu.", textEn: "Memory returns in fragments when a place matches the trace." },
      { speaker: "PolishPepe", text: "A jeśli przypomnę sobie coś, czego wolałbym nie wiedzieć?", textEn: "And what if I remember something I would rather not know?" },
      { speaker: "Bocian", text: "Wtedy przynajmniej będzie to twoja prawda, a nie cudza opowieść.", textEn: "Then at least it will be your truth, not someone else's story." },
    ],
    note: "Jaskinia łączy obecną kampanię z wydarzeniami sprzed katastrofy balonu.",
    trigger: { locationId: "hidden-cave" },
  },
  {
    id: "story-old-quarry",
    title: "Relikty nie są skarbem",
    titleEn: "Relics Are Not Treasure",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Cztery relikty w jednym miejscu. Dzisiaj los mnie lubi.", textEn: "Four relics in one place. Luck likes me today." },
      { speaker: "Bocian", text: "Relikt nie jest monetą. To narzędzie, po którym ktoś zostawił historię.", textEn: "A relic is not a coin. It is a tool on which someone left a story." },
      { speaker: "PolishPepe", text: "A jeśli historię da się sprzedać?", textEn: "And what if the story can be sold?" },
      { speaker: "Bocian", text: "Wtedy Archiwum wpisze cię na listę barbarzyńców.", textEn: "Then the Archive will put you on the list of barbarians." },
    ],
    note: "Relikty powinny trafiać do rozwoju, Kuźni i sekretów, nie tylko do magazynu.",
    trigger: { locationId: "old-quarry" },
  },
  {
    id: "story-deep-mine",
    title: "Pod ziemią",
    titleEn: "Underground",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "Bocian", text: "Słyszysz ten rytm? Ktoś uruchomił stare maszyny dużo wcześniej niż Niedźwiedzie pojawiły się w dolinie.", textEn: "Do you hear that rhythm? Someone started the old machines long before the Bears appeared in the valley." },
      { speaker: "PolishPepe", text: "Czyli wojna nie zaczęła się od nich?", textEn: "So the war did not begin with them?" },
      { speaker: "Bocian", text: "Wojny prawie nigdy nie zaczynają się tam, gdzie pierwszy raz widzimy miecz.", textEn: "Wars almost never begin where we first see the sword." },
    ],
    note: "Kopalnia sugeruje starsze źródło konfliktu niż obecny front Bear Army.",
    trigger: { locationId: "deep-mine" },
  },
  {
    id: "story-watchtower-cellar",
    title: "Ktoś prowadził kronikę",
    titleEn: "Someone Kept a Chronicle",
    speaker: "PolishPepe",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Te księgi opisują ruchy patroli sprzed wielu lat. Ktoś przewidział tę wojnę.", textEn: "These books describe patrol movements from many years ago. Someone predicted this war." },
      { speaker: "Bocian", text: "Albo przygotował ją wcześniej.", textEn: "Or prepared it in advance." },
      { speaker: "PolishPepe", text: "Nie lubię, kiedy twoje odpowiedzi są gorsze od moich pytań.", textEn: "I do not like it when your answers are worse than my questions." },
    ],
    note: "Strażnica zawiera dane o planowaniu konfliktu długo przed obecną kampanią.",
    trigger: { locationId: "watchtower-cellar" },
  },
  {
    id: "story-stone-circle",
    title: "Krąg pamięta",
    titleEn: "The Circle Remembers",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "Bocian", text: "Kamienie reagują na relikty, które niesiesz.", textEn: "The stones are reacting to the relics you carry." },
      { speaker: "PolishPepe", text: "Czyli cały czas nosiłem klucze i nawet o tym nie wiedziałem.", textEn: "So I have been carrying the keys all this time and did not even know it." },
      { speaker: "Bocian", text: "Tak działa większość ważnych rzeczy. Najpierw je znajdujesz, dopiero później rozumiesz.", textEn: "That is how most important things work. First you find them, only later do you understand them." },
    ],
    note: "Kamienny Krąg wiąże relikty z systemem pieczęci prowadzących ku Ciemnej Dolinie.",
    trigger: { locationId: "stone-circle" },
  },
  {
    id: "story-coastal-beacon",
    title: "Światło z wybrzeża",
    titleEn: "Light from the Coast",
    speaker: "PolishPepe",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Jeśli zapalimy latarnię, zobaczą nas z połowy wybrzeża.", textEn: "If we light the beacon, half the coast will see us." },
      { speaker: "Bocian", text: "Właśnie o to chodzi.", textEn: "That is exactly the point." },
      { speaker: "PolishPepe", text: "Przez całą drogę uczyłeś mnie unikać zasadzek.", textEn: "The whole journey you taught me to avoid ambushes." },
      { speaker: "Bocian", text: "A teraz jesteśmy wystarczająco silni, żeby wybrać miejsce następnej.", textEn: "And now we are strong enough to choose the place for the next one." },
    ],
    note: "Od tej chwili bohaterowie coraz częściej narzucają przeciwnikowi warunki walki.",
    trigger: { locationId: "coastal-beacon" },
  },
  {
    id: "story-bear-outpost",
    title: "Front odpowiada",
    titleEn: "The Front Answers",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "Bocian", text: "Ich posterunki nie są już przypadkowe. Każdy osłania kolejny.", textEn: "Their outposts are no longer random. Each one protects the next." },
      { speaker: "PolishPepe", text: "To dobrze. Przynajmniej wiemy, gdzie szukać następnego przeciwnika.", textEn: "Good. At least we know where to look for the next opponent." },
      { speaker: "Bocian", text: "Ty naprawdę potrafisz zamienić logistykę wojenną w zaproszenie do bójki.", textEn: "You really can turn military logistics into an invitation to a fight." },
      { speaker: "PolishPepe", text: "To moja specjalizacja.", textEn: "That is my specialization." },
    ],
    note: "Bear Army reaguje na postęp kampanii i buduje prawdziwą linię obrony.",
    trigger: { locationId: "bear-outpost-west" },
  },
  {
    id: "story-burned-village",
    title: "Cena wojny",
    titleEn: "The Price of War",
    speaker: "PolishPepe",
    text: [],
    dialogue: [
      { speaker: "PolishPepe", text: "Tu nie ma już kogo ratować.", textEn: "There is no one left here to save." },
      { speaker: "Bocian", text: "Dlatego nie możemy traktować tej drogi jak turnieju.", textEn: "That is why we cannot treat this road like a tournament." },
      { speaker: "PolishPepe", text: "Wiem. Od tej chwili kończymy to nie dla mapy. Dla tych, którzy nie zdążyli odejść.", textEn: "I know. From now on we finish this not for the map. For those who did not have time to leave." },
    ],
    note: "Spalona Wioska zmienia motywację Pepe: konflikt przestaje być tylko poszukiwaniem własnej przeszłości.",
    trigger: { locationId: "burned-village" },
  },
  {
    id: "story-dark-gate",
    title: "Przed ostatnią bramą",
    titleEn: "Before the Final Gate",
    speaker: "Bocian",
    text: [],
    dialogue: [
      { speaker: "Bocian", text: "Za tą bramą nie będzie już zwiadu. Każdy ruch stanie się częścią finału.", textEn: "Beyond this gate there will be no more scouting. Every move becomes part of the finale." },
      { speaker: "PolishPepe", text: "Dobrze. Przez całą drogę próbowałem sobie przypomnieć, kim byłem.", textEn: "Good. The whole way I was trying to remember who I used to be." },
      { speaker: "Bocian", text: "A teraz?", textEn: "And now?" },
      { speaker: "PolishPepe", text: "Teraz bardziej interesuje mnie, kim zdecyduję się być po drugiej stronie.", textEn: "Now I care more about who I choose to become on the other side." },
    ],
    note: "Finał kampanii zamyka łuk pamięci i otwiera dalszy rozwój PolishPepe Universe.",
    trigger: { locationId: "dark-gate" },
  },
  {
    id: "story-war-awakens",
    title: "Wojna budzi się",
    titleEn: "War Awakens",
    speaker: "Bocian",
    text: ["Ciemna Dolina obserwuje nasze szlaki i buduje własną sieć wpływów.", "Nie wystarczy pokonać jednego Niedźwiedzia. Musimy odebrać im teren, informacje i zapasy."],
    textEn: ["The Dark Valley watches our routes and builds its own network of influence.", "Defeating one Bear is not enough. We must take away their territory, intelligence and supplies."],
    note: "Ciemna Dolina jest aktywną frakcją. Jej siła rośnie wraz z turami i kontrolowanym terytorium.",
    trigger: { minTurn: 3 },
  },
  {
    id: "story-scout-rescued",
    title: "Raport Zwiadowcy",
    titleEn: "Scout Report",
    speaker: "Zwiadowca",
    text: ["Bear Army nie trzyma wszystkich sił w Ciemnej Dolinie.", "Mają mniejsze posterunki, magazyny i grupy, które potrafią odbijać teren."],
    textEn: ["The Bear Army does not keep all its forces in the Dark Valley.", "They have smaller outposts, depots and groups capable of retaking territory."],
    note: "Uratowany Zwiadowca przekazał informacje o systemie posterunków Bear Army.",
    trigger: { rescuedNpcId: "monastery-scout" },
  },
];

export function loadWorldStoryState(): WorldStoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seenSceneIds: [] };
    const parsed = JSON.parse(raw) as Partial<WorldStoryState>;
    return { seenSceneIds: Array.isArray(parsed.seenSceneIds) ? parsed.seenSceneIds : [] };
  } catch {
    return { seenSceneIds: [] };
  }
}

export function saveWorldStoryState(state: WorldStoryState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markStorySceneSeen(state: WorldStoryState, sceneId: string): WorldStoryState {
  if (state.seenSceneIds.includes(sceneId)) return state;
  return { ...state, seenSceneIds: [...state.seenSceneIds, sceneId] };
}

export function findTriggeredStoryScene(args: {
  state: WorldStoryState;
  turn: number;
  locationId: string;
  discoveries: string[];
  rescuedNPCs: string[];
}) {
  return WORLD_STORY_SCENES.find((scene) => {
    if (args.state.seenSceneIds.includes(scene.id)) return false;
    const trigger = scene.trigger;
    if (trigger.minTurn !== undefined && args.turn < trigger.minTurn) return false;
    if (trigger.locationId && args.locationId !== trigger.locationId) return false;
    if (trigger.discoveryId && !args.discoveries.includes(trigger.discoveryId)) return false;
    if (trigger.rescuedNpcId && !args.rescuedNPCs.includes(trigger.rescuedNpcId)) return false;
    return true;
  }) ?? null;
}
