import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontDisplay = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fin-Sentinel 🛡️ | AI Financial Control Tower",
  description: "Enterprise autonomous financial anomaly detection, adversarial evidence verification, and multi-agent reconciliation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col selection:bg-[#C50337]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
