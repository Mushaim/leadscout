import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadScout — AI B2B creator finder",
  description: "Find, score, and reach out to B2B creators/influencers — an AI agent demo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
