// components/Header.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";



export default function Header() {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-cyan-900 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Branding */}
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-cyan-400 tracking-tight hover:opacity-90 transition-all">
                        TSender
                    </span>
                    <Link
                        href="https://github.com/AshiqAhamed17/TSender"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition"
                    >
                        <FaGithub size={22} />
                    </Link>
                </div>
                <section className="p-3">
                    <p className="text-gray-400">Your trustless ETH & token sending hub.</p>
                </section>

                {/* Wallet Connect */}
                <div>
                    <ConnectButton showBalance={false} chainStatus="icon" />
                </div>
            </div>
        </header>
    );
}