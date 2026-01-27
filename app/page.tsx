"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Plus, Trash2, BarChart3, Newspaper, BrainCircuit } from 'lucide-react';
import { stockList } from './stockList';
// 1. IMPORTIAMO GLI STRUMENTI CLERK
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';

const APP_NAME = "Portfolio Alpha";

export default function Home() {
  // 2. RECUPERIAMO I DATI UTENTE
  const { user } = useUser();

  const [stocks, setStocks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loadingNews, setLoadingNews] = useState(false);

  // Caricamento Iniziale
  useEffect(() => {
    const saved = localStorage.getItem('portfolio_alpha_stocks');
    if (saved) setStocks(JSON.parse(saved));
  }, []);

  // Aggiornamento Prezzi Simulato
  const updatePrices = () => {
    const updated = stocks.map(stock => ({
      ...stock,
      price: stock.price * (1 + (Math.random() * 0.04 - 0.02)),
      change: (Math.random() * 4 - 2)
    }));
    setStocks(updated);
    recalculateTotal(updated);
    saveData(updated);
  };

  const recalculateTotal = (currentStocks: any[]) => {
    const t = currentStocks.reduce((acc, s) => acc + (s.price * s.shares), 0);
    setTotal(t);
  };

  const saveData = (data: any[]) => {
    localStorage.setItem('portfolio_alpha_stocks', JSON.stringify(data));
  };

  const addStock = (ticker: string) => {
    const base = stockList.find(s => s.ticker === ticker);
    if (!base) return;
    const newStock = { ...base, shares: 1, id: Date.now() };
    const updated = [...stocks, newStock];
    setStocks(updated);
    recalculateTotal(updated);
    saveData(updated);
  };

  const removeStock = (id: number) => {
    const updated = stocks.filter(s => s.id !== id);
    setStocks(updated);
    recalculateTotal(updated);
    saveData(updated);
  };

  const runAnalysis = async () => {
    setLoadingNews(true);
    setAnalysis(null);
    try {
      const portfolioText = stocks.map(s => `${s.shares} azioni di ${s.name}`).join(', ');
      const query = `Analizza questo portafoglio: ${portfolioText}. Dammi Health Score (0-100), Sentiment e Consigli.`;
      
      const res = await fetch('/api/analyze', { 
        method: 'POST', 
        body: JSON.stringify({ query }) 
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (e) { console.error(e); }
    setLoadingNews(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER CON LOGIN --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-black flex items-center gap-2 tracking-tight text-slate-800">
              <BarChart3 className="text-blue-600" /> {APP_NAME}
            </h1>
            {/* Se l'utente è loggato, salutalo! */}
            <SignedIn>
              <p className="text-sm text-slate-500 mt-1">Bentornato, {user?.firstName}!</p>
            </SignedIn>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 tracking-wider">NET WORTH</p>
              <p className="text-4xl font-black text-slate-900">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>
            
            {/* ZONA LOGIN */}
            <div className="border-l pl-6 border-slate-200">
              {/* Se sei FUORI -> Mostra bottone Login */}
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    Accedi
                  </button>
                </SignInButton>
              </SignedOut>

              {/* Se sei DENTRO -> Mostra Avatar utente */}
              <SignedIn>
                <UserButton afterSignOutUrl="/"/>
              </SignedIn>
            </div>
          </div>
        </header>

        {/* --- CONTENUTO PRINCIPALE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLONNA 1: AZIONI */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500"/> I tuoi Asset
                </h2>
                <button onClick={updatePrices} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <RefreshCw className="w-5 h-5 text-slate-400"/>
                </button>
              </div>

              <div className="space-y-3">
                {stocks.map((stock) => (
                  <div key={stock.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-200 group">
                    <div>
                      <h3 className="font-bold text-slate-800">{stock.ticker}</h3>
                      <p className="text-sm text-slate-500">{stock.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold">${stock.price.toFixed(2)}</p>
                        <p className={`text-xs font-bold ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                        </p>
                      </div>
                      <button onClick={() => removeStock(stock.id)} className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* AGGIUNTA AZIONI */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-3 uppercase">Aggiungi al portafoglio</p>
                <div className="flex gap-2 flex-wrap">
                  {stockList.map((s) => (
                    <button 
                      key={s.ticker}
                      onClick={() => addStock(s.ticker)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3"/> {s.ticker}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COLONNA 2: INTELLIGENZA ARTIFICIALE */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-blue-400"/> AI Analyst
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Clicca per generare un report professionale basato su news in tempo reale e analisi tecnica.
                </p>
                
                <button 
                  onClick={runAnalysis}
                  disabled={loadingNews || stocks.length === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition flex justify-center items-center gap-2"
                >
                  {loadingNews ? (
                    <RefreshCw className="w-5 h-5 animate-spin"/>
                  ) : (
                    <>Generate Report ✨</>
                  )}
                </button>
              </div>
            </div>

            {/* RISULTATI AI */}
            {analysis && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-800">Analisi Completata</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    analysis.score > 70 ? 'bg-emerald-100 text-emerald-700' : 
                    analysis.score > 40 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    Score: {analysis.score}/100
                  </span>
                </div>
                
                <div className="prose prose-sm text-slate-600 mb-6">
                  <p>{analysis.analysis}</p>
                </div>

                {analysis.news && analysis.news.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <Newspaper className="w-3 h-3"/> Fonti Utilizzate
                    </h4>
                    <ul className="space-y-2">
                      {analysis.news.map((n: any, i: number) => (
                        <li key={i}>
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline line-clamp-1">
                            {n.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}