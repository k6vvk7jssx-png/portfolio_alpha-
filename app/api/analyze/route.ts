import { NextResponse } from 'next/server';
import Groq from "groq-sdk";
import { auth } from "@clerk/nextjs/server";

// --- 1. GESTIONE LIMITI (MEMORY) ---
const USAGE_TRACKER: Record<string, { date: string; count: number }> = {};
const DAILY_LIMIT = 2; 

export async function POST(request: Request) {
  try {
    // A. CONTROLLO IDENTITÀ (FIX: Aggiunto 'await')
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Devi essere loggato." }, { status: 401 });
    }

    // B. LOGICA BLOCCO GIORNALIERO ⛔
    const today = new Date().toLocaleDateString('it-IT');

    // Se è un nuovo giorno (o primo accesso), resettiamo il contatore
    if (!USAGE_TRACKER[userId] || USAGE_TRACKER[userId].date !== today) {
        USAGE_TRACKER[userId] = { date: today, count: 0 };
    }

    // Se ha superato il limite, BLOCCA e rispondi con errore 429
    if (USAGE_TRACKER[userId].count >= DAILY_LIMIT) {
        return NextResponse.json({ 
            error: "LIMIT_REACHED", 
            message: "Hai raggiunto il limite di 2 analisi giornaliere." 
        }, { status: 429 });
    }

    // Se passa, incrementiamo il contatore
    USAGE_TRACKER[userId].count++;


    // --- 2. LOGICA AI ---
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_KEY) {
        // Fallback silenzioso se manca la chiave (per evitare crash)
        throw new Error("Manca API Key Groq"); 
    }

    const body = await request.json();
    const customQuery = body.query; 

    // C. PROMPT "SHERLOCK HOLMES" 🕵️‍♂️
    const prompt = `
      Agisci come un Senior Hedge Fund Manager. Analizza questo portafoglio utente:
      "${customQuery}"

      OBIETTIVO:
      Non limitarti a descrivere le aziende. Spiega i COLLEGAMENTI (Supply Chain, Settore, Macroeconomia).
      
      ESEMPI DI ANALISI CHE VOGLIO:
      - Invece di "Nvidia fa chip", di': "Nvidia è il motore dell'AI Generativa e traina il settore Tech".
      - Invece di "Eni è energia", di': "Eni è correlata al prezzo del Brent e ai rischi geopolitici".

      FORMATO RISPOSTA (JSON STRICT):
      Rispondi SOLO con questo JSON valido (senza markdown):
      {
        "score": (numero intero 0-100),
        "rating": "Strong Buy" | "Buy" | "Hold" | "Sell",
        "advice": "Consiglio operativo diretto e breve (massimo 20 parole).",
        "sentiment": { "positive": 0, "neutral": 0, "negative": 0 },
        "insights": [
          { 
            "title": "Nome Azienda o Macro-Tema", 
            "sentiment": "positive" | "negative" | "neutral", 
            "reason": "Spiegazione profonda del collegamento causa-effetto." 
          }
        ]
      }
    `;

    // D. CHIAMATA A GROQ
    const groq = new Groq({ apiKey: GROQ_KEY });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
    });

    const content = completion.choices[0]?.message?.content || "{}";
    
    // E. PULIZIA JSON
    const jsonString = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        const cleanJson = jsonString.substring(firstBrace, lastBrace + 1);
        return NextResponse.json(JSON.parse(cleanJson));
    } else {
        throw new Error("Risposta AI non valida");
    }

  } catch (error: any) {
    console.error("ERRORE AI:", error);

    // F. RETE DI SICUREZZA (FALLBACK) 🛡️
    return NextResponse.json({ 
        score: 50, 
        rating: "Hold", 
        advice: "Servizio di analisi momentaneamente non disponibile.",
        sentiment: { positive: 0, negative: 0, neutral: 100 }, 
        insights: [
            { 
                title: "Errore Connessione AI", 
                sentiment: "neutral", 
                reason: "Impossibile contattare l'analista virtuale. Riprova tra poco." 
            }
        ] 
    });
  }
}