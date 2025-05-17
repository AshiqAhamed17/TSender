import Header from "@/components/Header";
import StarsBackground from "@/components/StarsBackground";
import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TSender",
  description:
    "Hyper gas efficient smart contracts for air dropping tokens to a large number of users",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-gradient-to-br from-[var(--bg-gradient-1)] via-[var(--bg-gradient-2)] to-[var(--bg-gradient-3)] text-white antialiased overflow-x-hidden theme-transition">
        <StarsBackground />
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

        <Providers>
          <div className="relative">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {props.children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
