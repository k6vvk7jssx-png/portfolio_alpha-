"use client";
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip, PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, Legend } from 'recharts';
import { Trash2, Search, Loader2, RefreshCw, BarChart3, TrendingUp, Settings, ChevronRight, Wallet, X, Moon, Sun, Palette, Droplets, Bitcoin, Zap, Car, Landmark, ShoppingBag, Shield, Leaf, Monitor, Pill, Clock, Lock, AlertCircle } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const APP_NAME = "Portfolio Alpha"; 

// --- ICONE CATEGORIE ---
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Water': return <Droplets size={14} className="text-blue-500"/>;
    case 'Crypto': return <Bitcoin size={14} className="text-orange-500"/>;
    case 'Energy': return <Zap size={14} className="text-yellow-500"/>;
    case 'Auto': return <Car size={14} className="text-red-500"/>;
    case 'Finance': return <Landmark size={14} className="text-emerald-600"/>;
    case 'Luxury': return <ShoppingBag size={14} className="text-purple-500"/>;
    case 'Defense': return <Shield size={14} className="text-slate-600"/>;
    case 'Green': return <Leaf size={14} className="text-green-500"/>;
    case 'Tech': return <Monitor size={14} className="text-blue-400"/>;
    case 'Health': return <Pill size={14} className="text-rose-400"/>;
    case 'Gold': return <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600"></div>;
    default: return <BarChart3 size={14} className="text-slate-400"/>;
  }
};

const PALETTES: any = {
  core: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'], 
  sat: {
    green:  ['#059669', '#10b981', '#34d399', '#6ee7b7'], 
    purple: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'], 
    orange: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'], 
  }
};

export default function Home() {
  return (
    <>
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

      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  );
}

