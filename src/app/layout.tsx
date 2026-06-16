import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepAI — AI-Powered Interview Practice",
  description:
    "Ace your next interview with PrepAI. Voice-first AI interview coaching with real-time feedback, scoring, and improvement suggestions.",
  openGraph: {
    title: "PrepAI — AI-Powered Interview Practice",
    description:
      "Ace your next interview with PrepAI. Voice-first AI interview coaching with real-time feedback, scoring, and improvement suggestions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${dmSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
