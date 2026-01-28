import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Aggiungiamo ': any' per zittire TypeScript
    const results: any = await yahooFinance.search(query, { newsCount: 0, quotesCount: 10 });
    
    // Ora TypeScript non si lamenta più di .quotes
    const suggestions = results.quotes.map((item: any) => ({
      ticker: item.symbol,
      label: item.longname || item.shortname || item.symbol,
      isin: item.exchDisp || 'N/A', 
      type: item.quoteType
    }));

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json([]);
  }
}