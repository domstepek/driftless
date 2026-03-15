import { RootProvider } from "fumadocs-ui/provider/next";
import { Familjen_Grotesk, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

const familjenGrotesk = Familjen_Grotesk({
  weight: "700",
  subsets: ["latin"],
  variable: "--font-display",
  display: "block",
});

const instrumentSans = Instrument_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "driftless — Documentation that writes itself",
    template: "%s | driftless",
  },
  description:
    "Your e2e tests become training docs. Automatically. Driftless reads your end-to-end tests and generates human-readable documentation that stays in sync.",
  metadataBase: new URL("https://driftless.dev"),
  openGraph: {
    title: "driftless — Documentation that writes itself",
    description:
      "Your e2e tests become training docs. Automatically. Driftless reads your end-to-end tests and generates human-readable documentation that stays in sync.",
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
    title: "driftless — Documentation that writes itself",
    description:
      "Your e2e tests become training docs. Automatically. Driftless reads your end-to-end tests and generates human-readable documentation that stays in sync.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${familjenGrotesk.variable} ${instrumentSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
