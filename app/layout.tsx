import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sona — AI-Powered Video Calls",
  description: "Crystal-clear video calls with a live AI co-pilot. Real-time transcription, smart summaries, and action items — automatically.",
  keywords: ["video call", "AI meeting", "transcription", "Sona"],
  openGraph: {
    title: "Sona — AI-Powered Video Calls",
    description: "Meet smarter. Sona transcribes, summarises, and extracts action items from every call — in real time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
