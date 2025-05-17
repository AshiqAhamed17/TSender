import Header from "@/components/Header";
import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { ThemeScript } from "./theme-script";

export const metadata: Metadata = {
  title: "TSender",
  description:
    "Hyper gas efficient smart contracts for air dropping tokens to a large number of users",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white antialiased overflow-x-hidden theme-transition">
        <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="fixed inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="fixed top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="fixed top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="fixed -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

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
