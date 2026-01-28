import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- QUESTA È LA RIGA MAGICA CHE CARICA I COLORI
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio Alpha",
  description: "AI Financial Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}