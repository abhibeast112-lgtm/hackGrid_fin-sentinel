import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fin-Sentinel | Financial Control Tower",
  description: "Autonomous financial exception detection, invoice discrepancy review, and audit trail management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-[#132228] text-[#F5EED2] flex flex-col font-sans selection:bg-[#EBAE29]/20 selection:text-[#F5EED2]">
        {children}
      </body>
    </html>
  );
}
