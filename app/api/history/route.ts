import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticker } = body;
    if (!ticker) return NextResponse.json([]);

    const yahooFinanceModule = require('yahoo-finance2').default;
    const yahooFinance = new yahooFinanceModule();

    // CALCOLO DATA PER EVITARE L'ERRORE 'INVALID DATE'
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7); 

    const result = await yahooFinance.chart(ticker, { 
      period1: sevenDaysAgo, // Usa l'oggetto Date calcolato
      interval: '1d' 
    });
    
    if (!result || !result.quotes) return NextResponse.json([]);

    const chartData = result.quotes
      .map((q: any) => ({
        date: new Date(q.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' }),
        price: q.close
      }))
      .filter((item: any) => item.price !== undefined && item.price !== null);

    return NextResponse.json(chartData);

  } catch (error: any) {
    console.error("ERRORE GRAFICO:", error.message || error);
    return NextResponse.json([]);
  }
}