"use client";
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip } from 'recharts';
import { Trash2, Search, Loader2, RefreshCw, BarChart3, TrendingUp, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { stockList } from './stockList';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const APP_NAME = "Portfolio Alpha"; 

const getDynamicColor = (index: number, strategy: string) => {
  if (strategy === 'Core') return `hsl(220, 80%, ${40 + (index * 8) % 25}%)`;
  return `hsl(${(160 + index * 45) % 360}, 70%, 50%)`;
};

export default function Home() {
  return (
    <>
      {/* 1. LANDING PAGE (VISIBILE SOLO SE NON SEI LOGGATO) */}
      <SignedOut>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
           </div>
           <div className="relative z-10 text-center space-y-8 max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                {APP_NAME}
              </h1>
              <div className="pt-8">
                <SignInButton mode="modal">
                  <button className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto">
                    Inizia Ora <ChevronRight className="w-5 h-5"/>
                  </button>
                </SignInButton>
              </div>
           </div>
        </div>
      </SignedOut>

      {/* 2. DASHBOARD (VISIBILE SOLO SE SEI LOGGATO) */}
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}

// --- COMPONENTE PRINCIPALE DELL'APP ---
function Dashboard() {
  const { user } = useUser();
  const [assets, setAssets] = useState<any[]>([]);
  const [inputType, setInputType] = useState<'shares' | 'usd'>('shares');

  // --- VARIABILI PER LA RICERCA (FIX ERRORI ROSSI) ---
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // ---------------------------------------------------

  const [form, setForm] = useState({ ticker: '', strategy: 'Core', value: '' });
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);

  // LOGICA RICERCA LIVE (Chiama /api/search)
  useEffect(() => {
    if (!searchValue || searchValue.length < 2) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Aspetta 300ms che l'utente finisca di scrivere
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${searchValue}`);
        if (res.ok) {
            const data = await res.json();
            setFilteredSuggestions(data);
            setShowSuggestions(true);
        }
      } catch (error) { console.error(error); }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  // Quando clicchi su un suggerimento dal menu a tendina
  const handleSelectSuggestion = (stock: any) => {
    setSearchValue(`${stock.ticker} - ${stock.label}`); 
    setForm({ ...form, ticker: stock.ticker }); 
    setShowSuggestions(false);
  };

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

  // Salvataggio e aggiornamento prezzi
  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(assets));
    if (assets.length > 0) updatePrices();
  }, [assets]);

  // Aggiornamento grafico quando cambi selezione
  useEffect(() => {
    if (selectedTicker) fetchHistory(selectedTicker);
  }, [selectedTicker]);

  // API PREZZI
  const updatePrices = async () => {
    try {
      const tickers = assets.map(a => a.ticker);
      if (tickers.length === 0) return;
      const res = await fetch('/api/prices', { 
        method: 'POST', 
        body: JSON.stringify({ tickers }) 
      });
      if (res.ok) setLivePrices(await res.json());
    } catch (e) { console.error(e); }
  };

  // API HISTORY (Usa il tuo file esistente)
  const fetchHistory = async (ticker: string) => {
    setLoadingChart(true);
    setChartData([]);
    try {
      const res = await fetch('/api/history', { 
        method: 'POST', 
        body: JSON.stringify({ ticker }) 
      });
      if (res.ok) setChartData(await res.json());
    } catch (e) { console.error(e); }
    setLoadingChart(false);
  };

  // AGGIUNTA ASSET
  const addAsset = async () => {
    // Prende il ticker o dal form nascosto o dalla barra di ricerca
    const finalTicker = form.ticker || (searchValue.split(' - ')[0] || '').toUpperCase();
    
    if (!finalTicker || !form.value) return;

    let shares = parseFloat(form.value);
    
    // Se inserito in USD, converte
    if (inputType === 'usd') {
       try {
         const res = await fetch('/api/prices', { 
            method: 'POST', 
            body: JSON.stringify({ tickers: [finalTicker] }) 
         });
         const data = await res.json();
         const price = data[finalTicker];
         if (price && price > 0) shares = shares / price;
         else { alert("Prezzo non trovato."); return; }
       } catch (e) { return; }
    }

    // Cerca info extra (se presenti nella lista statica) oppure usa i dati della ricerca
    const stockInfo = stockList.find(s => s.ticker === finalTicker);
    const newAsset = { 
        ...form, 
        ticker: finalTicker, 
        id: Date.now(), 
        shares,
        name: stockInfo ? stockInfo.label : (searchValue.split(' - ')[1] || finalTicker)
    };

    const newAssetsList = [...assets, newAsset];
    setAssets(newAssetsList);
    setSelectedTicker(finalTicker);
    setForm({ ...form, ticker: '', value: '' });
    setSearchValue(''); // Pulisce la barra
  };

  // AI ANALYST
  const runAnalysis = async () => {
    setLoadingNews(true);
    setAnalysis(null); 
    try {
      const portfolioText = assets.map(a => `${a.shares.toFixed(2)} azioni di ${a.ticker}`).join(', ');
      const query = `Analizza come analista senior: ${portfolioText}. Rispondi SOLO JSON: {"score": 0-100, "rating": "BUY/SELL", "sentiment": {"positive": %, "neutral": %, "negative": %}, "insights": [{"title": "...", "sentiment": "...", "reason": "..."}]}`;
      const res = await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ query }) });
      const data = await res.json();
      let parsedData = data;
      if (data.analysis) {
         try { parsedData = JSON.parse(data.analysis.replace(/```json/g, '').replace(/```/g, '')); } catch (e) {}
      }
      setAnalysis(parsedData);
    } catch (e) { console.error(e); }
    setLoadingNews(false);
  };

  // CALCOLI TOTALI
  const total = assets.reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const coreValue = assets.filter(a => a.strategy === 'Core').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const satValue = assets.filter(a => a.strategy === 'Satellite').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const corePct = total > 0 ? Math.round((coreValue / total) * 100) : 0;
  const satPct = total > 0 ? Math.round((satValue / total) * 100) : 0;
  const getScoreColor = (score: number) => score >= 75 ? "text-emerald-500" : score >= 50 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <BarChart3 className="text-blue-600"/> {APP_NAME}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Bentornato, <span className="text-blue-600">{user?.firstName}</span></p>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0">
            <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">NET WORTH</p>
                <p className="text-4xl font-black tracking-tighter">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            <div className="pl-6 border-l border-slate-200">
                <UserButton afterSignOutUrl="/"/>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLONNA SINISTRA: INPUT E RICERCA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aggiungi Titolo</h2>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button onClick={() => setInputType('shares')} className={`px-2 py-1 text-[10px] font-bold rounded ${inputType === 'shares' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>SHARES</button>
                <button onClick={() => setInputType('usd')} className={`px-2 py-1 text-[10px] font-bold rounded ${inputType === 'usd' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>USD $</button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* BARRA DI RICERCA */}
              <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4"/>
                    <input 
                        type="text"
                        placeholder="Cerca Ticker (es. NVDA)..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner" 
                        value={searchValue} 
                        onChange={e => setSearchValue(e.target.value)}
                    />
                </div>
                {/* MENU A TENDINA SUGGERIMENTI */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                        {filteredSuggestions.map((stock) => (
                            <div key={stock.ticker} onClick={() => handleSelectSuggestion(stock)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{stock.ticker}</p>
                                        <p className="text-xs text-slate-500">{stock.label}</p>
                                    </div>
                                    <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded">{stock.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setForm({...form, strategy: 'Core'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${form.strategy === 'Core' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>CORE</button>
                <button onClick={() => setForm({...form, strategy: 'Satellite'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${form.strategy === 'Satellite' ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-400'}`}>SAT</button>
              </div>
              <input type="number" placeholder={inputType === 'shares' ? "Quantità" : "Importo $"} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm" value={form.value} onChange={e => setForm({...form, value: e.target.value})}/>
              <button onClick={addAsset} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition">AGGIUNGI</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[200px]">
             {assets.map((a, i) => (
              <div key={a.id} onClick={() => setSelectedTicker(a.ticker)} className={`p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer ${selectedTicker === a.ticker ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full" style={{backgroundColor: getDynamicColor(i, a.strategy)}}/>
                  <div>
                    <p className="font-black text-sm text-slate-800">{a.ticker}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{a.name} • {a.shares.toFixed(2)} sh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-slate-700">${((livePrices[a.ticker] || 0) * a.shares).toLocaleString()}</p>
                  <button onClick={(e) => { e.stopPropagation(); setAssets(assets.filter(x => x.id !== a.id)); }} className="text-red-200 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLONNA DESTRA: GRAFICI E AI */}
        <div className="lg:col-span-8 space-y-6">
          {/* GRAFICO TREND */}
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
                    <XAxis dataKey="date" tick={{fontSize: 10}} hide={chartData.length === 0}/>
                    <YAxis hide domain={['auto', 'auto']}/>
                    <AreaTooltip />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TORTA ALLOCATION */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[320px] flex flex-col items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 w-full text-left">Allocation</h3>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={assets.map((a, i) => ({ name: a.ticker, value: (livePrices[a.ticker] || 0) * a.shares }))} innerRadius={60} outerRadius={80} dataKey="value">
                      {assets.map((a, i) => <Cell key={i} fill={getDynamicColor(i, a.strategy)} stroke="none" />)}
                    </Pie>
                    <PieTooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI ANALYST */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 h-[320px] flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[80px] opacity-10 -mr-16 -mt-16 pointer-events-none"></div>
               <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Search size={14} className="text-blue-400"/> AI Analyst</h3>
                <button onClick={runAnalysis} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition" disabled={loadingNews}>
                  {loadingNews ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                </button>
              </div>
              <div className="overflow-y-auto space-y-4 flex-1 custom-scrollbar relative z-10 pr-1">
                {analysis && (
                    <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                        <p className={`text-3xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}/100</p>
                        <p className="text-sm font-bold uppercase">{analysis.rating}</p>
                        <div className="w-full h-2 bg-slate-950 rounded-full flex overflow-hidden mt-2">
                           <div style={{width: `${analysis.sentiment.positive}%`}} className="h-full bg-emerald-500"/>
                           <div style={{width: `${analysis.sentiment.neutral}%`}} className="h-full bg-slate-600"/>
                           <div style={{width: `${analysis.sentiment.negative}%`}} className="h-full bg-rose-500"/>
                        </div>
                    </div>
                )}
                {!analysis && <p className="text-center text-xs text-slate-500 mt-10">Premi il tasto per analizzare.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}