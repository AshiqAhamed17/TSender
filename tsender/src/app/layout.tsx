import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import Header from "@/components/Header";



export const metadata: Metadata = {
  title: "TSender",
  description: "Hyper gas efficient smart contracts for air dropping tokens to a large number of users",
};

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#3d3c3c] text-white antialiased min-h-screen">
        <Providers>
          <Header />
          {props.children}
        </Providers>
        
      </body>
    </html>
  );
}
