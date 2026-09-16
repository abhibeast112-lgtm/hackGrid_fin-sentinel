import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import { BusinessBackground } from "@/components/layout/BusinessBackground";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fin-Sentinel | AI Financial Control Tower",
  description: "Enterprise autonomous financial anomaly detection, multi-agent evidence verification, and tiered approval governance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} dark h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans relative transition-colors duration-200">
        <ThemeProvider>
          {/* Rich Institutional Business Background */}
          <BusinessBackground />

          {/* Foreground Content */}
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
