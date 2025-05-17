// components/Header.tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { FiCoffee, FiMoon, FiSend, FiSun } from "react-icons/fi";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function Header() {
  const { isConnected, address } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const toggleTheme = (theme: string) => {
    setAlertMessage(`Switching to ${theme} theme...`);
    setShowAlert(true);

    // Add a small delay to show the alert
    setTimeout(() => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);

      // Hide the alert after theme is applied
      setTimeout(() => {
        setShowAlert(false);
      }, 1000);
    }, 300);
  };

  return (
    <>
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg"
          >
            <p className="text-white text-sm font-medium">{alertMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/5 border-b border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <div className="flex items-center gap-2">
              <FiSend className="w-6 h-6 text-cyan-400 transition-colors duration-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent transition-all duration-300">
                TSender
              </span>
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="px-2 py-1 text-xs rounded-full bg-cyan-400/10 text-cyan-400 transition-colors duration-300">
                  Gas Efficient
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-400/10 text-blue-400 transition-colors duration-300">
                  Trustless
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-400/10 text-purple-400 transition-colors duration-300">
                  Secure
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="https://github.com/AshiqAhamed17/TSender"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaGithub size={20} />
              </Link>
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                label="Connect Wallet"
              />
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                label="Connect"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-1 rounded-lg bg-white/5 transition-colors duration-300">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTheme("light")}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors duration-300"
                  title="Light Mode"
                >
                  <FiSun className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTheme("dark")}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors duration-300"
                  title="Dark Mode"
                >
                  <FiMoon className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTheme("aesthetic")}
                  className="p-2 rounded-md hover:bg-white/10 transition-colors duration-300"
                  title="Aesthetic Mode"
                >
                  <FiCoffee className="w-5 h-5" />
                </motion.button>
              </div>

              {isConnected ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => disconnect()}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-300"
                >
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connect({ connector: injected() })}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium transition-all duration-300"
                >
                  Connect Wallet
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
