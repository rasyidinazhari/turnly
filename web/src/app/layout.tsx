import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turnly — Autonomous Onchain ROSCA & Social Savings",
  description:
    "Autonomous onchain rotating savings powered by Monad smart contracts. Zero treasurers, automated pot distribution, and frictionless email authentication.",
  keywords: ["arisan", "rosca", "onchain", "monad", "stablecoin", "social savings", "defi"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
