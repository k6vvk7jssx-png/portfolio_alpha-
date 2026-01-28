import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tickers } = body;

    if (!tickers || !Array.isArray(tickers)) return NextResponse.json({});

    const prices: Record<string, number> = {};

    for (const ticker of tickers) {
      try {
        // TRUCCO: Usiamo l'endpoint del GRAFICO (v8) invece di quello delle QUOTE (v7).
        // È molto più robusto e contiene il prezzo corrente nei "meta" dati.
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, // Fingiamo di essere Chrome
            cache: 'no-store'
        });
        
        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;

        // Cerca il prezzo in questo ordine di priorità:
        // 1. Prezzo di mercato regolare (adesso)
        // 2. Prezzo chiusura precedente (se mercato chiuso)
        let price = meta?.regularMarketPrice || meta?.chartPreviousClose || 0;

        prices[ticker] = parseFloat(price.toFixed(2));

      } catch (err) {
        console.error(`Errore fetch per ${ticker}`);
        // Se fallisce, lascia 0 (così capiamo che c'è un problema) o metti un fallback
        prices[ticker] = 0; 
      }
    }

    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json({});
  }
}