function Dashboard() {
  const { user } = useUser();
  
  // --- STATI DATI ---
  const [assets, setAssets] = useState<any[]>([]);
  const [form, setForm] = useState({ ticker: '', strategy: 'Core', value: '' });
  const [inputType, setInputType] = useState<'shares' | 'usd'>('shares');
  const [searchValue, setSearchValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  
  // --- STATI AI & TIMER ---
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [usesToday, setUsesToday] = useState(0); 
  const [countdown, setCountdown] = useState("");
  
  // --- STATI GRAFICA ---
  const [settingsOpen, setSettingsOpen] = useState(false); 
  const [darkMode, setDarkMode] = useState(false);
  const [satColor, setSatColor] = useState('green');

  // --- EFFETTI ---
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_data');
    if (saved) {
      try { const parsed = JSON.parse(saved); setAssets(parsed); if(parsed.length>0) setSelectedTicker(parsed[0].ticker); } catch (e) {}
    }
    const savedUses = localStorage.getItem(`ai_uses_${new Date().toLocaleDateString('it-IT')}`);
    if (savedUses) setUsesToday(parseInt(savedUses));
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(assets));
    if (assets.length > 0) updatePrices();
  }, [assets]);

  useEffect(() => {
    if (selectedTicker) fetchHistory(selectedTicker);
  }, [selectedTicker]);

  useEffect(() => {
    if (usesToday >= 2) {
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const diff = tomorrow.getTime() - now.getTime();
            
            if (diff <= 0) {
                setUsesToday(0); 
                localStorage.removeItem(`ai_uses_${new Date().toLocaleDateString('it-IT')}`);
                clearInterval(interval);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [usesToday]);

  useEffect(() => {
    if (!searchValue || searchValue.length < 1) { setFilteredSuggestions([]); setShowSuggestions(false); return; }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${searchValue}`);
        if (res.ok) { const data = await res.json(); setFilteredSuggestions(data); setShowSuggestions(true); }
      } catch (error) { console.error(error); }
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  const updatePrices = async () => {
    try {
      const tickers = assets.map(a => a.ticker);
      if (tickers.length === 0) return;
      const res = await fetch('/api/prices', { method: 'POST', body: JSON.stringify({ tickers }) });
      if (res.ok) setLivePrices(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (ticker: string) => {
    setLoadingChart(true);
    setChartData([]);
    try {
      const res = await fetch('/api/history', { method: 'POST', body: JSON.stringify({ ticker }) });
      if (res.ok) setChartData(await res.json());
    } catch (e) { console.error(e); }
    setLoadingChart(false);
  };

  const runAnalysis = async () => {
    if (usesToday >= 2) return; 

    setLoadingNews(true);
    setAnalysis(null); 
    try {
      const portfolioText = assets.map(a => `${a.shares.toFixed(2)} azioni di ${a.ticker} (${a.name})`).join(', ');
      const query = `Analizza questo portafoglio: ${portfolioText}`;
      
      const res = await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ query }) });
      
      if (res.status === 429) {
          setUsesToday(2); 
          alert("🚫 LIMITE GIORNALIERO RAGGIUNTO");
          setLoadingNews(false);
          return;
      }

      const data = await res.json();
      let parsedData = data;
      if (!data.insights && data.analysis) { try { parsedData = JSON.parse(data.analysis.replace(/```json/g, '').replace(/```/g, '')); } catch (e) {} }
      
      setAnalysis(parsedData);
      
      const newUses = usesToday + 1;
      setUsesToday(newUses);
      localStorage.setItem(`ai_uses_${new Date().toLocaleDateString('it-IT')}`, newUses.toString());

    } catch (e) { console.error(e); alert("Errore analisi."); }
    setLoadingNews(false);
  };

  const handleSelectSuggestion = (stock: any) => {
    setSearchValue(`${stock.label}`); 
    setForm({ ...form, ticker: stock.ticker }); 
    setShowSuggestions(false);
  };

  const addAsset = async () => {
    let finalTicker = form.ticker;
    if (!finalTicker && searchValue) finalTicker = searchValue.split(' - ')[0].toUpperCase();
    if (!finalTicker || !form.value) return;

    let shares = parseFloat(form.value);
    if (inputType === 'usd') {
       try {
         const res = await fetch('/api/prices', { method: 'POST', body: JSON.stringify({ tickers: [finalTicker] }) });
         const data = await res.json();
         const price = data[finalTicker];
         if (price && price > 0) shares = shares / price;
         else { alert("Prezzo non trovato."); return; }
       } catch (e) { return; }
    }

    const suggestion = filteredSuggestions.find(s => s.ticker === finalTicker);
    const extractedName = suggestion ? suggestion.label : finalTicker;
    const existingIndex = assets.findIndex(a => a.ticker === finalTicker);
    
    if (existingIndex >= 0) {
        const updatedAssets = [...assets];
        updatedAssets[existingIndex].shares += shares;
        updatedAssets[existingIndex].strategy = form.strategy; 
        setAssets(updatedAssets);
    } else {
        const newAsset = { 
            ...form, ticker: finalTicker, id: Date.now(), shares, name: extractedName, category: suggestion?.category 
        };
        setAssets([...assets, newAsset]);
    }
    setSelectedTicker(finalTicker);
    setForm({ ...form, ticker: '', value: '' });
    setSearchValue(''); 
  };

  const total = assets.reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const coreValue = assets.filter(a => a.strategy === 'Core').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const satValue = assets.filter(a => a.strategy === 'Satellite').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const corePct = total > 0 ? ((coreValue / total) * 100).toFixed(0) : "0";
  const satPct = total > 0 ? ((satValue / total) * 100).toFixed(0) : "0";
  const getScoreColor = (score: number) => score >= 75 ? "text-emerald-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  
  const pieData = assets.map((a, i) => ({ 
    name: a.ticker, value: (livePrices[a.ticker] || 0) * a.shares, strategy: a.strategy 
  }));

  const bgMain = darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900';
  const bgCard = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textSub = darkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`min-h-screen p-4 md:p-8 font-sans relative transition-colors duration-300 ${bgMain}`}>
      <header className={`flex flex-col md:flex-row justify-between items-center mb-8 p-6 rounded-2xl shadow-sm border transition-colors ${bgCard}`}>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <BarChart3 className="text-blue-600"/> {APP_NAME}
          </h1>
          <p className={`text-xs mt-1 font-medium ${textSub}`}>Dashboard di <span className="text-blue-600">{user?.firstName}</span></p>
        </div>
        <div className="flex items-center gap-6 mt-4 md:mt-0 relative">
            <div className="text-right">
                <p className={`text-[10px] font-bold tracking-widest ${textSub}`}>PATRIMONIO</p>
                <p className="text-4xl font-black tracking-tighter">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            <button onClick={() => setSettingsOpen(!settingsOpen)} className={`p-2 rounded-full transition ${settingsOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}>
                <Settings size={20}/>
            </button>
            <div className="pl-6 border-l border-slate-200"><UserButton afterSignOutUrl="/"/></div>
            
            {settingsOpen && (
              <div className="absolute top-16 right-0 w-72 bg-white p-5 rounded-xl shadow-2xl border border-slate-100 z-[100] animate-in fade-in slide-in-from-top-2 text-slate-800">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                      <span className="text-sm font-bold flex items-center gap-2"><Settings size={14}/> Preferenze</span>
                      <button onClick={() => setSettingsOpen(false)}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                  </div>
                  <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Sun size={10}/> Tema</p>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                          <button onClick={() => setDarkMode(false)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${!darkMode ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>Light</button>
                          <button onClick={() => setDarkMode(true)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${darkMode ? 'bg-slate-800 shadow text-white' : 'text-slate-400'}`}>Dark</button>
                      </div>
                  </div>
                  <div className="mb-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Palette size={10}/> Satellite</p>
                      <div className="flex gap-2 justify-between">
                          <button onClick={() => setSatColor('green')} className={`w-8 h-8 rounded-full bg-emerald-500 border-2 transition ${satColor === 'green' ? 'border-slate-900 scale-110' : 'border-transparent opacity-50'}`}/>
                          <button onClick={() => setSatColor('purple')} className={`w-8 h-8 rounded-full bg-purple-500 border-2 transition ${satColor === 'purple' ? 'border-slate-900 scale-110' : 'border-transparent opacity-50'}`}/>
                          <button onClick={() => setSatColor('orange')} className={`w-8 h-8 rounded-full bg-orange-500 border-2 transition ${satColor === 'orange' ? 'border-slate-900 scale-110' : 'border-transparent opacity-50'}`}/>
                      </div>
                  </div>
                  <button onClick={() => {localStorage.removeItem('portfolio_data'); window.location.reload()}} className="w-full text-center text-xs text-red-500 font-bold mt-2 hover:bg-red-50 p-2 rounded transition border border-red-100">Reset Dati</button>
              </div>
            )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 rounded-2xl shadow-sm border relative z-50 transition-colors ${bgCard}`}>
            <h2 className={`text-xs font-bold uppercase tracking-wider mb-4 ${textSub}`}>Nuova Operazione</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4"/>
                    <input type="text" placeholder="Cerca: 'Water', 'Apple', 'Bitcoin'..." className={`w-full pl-10 pr-4 py-3 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner ${inputBg}`} 
                        value={searchValue} onChange={e => setSearchValue(e.target.value)} onFocus={() => { if(searchValue.length >= 1) setShowSuggestions(true); }}
                    />
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[300px] overflow-y-auto custom-scrollbar">
                        {filteredSuggestions.map((stock) => (
                            <div key={stock.ticker} onClick={() => handleSelectSuggestion(stock)} className="p-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-full">{getCategoryIcon(stock.category)}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm">{stock.label}</p>
                                        <div className="flex items-center gap-2"><span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{stock.ticker}</span></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setForm({...form, strategy: 'Core'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${form.strategy === 'Core' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>CORE</button>
                <button onClick={() => setForm({...form, strategy: 'Satellite'})} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${form.strategy === 'Satellite' ? (satColor==='purple' ? 'bg-purple-500' : satColor==='orange' ? 'bg-orange-500' : 'bg-emerald-500') + ' text-white' : 'bg-slate-100 text-slate-400'}`}>SAT</button>
              </div>
              
              <div className="flex gap-2">
                 <input type="number" placeholder={inputType === 'shares' ? "Quantità" : "Importo $"} className={`flex-1 p-3 rounded-xl border text-sm ${inputBg}`} value={form.value} onChange={e => setForm({...form, value: e.target.value})}/>
                 <div className="flex bg-slate-100 rounded-xl p-1 items-center">
                    <button onClick={() => setInputType('shares')} className={`px-2 h-full text-[10px] font-bold rounded ${inputType === 'shares' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>PZ</button>
                    <button onClick={() => setInputType('usd')} className={`px-2 h-full text-[10px] font-bold rounded ${inputType === 'usd' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>$</button>
                 </div>
              </div>

              <button onClick={addAsset} className={`w-full py-3 rounded-xl font-bold text-sm transition ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-900 hover:bg-slate-800'} text-white`}>AGGIUNGI</button>
            </div>
          </div>

          <div className={`rounded-2xl shadow-sm border overflow-hidden min-h-[200px] transition-colors ${bgCard}`}>
             {assets.length === 0 && <p className={`text-center p-8 text-xs italic ${textSub}`}>Nessun titolo nel portafoglio.</p>}
             {assets.map((a, i) => (
              <div key={a.id} onClick={() => setSelectedTicker(a.ticker)} className={`p-4 border-b flex justify-between items-center cursor-pointer transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'} ${selectedTicker === a.ticker ? (darkMode ? 'bg-slate-800' : 'bg-blue-50') : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${a.strategy === 'Core' ? 'bg-blue-500' : (satColor==='purple' ? 'bg-purple-500' : satColor==='orange' ? 'bg-orange-500' : 'bg-emerald-500')}`}/>
                  <div><p className={`font-black text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{a.name || a.ticker}</p><p className={`text-[10px] font-bold ${textSub}`}>{a.ticker}</p></div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>${((livePrices[a.ticker] || 0) * a.shares).toLocaleString()}</p>
                  <p className={`text-[10px] ${textSub}`}>{a.shares.toFixed(2)} pz • ${livePrices[a.ticker]?.toFixed(2)}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setAssets(assets.filter(x => x.id !== a.id)); }} className="ml-2 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className={`p-6 rounded-2xl shadow-sm border h-[350px] transition-colors ${bgCard}`}>
            <h3 className={`text-xs font-bold uppercase mb-4 tracking-wider flex items-center gap-2 ${textSub}`}>
                <TrendingUp size={14}/> Trend 7 Giorni: <span className={darkMode ? 'text-white' : 'text-slate-800'}>{selectedTicker || 'Seleziona un titolo'}</span>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"}/>
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: darkMode ? '#94a3b8' : '#64748b'}} hide={chartData.length === 0}/>
                    <YAxis hide domain={['auto', 'auto']}/>
                    <AreaTooltip contentStyle={{backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#fff' : '#000'}}/>
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl shadow-sm border h-[380px] flex flex-col transition-colors ${bgCard}`}>
              <div className="flex justify-between items-start mb-2">
                 <h3 className={`text-xs font-bold uppercase ${textSub}`}>Allocazione</h3>
                 <div className="text-[10px] font-bold space-x-2">
                    <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">CORE: {corePct}%</span>
                    <span className={`${satColor==='purple' ? 'text-purple-600 bg-purple-50' : satColor==='orange' ? 'text-orange-600 bg-orange-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-1 rounded`}>SAT: {satPct}%</span>
                 </div>
              </div>
              <div className="flex-1 w-full relative min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.strategy === 'Core' ? PALETTES.core[index % PALETTES.core.length] : PALETTES.sat[satColor][index % PALETTES.sat[satColor].length]} stroke="none"/>
                      ))}
                    </Pie>
                    <PieTooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Value']} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 h-[380px] flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-blue-600 rounded-full blur-[80px] opacity-10 -mr-16 -mt-16 pointer-events-none"></div>
               
               <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Search size={14} className="text-blue-400"/> AI Senior Analyst</h3>
                    {usesToday >= 2 ? (
                        <span className="text-[9px] font-mono bg-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1 border border-red-500/30">
                           <Lock size={8}/> BLOCKED
                        </span>
                    ) : (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30">
                           {2 - usesToday}/2 FREE
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {usesToday >= 2 && (
                        <div className="flex items-center gap-1.5 text-orange-400 animate-pulse">
                            <Clock size={12}/>
                            <span className="text-[10px] font-mono font-bold">{countdown}</span>
                        </div>
                    )}
                    
                    <button onClick={runAnalysis} disabled={loadingNews || usesToday >= 2} 
                        className={`p-2 rounded-lg transition shadow-lg ${usesToday >= 2 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50'}`}>
                        {loadingNews ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                    </button>
                </div>
              </div>

              <div className="overflow-y-auto space-y-4 flex-1 custom-scrollbar relative z-10 pr-1">
                {analysis ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center backdrop-blur-sm">
                            <div><p className={`text-4xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}</p><p className="text-[10px] text-slate-400 uppercase tracking-widest">Health Score</p></div>
                            <div className="text-right">
                                <p className="text-lg font-bold uppercase text-white">{analysis.rating}</p>
                                <div className="flex gap-1 mt-1 justify-end"><div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden"><div style={{width: `${analysis.sentiment.positive}%`}} className="h-full bg-emerald-500"/></div></div>
                            </div>
                        </div>
                        {analysis.advice && (
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800/50">
                                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1"><Wallet size={10}/> Consiglio Operativo</p>
                                <p className="text-xs text-blue-100 leading-relaxed italic">"{analysis.advice}"</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            {analysis.insights?.map((insight: any, i: number) => (
                                <div key={i} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                    <div className="flex justify-between mb-1"><p className="font-bold text-xs text-slate-200">{insight.title}</p><span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${insight.sentiment === 'positive' ? 'text-emerald-400' : 'text-slate-400'}`}>{insight.sentiment}</span></div>
                                    <p className="text-[10px] text-slate-400">{insight.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                        {usesToday >= 2 ? <Lock size={40} className="text-red-500/50"/> : <BarChart3 size={40} className="opacity-20"/>}
                        <p className="text-xs text-center max-w-[200px]">
                            {usesToday >= 2 
                             ? "Hai raggiunto il limite giornaliero. L'AI si sta ricaricando." 
                             : "Premi il tasto aggiorna per l'analisi completa."}
                        </p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLAIMER FOOTER AGGIUNTO QUI */}
      <footer className={`mt-8 py-6 text-center border-t transition-colors ${darkMode ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'}`}>
         <div className="flex items-center justify-center gap-2 mb-2">
           <AlertCircle size={14} className={darkMode ? 'text-slate-600' : 'text-slate-400'}/>
           <p className="text-[10px] uppercase font-bold tracking-widest">Disclaimer</p>
         </div>
         <p className="text-[10px] max-w-2xl mx-auto leading-relaxed px-4">
           Le informazioni fornite da {APP_NAME} e dall'AI Analyst sono a scopo puramente educativo e non costituiscono consulenza finanziaria o invito all'investimento.
           I dati di mercato potrebbero subire ritardi. Il trading comporta rischi di perdita del capitale.
         </p>
      </footer>

    </div> 
  );
}