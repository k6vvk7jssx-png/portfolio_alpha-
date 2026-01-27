import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers } = body;

    // Controllo di sicurezza
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: 'Nessun ticker fornito' }, { status: 400 });
    }

    const prices: Record<string, number> = {};

    // Ciclo su ogni ticker
    for (const ticker of tickers) {
      try {
        // --- QUI C'È IL FIX: Aggiungiamo ': any' per zittire l'errore TypeScript ---
        const result: any = await yahooFinance.quote(ticker);
        
        // Ora TypeScript non si lamenterà più di queste proprietà
        const price = result.regularMarketPrice || result.currentPrice || result.ask || result.bid || 0;
        
        prices[ticker] = price;
      } catch (err) {
        console.error(`Prezzo non trovato per ${ticker}`);
        prices[ticker] = 0; 
      }
    }

    return NextResponse.json(prices);
    
  } catch (error) {
    console.error("Errore server:", error);
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 });
  }
}