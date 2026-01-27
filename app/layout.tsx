import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Alpha",
  description: "AI Financial Analyst",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {children}
        </div>

        {/* FOOTER LEGALE */}
        <footer className="bg-slate-900 text-slate-500 text-[10px] py-8 border-t border-slate-800 mt-auto">
          <div className="max-w-6xl mx-auto px-6 text-center space-y-2">
            <p className="font-bold uppercase tracking-widest text-slate-400">
              Disclaimer Legale & Rischio
            </p>
            <p className="max-w-2xl mx-auto leading-relaxed">
              Questa applicazione utilizza l&apos;Intelligenza Artificiale per fornire analisi di mercato a scopo esclusivamente 
              informativo e didattico. <strong>Le informazioni fornite NON costituiscono consulenza finanziaria</strong>, 
              invito al risparmio o sollecitazione all&apos;investimento.
            </p>
            <p className="max-w-2xl mx-auto leading-relaxed">
              Il trading e gli investimenti comportano un <strong>rischio significativo di perdita del capitale</strong>. 
              I rendimenti passati non sono garanzia di risultati futuri. L&apos;utente si assume la piena responsabilità 
              delle proprie decisioni di investimento. Si raccomanda di consultare un consulente finanziario qualificato 
              prima di operare.
            </p>
            <p className="pt-4 text-slate-700">
              &copy; {new Date().getFullYear()} Portfolio Alpha. Tutti i diritti riservati.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}