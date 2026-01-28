import { NextResponse } from 'next/server';
import { stockList } from '../../stockList';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase(); // Trasformiamo tutto in minuscolo per facilitare

  if (!query || query.length < 1) return NextResponse.json([]);

  const results = stockList.filter(item => {
    const text = (item.label + " " + item.ticker + " " + (item.keywords || "")).toLowerCase();
    return text.includes(query);
  });

  // Limitiamo a 10 risultati per non intasare il menu
  return NextResponse.json(results.slice(0, 10));
}