import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "@/styles/mobile.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/navigation/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "RAG Academy",
  description: "Interactive, code-first learning for Retrieval-Augmented Generation (RAG).",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RAG Academy",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white text-zinc-900`}
      >
        <AppProviders>
          <SkipLink />
          <div className="flex flex-col min-h-screen">
            <Header />
            <main id="main-content" className="flex-1 pb-16 md:pb-0" role="main" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <MobileNav />
          </div>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
