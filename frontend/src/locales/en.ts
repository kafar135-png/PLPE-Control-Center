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
    installApp: "Install App",
    installAppManual:
      "Use your browser menu and choose Install app or Add to Home screen.",
    installAppIos:
      "Tap Share and then choose Add to Home Screen.",
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
    poweredBy:
      "Powered by PLPE Backend · GeckoTerminal",
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
    externalWalletAnalysis: "External Wallet Analysis",
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
    searchSubtitle:
      "Analyze any PLPE holder by wallet address.",
    analyze: "Analyze",
    myWallet: "My Wallet",
    invalidWallet: "Invalid Ethereum wallet address.",
    walletPlaceholder:
      "Paste Ethereum wallet address...",
  },

  ai: {
    title: "🤖 PLPE AI",
    loading: "Loading AI...",
    waitingTitle: "Loading...",
    waitingText: "Waiting for market data...",
    strongBullishTitle: "🚀 Strong Bullish",
    strongBullishText:
      "Momentum is very strong. Buyers are in control.",
    bullishTitle: "🟢 Bullish",
    bullishText:
      "Positive trend with healthy buying pressure.",
    strongBearishTitle: "🔴 Strong Bearish",
    strongBearishText:
      "Heavy selling pressure detected.",
    bearishTitle: "🟠 Bearish",
    bearishText:
      "Market is currently under pressure.",
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
    monthlyTradingChallenge:
      "MONTHLY TRADING CHALLENGE",
    monthlyChallenge:
      "MONTHLY CHALLENGE",
    tradePlpe:
      "TRADE PLPE",
    title:
      "MONTHLY TRADING CHALLENGE",
    phase:
      "PHASE",
    launchPhase:
      "LAUNCH PHASE",
    rewardPool:
      "Reward Pool",
    minimumVolume:
      "Minimum Volume",
    trades:
      "Trades",
    qualified:
      "Qualified",
    wallet:
      "Wallet",
    volume:
      "Volume",
    entries:
      "Entries",
    rank:
      "Rank",
    noQualified:
      "No qualified portfolios",
    noQualifiedDescription:
      "Make a PLPE/WETH transaction with a minimum total volume of $2.",
    portfolioNotQualified:
      "Your portfolio is not qualified yet.",
    portfolioNotQualifiedDescription:
      "Generate at least $2 in PLPE/WETH volume to receive your first entry.",
    live:
      "LIVE",
    maxEntries:
      "Max. 6 entries / wallet",
    onChainVerified:
      "On-chain verified",
    loading:
      "Loading challenge...",
    error:
      "Unable to load challenge.",
    buy:
      "BUY",
    sell:
      "SELL",
    buyOnly:
      "BUY ONLY",
    qualifiedStatus:
      "Qualified",
    phasePeriod:
      "Current phase: {start} → {end}",
    nextPhase:
      "🚀 NEXT PHASE",
    nextPhaseDescription:
      "The next Challenge phase starts on {start} and ends on {end}. Your volume and entries will reset for the new phase.",
    entryRules:
      "ENTRY RULES",
    entryRulesDescription:
      "BUY ≥ $2 = 1 ENTRY · BUY < $2 = 0 ENTRY · SELL = 0 ENTRY · MAX 6 ENTRIES / WALLET",
    pairMinimumVolume:
      "Minimum volume: $2",
    phaseLabel:
      "PHASE",
  },

  game: {
    arena: "PLPE Arena",
    universe: "POLISHPEPE UNIVERSE",
    season1: "Season 1",
    chapter1Awakening: "Chapter 1 — Awakening",

    memeEnergy: "Meme Energy",
    relics: "Relics",
    intel: "Intel",

    mainHero: "Main Hero",
    mentor: "Mentor",
    level: "Level",
    rank: "Rank",
    xp: "XP",

    polishPepe: "PolishPepe",
    bocian: "Bocian",
    storkGuidanceUnlocked:
      "Stork Guidance unlocked",

    mainHub: "MAIN HUB",
    storkMonastery: "Stork Monastery",
    monasteryDescription:
      "Upgrade the monastery to unlock new chapters, buildings and PolishPepe progression.",

    trainingHall: "Training Hall",
    trainingHallDescription:
      "Train and improve heroes.",

    cardForge: "Card Forge",
    cardForgeDescription:
      "Upgrade cards and abilities.",

    comicArchive: "Comic Archive",
    comicArchiveDescription:
      "Codes, secrets and hidden knowledge.",

    plpeVault: "PLPE Vault",
    plpeVaultDescription:
      "Holder rewards and season bonuses.",

    arenaBuilding: "Arena",
    arenaDescription:
      "Story battles and bosses.",

    expeditions: "Expeditions",
    expeditionsDescription:
      "Send heroes on timed missions.",

    locked: "LOCKED",

    currentStory: "CURRENT STORY",
    chapter1Description:
      "Enter the monastery and begin the PolishPepe journey.",
    startChapter: "START CHAPTER",
        quest1Title: "Quest 01 — Enter the Monastery",
    quest1Objective:
      "Enter the Stork Monastery and discover what is waiting inside.",

    storyIntroTitle: "The Awakening",

    storyIntroBocian1:
      "If you made it here, then this world is not dead yet.",

    storyIntroPolishPepe1:
      "And you are supposed to tell me what is happening here?",

    storyIntroBocian2:
      "In time. First, enter the monastery. There is something you need to see.",

    continue: "CONTINUE",
    enterMonastery: "ENTER MONASTERY",
    questCompleted: "QUEST COMPLETED",
        quest2Title: "Quest 02 — First Signal",
    quest2Objective:
      "Investigate the strange signal coming from the Broken Market Gate.",

    firstSignalTitle: "First Signal",

    firstSignalBocian1:
      "Something is moving beyond the monastery walls. The signal is weak, but it is getting closer.",

    firstSignalPolishPepe1:
      "Then we stop waiting and find out what it is.",

    investigate: "INVESTIGATE",

    battle: "BATTLE",
    yourTurn: "YOUR TURN",
    enemyTurn: "ENEMY TURN",

    attack: "ATTACK",
    ability: "ABILITY",
    defend: "DEFEND",

    victory: "VICTORY",
    defeat: "DEFEAT",
    reward: "REWARD",

    bearScout: "Bear Scout",

    hp: "HP",
    damage: "Damage",
        prologueText1:
      "After many months of wandering, PolishPepe still did not know who he was or why he had awakened in a world he could not remember.",

    prologueText2:
      "Only fragments remained — strange images, unknown symbols and the feeling that somewhere there was a place he had to find.",

    prologueText3:
      "One day, high in the mountains, something appeared through the mist...",

    scene2Narrator:
      "For the first time in months, PolishPepe saw a place that somehow felt familiar.",

    scene2PolishPepe:
      "I don't know why... but I feel like I've been here before.",

    goToMonastery:
      "GO TO THE MONASTERY",

    scene3Bocian1:
      "Took you long enough.",

    scene3PolishPepe1:
      "You know me?",

    scene3Bocian2:
      "Let's say I know more about you than you know about yourself.",

    scene3PolishPepe2:
      "That won't be difficult. I barely remember anything.",

    scene3Bocian3:
      "I noticed. Come in. If you really are who I think you are, we have work to do.",

    scene4PolishPepe1:
      "What is this place?",

    scene4Bocian1:
      "Once, it was much larger. The world around us is weakening. Some places disappeared. Others were forgotten.",

    scene4PolishPepe2:
      "And you stayed here?",

    scene4Bocian2:
      "Someone had to protect what was left.",

    scene5Bocian1:
      "If you want to recover what you lost, strength alone will not be enough.",

    scene5PolishPepe1:
      "Then what do I need?",

    scene5Bocian2:
      "Knowledge. Discipline. And the right allies.",

    scene5PolishPepe2:
      "Sounds like a long plan.",

    scene5Bocian3:
      "Good. Short plans usually end badly.",

    scene5PolishPepe3:
      "And those symbols?",

    scene5Bocian4:
      "There are things even I cannot simply tell you. Some answers must be found on your own.",

    scene6Bocian1:
      "Wait.",

    scene6PolishPepe1:
      "What?",

    scene6Bocian2:
      "Someone is outside the walls.",

    scene6PolishPepe2:
      "A friend?",

    scene6Bocian3:
      "If it were a friend, they would not be trying to approach unnoticed.",

    scene6Bocian4:
      "Come with me.",

    scene7Bear1:
      "So someone still lives here after all.",

    scene7PolishPepe1:
      "Looks like you got the wrong address.",

    scene7Bocian1:
      "Pepe.",

    scene7PolishPepe2:
      "What?",

    scene7Bocian2:
      "Now you can stop talking.",

    defendMonastery:
      "DEFEND THE MONASTERY",

          welcomeTitle: "Welcome to the PolishPepe Universe",

    welcomeText1:
      "A world of stories, battles, secrets and characters awaits you.",

    welcomeText2:
      "Grow PolishPepe, uncover Bocian's knowledge and build your path through the PLPE world.",

    beginAdventure:
      "BEGIN ADVENTURE",
  },
};

export default en;