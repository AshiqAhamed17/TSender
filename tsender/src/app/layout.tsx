import Footer from "@/components/site/Footer";
import Nav from "@/components/site/Nav";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "TSender: batch token transfers",
  description:
    "Send ERC-20 tokens or ETH to hundreds of wallets in a single transaction, using a gas-optimised smart contract.",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen overflow-x-hidden">
        <Providers>
          <Nav />
          <main>{props.children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
