// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono,Baloo_2,Comfortaa, Quicksand } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { ScrollToTop } from '@/components/scrollToTop';

const comfortaa = Comfortaa({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-comfortaa', 
});
const baloo = Baloo_2({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-baloo', 
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const quickSand = Quicksand({
  variable: "--font-quick-sand",
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Liste de Naissance - Petit Marsupilami",
  description: "Liste de naissance pour notre petit marsupilami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body
        className={`${quickSand.className} antialiased bg-gradient-to-b from-sky-100 to-white text-slate-800`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}