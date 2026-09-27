import type { TranslationDictionary } from "../types/language";

const pl: TranslationDictionary = {
  common: {
    loading: "Ładowanie...",
    live: "NA ŻYWO",
    connected: "Połączono",
    disconnected: "Rozłączono",
    wallet: "Portfel",
    network: "Sieć",
    price: "Cena",
    language: "Język",
    search: "Szukaj",
    save: "Zapisz",
    cancel: "Anuluj",
    dashboard: "Dashboard",
    analytics: "Analityka",
    holderProfile: "Profil Holdera",
    about: "O projekcie",
    connectWallet: "🦊 Połącz portfel",
    connecting: "Łączenie...",
    disconnect: "Rozłącz",
    value: "Wartość",
    share: "Udział",
    installApp: "Pobierz aplikację",
    installAppManual:
      "Otwórz menu przeglądarki i wybierz Zainstaluj aplikację lub Dodaj do ekranu głównego.",
    installAppIos:
      "Kliknij Udostępnij, a następnie wybierz Dodaj do ekranu początkowego.",
  },

  topbar: {
    title: "Panel PLPE",
    subtitle: "PolishPepe System operacyjny",
    networkName: "Ethereum",
  },

  dashboard: {
    loading: "Ładowanie panelu...",
    price: "Cena PLPE",
    liquidity: "Płynność",
    marketCap: "Kapitalizacja",
    volume24h: "Wolumen 24H",
    chartTitle: "📈 Rynek PLPE",
    chartSubtitle: "Wykres świecowy na żywo",
    chartLoading: "Ładowanie wykresu...",
    chartError: "Nie można załadować wykresu",
    poweredBy:
      "Dane PLPE Backend · GeckoTerminal",
  },

  analytics: {
    title: "Analityka",
    loading: "Ładowanie rynku...",
    price: " Cena",
    liquidity: " Płynność",
    marketCap: " Kapitalizacja",
    volume24h: " Wolumen 24H",

    holderGrowthTitle: "📈 Wzrost holderów",
    holderGrowthSubtitle:
      "Łączna liczba holderów w czasie",
    current: "Aktualnie",
    marketHealthTitle: "🧠 Kondycja rynku",
    topHoldersTitle: "👑 Najwięksi holderzy",
    whaleActivityTitle: "🐋 Aktywność wielorybów",
    scanning: "Skanowanie blockchaina...",
    marketPressure: "Presja rynku",
    largeTrades: "Duże transakcje",
    monitoring: "Monitorowanie",
    lastScan: "Ostatni skan",

    highActivity: "Wysoka aktywność",
    mediumActivity: "Średnia aktywność",
    lowActivity: "Niska aktywność",

    buyingPressure: "Presja kupujących",
    sellingPressure: "Presja sprzedających",
    neutral: "Neutralnie",

    detected: "Wykryto",
    status: "Status",
    trend: "Trend",
    risk: "Ryzyko",
    aiScore: "Wynik AI",
    healthy: "🟢 Zdrowy",
    moderate: "🟡 Umiarkowany",
    weak: "🔴 Słaby",
    bullish: "📈 Wzrostowy",
    bearish: "📉 Spadkowy",
    liveTradesTitle: "🔥 Transakcje na żywo",
    aiAnalysisTitle: "🧠 PLPE AI",
    marketHealth: "Kondycja rynku",
    riskScore: "Poziom ryzyka",
    strongBuy: "Silny zakup",
    accumulation: "Akumulacja",
    highRisk: "Wysokie ryzyko",
    lowLiquidity: "🔴 Niska płynność",
    marketMonitorTitle: "⚡ Monitor rynku",
    connecting: "Łączenie...",
    currentPrice: "Aktualna cena",
    connection: "Połączenie",
    lastRefresh: "Ostatnie odświeżenie",
  },

  holderProfile: {
    portfolioTimeline: "📈 Historia portfela",
    noTransactions: "Nie znaleziono transakcji.",
    buy: "🟢 KUPNO",
    sell: "🔴 SPRZEDAŻ",
    noWalletSelected: "Nie wybrano portfela",
    noWalletDescription:
      "Połącz MetaMask lub wpisz adres portfela powyżej.",
    externalWalletAnalysis:
      "Analiza zewnętrznego portfela",
    connectedWallet: "Połączony portfel",
    analyzedWallet: "Analizowany portfel",
    wallet: "Portfel",
    status: "Status",
    ready: "🟢 Gotowy",
    address: "Adres",
    firstBuy: "Pierwszy zakup",
    holdingDays: "Dni posiadania",
    holdings: "Posiadane środki",
    plpeBalance: "Saldo PLPE",
    currentValue: "Aktualna wartość",
    ownership: "Udział",
    supplyShare: "Udział w podaży",
    transactions: "Transakcje",
    lastActivity: "Ostatnia aktywność",
    portfolioAnalytics: "Analityka portfela",
    largestBuy: "Największy zakup",
    largestSell: "Największa sprzedaż",
    portfolioAge: "Wiek portfela",
    activity: "Aktywność",
    active: "Aktywny",
    portfolioPerformance: "Wyniki portfela",
    currentBalance: "Aktualne saldo",
    totalBought: "Łącznie kupiono",
    totalSold: "Łącznie sprzedano",
    netPosition: "Pozycja netto",
    searchWallet: "Szukaj portfela",
    searchSubtitle:
      "Analizuj dowolnego holdera PLPE po adresie portfela.",
    analyze: "Analizuj",
    myWallet: "Mój portfel",
    invalidWallet:
      "Nieprawidłowy adres portfela Ethereum.",
    walletPlaceholder:
      "Wklej adres portfela Ethereum...",
  },

  ai: {
    title: "🤖 PLPE AI",
    loading: "Ładowanie AI...",
    waitingTitle: "Ładowanie...",
    waitingText: "Oczekiwanie na dane rynkowe...",
    strongBullishTitle: "🚀 Silnie wzrostowy",
    strongBullishText:
      "Momentum jest bardzo silne. Kupujący kontrolują rynek.",
    bullishTitle: "🟢 Wzrostowy",
    bullishText:
      "Pozytywny trend i zdrowa presja kupujących.",
    strongBearishTitle: "🔴 Silnie spadkowy",
    strongBearishText:
      "Wykryto silną presję sprzedażową.",
    bearishTitle: "🟠 Spadkowy",
    bearishText:
      "Rynek znajduje się obecnie pod presją.",
    neutralTitle: "🟡 Neutralny",
    neutralText: "Cena porusza się bokiem.",
    change24h: "Zmiana 24H",
    liquidity: "Płynność",
    scoreButton: "Wynik AI (wkrótce w v2)",
  },

  activity: {
    title: "📋 Aktywność na żywo",
    loading: "Ładowanie najnowszych transakcji...",
    buy: "🟢 KUPNO",
    sell: "🔴 SPRZEDAŻ",
    transfer: "🔵 TRANSFER",
    noActivity: "Brak ostatniej aktywności.",
    secondsAgo: "s temu",
    minutesAgo: "min temu",
    hoursAgo: "godz. temu",
    daysAgo: "dni temu",
  },

  about: {
    title: "O PolishPepe",
    projectInformation: "Informacje o projekcie",
    version: "Wersja",
    network: "Sieć",
    token: "Token",
    supply: "Podaż",
    status: "Status",
    mission: "Misja",
    missionText1:
      "PolishPepe to pierwszy polski społecznościowy ekosystem memowy zbudowany na Ethereum.",
    missionText2:
      "Naszą wizją jest stworzenie czegoś znacznie większego niż sam token.",
    missionText3:
      "PLPE OS, BOCIAN, analityka wspierana przez AI, narzędzia społecznościowe i przyszłe produkty Web3 są częścią jednego rozwijającego się ekosystemu.",
    officialLinks: "Oficjalne linki",
    website: "Strona internetowa",
    x: "X",
    telegram: "Telegram",
    discord: "Discord",
    smartContract: "Smart Contract",
    copy: "Kopiuj",
    contractCopied: "Skopiowano kontrakt!",
    copyFailed: "Nie udało się skopiować.",
  },

  challenge: {
    monthlyTradingChallenge:
      "MIESIĘCZNE WYZWANIE TRADINGOWE",
    monthlyChallenge: "MIESIĘCZNE WYZWANIE",
    tradePlpe: "HANDLUJ PLPE",
    title: "MIESIĘCZNE WYZWANIE TRADINGOWE",
    phase: "FAZA",
    launchPhase: "FAZA STARTOWA",
    rewardPool: "Pula nagród",
    minimumVolume: "Minimalny wolumen",
    minimumBuy: "Minimalny BUY",
    netBuy: "NET BUY",
    trades: "Transakcje",
    qualified: "Zakwalifikowani",
    wallet: "Portfel",
    volume: "Wolumen",
    entries: "Losy",
    rank: "Miejsce",
    noQualified: "Brak zakwalifikowanych portfeli",
    noQualifiedDescription:
      "Wykonaj transakcję PLPE/WETH o minimalnym łącznym wolumenie $2.",
    portfolioNotQualified:
      "Twój portfel nie jest jeszcze zakwalifikowany.",
    portfolioNotQualifiedDescription:
      "Wygeneruj co najmniej $2 wolumenu PLPE/WETH, aby otrzymać pierwszy los.",
    live: "NA ŻYWO",
    maxEntries: "Maks. 6 losów / portfel",
    onChainVerified: "Zweryfikowane on-chain",
    loading: "Ładowanie wyzwania...",
    error: "Nie udało się załadować wyzwania.",
    buy: "KUPNO",
    sell: "SPRZEDAŻ",
    buyOnly: "TYLKO KUPNO",
    qualifiedStatus: "Zakwalifikowany",
    phasePeriod: "Aktualna faza: {start} → {end}",
    nextPhase: "🚀 NASTĘPNA FAZA",
    nextPhaseDescription:
      "Następna faza Challenge rozpoczyna się {start} i kończy {end}. Wolumen i losy zostaną wyzerowane dla nowej fazy.",
    entryRules: "ZASADY LOSÓW",
    entryRulesDescription:
      "BUY ≥ $2 = 1 LOS · BUY < $2 = 0 LOSÓW · SELL = 0 LOSÓW · MAKS. 6 LOSÓW / PORTFEL",
    pairMinimumVolume: "Minimalny wolumen: $2",
    pairMinimumBuy: "Minimalny BUY: $5",
    noQualifiedDescriptionPhase03:
      "Zarejestruj portfel i wykonaj kwalifikowany BUY za minimum $5, aby wejść do Phase #03.",
    portfolioNotQualifiedDescriptionPhase03:
      "Najpierw zarejestruj portfel, a następnie wykonaj BUY za minimum $5, aby zdobyć pierwsze ENTRY.",
    holderBonus: "HOLDER BONUS — $50",
    holderBonusDescription:
      "Minimum 4 ENTRY. Ranking: HOLD % → utrzymane kwalifikowane PLPE → NET BUY → portfel.",
    noHolderQualified: "Brak zakwalifikowanych do Holder Bonus",
    noHolderQualifiedDescription:
      "Zdobądź minimum 4 ENTRY i utrzymaj kwalifikowane PLPE, aby wejść do rankingu Holder Bonus.",
    phaseLabel: "FAZA",
  },

  game: {
    arena: "PLPE Arena",
    universe: "UNIWERSUM POLISHPEPE",
    season1: "Sezon 1",
    chapter1Awakening: "Rozdział 1 — Przebudzenie",

    memeEnergy: "Meme Energy",
    relics: "Relikty",
    intel: "Wiedza",

    mainHero: "Główny bohater",
    mentor: "Mentor",
    level: "Poziom",
    rank: "Ranga",
    xp: "XP",

    polishPepe: "PolishPepe",
    bocian: "Bocian",
    storkGuidanceUnlocked:
      "Przewodnictwo Bociana odblokowane",

    mainHub: "GŁÓWNA BAZA",
    storkMonastery: "Klasztor Bociana",
    monasteryDescription:
      "Ulepszaj klasztor, aby odblokowywać nowe rozdziały, budynki i dalszy rozwój PolishPepe.",

    trainingHall: "Sala Treningowa",
    trainingHallDescription:
      "Trenuj i rozwijaj bohaterów.",

    cardForge: "Kuźnia Kart",
    cardForgeDescription:
      "Ulepszaj karty i umiejętności.",

    comicArchive: "Archiwum Komiksu",
    comicArchiveDescription:
      "Kody, sekrety i ukryta wiedza.",

    plpeVault: "Skarbiec PLPE",
    plpeVaultDescription:
      "Nagrody dla holderów i bonusy sezonowe.",

    arenaBuilding: "Arena",
    arenaDescription:
      "Walki fabularne i bossowie.",

    expeditions: "Ekspedycje",
    expeditionsDescription:
      "Wysyłaj bohaterów na misje czasowe.",

    locked: "ZABLOKOWANE",

    currentStory: "AKTUALNA HISTORIA",
    chapter1Description:
      "Wejdź do klasztoru i rozpocznij podróż PolishPepe.",
    startChapter: "ROZPOCZNIJ ROZDZIAŁ",
        quest1Title: "Zadanie 01 — Wejdź do Klasztoru",
    quest1Objective:
      "Wejdź do Klasztoru Bociana i odkryj, co czeka w środku.",

    storyIntroTitle: "Przebudzenie",

    storyIntroBocian1:
      "Skoro tu dotarłeś, ten świat jeszcze nie umarł.",

    storyIntroPolishPepe1:
      "I to ty masz mi powiedzieć, co tu się właściwie dzieje?",

    storyIntroBocian2:
      "W swoim czasie. Najpierw wejdź do klasztoru. Musisz coś zobaczyć.",

    continue: "DALEJ",
    enterMonastery: "WEJDŹ DO KLASZTORU",
    questCompleted: "ZADANIE UKOŃCZONE",
        quest2Title: "Zadanie 02 — Pierwszy Sygnał",
    quest2Objective:
      "Zbadaj dziwny sygnał dochodzący z Bramy Zniszczonego Rynku.",

    firstSignalTitle: "Pierwszy Sygnał",

    firstSignalBocian1:
      "Coś porusza się za murami klasztoru. Sygnał jest słaby, ale zbliża się.",

    firstSignalPolishPepe1:
      "To przestańmy czekać i sprawdźmy, co to jest.",

    investigate: "ZBADAJ",

    battle: "WALKA",
    yourTurn: "TWOJA TURA",
    enemyTurn: "TURA PRZECIWNIKA",

    attack: "ATAK",
    ability: "UMIEJĘTNOŚĆ",
    defend: "OBRONA",

    victory: "ZWYCIĘSTWO",
    defeat: "PORAŻKA",
    reward: "NAGRODA",

    bearScout: "Niedźwiedzi Zwiadowca",

    hp: "HP",
    damage: "Obrażenia",
        prologueText1:
      "Po wielu miesiącach tułaczki PolishPepe nadal nie wiedział, kim był ani dlaczego obudził się w świecie, którego nie pamiętał.",

    prologueText2:
      "Zostały mu tylko urywki obrazów, dziwne symbole i uczucie, że gdzieś istnieje miejsce, do którego powinien dotrzeć.",

    prologueText3:
      "Pewnego dnia, wysoko w górach, zobaczył coś pośród mgły...",

    scene2Narrator:
      "Po raz pierwszy od wielu miesięcy PolishPepe zobaczył miejsce, które wydało mu się dziwnie znajome.",

    scene2PolishPepe:
      "Nie wiem dlaczego... ale mam wrażenie, że już kiedyś tu byłem.",

    goToMonastery:
      "IDŹ DO KLASZTORU",

    scene3Bocian1:
      "Długo ci to zajęło.",

    scene3PolishPepe1:
      "Znasz mnie?",

    scene3Bocian2:
      "Powiedzmy, że wiem o tobie więcej, niż ty sam.",

    scene3PolishPepe2:
      "To nie będzie trudne. Ja praktycznie niczego nie pamiętam.",

    scene3Bocian3:
      "Zauważyłem. Wejdź. Jeżeli naprawdę jesteś tym, za kogo cię uważam, mamy sporo pracy.",

    scene4PolishPepe1:
      "Co to za miejsce?",

    scene4Bocian1:
      "Kiedyś było znacznie większe. Świat wokół nas słabnie. Niektóre miejsca zniknęły. Inne zostały zapomniane.",

    scene4PolishPepe2:
      "A ty tu zostałeś?",

    scene4Bocian2:
      "Ktoś musiał pilnować tego, co jeszcze zostało.",

    scene5Bocian1:
      "Jeżeli chcesz odzyskać to, co straciłeś, sama siła ci nie wystarczy.",

    scene5PolishPepe1:
      "A czego potrzebuję?",

    scene5Bocian2:
      "Wiedzy. Dyscypliny. I odpowiednich sojuszników.",

    scene5PolishPepe2:
      "Brzmi jak długi plan.",

    scene5Bocian3:
      "To dobrze. Krótkie plany zwykle kończą się źle.",

    scene5PolishPepe3:
      "A te symbole?",

    scene5Bocian4:
      "Są rzeczy, których nawet ja nie mogę ci po prostu powiedzieć. Niektóre odpowiedzi trzeba znaleźć samemu.",

    scene6Bocian1:
      "Czekaj.",

    scene6PolishPepe1:
      "Co?",

    scene6Bocian2:
      "Ktoś jest za murami.",

    scene6PolishPepe2:
      "Przyjaciel?",

    scene6Bocian3:
      "Gdyby był przyjacielem, nie próbowałby podejść niezauważony.",

    scene6Bocian4:
      "Chodź.",

    scene7Bear1:
      "Więc jednak ktoś jeszcze tu mieszka.",

    scene7PolishPepe1:
      "A ty chyba pomyliłeś adres.",

    scene7Bocian1:
      "Pepe.",

    scene7PolishPepe2:
      "Co?",

    scene7Bocian2:
      "Teraz możesz przestać mówić.",

    defendMonastery:
      "BROŃ KLASZTORU",

          welcomeTitle: "Witaj w Uniwersum PolishPepe",

    welcomeText1:
      "Przed Tobą świat pełen historii, walk, sekretów i postaci do odkrycia.",

    welcomeText2:
      "Rozwijaj PolishPepe, odkrywaj wiedzę Bociana i buduj swoją drogę przez świat PLPE.",

    beginAdventure:
      "ROZPOCZNIJ PRZYGODĘ",
  },
};

export default pl;