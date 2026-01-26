import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tickers } = await request.json();
    if (!tickers || tickers.length === 0) return NextResponse.json({});

    const yahooFinanceModule = require('yahoo-finance2').default;
    const yahooFinance = new yahooFinanceModule();

    const results = await yahooFinance.quote(tickers);
    const prices: Record<string, number> = {};
    
    const findRealPrice = (q: any) => {
      return q.regularMarketPrice || q.currentPrice || q.price || q.ask || q.bid || 0;
    };

    if (Array.isArray(results)) {
      results.forEach((q: any) => prices[q.symbol] = findRealPrice(q));
    } else if (results) {
      prices[results.symbol] = findRealPrice(results);
    }

    return NextResponse.json(prices);
  } catch (error: any) {
    return NextResponse.json({}, { status: 500 });
  }
}