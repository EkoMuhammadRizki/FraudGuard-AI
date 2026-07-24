import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import SplashScreen from "@/komponen/bersama/splash-screen";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Amankan Fraud - Deteksi Fraud Digital Real-time",
  description: "Platform deteksi fraud mutakhir dengan GNN dan XAI.",
  icons: {
    icon: "/logo-transparent.png",
    shortcut: "/logo-transparent.png",
    apple: "/logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${publicSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-dark-900 text-dark-100 flex flex-col min-h-screen`}>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
