import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const GROQ_KEY = process.env.GROQ_API_KEY;
    const GNEWS_KEY = process.env.GNEWS_API_KEY;

    if (!GROQ_KEY || !GNEWS_KEY) {
      return NextResponse.json({ error: "Mancano API Key" });
    }

    const body = await request.json();
    const customQuery = body.query || "Economy"; 

    // 1. RECUPERO NEWS (con Piano B automatico)
    let url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(customQuery)}&lang=en&sortby=publishedAt&max=5&apikey=${GNEWS_KEY}`;
    let newsResponse = await fetch(url);
    let newsData = await newsResponse.json();
    let articles = newsData.articles || [];
    let isFallback = false;

    if (articles.length === 0) {
        console.log("⚠️ Attivo Piano B: News Globali");
        isFallback = true;
        url = `https://gnews.io/api/v4/search?q=Stock%20Market%20OR%20Global%20Economy&lang=en&sortby=publishedAt&max=5&apikey=${GNEWS_KEY}`;
        newsResponse = await fetch(url);
        newsData = await newsResponse.json();
        articles = newsData.articles || [];
    }

    if (articles.length === 0) return NextResponse.json({ error: "Nessuna notizia trovata." });

    // 2. ANALISI QUANTITATIVA CON GROQ
    const groq = new Groq({ apiKey: GROQ_KEY });
    
    const contextInstruction = isFallback 
        ? "Non ci sono news specifiche. Valuta il SENTIMENT MACROECONOMICO GLOBALE e dai un voto alla salute generale dei mercati."
        : "Valuta la salute specifica di questo portafoglio basandoti sulle news.";

    const prompt = `
      Sei un analista finanziario quantitativo.
      ${contextInstruction}
      
      NEWS:
      ${articles.map((a: any, i: number) => `${i+1}. ${a.title}`).join('\n')}

      COMPITO:
      1. Assegna un "Portfolio Health Score" da 0 a 100 (0=Crollo, 100=Boom).
      2. Calcola la distribuzione del sentiment (deve sommare a 100%).
      3. Estrai 3 insight chiave.

      Rispondi ESCLUSIVAMENTE con questo formato JSON (no markdown):
      {
        "score": 75,
        "rating": "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell",
        "sentiment": { "positive": 60, "negative": 10, "neutral": 30 },
        "insights": [
          { "title": "Titolo breve", "sentiment": "positive", "reason": "Spiegazione..." }
        ]
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3, 
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const jsonString = content.replace(/```json|```/g, '').trim();
    
    // Estrazione JSON sicura
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        return NextResponse.json(JSON.parse(jsonString.substring(firstBrace, lastBrace + 1)));
    } else {
        throw new Error("Formato JSON non valido");
    }

  } catch (error: any) {
    console.error("ERRORE:", error);
    // Dati di fallback in caso di errore tecnico
    return NextResponse.json({ 
        score: 50, 
        rating: "Neutral", 
        sentiment: { positive: 33, negative: 33, neutral: 34 }, 
        insights: [{ title: "Errore Tecnico", sentiment: "neutral", reason: "Impossibile calcolare il punteggio ora." }] 
    });
  }
}