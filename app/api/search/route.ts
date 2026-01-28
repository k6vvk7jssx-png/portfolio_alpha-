import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Se non scrivi almeno 2 lettere, non cerca nulla
  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // CHIAMATA A YAHOO FINANCE
    // Usiamo ': any' per dire a TypeScript di stare tranquillo
    const results: any = await yahooFinance.search(query, { newsCount: 0, quotesCount: 6 });
    
    // Se Yahoo non trova nulla, restituiamo lista vuota
    if (!results.quotes || results.quotes.length === 0) {
      return NextResponse.json([]);
    }

    // Formattiamo i dati per la tua barra di ricerca
    const suggestions = results.quotes.map((item: any) => ({
      ticker: item.symbol,
      label: item.longname || item.shortname || item.symbol, // Cerca il nome migliore
      isin: item.exchDisp || 'Stock', 
      type: item.quoteType || 'Equity'
    }));

    return NextResponse.json(suggestions);

  } catch (error) {
    console.error("Errore Ricerca:", error);
    return NextResponse.json([]); // In caso di errore, non crashare, ma dai lista vuota
  }
}