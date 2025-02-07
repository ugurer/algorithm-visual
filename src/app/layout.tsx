import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Algoritma Görselleştirici",
  description: "Algoritmaların çalışma mantığını interaktif bir şekilde öğrenin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <a href="/" className="text-xl font-bold">
                Algoritma Görselleştirici
              </a>
              <div className="flex flex-wrap gap-4">
                <a href="/algorithms/basic" className="text-sm hover:text-blue-500">
                  Temel
                </a>
                <a href="/algorithms/sorting" className="text-sm hover:text-blue-500">
                  Sıralama
                </a>
                <a href="/algorithms/search" className="text-sm hover:text-blue-500">
                  Arama
                </a>
                <a href="/algorithms/array-matrix" className="text-sm hover:text-blue-500">
                  Dizi/Matris
                </a>
                <a href="/algorithms/tree" className="text-sm hover:text-blue-500">
                  Ağaç
                </a>
                <a href="/algorithms/graph" className="text-sm hover:text-blue-500">
                  Graf
                </a>
                <a href="/algorithms/dynamic" className="text-sm hover:text-blue-500">
                  Dinamik
                </a>
                <a href="/algorithms/ai" className="text-sm hover:text-blue-500">
                  Yapay Zeka
                </a>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
