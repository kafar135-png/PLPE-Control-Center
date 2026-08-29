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
    subtitle: "System Operacyjny PolishPepe",
    networkName: "Ethereum",
  },

  dashboard: {
    loading: "Ładowanie Dashboardu...",
    price: "Cena PLPE",
    liquidity: "Płynność",
    marketCap: "Kapitalizacja",
    volume24h: "Wolumen 24H",
    chartTitle: "📈 Rynek PLPE",
chartSubtitle: "Wykres świecowy na żywo",
chartLoading: "Ładowanie wykresu...",
chartError: "Nie można załadować wykresu",
poweredBy: "Dane: PLPE Backend · GeckoTerminal",
  },

  analytics: {
    title: "Analityka",
    loading: "Ładowanie rynku...",
price: " Cena",
liquidity: " Płynność",
marketCap: " Kapitalizacja",
volume24h: " Wolumen 24H",
holderGrowthTitle: "📈 Wzrost Holderów",
holderGrowthSubtitle: "Liczba holderów w czasie rzeczywistym",
current: "Obecnie",
marketHealthTitle: "🧠 Kondycja Rynku",
topHoldersTitle: "👑 Najwięksi Holderzy",
whaleActivityTitle: "🐋 Aktywność Wielorybów",

scanning: "Skanowanie blockchaina...",

marketPressure: "Presja Rynkowa",
largeTrades: "Duże Transakcje",
monitoring: "Monitoring",
lastScan: "Ostatnia Aktualizacja",

highActivity: "Wysoka Aktywność",
mediumActivity: "Średnia Aktywność",
lowActivity: "Niska Aktywność",

buyingPressure: "Presja Kupujących",
sellingPressure: "Presja Sprzedających",
neutral: "Neutralnie",

detected: "Wykryto",

status: "Status",
trend: "Trend",
risk: "Ryzyko",
aiScore: "AI Score",

healthy: "🟢 Silny",
moderate: "🟡 Umiarkowany",
weak: "🔴 Słaby",

bullish: "📈 Wzrostowy",
bearish: "📉 Spadkowy",
liveTradesTitle: "🔥 Transakcje na Żywo",
aiAnalysisTitle: "🧠 PLPE AI",

marketHealth: "Kondycja Rynku",
riskScore: "Ocena Ryzyka",

strongBuy: "Mocny Zakup",
accumulation: "Akumulacja",
highRisk: "Wysokie Ryzyko",

lowLiquidity: "🔴 Niska Płynność",
marketMonitorTitle: "⚡ Monitor Rynku",

connecting: "Łączenie...",

currentPrice: "Aktualna Cena",

connection: "Połączenie",

lastRefresh: "Ostatnie Odświeżenie",
  },
   holderProfile: {
    
      portfolioTimeline: "📈 Historia Portfela",

noTransactions: "Nie znaleziono transakcji.",

buy: "🟢 KUPNO",

sell: "🔴 SPRZEDAŻ",
noWalletSelected: "Nie wybrano portfela",

noWalletDescription:
  "Połącz MetaMask lub wpisz adres portfela powyżej.",

externalWalletAnalysis:
  "Analiza Zewnętrznego Portfela",

connectedWallet: "Połączony Portfel",

analyzedWallet: "Analizowany Portfel",
wallet: "Portfel",

status: "Status",

ready: "🟢 Gotowy",

address: "Adres",

firstBuy: "Pierwszy Zakup",

holdingDays: "Dni Trzymania",
holdings: "Stan Posiadania",

plpeBalance: "Saldo PLPE",

currentValue: "Aktualna Wartość",
ownership: "Udział",

supplyShare: "Udział w Podaży",

transactions: "Transakcje",

lastActivity: "Ostatnia Aktywność",
portfolioAnalytics: "Analiza Portfela",

largestBuy: "Największy Zakup",

largestSell: "Największa Sprzedaż",

portfolioAge: "Wiek Portfela",

activity: "Aktywność",

active: "Aktywny",
portfolioPerformance: "Wyniki Portfela",

currentBalance: "Aktualne Saldo",

totalBought: "Łącznie Kupiono",

totalSold: "Łącznie Sprzedano",

netPosition: "Pozycja Netto",
searchWallet: "Szukaj Portfela",

searchSubtitle:
  "Analizuj dowolny portfel PLPE po adresie.",

analyze: "Analizuj",

myWallet: "Mój Portfel",

invalidWallet:
  "Nieprawidłowy adres portfela Ethereum.",

walletPlaceholder:
  "Wklej adres portfela Ethereum...",
  },

  ai: {
    title: "🤖 PLPE AI",
    loading: "Ładowanie AI...",

    waitingTitle: "Ładowanie...",
    waitingText: "Oczekiwanie na dane rynku...",

    strongBullishTitle: "🚀 Silny trend wzrostowy",
    strongBullishText: "Momentum jest bardzo silne. Kupujący kontrolują rynek.",

    bullishTitle: "🟢 Trend wzrostowy",
    bullishText: "Pozytywny trend z dobrą presją zakupową.",

    strongBearishTitle: "🔴 Silny trend spadkowy",
    strongBearishText: "Wykryto dużą presję sprzedażową.",

    bearishTitle: "🟠 Trend spadkowy",
    bearishText: "Rynek znajduje się pod presją.",

    neutralTitle: "🟡 Neutralnie",
    neutralText: "Cena porusza się w konsolidacji.",

    change24h: "Zmiana 24H",
    liquidity: "Płynność",

    scoreButton: "AI Score (w wersji 2.0)",
  },

  activity: {
    title: "📋 Aktywność na żywo",

    loading: "Ładowanie ostatnich transakcji...",

    buy: "🟢 KUPNO",
    sell: "🔴 SPRZEDAŻ",
    transfer: "🔵 TRANSFER",

    noActivity: "Brak ostatniej aktywności.",

    secondsAgo: "s temu",
    minutesAgo: "m temu",
    hoursAgo: "h temu",
    daysAgo: "d temu",
  },
  about: {

  title: "O PolishPepe",

  projectInformation: "Informacje o Projekcie",

  version: "Wersja",
  network: "Sieć",
  token: "Token",
  supply: "Podaż",
  status: "Status",

  mission: "Misja",

  missionText1:
    "PolishPepe to pierwszy polski ekosystem memecoinów tworzony przez społeczność na Ethereum.",

  missionText2:
    "Naszą wizją jest stworzenie znacznie więcej niż tylko tokena.",

  missionText3:
    "PLPE OS, BOCIAN, analityka AI, narzędzia społeczności oraz przyszłe produkty Web3 są częścią jednego rozwijającego się ekosystemu.",

  officialLinks: "Oficjalne Linki",

  website: "Strona WWW",

  x: "X",

  telegram: "Telegram",

  discord: "Discord",

  smartContract: "Smart Kontrakt",

  copy: "Kopiuj",

  contractCopied: "Kontrakt został skopiowany!",

  copyFailed: "Nie udało się skopiować kontraktu.",

},
  challenge: {
    title: "🏆 MIESIĘCZNY CHALLENGE PLPE",
    phase: "Faza",
    launchPhase: "FAZA STARTOWA",
    rewardPool: "PULA NAGRÓD",
    minimumVolume: "Minimalny wolumen",
    trades: "Transakcje",
    qualified: "Zakwalifikowani",
    wallet: "Portfel",
    volume: "Wolumen",
    entries: "Losy",
    rank: "Miejsce",
    noQualified: "Brak zakwalifikowanych portfeli",
    noQualifiedDescription:
      "Wykonaj transakcję PLPE/WETH o łącznym wolumenie minimum $2.",
    portfolioNotQualified: "Twój portfel nie jest jeszcze zakwalifikowany.",
    portfolioNotQualifiedDescription:
      "Wygeneruj minimum $2 wolumenu PLPE/WETH, aby otrzymać pierwszy los.",
    live: "NA ŻYWO",
    maxEntries: "Maks. 6 losów / portfel",
    onChainVerified: "Zweryfikowano on-chain",
    loading: "Ładowanie challenge...",
    error: "Nie można załadować challenge.",
    buy: "KUPNO",
    sell: "SPRZEDAŻ",
    buyOnly: "TYLKO ZAKUPY",
    qualifiedStatus: "Zakwalifikowany",
    phasePeriod: "Aktualna faza: {start} → {end}",
nextPhase: "🚀 NASTĘPNA FAZA",
nextPhaseDescription:
  "Kolejna faza Challenge rozpocznie się {start} i zakończy {end}. Wolumen i losy zostaną wyzerowane dla nowej fazy.",
  },
};

export default pl;

