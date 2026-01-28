import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers } = body;

    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({});
    }

    const prices: Record<string, number> = {};

    for (const ticker of tickers) {
      try {
        // AGGIUNTO ': any' QUI SOTTO PER RISOLVERE GLI ERRORI ROSSI
        const result: any = await yahooFinance.quote(ticker);
        
        // Ora TypeScript non si bloccherà più su queste proprietà
        const price = result.regularMarketPrice || result.currentPrice || result.ask || result.bid || 0;
        
        prices[ticker] = price;
      } catch (err) {
        console.error(`Prezzo non trovato per ${ticker}`);
        prices[ticker] = 0; 
      }
    }

    return NextResponse.json(prices);
    
  } catch (error) {
    console.error("Errore server prezzi:", error);
    return NextResponse.json({}, { status: 500 });
  }
}