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

    holderGrowthTitle:
      "📈 Wzrost holderów",

    holderGrowthSubtitle:
      "Łączna liczba holderów w czasie",

    current: "Aktualnie",

    marketHealthTitle:
      "🧠 Kondycja rynku",

    topHoldersTitle:
      "👑 Najwięksi holderzy",

    whaleActivityTitle:
      "🐋 Aktywność wielorybów",

    scanning:
      "Skanowanie blockchaina...",

    marketPressure:
      "Presja rynku",

    largeTrades:
      "Duże transakcje",

    monitoring:
      "Monitorowanie",

    lastScan:
      "Ostatni skan",

    highActivity:
      "Wysoka aktywność",

    mediumActivity:
      "Średnia aktywność",

    lowActivity:
      "Niska aktywność",

    buyingPressure:
      "Presja kupujących",

    sellingPressure:
      "Presja sprzedających",

    neutral:
      "Neutralnie",

    detected:
      "Wykryto",

    status:
      "Status",

    trend:
      "Trend",

    risk:
      "Ryzyko",

    aiScore:
      "Wynik AI",

    healthy:
      "🟢 Zdrowy",

    moderate:
      "🟡 Umiarkowany",

    weak:
      "🔴 Słaby",

    bullish:
      "📈 Wzrostowy",

    bearish:
      "📉 Spadkowy",

    liveTradesTitle:
      "🔥 Transakcje na żywo",

    aiAnalysisTitle:
      "🧠 PLPE AI",

    marketHealth:
      "Kondycja rynku",

    riskScore:
      "Poziom ryzyka",

    strongBuy:
      "Silny zakup",

    accumulation:
      "Akumulacja",

    highRisk:
      "Wysokie ryzyko",

    lowLiquidity:
      "🔴 Niska płynność",

    marketMonitorTitle:
      "⚡ Monitor rynku",

    connecting:
      "Łączenie...",

    currentPrice:
      "Aktualna cena",

    connection:
      "Połączenie",

    lastRefresh:
      "Ostatnie odświeżenie",
  },

  holderProfile: {
    portfolioTimeline:
      "📈 Historia portfela",

    noTransactions:
      "Nie znaleziono transakcji.",

    buy:
      "🟢 KUPNO",

    sell:
      "🔴 SPRZEDAŻ",

    noWalletSelected:
      "Nie wybrano portfela",

    noWalletDescription:
      "Połącz MetaMask lub wpisz adres portfela powyżej.",

    externalWalletAnalysis:
      "Analiza zewnętrznego portfela",

    connectedWallet:
      "Połączony portfel",

    analyzedWallet:
      "Analizowany portfel",

    wallet:
      "Portfel",

    status:
      "Status",

    ready:
      "🟢 Gotowy",

    address:
      "Adres",

    firstBuy:
      "Pierwszy zakup",

    holdingDays:
      "Dni posiadania",

    holdings:
      "Posiadane środki",

    plpeBalance:
      "Saldo PLPE",

    currentValue:
      "Aktualna wartość",

    ownership:
      "Udział",

    supplyShare:
      "Udział w podaży",

    transactions:
      "Transakcje",

    lastActivity:
      "Ostatnia aktywność",

    portfolioAnalytics:
      "Analityka portfela",

    largestBuy:
      "Największy zakup",

    largestSell:
      "Największa sprzedaż",

    portfolioAge:
      "Wiek portfela",

    activity:
      "Aktywność",

    active:
      "Aktywny",

    portfolioPerformance:
      "Wyniki portfela",

    currentBalance:
      "Aktualne saldo",

    totalBought:
      "Łącznie kupiono",

    totalSold:
      "Łącznie sprzedano",

    netPosition:
      "Pozycja netto",

    searchWallet:
      "Szukaj portfela",

    searchSubtitle:
      "Analizuj dowolnego holdera PLPE po adresie portfela.",

    analyze:
      "Analizuj",

    myWallet:
      "Mój portfel",

    invalidWallet:
      "Nieprawidłowy adres portfela Ethereum.",

    walletPlaceholder:
      "Wklej adres portfela Ethereum...",
  },

  ai: {
    title:
      "🤖 PLPE AI",

    loading:
      "Ładowanie AI...",

    waitingTitle:
      "Ładowanie...",

    waitingText:
      "Oczekiwanie na dane rynkowe...",

    strongBullishTitle:
      "🚀 Silnie wzrostowy",

    strongBullishText:
      "Momentum jest bardzo silne. Kupujący kontrolują rynek.",

    bullishTitle:
      "🟢 Wzrostowy",

    bullishText:
      "Pozytywny trend i zdrowa presja kupujących.",

    strongBearishTitle:
      "🔴 Silnie spadkowy",

    strongBearishText:
      "Wykryto silną presję sprzedażową.",

    bearishTitle:
      "🟠 Spadkowy",

    bearishText:
      "Rynek znajduje się obecnie pod presją.",

    neutralTitle:
      "🟡 Neutralny",

    neutralText:
      "Cena porusza się bokiem.",

    change24h:
      "Zmiana 24H",

    liquidity:
      "Płynność",

    scoreButton:
      "Wynik AI (wkrótce w v2)",
  },

  activity: {
    title:
      "📋 Aktywność na żywo",

    loading:
      "Ładowanie najnowszych transakcji...",

    buy:
      "🟢 KUPNO",

    sell:
      "🔴 SPRZEDAŻ",

    transfer:
      "🔵 TRANSFER",

    noActivity:
      "Brak ostatniej aktywności.",

    secondsAgo:
      "s temu",

    minutesAgo:
      "min temu",

    hoursAgo:
      "godz. temu",

    daysAgo:
      "dni temu",
  },

  about: {
    title:
      "O PolishPepe",

    projectInformation:
      "Informacje o projekcie",

    version:
      "Wersja",

    network:
      "Sieć",

    token:
      "Token",

    supply:
      "Podaż",

    status:
      "Status",

    mission:
      "Misja",

    missionText1:
      "PolishPepe to pierwszy polski społecznościowy ekosystem memowy zbudowany na Ethereum.",

    missionText2:
      "Naszą wizją jest stworzenie czegoś znacznie większego niż sam token.",

    missionText3:
      "PLPE OS, BOCIAN, analityka wspierana przez AI, narzędzia społecznościowe i przyszłe produkty Web3 są częścią jednego rozwijającego się ekosystemu.",

    officialLinks:
      "Oficjalne linki",

    website:
      "Strona internetowa",

    x:
      "X",

    telegram:
      "Telegram",

    discord:
      "Discord",

    smartContract:
      "Smart Contract",

    copy:
      "Kopiuj",

    contractCopied:
      "Skopiowano kontrakt!",

    copyFailed:
      "Nie udało się skopiować.",
  },

  challenge: {
    monthlyTradingChallenge:
      "MIESIĘCZNE WYZWANIE TRADINGOWE",

    monthlyChallenge:
      "MIESIĘCZNE WYZWANIE",

    tradePlpe:
      "HANDLUJ PLPE",

    title:
      "MIESIĘCZNE WYZWANIE TRADINGOWE",

    phase:
      "FAZA",

    launchPhase:
      "FAZA STARTOWA",

    rewardPool:
      "Pula nagród",

    minimumVolume:
      "Minimalny wolumen",

    trades:
      "Transakcje",

    qualified:
      "Zakwalifikowani",

    wallet:
      "Portfel",

    volume:
      "Wolumen",

    entries:
      "Losy",

    rank:
      "Miejsce",

    noQualified:
      "Brak zakwalifikowanych portfeli",

    noQualifiedDescription:
      "Wykonaj transakcję PLPE/WETH o minimalnym łącznym wolumenie $2.",

    portfolioNotQualified:
      "Twój portfel nie jest jeszcze zakwalifikowany.",

    portfolioNotQualifiedDescription:
      "Wygeneruj co najmniej $2 wolumenu PLPE/WETH, aby otrzymać pierwszy los.",

    live:
      "NA ŻYWO",

    maxEntries:
      "Maks. 6 losów / portfel",

    onChainVerified:
      "Zweryfikowane on-chain",

    loading:
      "Ładowanie wyzwania...",

    error:
      "Nie udało się załadować wyzwania.",

    buy:
      "KUPNO",

    sell:
      "SPRZEDAŻ",

    buyOnly:
      "TYLKO KUPNO",

    qualifiedStatus:
      "Zakwalifikowany",

    phasePeriod:
      "Aktualna faza: {start} → {end}",

    nextPhase:
      "🚀 NASTĘPNA FAZA",

    nextPhaseDescription:
      "Następna faza Challenge rozpoczyna się {start} i kończy {end}. Wolumen i losy zostaną wyzerowane dla nowej fazy.",

    entryRules:
      "ZASADY LOSÓW",

    entryRulesDescription:
      "BUY ≥ $2 = 1 LOS · BUY < $2 = 0 LOSÓW · SELL = 0 LOSÓW · MAKS. 6 LOSÓW / PORTFEL",

    pairMinimumVolume:
      "Minimalny wolumen: $2",

    phaseLabel:
      "FAZA",
  },
};

export default pl;