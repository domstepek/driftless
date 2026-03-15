import { RootProvider } from "fumadocs-ui/provider/next";
import { Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "driftless — Keep docs in sync with your tests",
    template: "%s | driftless",
  },
  description:
    "AI-powered documentation that stays in sync with your e2e tests. Never ship stale docs again.",
  metadataBase: new URL("https://driftless.dev"),
  openGraph: {
    title: "driftless — Keep docs in sync with your tests",
    description:
      "AI-powered documentation that stays in sync with your e2e tests. Never ship stale docs again.",
    url: "https://driftless.dev",
    siteName: "driftless",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "driftless — Your e2e tests become training docs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "driftless — Keep docs in sync with your tests",
    description:
      "AI-powered documentation that stays in sync with your e2e tests. Never ship stale docs again.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={instrumentSerif.variable} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
