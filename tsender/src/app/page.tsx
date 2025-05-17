"use client";

import HomeContent from "@/components/HomeContent";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiSend } from "react-icons/fi";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-4rem)]"
    >
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6"
          >
            <motion.div
              className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to TSender
            </motion.div>
            <motion.p
              className="text-gray-400 text-lg max-w-md text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Connect your wallet to start sending tokens efficiently and
              securely
            </motion.p>
            <motion.div
              className="mt-4 p-6 rounded-xl glass glass-hover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 text-gray-300">
                <FiSend className="w-5 h-5 text-cyan-400" />
                <p>Please connect a wallet to continue</p>
                <FiArrowRight className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Token Airdrop
              </h1>
              <p className="text-gray-400 text-lg">
                Send tokens to multiple addresses in a single transaction
              </p>
            </motion.div>
            <HomeContent />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
