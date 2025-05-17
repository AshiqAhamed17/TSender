"use client";

import InputField from "@/components/ui/InputField";
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { calculateTotal } from "@/utils";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { FiCheck, FiLoader, FiSend } from "react-icons/fi";
import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";

export default function AirdropForms() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<
    "input" | "approving" | "sending" | "complete"
  >("input");

  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const getApprovedAmount = async (
    tSenderAddress: string | null
  ): Promise<number> => {
    if (!tSenderAddress) {
      alert("No address found, Please use a supported chain");
      return 0;
    }

    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tokenAddress as `0x${string}`],
    });

    return response as number;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setStep("approving");

    try {
      const tSenderAddress = chainsToTSender[chainId]["tsender"];
      const approvedAmount = await getApprovedAmount(tSenderAddress);

      if (approvedAmount < total) {
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, total],
        });
        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash,
        });
        console.log("Approval Confirmed: ", approvalReceipt);
      }

      setStep("sending");
      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [
          tokenAddress,
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ""),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ""),
          BigInt(total),
        ],
      });

      setStep("complete");
    } catch (error) {
      console.error(error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div
        className="glass glass-hover rounded-xl p-8 space-y-6"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InputField
            label="Token Address"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <InputField
            label="Recipients"
            placeholder="0x123..., 0x5678..., 0x9abc..."
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            large={true}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <InputField
            label="Amount"
            placeholder="100, 200, 300, ..."
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
            large={true}
          />
        </motion.div>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400 bg-white/5 rounded-lg p-3"
          >
            Total Amount: {total}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.button
            key={step}
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`relative group w-full inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ease-in-out ${
              isProcessing
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            }`}
            whileHover={!isProcessing ? { scale: 1.02 } : {}}
            whileTap={!isProcessing ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 rounded-xl" />
            <span className="relative z-10 flex items-center gap-2">
              {step === "input" && <FiSend className="w-5 h-5" />}
              {step === "approving" && (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Approving...
                </>
              )}
              {step === "sending" && (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Sending Tokens...
                </>
              )}
              {step === "complete" && (
                <>
                  <FiCheck className="w-5 h-5" />
                  Complete
                </>
              )}
              {step === "input" && "Send Tokens"}
            </span>
          </motion.button>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
