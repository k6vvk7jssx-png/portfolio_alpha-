"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as PieTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip } from 'recharts';
import { Trash2, Search, Loader2, RefreshCw, BarChart3, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { stockList } from './stockList';

const APP_NAME = "Portfolio Alpha"; 

const getDynamicColor = (index: number, strategy: string) => {
  if (strategy === 'Core') return `hsl(220, 80%, ${40 + (index * 8) % 25}%)`;
  return `hsl(${(160 + index * 45) % 360}, 70%, 50%)`;
};

export default function Dashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [inputType, setInputType] = useState<'shares' | 'usd'>('shares');
  const [form, setForm] = useState({ ticker: '', strategy: 'Core', value: '' });
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [loadingChart, setLoadingChart] = useState(false);
  
  // STATO PER L'ANALISI AVANZATA
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('portfolio_data', JSON.stringify(assets));
    if (assets.length > 0) updatePrices();
  }, [assets]);

  useEffect(() => {
    if (selectedTicker) fetchHistory(selectedTicker);
  }, [selectedTicker]);

  const updatePrices = async () => {
    try {
      const tickers = assets.map(a => a.ticker);
      const res = await fetch('/api/prices', { method: 'POST', body: JSON.stringify({ tickers }) });
      if (res.ok) setLivePrices(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async (ticker: string) => {
    setLoadingChart(true);
    try {
      const res = await fetch('/api/history', { method: 'POST', body: JSON.stringify({ ticker }) });
      setChartData(await res.json());
    } catch (e) { console.error(e); }
    setLoadingChart(false);
  };

  const addAsset = async () => {
    if (!form.ticker || !form.value) return;
    let shares = parseFloat(form.value);
    
    if (inputType === 'usd') {
      try {
        const res = await fetch('/api/prices', { method: 'POST', body: JSON.stringify({ tickers: [form.ticker] }) });
        const data = await res.json();
        const price = data[form.ticker] || 0;
        if (price > 0) shares = shares / price;
        else return alert("Prezzo non trovato.");
      } catch (e) { return; }
    }

    const newAsset = { ...form, id: Date.now(), shares };
    setAssets([...assets, newAsset]);
    setSelectedTicker(form.ticker);
    setForm({ ...form, ticker: '', value: '' });
  };

  const runAnalysis = async () => {
    setLoadingNews(true);
    setAnalysis(null); 
    try {
      const searchTerms = assets.slice(0, 5).map(a => {
         const stockInfo = stockList.find(s => s.ticker === a.ticker);
         return stockInfo ? stockInfo.label.split('(')[0].trim() : a.ticker;
      });

      const uniqueTerms = Array.from(new Set(searchTerms));
      const query = uniqueTerms.join(' OR ');
      
      const res = await fetch('/api/analyze', { 
        method: 'POST', 
        body: JSON.stringify({ query }) 
      });
      
      const data = await res.json();
      setAnalysis(data);
    } catch (e) { console.error(e); }
    setLoadingNews(false);
  };

  const total = assets.reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const coreValue = assets.filter(a => a.strategy === 'Core').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const satValue = assets.filter(a => a.strategy === 'Satellite').reduce((sum, a) => sum + (a.shares * (livePrices[a.ticker] || 0)), 0);
  const corePct = total > 0 ? Math.round((coreValue / total) * 100) : 0;
  const satPct = total > 0 ? Math.round((satValue / total) * 100) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="text-blue-600"/> {APP_NAME}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400">NET WORTH</p>
          <p className="text-4xl font-bold">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase">Add Position</h2>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button onClick={() => setInputType('shares')} className={`px-2 py-1 text-[10px] font-bold rounded ${inputType === 'shares' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>SHARES</button>
                <button onClick={() => setInputType('usd')} className={`px-2 py-1 text-[10px] font-bold rounded ${inputType === 'usd' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>USD $</button>
              </div>
            </div>
            
            <div className="space-y-3">
              <input 
                list="ticker-suggestions" 
                placeholder="TICKER (es. AAPL)" 
                className="w-full p-3 bg-slate-50 rounded-xl border font-bold uppercase" 
                value={form.ticker} 
                onChange={e => setForm({...form, ticker: e.target.value.toUpperCase()})}
              />
              <datalist id="ticker-suggestions">
                {stockList.map((stock, index) => (
                  <option key={index} value={stock.ticker}>
                    {stock.label}
                  </option>
                ))}
              </datalist>

              <div className="flex gap-2">
                <button onClick={() => setForm({...form, strategy: 'Core'})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${form.strategy === 'Core' ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>CORE</button>
                <button onClick={() => setForm({...form, strategy: 'Satellite'})} className={`flex-1 py-2 rounded-lg text-xs font-bold ${form.strategy === 'Satellite' ? 'bg-teal-500 text-white' : 'bg-slate-50 text-slate-400'}`}>SAT</button>
              </div>
              <input type="number" placeholder={inputType === 'shares' ? "Quantity" : "Invested Amount $"} className="w-full p-3 bg-slate-50 rounded-xl border" value={form.value} onChange={e => setForm({...form, value: e.target.value})}/>
              <button onClick={addAsset} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition">ADD POSITION</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            {assets.length === 0 && <p className="text-center p-4 text-xs text-slate-400 italic">Nessun asset.</p>}
            {assets.map((a, i) => (
              <div key={a.id} onClick={() => setSelectedTicker(a.ticker)} className={`p-4 border-b flex justify-between items-center cursor-pointer transition ${selectedTicker === a.ticker ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full" style={{backgroundColor: getDynamicColor(i, a.strategy)}}/>
                  <div>
                    <p className="font-bold text-sm">{a.ticker}</p>
                    <p className="text-[10px] text-slate-400">{a.strategy.toUpperCase()} • {a.shares.toFixed(2)} sh</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">${((livePrices[a.ticker] || 0) * a.shares).toLocaleString()}</p>
                  <button onClick={(e) => { e.stopPropagation(); setAssets(assets.filter(x => x.id !== a.id)); }} className="text-red-300 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border h-[350px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Trend (7gg): {selectedTicker || '...'}</h3>
            <div className="h-[250px] w-full">
              {loadingChart ? <Loader2 className="animate-spin mx-auto mt-20 text-slate-300"/> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                    <XAxis dataKey="date" tick={{fontSize: 10}} hide={chartData.length === 0}/>
                    <YAxis hide domain={['auto', 'auto']}/>
                    <AreaTooltip />
                    <Area type="monotone" dataKey="price" stroke="#3b82f6" fillOpacity={0.2} fill="#3b82f6" strokeWidth={3}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border h-[320px] flex flex-col items-center">
              <div className="w-full flex justify-between items-end mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase">Allocation</h3>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600">CORE {corePct}%</span>
                  <span className="text-xs text-slate-300 mx-1">|</span>
                  <span className="text-xs font-bold text-teal-500">SAT {satPct}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden flex">
                <div style={{ width: `${corePct}%` }} className="h-full bg-blue-600 transition-all duration-500"></div>
                <div style={{ width: `${satPct}%` }} className="h-full bg-teal-400 transition-all duration-500"></div>
              </div>
              <div className="h-[200px] w-full">
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

            {/* BOX ANALISI AGGIORNATO */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border h-[320px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Search size={14}/> AI Analyst</h3>
                <button onClick={runAnalysis} className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition" disabled={loadingNews}>
                  {loadingNews ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 flex-1 custom-scrollbar">
                {!analysis ? (
                  <p className="text-slate-500 text-xs text-center mt-10">
                    {loadingNews ? "L'AI sta calcolando il punteggio..." : "Premi refresh per valutare."}
                  </p>
                ) : (
                  <>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Health Score</p>
                          <p className={`text-3xl font-black ${getScoreColor(analysis.score)}`}>{analysis.score}/100</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold uppercase ${getScoreColor(analysis.score)}`}>({analysis.rating})</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-3 bg-slate-900 rounded-full flex overflow-hidden mt-2">
                        <div style={{width: `${analysis.sentiment.positive}%`}} className="h-full bg-emerald-500" title="Positive"/>
                        <div style={{width: `${analysis.sentiment.neutral}%`}} className="h-full bg-slate-500" title="Neutral"/>
                        <div style={{width: `${analysis.sentiment.negative}%`}} className="h-full bg-red-500" title="Negative"/>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1 uppercase font-bold">
                        <span>Pos {analysis.sentiment.positive}%</span>
                        <span>Risk {analysis.sentiment.negative}%</span>
                      </div>
                    </div>

                    {analysis.insights.map((n: any, i: number) => (
                      <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="flex gap-2 mb-1">
                          {n.sentiment === 'positive' ? <TrendingUp size={12} className="text-emerald-400"/> : 
                           n.sentiment === 'negative' ? <AlertTriangle size={12} className="text-red-400"/> : 
                           <ShieldCheck size={12} className="text-slate-400"/>}
                          <p className="text-[10px] font-bold uppercase text-slate-200">{n.title}</p>
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