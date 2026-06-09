import type { Metadata } from "next";
import { EB_Garamond, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// EB Garamond — the free Google Fonts equivalent of Garamond Premier Pro.
const garamond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-garamond",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Grab";
const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE ?? "Shoppers Insider";

export const metadata: Metadata = {
  title: `${appName} — ${appTagline}`,
  description:
    "Know what to buy before everyone else does. Resale price trends and ML-powered forecasts for fashion items across brands and categories.",
  icons: { icon: "/assets/grab-logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${garamond.variable} ${dmSans.variable} ${jetbrains.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <Navbar />
        <main className="min-h-[calc(100vh-9rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
