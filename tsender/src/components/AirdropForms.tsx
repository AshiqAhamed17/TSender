"use client";

import InputField from "@/components/ui/InputField";
import { chainsToStablecoins, chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { calculateTotal } from "@/utils";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiLoader, FiSend, FiUpload } from "react-icons/fi";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useConfig, useWriteContract } from "wagmi";

function parseList(input: string): string[] {
  return input
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s !== "");
}

// Maps ERC-20 symbols to CoinGecko coin ids for a rough live USD estimate.
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  EURC: "euro-coin",
  WETH: "weth",
  ETH: "ethereum",
};

export default function AirdropForms() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<
    "input" | "approving" | "sending" | "complete"
  >("input");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const stablecoins = chainsToStablecoins[chainId] ?? [];

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!tokenAddress) {
        setTokenDecimals(18);
        setTokenSymbol("");
        return;
      }

      try {
        const [decimals, symbol] = await Promise.all([
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "decimals",
          }),
          readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "symbol",
          }),
        ]);

        setTokenDecimals(Number(decimals));
        setTokenSymbol(String(symbol));
      } catch (error) {
        console.error("Error fetching token info:", error);
        setTokenDecimals(18);
        setTokenSymbol("");
      }
    };

    fetchTokenInfo();
  }, [tokenAddress, config]);

  useEffect(() => {
    const coingeckoId = SYMBOL_TO_COINGECKO_ID[tokenSymbol.toUpperCase()];
    if (!coingeckoId) {
      setUsdPrice(null);
      return;
    }

    let cancelled = false;
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUsdPrice(data?.[coingeckoId]?.usd ?? null);
      })
      .catch(() => {
        if (!cancelled) setUsdPrice(null);
      });

    return () => {
      cancelled = true;
    };
  }, [tokenSymbol]);

  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

  const parsedRecipients = useMemo(() => parseList(recipients), [recipients]);
  const parsedAmountStrings = useMemo(() => parseList(amounts), [amounts]);
  const preview = useMemo(
    () =>
      parsedRecipients.map((address, i) => ({
        address,
        amount: parsedAmountStrings[i] ?? "",
      })),
    [parsedRecipients, parsedAmountStrings]
  );

  const getParsedAmounts = () => {
    if (!amounts) return [];
    return parseList(amounts).map((amt) => parseUnits(amt, tokenDecimals));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result)
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter((row) => row !== "");

      const parsedRows = rows
        .map((row) => row.split(","))
        .filter(
          ([address, amount]) =>
            address?.trim().startsWith("0x") && amount !== undefined
        );

      setRecipients(parsedRows.map(([address]) => address.trim()).join("\n"));
      setAmounts(parsedRows.map(([, amount]) => amount.trim()).join("\n"));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

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
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as number;
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setStep("approving");

    try {
      const tSenderAddress = chainsToTSender[chainId]["tsender"];
      const approvedAmount = await getApprovedAmount(tSenderAddress);
      const parsedAmounts = getParsedAmounts();
      const totalAmount = parsedAmounts.reduce(
        (sum, amt) => sum + amt,
        BigInt(0)
      );

      if (approvedAmount < totalAmount) {
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, totalAmount],
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
        args: [tokenAddress, parseList(recipients), parsedAmounts, totalAmount],
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
        {stablecoins.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {stablecoins.map((coin) => (
              <button
                key={coin.address}
                type="button"
                onClick={() => setTokenAddress(coin.address)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  tokenAddress === coin.address
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-white/5 border-white/10 text-gray-300 hover:border-cyan-400/50"
                }`}
              >
                {coin.symbol}
              </button>
            ))}
          </motion.div>
        )}

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
            rightElement={
              tokenSymbol ? (
                <span className="text-sm text-cyan-300 bg-cyan-900/20 px-2 py-1 rounded-lg border border-cyan-900">
                  {tokenSymbol}
                </span>
              ) : null
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-cyan-300 tracking-wide">
              Recipients
            </label>
            <button
              type="button"
              onClick={() => csvInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 hover:border-cyan-400/50 border border-white/10 px-2.5 py-1 rounded-lg transition-colors"
            >
              <FiUpload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
          </div>
          <InputField
            label=""
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
            Total Amount: {total} {tokenSymbol}
            {usdPrice !== null && (
              <span className="text-gray-500">
                {" "}
                (≈ ${(total * usdPrice).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                USD)
              </span>
            )}
          </motion.div>
        )}

        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-white/10 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-gray-400 sticky top-0">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">
                      Recipient
                    </th>
                    <th className="text-right font-medium px-3 py-2">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="px-3 py-1.5 text-gray-300 font-mono text-xs">
                        {row.address.length > 12
                          ? `${row.address.slice(0, 6)}...${row.address.slice(-4)}`
                          : row.address}
                      </td>
                      <td
                        className={`px-3 py-1.5 text-right ${
                          row.amount === "" ? "text-red-400" : "text-gray-300"
                        }`}
                      >
                        {row.amount || "missing"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRecipients.length !== parsedAmountStrings.length && (
              <div className="text-xs text-red-400 bg-red-900/20 px-3 py-2">
                Recipients ({parsedRecipients.length}) and amounts (
                {parsedAmountStrings.length}) counts don&apos;t match.
              </div>
            )}
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
