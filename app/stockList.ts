export const stockList = [
  // --- 🌍 ETF MONDIALI (ALL-WORLD & STRATEGICI) ---
  { label: "Vanguard FTSE All-World (Acc) - Il Re", ticker: "VWCE.DE", isin: "IE00BK5BQT80" },
  { label: "Vanguard FTSE All-World (Dist)", ticker: "VGWL.DE", isin: "IE00B3RBWM25" },
  { label: "iShares Core MSCI World (Acc)", ticker: "SWDA.MI", isin: "IE00B4L5Y983" },
  { label: "iShares MSCI ACWI (All Country)", ticker: "IUSQ.DE", isin: "IE00B6R52259" },
  { label: "Xtrackers MSCI World", ticker: "XDWD.DE", isin: "IE00BJ0KDQ92" },
  { label: "Amundi MSCI World", ticker: "CW8.PA", isin: "LU1681043599" },
  
  // --- 📈 ETF STRATEGICI & BILANCIATI (LIFESTRATEGY) ---
  { label: "Vanguard LifeStrategy 80% Equity", ticker: "VNGA80.MI", isin: "IE00BMVB5R75" },
  { label: "Vanguard LifeStrategy 60% Equity", ticker: "VNGA60.MI", isin: "IE00BMVB5P51" },
  { label: "Vanguard LifeStrategy 40% Equity", ticker: "VNGA40.MI", isin: "IE00BMVB5M21" },
  { label: "Vanguard High Dividend Yield", ticker: "VHYL.MI", isin: "IE00B8GKDB10" },
  { label: "iShares World Small Cap (Piccole Aziende)", ticker: "IUSN.DE", isin: "IE00BF4RFH31" },
  { label: "iShares Core EM IMI (Emergenti)", ticker: "EIMI.MI", isin: "IE00BKM4GZ66" },

  // --- 💧 SETTORE IDRICO (ACQUA) ---
  { label: "iShares Global Water", ticker: "IH2O.MI", isin: "IE00B1TXK627" },
  { label: "Lyxor World Water", ticker: "WAT.MI", isin: "FR0010527275" },
  { label: "Invesco Water Resources (USA)", ticker: "PHO", isin: "US46137F1003" },
  { label: "Xylem Inc. (Leader Tecnologie Acqua)", ticker: "XYL", isin: "US98419M1009" },
  { label: "American Water Works", ticker: "AWK", isin: "US0304201033" },

  // --- 🥇 ORO, ARGENTO & MATERIE PRIME ---
  { label: "WisdomTree Physical Gold (Oro Fisico)", ticker: "PHAU.MI", isin: "JE00B1VS3770" },
  { label: "iShares Physical Gold", ticker: "IGLN.L", isin: "IE00B4ND3602" },
  { label: "WisdomTree Physical Silver (Argento)", ticker: "PHAG.MI", isin: "JE00B1VS3364" },
  { label: "WisdomTree WTI Crude Oil (Petrolio)", ticker: "CRUD.MI", isin: "GB00B15KXV33" },
  { label: "Rio Tinto (Minerario)", ticker: "RIO.L", isin: "GB0007188757" },
  { label: "Glencore (Commodities Trading)", ticker: "GLEN.L", isin: "JE00B4T3BW64" },

  // --- 🇺🇸 ETF USA & TECNOLOGIA ---
  { label: "Vanguard S&P 500 (VOO)", ticker: "VOO", isin: "US9229083632" },
  { label: "iShares Core S&P 500 (IVV)", ticker: "IVV", isin: "US4642872000" },
  { label: "Invesco Nasdaq 100 (Tech)", ticker: "EQQQ.MI", isin: "IE0032077012" },
  { label: "VanEck Semiconductor (Chip)", ticker: "SMH", isin: "US92189F6768" },
  { label: "iShares Global Clean Energy", ticker: "INRG.MI", isin: "IE00B1XNHC34" },
  { label: "iShares Automation & Robotics", ticker: "RBOT.MI", isin: "IE00BYZK4552" },
  { label: "L&G Cyber Security", ticker: "ISPY.MI", isin: "IE00BYPLS672" },

  // --- 🇪🇺 ETF EUROPA ---
  { label: "iShares Core STOXX Europe 600", ticker: "MEUD.PA", isin: "DE0002635307" },
  { label: "Vanguard FTSE Developed Europe", ticker: "VEUR.AS", isin: "IE00B945VV12" },
  { label: "BNP Paribas CAC 40 (Francia)", ticker: "C40.PA", isin: "FR0010150458" },
  { label: "iShares Core DAX (Germania)", ticker: "DAXEX.DE", isin: "DE0005933931" },

  // --- 🚀 BIG TECH (MAGNIFICENT 7) ---
  { label: "NVIDIA Corp.", ticker: "NVDA", isin: "US67066G1040" },
  { label: "Apple Inc.", ticker: "AAPL", isin: "US0378331005" },
  { label: "Microsoft Corp.", ticker: "MSFT", isin: "US5949181045" },
  { label: "Amazon", ticker: "AMZN", isin: "US0231351067" },
  { label: "Google (Alphabet)", ticker: "GOOGL", isin: "US02079K3059" },
  { label: "Meta (Facebook)", ticker: "META", isin: "US30303M1027" },
  { label: "Tesla", ticker: "TSLA", isin: "US88160R1014" },
  { label: "Palantir", ticker: "PLTR", isin: "US69608A1088" },

  // --- 🇮🇹 ITALIA (I Migliori) ---
  { label: "Generali Assicurazioni", ticker: "G.MI", isin: "IT0000062072" },
  { label: "Ferrari", ticker: "RACE.MI", isin: "NL0011585146" },
  { label: "Intesa Sanpaolo", ticker: "ISP.MI", isin: "IT0000072618" },
  { label: "Enel", ticker: "ENEL.MI", isin: "IT0003128367" },
  { label: "Eni", ticker: "ENI.MI", isin: "IT0003132476" },
  { label: "UniCredit", ticker: "UCG.MI", isin: "IT0004781412" },
  { label: "Stellantis", ticker: "STLAM.MI", isin: "NL00150001Q9" },
  { label: "Leonardo", ticker: "LDO.MI", isin: "IT0003856405" },
  { label: "Moncler", ticker: "MONC.MI", isin: "IT0004965148" },

  // --- ₿ CRYPTO ---
  { label: "Bitcoin USD", ticker: "BTC-USD", isin: "CRYPTO-BTC" },
  { label: "Ethereum USD", ticker: "ETH-USD", isin: "CRYPTO-ETH" },
  { label: "Solana USD", ticker: "SOL-USD", isin: "CRYPTO-SOL" },
];