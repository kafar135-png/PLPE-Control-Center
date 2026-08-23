export type Language = "en" | "pl";

export const DEFAULT_LANGUAGE: Language = "en";

export const SUPPORTED_LANGUAGES: Language[] = [
  "en",
  "pl",
];

export interface TranslationDictionary {
  common: {
    loading: string;
    live: string;
    connected: string;
    disconnected: string;
    wallet: string;
    network: string;
    price: string;
    language: string;
    search: string;
    save: string;
    cancel: string;
    dashboard: string;
analytics: string;
holderProfile: string;
about: string;
connectWallet: string;
connecting: string;
disconnect: string;
value: string;
share: string;

  };

  topbar: {
    title: string;
    subtitle: string;
    networkName: string;
  };

  dashboard: {
    loading: string;
    price: string;
    liquidity: string;
    marketCap: string;
    volume24h: string;
    chartTitle: string;
chartSubtitle: string;
chartLoading: string;
chartError: string;
poweredBy: string;
  };

  analytics: {
    title: string;
    loading: string;
price: string;
liquidity: string;
marketCap: string;
volume24h: string;
holderGrowthTitle: string;
holderGrowthSubtitle: string;
current: string;
marketHealthTitle: string;
status: string;
trend: string;
risk: string;
aiScore: string;
healthy: string;
moderate: string;
weak: string;
bullish: string;
bearish: string;
topHoldersTitle: string;
whaleActivityTitle: string;
scanning: string;
marketPressure: string;
largeTrades: string;
monitoring: string;
lastScan: string;

highActivity: string;
mediumActivity: string;
lowActivity: string;

buyingPressure: string;
sellingPressure: string;
neutral: string;

detected: string;
liveTradesTitle: string;
aiAnalysisTitle: string;
marketHealth: string;
riskScore: string;

strongBuy: string;
accumulation: string;
highRisk: string;
lowLiquidity: string;
marketMonitorTitle: string;
connecting: string;
currentPrice: string;
connection: string;
lastRefresh: string;
  };

  holderProfile: {
    searchWallet: string;
    searchSubtitle: string;
    analyze: string;
    myWallet: string;
    invalidWallet: string;
    portfolioTimeline: string;
noTransactions: string;
buy: string;
sell: string;
noWalletSelected: string;
noWalletDescription: string;

externalWalletAnalysis: string;

connectedWallet: string;
analyzedWallet: string;
wallet: string;
status: string;
ready: string;
address: string;
firstBuy: string;
holdingDays: string;
holdings: string;
plpeBalance: string;
currentValue: string;
ownership: string;
supplyShare: string;
transactions: string;
lastActivity: string;
portfolioAnalytics: string;
largestBuy: string;
largestSell: string;
portfolioAge: string;
activity: string;
active: string;
portfolioPerformance: string;
currentBalance: string;
totalBought: string;
totalSold: string;
netPosition: string;
walletPlaceholder: string;
  };

  ai: {
    title: string;
    loading: string;

    waitingTitle: string;
    waitingText: string;

    strongBullishTitle: string;
    strongBullishText: string;

    bullishTitle: string;
    bullishText: string;

    strongBearishTitle: string;
    strongBearishText: string;

    bearishTitle: string;
    bearishText: string;

    neutralTitle: string;
    neutralText: string;

    change24h: string;
    liquidity: string;

    scoreButton: string;
  };

  activity: {
    title: string;

    loading: string;

    buy: string;
    sell: string;
    transfer: string;

    noActivity: string;

    secondsAgo: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  };
  about: {
  title: string;

  projectInformation: string;

  version: string;
  network: string;
  token: string;
  supply: string;
  status: string;

  mission: string;

  missionText1: string;
  missionText2: string;
  missionText3: string;

  officialLinks: string;

  website: string;
  x: string;
  telegram: string;
  discord: string;

  smartContract: string;

  copy: string;
  contractCopied: string;
  copyFailed: string;
};
  challenge: {
    title: string;
    phase: string;
    launchPhase: string;
    rewardPool: string;
    minimumVolume: string;
    trades: string;
    qualified: string;
    wallet: string;
    volume: string;
    entries: string;
    rank: string;
    noQualified: string;
    noQualifiedDescription: string;
    portfolioNotQualified: string;
    portfolioNotQualifiedDescription: string;
    live: string;
    maxEntries: string;
    onChainVerified: string;
    loading: string;
    error: string;
    buy: string;
    sell: string;
    buyOnly: string;
    qualifiedStatus: string;
    phasePeriod: string;
nextPhase: string;
nextPhaseDescription: string;
  };
}