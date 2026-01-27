"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip } from 'recharts';
import { Trash2, Search, Loader2, RefreshCw, BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { stockList } from './stockList';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const APP_NAME = "Portfolio Alpha"; 

const getDynamicColor = (index: number, strategy: string) => {
  if (strategy === 'Core') return `hsl(220, 80%, ${40 + (index * 8) % 25}%)`;
  return `hsl(${(160 + index * 45) % 360}, 70%, 50%)`;
};

export default function Dashboard() {
  const { user } = useUser();

  const [assets, setAssets] = useState<any[]>([]);
  const [inputType, setInputType] = useState<'shares' | 'usd'>('shares');
  const [form, setForm] = useState({ ticker: '', strategy: 'Core', value: '' });
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);

  // Caricamento iniziale
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAssets(parsed);
        if (parsed.length > 0) setSelectedTicker(parsed[0].ticker);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Salvataggio automatico e aggiornamento prezzi
  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(assets));
    if (assets.length > 0) updatePrices();
  }, [assets]);

  // Recupero storico quando si seleziona un ticker
  useEffect(() => {
    if (selectedTicker) fetchHistory(selectedTicker);
  }, [selectedTicker]);

  // --- 1. FUNZIONE PREZZI (CHIAMA IL SERVER) ---
  const updatePrices = async () => {
    try {
      const tickers = assets.map(a => a.ticker);
      if (tickers.length === 0) return;

      const res = await fetch('/api/prices', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }) 
      });
      
      if (res.ok) {
        const data = await res.json();
        setLivePrices(data);
      }
    } catch (e) { console.error("Errore prezzi:", e); }
  };

  // --- 2. FUNZIONE HISTORY REALE (RIPRISTINATA) ---
  const fetchHistory = async (ticker: string) => {
    setLoadingChart(true);
    setChartData([]); // Pulisce il grafico vecchio mentre carica
    try {
      const res = await fetch('/api/history', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }) 
      });
      
      if (res.ok) {
        const data = await res.json();
        setChartData(data);
      }
    } catch (e) { console.error("Errore history:", e); }
    setLoadingChart(false);
  };

  // --- 3. AGGIUNTA ASSET (SBLOCCATA "DATABASE INFINITO") ---
  const addAsset = async () => {
    if (!form.ticker || !form.value) return;
    const tickerUpper = form.ticker.toUpperCase(); // Forza maiuscolo
    let shares = parseFloat(form.value);
    
    // Se l'input è in DOLLARI, convertiamo in AZIONI chiedendo il prezzo al volo
    if (inputType === 'usd') {
       try {
         // Chiediamo il prezzo al server anche se il ticker non è nella stockList
         const res = await fetch('/api/prices', { 
            method: 'POST', 
            body: JSON.stringify({ tickers: [tickerUpper] }) 
         });
         const data = await res.json();
         const price = data[tickerUpper]; // Prende il prezzo reale
         
         if (price && price > 0) {
            shares = shares / price;
         } else {
            alert(`Impossibile trovare il prezzo per ${tickerUpper}. Inserisci il numero di azioni manuale.`);
            return;
         }
       } catch (e) { return; }
    }

    // Cerchiamo info extra nella lista statica, MA se non c'è, creiamo un oggetto generico
    // Questo permette di aggiungere QUALSIASI ticker (es. una crypto o stock estero)
    const stockInfo = stockList.find(s => s.ticker === tickerUpper) || { 
        ticker: tickerUpper, 
        label: tickerUpper, 
        isin: 'N/A' 
    };

    const newAsset = { 
        ...form, 
        ticker: tickerUpper, // Assicura che usiamo il ticker maiuscolo
        id: Date.now(), 
        shares,
        // Se non era nella lista, usiamo il ticker come nome
        name: stockInfo.label 
    };

    const newAssetsList = [...assets, newAsset];
    setAssets(newAssetsList);
    setSelectedTicker(tickerUpper);
    setForm({ ...form, ticker: '', value: '' });
  };

  const runAnalysis = async () => {
    setLoadingNews(true);
    setAnalysis(null); 
    try {
      const portfolioText = assets.map(a => 
        `${a.shares.toFixed(2)} azioni di ${a.ticker} (${a.strategy})`
      ).join(', ');

      const query = `
        Agisci come un analista finanziario senior di Wall Street.
        Analizza questo portafoglio: ${portfolioText}.
        IMPORTANTE: Rispondi SOLO con questo JSON valido:
        {
          "score": (0-100),
          "rating": ("BUY", "HOLD", "SELL"),
          "sentiment": { "positive": %, "neutral": %, "negative": % },
          "insights": [ { "title": "...", "sentiment": "...", "reason": "..." } ]
        }
      `;
      
      const res = await fetch('/api/analyze', { 
        method: 'POST', 
        body: JSON.stringify({ query }) 
      });
      
      const data = await res.json();
      
      // Gestione fallback se l'AI risponde male
      let parsedData = data;
      if (data.analysis) {
         try {
            const cleanJson = data.analysis.replace(/```json/g, '').replace(/```/g, '');
            parsedData = JSON.parse(cleanJson);
         } catch (e) {
            console.error("Errore parsing AI");
         }
      }
      setAnalysis(parsedData);
    } catch (e) { console.error(e); }
    setLoadingNews(false);
  };

  // Calcoli totali
  const total = assets.reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const coreValue = assets.filter(a => a.strategy === 'Core').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const satValue = assets.filter(a => a.strategy === 'Satellite').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const corePct = total > 0 ? Math.round((coreValue / total) * 100) : 0;
  const satPct = total > 0 ? Math.round((satValue / total) * 100) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <BarChart3 className="text-blue-600"/> {APP_NAME}
          </h1>
          <SignedIn>
             <p className="text-xs text-slate-400 mt-1 font-medium">Bentornato, <span className="text-blue-600">{user?.firstName}</span></p>
          </SignedIn>
        </div>
        
        <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">NET WORTH</p>
                <p className="text-4xl font-black tracking-tighter">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            
            <div className="pl-6 border-l border-slate-200">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-lg">ACCEDI</button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl="/"/>
                </SignedIn>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Add Position</h2>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button onClick={() => setInputType('shares')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${inputType === 'shares' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>SHARES</button>
                <button onClick={() => setInputType('usd')} className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${inputType === 'usd' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>USD $</button>
              </div>
            </div>
            
            <div className="space-y-3">
              <input 
                list="ticker-suggestions" 
                placeholder="TICKER (es. AAPL, BTC-USD)" 
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" 
                value={form.ticker} 
                onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
              />
              <datalist id="ticker-suggestions">
                {stockList.map((stock, index) => (
                  <option key={index} value={stock.ticker}>{stock.label}</option>
                ))}
              </datalist>

              <div className="flex gap-2">
                <button onClick={() => setForm({...form, strategy: 'Core'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${form.strategy === 'Core' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>CORE</button>
                <button onClick={() => setForm({...form, strategy: 'Satellite'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${form.strategy === 'Satellite' ? 'bg-teal-500 text-white shadow-md shadow-teal-200' : 'bg-slate-50 text-slate-400 border border-slate-200'}`}>SAT</button>
              </div>
              <input type="number" placeholder={inputType === 'shares' ? "Quantity" : "Invested Amount $"} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" value={form.value} onChange={e => setForm({...form, value: e.target.value})}/>
              <button onClick={addAsset} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">ADD POSITION</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[200px]">
            {assets.length === 0 && <p className="text-center p-8 text-xs text-slate-400 italic">Il portafoglio è vuoto.</p>}
            {assets.map((a, i) => (
              <div key={a.id} onClick={() => setSelectedTicker(a.ticker)} className={`p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer transition ${selectedTicker === a.ticker ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full shadow-sm" style={{backgroundColor: getDynamicColor(i, a.strategy)}}/>
                  <div>
                    <p className="font-black text-sm text-slate-800">{a.ticker}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{a.strategy.toUpperCase()} • {a.shares.toFixed(2)} sh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-700">${((livePrices[a.ticker] || 0) * a.shares).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <button onClick={(e) => { e.stopPropagation(); setAssets(assets.filter(x => x.id !== a.id)); }} className="text-red-200 hover:text-red-500 transition"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[350px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-2">
                <TrendingUp size={14}/> Trend (7gg): <span className="text-slate-800">{selectedTicker || 'Portafoglio'}</span>
            </h3>
            <div className="h-[250px] w-full">
              {loadingChart ? <Loader2 className="animate-spin mx-auto mt-20 text-slate-300"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} hide={chartData.length === 0}/>
                    <YAxis hide domain={['auto', 'auto']}/>
                    <AreaTooltip contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} itemStyle={{color: '#1e293b', fontWeight: 'bold', fontSize: '12px'}} />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[320px] flex flex-col items-center">
              <div className="w-full flex justify-between items-end mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allocation</h3>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">CORE {corePct}%</span>
                  <span className="mx-1"></span>
                  <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">SAT {satPct}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden flex">
                <div style={{ width: `${corePct}%` }} className="h-full bg-blue-600 transition-all duration-1000 ease-out"></div>
                <div style={{ width: `${satPct}%` }} className="h-full bg-teal-400 transition-all duration-1000 ease-out"></div>
              </div>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={assets.map((a, i) => ({ name: a.ticker, value: (livePrices[a.ticker] || 0) * a.shares }))} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                      {assets.map((a, i) => <Cell key={i} fill={getDynamicColor(i, a.strategy)} stroke="none" />)}
                    </Pie>
                    <PieTooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px'}} formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-300 font-black text-2xl opacity-20">{assets.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 h-[320px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[80px] opacity-10 -mr-16 -mt-16 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 tracking-wider"><Search size={14} className="text-blue-400"/> AI Analyst</h3>
                <button onClick={runAnalysis} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/50" disabled={loadingNews}>
                  {loadingNews ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 flex-1 custom-scrollbar relative z-10 pr-1">
                {!analysis ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <BarChart3 className="w-8 h-8 opacity-20"/>
                    <p className="text-xs text-center italic">
                      {loadingNews ? "L'AI sta analizzando i mercati..." : "Premi il bottone blu per generare il report."}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Health Score</p>
                          <p className={`text-3xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}<span className="text-sm text-slate-500">/100</span></p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black uppercase tracking-tight ${getScoreColor(analysis.rating)}`}>{analysis.rating}</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-2 bg-slate-950 rounded-full flex overflow-hidden mt-3">
                        <div style={{width: `${analysis.sentiment.positive}%`}} className="h-full bg-emerald-500 transition-all duration-1000" title="Positive"/>
                        <div style={{width: `${analysis.sentiment.neutral}%`}} className="h-full bg-slate-600 transition-all duration-1000" title="Neutral"/>
                        <div style={{width: `${analysis.sentiment.negative}%`}} className="h-full bg-rose-500 transition-all duration-1000" title="Negative"/>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-wider">
                        <span>Bull {analysis.sentiment.positive}%</span>
                        <span>Bear {analysis.sentiment.negative}%</span>
                      </div>
                    </div>

                    {analysis.insights && analysis.insights.map((n: any, i: number) => (
                      <div key={i} className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition">
                        <div className="flex gap-2 mb-1 items-center">
                          {n.sentiment === 'positive' ? <TrendingUp size={12} className="text-emerald-400"/> : 
                           n.sentiment === 'negative' ? <AlertTriangle size={12} className="text-rose-400"/> : 
                           <ShieldCheck size={12} className="text-slate-400"/>}
                          <p className="text-[10px] font-bold uppercase text-slate-200 tracking-wide">{n.title}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{n.reason}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}