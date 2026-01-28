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
        const result: any = await yahooFinance.quote(ticker);
        // Prende il prezzo, se non c'è prova con altri campi, se no mette 0
        const price = result.regularMarketPrice || result.currentPrice || result.ask || 0;
        prices[ticker] = price;
      } catch (err) {
        console.error(`Errore prezzo ${ticker}`);
        prices[ticker] = 0; 
      }
    }

    return NextResponse.json(prices);
    
  } catch (error) {
    return NextResponse.json({}, { status: 500 });
  }
}