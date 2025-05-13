"use client"

import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";
export default function Home() {
  const { isConnected } = useAccount();
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
    {!isConnected ? (
      <div className="flex items-center justify-center mr-6 pt-5 text-2xl text-gray-200">
        Please connect a wallet...
      </div>
    ) : (
      <div>
        <HomeContent />
      </div>
    )}
    </main>
  );
}
