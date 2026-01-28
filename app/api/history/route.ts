import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticker } = body;

    if (!ticker) return NextResponse.json([], { status: 400 });

    try {
        // Scarichiamo dati a 1 mese (1mo) con intervallo 1 giorno (1d)
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1mo`;
        
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const data = await response.json();
        const result = data?.chart?.result?.[0];

        if (!result) return NextResponse.json([]);

        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0].close;

        // Uniamo date e prezzi
        const chartData = timestamps.map((time: number, i: number) => ({
            date: new Date(time * 1000).toLocaleDateString('it-IT', { weekday: 'short' }),
            price: quotes[i]
        })).filter((item: any) => item.price).slice(-7); // Prendiamo gli ultimi 7 giorni validi

        return NextResponse.json(chartData);

    } catch (err) {
        console.error("Errore fetch grafico:", err);
        return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json([]); 
  }
}