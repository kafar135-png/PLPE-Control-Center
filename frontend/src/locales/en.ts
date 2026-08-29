import type { TranslationDictionary } from "../types/language";

const en: TranslationDictionary = {
  common: {
    loading: "Loading...",
    live: "LIVE",
    connected: "Connected",
    disconnected: "Disconnected",
    wallet: "Wallet",
    network: "Network",
    price: "Price",
    language: "Language",
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    dashboard: "Dashboard",
analytics: "Analytics",
holderProfile: "Holder Profile",
about: "About",
connectWallet: "🦊 Connect Wallet",
connecting: "Connecting...",
disconnect: "Disconnect",
value: "Value",
share: "Share",

  },

  topbar: {
    title: "PLPE Dashboard",
    subtitle: "PolishPepe Operating System",
    networkName: "Ethereum",
  },

  dashboard: {
    loading: "Loading Dashboard...",
    price: "PLPE Price",
    liquidity: "Liquidity",
    marketCap: "Market Cap",
    volume24h: "24H Volume",
    chartTitle: "📈 PLPE Market",
chartSubtitle: "Live Candlestick Chart",
chartLoading: "Loading chart...",
chartError: "Cannot load chart",
poweredBy: "Powered by PLPE Backend · GeckoTerminal",
  },

  analytics: {
    title: "Analytics",
    loading: "Loading market...",
price: " Price",
liquidity: " Liquidity",
marketCap: " Market Cap",
volume24h: " 24H Volume",
holderGrowthTitle: "📈 Holder Growth",
holderGrowthSubtitle: "Total holders over time",
current: "Current",
marketHealthTitle: "🧠 Market Health",
topHoldersTitle: "👑 Top Holders",
whaleActivityTitle: "🐋 Whale Activity",

scanning: "Scanning blockchain...",

marketPressure: "Market Pressure",
largeTrades: "Large Trades",
monitoring: "Monitoring",
lastScan: "Last Scan",

highActivity: "High Activity",
mediumActivity: "Medium Activity",
lowActivity: "Low Activity",

buyingPressure: "Buying Pressure",
sellingPressure: "Selling Pressure",
neutral: "Neutral",

detected: "Detected",

status: "Status",
trend: "Trend",
risk: "Risk",
aiScore: "AI Score",

healthy: "🟢 Healthy",
moderate: "🟡 Moderate",
weak: "🔴 Weak",

bullish: "📈 Bullish",
bearish: "📉 Bearish",
liveTradesTitle: "🔥 Live Trades",
aiAnalysisTitle: "🧠 PLPE AI",

marketHealth: "Market Health",
riskScore: "Risk Score",

strongBuy: "Strong Buy",
accumulation: "Accumulation",
highRisk: "High Risk",

lowLiquidity: "🔴 Low Liquidity",
marketMonitorTitle: "⚡ Market Monitor",

connecting: "Connecting...",

currentPrice: "Current Price",

connection: "Connection",

lastRefresh: "Last Refresh",
  },
   holderProfile: {
    
      portfolioTimeline: "📈 Portfolio Timeline",

noTransactions: "No transactions found.",

buy: "🟢 BUY",

sell: "🔴 SELL",
noWalletSelected: "No Wallet Selected",

noWalletDescription:
  "Connect MetaMask or enter a wallet address above.",

externalWalletAnalysis:
  "External Wallet Analysis",

connectedWallet: "Connected Wallet",

analyzedWallet: "Analyzed Wallet",
wallet: "Wallet",

status: "Status",

ready: "🟢 Ready",

address: "Address",

firstBuy: "First Buy",

holdingDays: "Holding Days",
holdings: "Holdings",

plpeBalance: "PLPE Balance",

currentValue: "Current Value",
ownership: "Ownership",

supplyShare: "Supply Share",

transactions: "Transactions",

lastActivity: "Last Activity",
portfolioAnalytics: "Portfolio Analytics",

largestBuy: "Largest Buy",

largestSell: "Largest Sell",

portfolioAge: "Portfolio Age",

activity: "Activity",

active: "Active",
portfolioPerformance: "Portfolio Performance",

currentBalance: "Current Balance",

totalBought: "Total Bought",

totalSold: "Total Sold",

netPosition: "Net Position",
searchWallet: "Search Wallet",
searchSubtitle: "Analyze any PLPE holder by wallet address.",
analyze: "Analyze",
myWallet: "My Wallet",
invalidWallet: "Invalid Ethereum wallet address.",
walletPlaceholder: "Paste Ethereum wallet address...",
  },

  ai: {
    title: "🤖 PLPE AI",
    loading: "Loading AI...",

    waitingTitle: "Loading...",
    waitingText: "Waiting for market data...",

    strongBullishTitle: "🚀 Strong Bullish",
    strongBullishText: "Momentum is very strong. Buyers are in control.",

    bullishTitle: "🟢 Bullish",
    bullishText: "Positive trend with healthy buying pressure.",

    strongBearishTitle: "🔴 Strong Bearish",
    strongBearishText: "Heavy selling pressure detected.",

    bearishTitle: "🟠 Bearish",
    bearishText: "Market is currently under pressure.",

    neutralTitle: "🟡 Neutral",
    neutralText: "Price is moving sideways.",

    change24h: "24H Change",
    liquidity: "Liquidity",

    scoreButton: "AI Score (Coming in v2)",
  },

  activity: {
    title: "📋 Live Activity",

    loading: "Loading latest transactions...",

    buy: "🟢 BUY",
    sell: "🔴 SELL",
    transfer: "🔵 TRANSFER",

    noActivity: "No recent activity.",

    secondsAgo: "s ago",
    minutesAgo: "m ago",
    hoursAgo: "h ago",
    daysAgo: "d ago",
  },
  about: {

  title: "About PolishPepe",

  projectInformation: "Project Information",

  version: "Version",
  network: "Network",
  token: "Token",
  supply: "Supply",
  status: "Status",

  mission: "Mission",

  missionText1:
    "PolishPepe is the first Polish community-driven meme ecosystem built on Ethereum.",

  missionText2:
    "Our vision is to create much more than a token.",

  missionText3:
    "PLPE OS, BOCIAN, AI-powered analytics, community tools and future Web3 products are all part of one growing ecosystem.",

  officialLinks: "Official Links",

  website: "Website",

  x: "X",

  telegram: "Telegram",

  discord: "Discord",

  smartContract: "Smart Contract",

  copy: "Copy",

  contractCopied: "Contract copied!",

  copyFailed: "Copy failed.",

},
  challenge: {
    title: "🏆 PLPE MONTHLY TRADING CHALLENGE",
    phase: "Phase",
    launchPhase: "LAUNCH PHASE",
    rewardPool: "REWARD POOL",
    minimumVolume: "Minimum Volume",
    trades: "Trades",
    qualified: "Qualified",
    wallet: "Wallet",
    volume: "Volume",
    entries: "Entries",
    rank: "Rank",
    noQualified: "No qualified portfolios",
    noQualifiedDescription:
      "Make a PLPE/WETH transaction with a minimum total volume of $2.",
    portfolioNotQualified: "Your portfolio is not qualified yet.",
    portfolioNotQualifiedDescription:
      "Generate at least $2 in PLPE/WETH volume to receive your first entry.",
    live: "LIVE",
    maxEntries: "Max. 6 entries / wallet",
    onChainVerified: "On-chain verified",
    loading: "Loading challenge...",
    error: "Unable to load challenge.",
    buy: "BUY",
    sell: "SELL",
    buyOnly: "BUY ONLY",
    qualifiedStatus: "Qualified",
    phasePeriod: "Current phase: {start} → {end}",
nextPhase: "🚀 NEXT PHASE",
nextPhaseDescription:
  "The next Challenge phase starts on {start} and ends on {end}. Your volume and entries will reset for the new phase.",
  },
};

export default en;
