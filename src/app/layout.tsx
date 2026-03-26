import type { Metadata } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "FraudGuard AI - Deteksi Fraud Digital Real-time",
  description: "Platform deteksi fraud mutakhir dengan GNN dan XAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${publicSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-dark-900 text-dark-100 flex flex-col min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
