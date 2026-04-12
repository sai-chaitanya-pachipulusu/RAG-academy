import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "@/styles/mobile.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/navigation/MobileNav";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  metadataBase: new URL("https://ragacademy.space"),
  title: {
    default: "RAG Academy — Interactive RAG Learning Platform",
    template: "%s | RAG Academy",
  },
  description: "Master Retrieval-Augmented Generation (RAG) through 260+ interactive, code-first challenges. From vector math fundamentals to production-grade systems.",
  keywords: [
    "RAG",
    "Retrieval Augmented Generation",
    "LLM",
    "AI",
    "Machine Learning",
    "Vector Database",
    "Embeddings",
    "Prompt Engineering",
    "LangChain",
    "LlamaIndex",
    "Python",
    "Interactive Learning",
    "Code Challenges",
  ],
  authors: [{ name: "RAG Academy Team" }],
  creator: "RAG Academy",
  publisher: "RAG Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ragacademy.space",
    siteName: "RAG Academy",
    title: "RAG Academy — Interactive RAG Learning Platform",
    description: "Master Retrieval-Augmented Generation (RAG) through 260+ interactive, code-first challenges.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RAG Academy — Interactive RAG Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Academy — Interactive RAG Learning Platform",
    description: "Master Retrieval-Augmented Generation (RAG) through 260+ interactive, code-first challenges.",
    images: ["/og-image.png"],
  },
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
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-white text-gray-900`}
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
        <SpeedInsights />
      </body>
    </html>
  );
}
