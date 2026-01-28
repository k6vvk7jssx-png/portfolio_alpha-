export const stockList = [
  // --- 🇺🇸 BIG TECH & AI (Magnificent 7) ---
  { label: "Apple Inc.", ticker: "AAPL", type: "Equity", category: "Tech", keywords: "iphone mac tech telefono" },
  { label: "NVIDIA Corp.", ticker: "NVDA", type: "Equity", category: "Tech", keywords: "ai chip intelligenza artificiale schede video" },
  { label: "Microsoft", ticker: "MSFT", type: "Equity", category: "Tech", keywords: "windows office cloud azure ai" },
  { label: "Amazon", ticker: "AMZN", type: "Equity", category: "Tech", keywords: "ecommerce cloud aws shopping" },
  { label: "Google (Alphabet)", ticker: "GOOGL", type: "Equity", category: "Tech", keywords: "ricerca youtube android ads" },
  { label: "Meta (Facebook)", ticker: "META", type: "Equity", category: "Tech", keywords: "social instagram whatsapp vr" },
  { label: "Tesla", ticker: "TSLA", type: "Equity", category: "Auto", keywords: "auto elettrica ev elon musk" },
  { label: "Palantir", ticker: "PLTR", type: "Equity", category: "Tech", keywords: "data ai difesa software" },
  { label: "Netflix", ticker: "NFLX", type: "Equity", category: "Tech", keywords: "streaming film serie tv" },
  { label: "AMD", ticker: "AMD", type: "Equity", category: "Tech", keywords: "chip processori ryzen" },
  { label: "Intel", ticker: "INTC", type: "Equity", category: "Tech", keywords: "chip processori" },
  { label: "Salesforce", ticker: "CRM", type: "Equity", category: "Tech", keywords: "software crm cloud" },
  { label: "Adobe", ticker: "ADBE", type: "Equity", category: "Tech", keywords: "photoshop creative cloud" },
  { label: "Spotify", ticker: "SPOT", type: "Equity", category: "Tech", keywords: "musica streaming audio" },
  { label: "Uber", ticker: "UBER", type: "Equity", category: "Tech", keywords: "taxi trasporti food" },
  { label: "Airbnb", ticker: "ABNB", type: "Equity", category: "Tech", keywords: "viaggi case vacanze" },

  // --- 🇮🇹 ITALIA (I Campioni) ---
  { label: "Ferrari", ticker: "RACE.MI", type: "Equity", category: "Auto", keywords: "auto lusso f1 italia rossa" },
  { label: "Intesa Sanpaolo", ticker: "ISP.MI", type: "Equity", category: "Finance", keywords: "banca italia dividendi" },
  { label: "UniCredit", ticker: "UCG.MI", type: "Equity", category: "Finance", keywords: "banca italia" },
  { label: "Enel", ticker: "ENEL.MI", type: "Equity", category: "Energy", keywords: "energia elettricità green italia" },
  { label: "Eni", ticker: "ENI.MI", type: "Equity", category: "Energy", keywords: "petrolio gas energia cane sei zampe" },
  { label: "Stellantis", ticker: "STLAM.MI", type: "Equity", category: "Auto", keywords: "fiat auto jeep peugeot" },
  { label: "Leonardo", ticker: "LDO.MI", type: "Equity", category: "Defense", keywords: "difesa aerei militare cybersecurity" },
  { label: "Generali", ticker: "G.MI", type: "Equity", category: "Finance", keywords: "assicurazioni leone trieste" },
  { label: "Moncler", ticker: "MONC.MI", type: "Equity", category: "Luxury", keywords: "moda piumini lusso" },
  { label: "Brunello Cucinelli", ticker: "BC.MI", type: "Equity", category: "Luxury", keywords: "moda cachemire lusso" },
  { label: "Poste Italiane", ticker: "PST.MI", type: "Equity", category: "Finance", keywords: "poste logistica risparmio" },
  { label: "Terna", ticker: "TRN.MI", type: "Equity", category: "Energy", keywords: "rete elettrica infrastrutture" },
  { label: "Snam", ticker: "SRG.MI", type: "Equity", category: "Energy", keywords: "gas infrastrutture" },
  { label: "Mediobanca", ticker: "MB.MI", type: "Equity", category: "Finance", keywords: "banca investimenti" },
  { label: "Prysmian", ticker: "PRY.MI", type: "Equity", category: "Ind", keywords: "cavi fibra ottica industria" },
  { label: "Campari", ticker: "CPR.MI", type: "Equity", category: "Food", keywords: "aperitivo bevande alcol" },

  // --- 💧 ETF TEMATICI (Acqua, Cyber, Green) ---
  { label: "iShares Global Water (Acqua)", ticker: "IH2O.MI", type: "ETF", category: "Water", keywords: "acqua water idrico risorse blu" },
  { label: "Lyxor World Water", ticker: "WAT.MI", type: "ETF", category: "Water", keywords: "acqua water risorse idriche" },
  { label: "L&G Cyber Security", ticker: "ISPY.MI", type: "ETF", category: "Tech", keywords: "hacker sicurezza informatica cyber" },
  { label: "iShares Global Clean Energy", ticker: "INRG.MI", type: "ETF", category: "Energy", keywords: "energia pulita rinnovabili sole vento" },
  { label: "VanEck Semiconductor", ticker: "SMH", type: "ETF", category: "Tech", keywords: "chip semiconduttori tecnologia" },
  { label: "iShares Automation & Robotics", ticker: "RBOT.MI", type: "ETF", category: "Tech", keywords: "robot ai automazione" },
  { label: "Global Uranium", ticker: "URNM.L", type: "ETF", category: "Energy", keywords: "uranio nucleare energia" },

  // --- 🌍 ETF CORE (Mondiali & S&P) ---
  { label: "Vanguard S&P 500 (USA)", ticker: "VOO", type: "ETF", category: "USA", keywords: "america usa 500 aziende warren buffett" },
  { label: "Vanguard FTSE All-World (Mondo)", ticker: "VWCE.DE", type: "ETF", category: "World", keywords: "mondo globale diversificazione pac" },
  { label: "iShares Core MSCI World", ticker: "SWDA.MI", type: "ETF", category: "World", keywords: "mondo sviluppato msci" },
  { label: "Invesco QQQ (Nasdaq 100)", ticker: "QQQ", type: "ETF", category: "Tech", keywords: "tech usa nasdaq crescita" },
  { label: "Vanguard LifeStrategy 80%", ticker: "VNGA80.MI", type: "ETF", category: "World", keywords: "bilanciato lifestrategy 80/20" },
  { label: "Vanguard LifeStrategy 60%", ticker: "VNGA60.MI", type: "ETF", category: "World", keywords: "bilanciato lifestrategy 60/40" },
  { label: "iShares Core Emerging Markets", ticker: "EIMI.MI", type: "ETF", category: "World", keywords: "paesi emergenti cina india" },

  // --- ₿ CRYPTO & BLOCKCHAIN ---
  { label: "Bitcoin", ticker: "BTC-USD", type: "Crypto", category: "Crypto", keywords: "crypto oro digitale blockchain satoshi" },
  { label: "Ethereum", ticker: "ETH-USD", type: "Crypto", category: "Crypto", keywords: "crypto smart contract defi vitalik" },
  { label: "Solana", ticker: "SOL-USD", type: "Crypto", category: "Crypto", keywords: "crypto veloce nft" },
  { label: "Ripple (XRP)", ticker: "XRP-USD", type: "Crypto", category: "Crypto", keywords: "crypto banche pagamenti" },
  { label: "Cardano", ticker: "ADA-USD", type: "Crypto", category: "Crypto", keywords: "crypto ada" },
  { label: "Coinbase", ticker: "COIN", type: "Equity", category: "Finance", keywords: "crypto exchange azioni" },
  { label: "MicroStrategy", ticker: "MSTR", type: "Equity", category: "Tech", keywords: "bitcoin azioni saylor" },

  // --- 🥇 COMMODITIES (Oro, Petrolio) ---
  { label: "Oro Fisico (Gold ETC)", ticker: "IGLN.L", type: "ETF", category: "Gold", keywords: "oro gold rifugio metallo prezioso" },
  { label: "Argento Fisico (Silver ETC)", ticker: "PHAG.MI", type: "ETF", category: "Gold", keywords: "argento silver metallo" },
  { label: "Petrolio WTI", ticker: "CRUD.MI", type: "ETF", category: "Energy", keywords: "petrolio oil energia" },
  { label: "Rio Tinto", ticker: "RIO.L", type: "Equity", category: "Ind", keywords: "miniere metalli risorse" },

  // --- 🛍️ CONSUMER, LUSSO & ALTRO ---
  { label: "LVMH (Louis Vuitton)", ticker: "MC.PA", type: "Equity", category: "Luxury", keywords: "lusso moda borse francia" },
  { label: "Hermès", ticker: "RMS.PA", type: "Equity", category: "Luxury", keywords: "lusso birkin francia" },
  { label: "Coca-Cola", ticker: "KO", type: "Equity", category: "Food", keywords: "bevande dividendi buffet" },
  { label: "PepsiCo", ticker: "PEP", type: "Equity", category: "Food", keywords: "bevande patatine snack" },
  { label: "McDonald's", ticker: "MCD", type: "Equity", category: "Food", keywords: "fast food hamburger" },
  { label: "Nike", ticker: "NKE", type: "Equity", category: "Luxury", keywords: "sport scarpe moda" },
  { label: "Disney", ticker: "DIS", type: "Equity", category: "Ent", keywords: "film parchi streaming marvel" },
  { label: "Starbucks", ticker: "SBUX", type: "Equity", category: "Food", keywords: "caffe colazione" },
  { label: "Costco", ticker: "COST", type: "Equity", category: "Food", keywords: "supermercato retail" },
  { label: "Walmart", ticker: "WMT", type: "Equity", category: "Food", keywords: "supermercato retail usa" },
  
  // --- 🏥 HEALTHCARE & PHARMA ---
  { label: "Johnson & Johnson", ticker: "JNJ", type: "Equity", category: "Health", keywords: "salute farmaci dividendi" },
  { label: "Pfizer", ticker: "PFE", type: "Equity", category: "Health", keywords: "farmaci vaccini" },
  { label: "Eli Lilly", ticker: "LLY", type: "Equity", category: "Health", keywords: "farmaci obesità salute" },
  { label: "Novo Nordisk", ticker: "NVO", type: "Equity", category: "Health", keywords: "farmaci ozempic diabete europa" },

  // --- 🏦 BANCHE USA & FINTECH ---
  { label: "JPMorgan Chase", ticker: "JPM", type: "Equity", category: "Finance", keywords: "banca usa finanza" },
  { label: "Bank of America", ticker: "BAC", type: "Equity", category: "Finance", keywords: "banca usa" },
  { label: "Visa", ticker: "V", type: "Equity", category: "Finance", keywords: "pagamenti carte credito" },
  { label: "Mastercard", ticker: "MA", type: "Equity", category: "Finance", keywords: "pagamenti carte credito" },
  { label: "Berkshire Hathaway", ticker: "BRK-B", type: "Equity", category: "Finance", keywords: "warren buffett holding" },
  { label: "BlackRock", ticker: "BLK", type: "Equity", category: "Finance", keywords: "etf investimenti finanza" },
  { label: "PayPal", ticker: "PYPL", type: "Equity", category: "Tech", keywords: "pagamenti online fintech" },
];