import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { QueryProvider } from "@/lib/query-client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NeonPass - High Performance Ticketing",
  description: "Plataforma de venta de tickets con mapas interactivos de asientos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="neonpass">
      <body className={`${inter.variable} font-sans antialiased bg-base-100 text-base-content`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
