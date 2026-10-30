"use client";

import {
  MULTICALL3_ADDRESS,
  chainsToStablecoins,
  chainsToTSender,
  erc20Abi,
  multicall3Abi,
  tsenderAbi,
} from "@/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiClipboard,
  FiExternalLink,
  FiLoader,
  FiPlus,
  FiShuffle,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { formatUnits, getAddress, isAddress, parseEther, parseUnits, toHex } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useBalance, useConfig, useSwitchChain, useWriteContract } from "wagmi";

// Maps symbols to CoinGecko coin ids for a rough live USD estimate.
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  EURC: "euro-coin",
  WETH: "weth",
  ETH: "ethereum",
};

type AssetMode = "erc20" | "eth";
type Step = "input" | "approving" | "sending" | "complete" | "error";
type Row = { id: number; address: string; amount: string };

let nextRowId = 1;
const newRow = (address = "", amount = ""): Row => ({ id: nextRowId++, address, amount });

// Accepts "address, amount" / "address amount" / "address<TAB>amount" per line
function parseBulk(text: string): Row[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[,\s;]+/))
    .filter(([address]) => address?.startsWith("0x"))
    .map(([address, amount]) => newRow(address, amount ?? ""));
}

function randomAddress() {
  return getAddress(toHex(crypto.getRandomValues(new Uint8Array(20))));
}

function short(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function AirdropForms() {
  const [mode, setMode] = useState<AssetMode>("erc20");
  const [tokenAddress, setTokenAddress] = useState("");
  const [customToken, setCustomToken] = useState(false);
  const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow()]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | null>(null);
  const [sendHash, setSendHash] = useState<`0x${string}` | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
  const [usdPrice, setUsdPrice] = useState<number | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const config = useConfig();
  const account = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const chainId = account.chainId;
  const explorerUrl = account.chain?.blockExplorers?.default.url;
  const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
    address: account.address,
  });
  const { writeContractAsync } = useWriteContract();
  const stablecoins = chainsToStablecoins[chainId ?? sepolia.id] ?? [];
  const tsenderAddress = chainId ? chainsToTSender[chainId]?.tsender : undefined;

  const isProcessing = step === "approving" || step === "sending";
  const nativeSymbol = account.chain?.nativeCurrency.symbol ?? "ETH";
  const symbol = mode === "eth" ? nativeSymbol : tokenSymbol;
  const decimals = mode === "eth" ? 18 : tokenDecimals;

  // Default to the first stablecoin on chains that have one
  useEffect(() => {
    if (!tokenAddress && !customToken && stablecoins.length > 0) {
      setTokenAddress(stablecoins[0].address);
    }
  }, [stablecoins, tokenAddress, customToken]);

  // Load decimals, symbol and balance for the chosen ERC-20 token
  const refreshKey = step === "complete";
  useEffect(() => {
    setTokenDecimals(null);
    setTokenSymbol("");
    setTokenBalance(null);
    if (mode !== "erc20" || !isAddress(tokenAddress) || !account.address) return;

    let cancelled = false;
    const address = tokenAddress as `0x${string}`;
    Promise.all([
      readContract(config, { abi: erc20Abi, address, functionName: "decimals" }),
      readContract(config, { abi: erc20Abi, address, functionName: "symbol" }),
      readContract(config, {
        abi: erc20Abi,
        address,
        functionName: "balanceOf",
        args: [account.address],
      }),
    ])
      .then(([dec, sym, bal]) => {
        if (cancelled) return;
        setTokenDecimals(Number(dec));
        setTokenSymbol(String(sym));
        setTokenBalance(bal as bigint);
      })
      .catch((error) => console.error("Error fetching token info:", error));

    return () => {
      cancelled = true;
    };
  }, [mode, tokenAddress, account.address, chainId, config, refreshKey]);

  useEffect(() => {
    const coingeckoId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
    if (!coingeckoId) {
      setUsdPrice(null);
      return;
    }

    let cancelled = false;
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`)
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
  }, [symbol]);

  // Rows that have anything typed in them are part of the batch
  const filledRows = useMemo(
    () => rows.filter((r) => r.address.trim() !== "" || r.amount.trim() !== ""),
    [rows]
  );

  const rowIssues = useMemo(() => {
    const issues: Record<number, { address?: boolean; amount?: boolean }> = {};
    for (const r of filledRows) {
      const amt = Number(r.amount);
      issues[r.id] = {
        address: !isAddress(r.address.trim()),
        amount: r.amount.trim() === "" || isNaN(amt) || amt <= 0,
      };
    }
    return issues;
  }, [filledRows]);

  const parsedAmounts = useMemo((): bigint[] | null => {
    if (decimals === null) return null;
    try {
      return filledRows.map((r) => parseUnits(r.amount.trim(), decimals));
    } catch {
      return null;
    }
  }, [filledRows, decimals]);

  const totalUnits = parsedAmounts?.reduce((s, a) => s + a, BigInt(0)) ?? null;
  const totalDisplay =
    totalUnits !== null && decimals !== null ? Number(formatUnits(totalUnits, decimals)) : 0;
  const balance = mode === "eth" ? ethBalance?.value ?? null : tokenBalance;

  // Why the batch can't be sent yet, or null if it's ready
  const blocker = useMemo((): { label: string; action?: () => void } | null => {
    if (!account.address) return { label: "Connect wallet", action: openConnectModal };
    if (mode === "erc20" && !tsenderAddress)
      return { label: "Switch to Sepolia", action: () => switchChain({ chainId: sepolia.id }) };
    if (mode === "erc20" && !isAddress(tokenAddress)) return { label: "Choose a token" };
    if (decimals === null) return { label: "Loading token…" };
    if (filledRows.length === 0) return { label: "Add recipients" };
    if (Object.values(rowIssues).some((i) => i.address)) return { label: "Fix invalid addresses" };
    if (Object.values(rowIssues).some((i) => i.amount) || parsedAmounts === null)
      return { label: "Fix invalid amounts" };
    if (balance !== null && totalUnits !== null && totalUnits > balance)
      return { label: `Not enough ${symbol}` };
    return null;
  }, [
    account.address,
    openConnectModal,
    mode,
    tsenderAddress,
    switchChain,
    tokenAddress,
    decimals,
    filledRows,
    rowIssues,
    parsedAmounts,
    balance,
    totalUnits,
    symbol,
  ]);

  const updateRow = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const removeRow = (id: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : [newRow()]));

  // Replace the list, keeping it non-empty
  const loadRows = (incoming: Row[]) => setRows(incoming.length > 0 ? incoming : [newRow()]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadRows(parseBulk(String(reader.result)));
    reader.readAsText(file);
    e.target.value = "";
  };

  const openBulk = () => {
    setBulkText(
      filledRows.map((r) => `${r.address}${r.amount ? `, ${r.amount}` : ""}`).join("\n")
    );
    setBulkOpen(true);
  };

  const fillSample = () => {
    const amount = mode === "eth" ? "0.0001" : "0.1";
    loadRows(Array.from({ length: 5 }, () => newRow(randomAddress(), amount)));
  };

  const sendErc20 = async (recipients: `0x${string}`[], amounts: bigint[], total: bigint) => {
    const token = tokenAddress as `0x${string}`;
    const spender = tsenderAddress as `0x${string}`;

    // 1. Let TSender pull the batch total from the wallet (skipped if already allowed)
    const allowance = (await readContract(config, {
      abi: erc20Abi,
      address: token,
      functionName: "allowance",
      args: [account.address, spender],
    })) as bigint;

    if (allowance < total) {
      setStep("approving");
      const hash = await writeContractAsync({
        abi: erc20Abi,
        address: token,
        functionName: "approve",
        args: [spender, total],
      });
      setApprovalHash(hash);
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status !== "success") throw new Error("Approval transaction reverted");
    }

    // 2. TSender transfers to every recipient in one transaction
    setStep("sending");
    const hash = await writeContractAsync({
      abi: tsenderAbi,
      address: spender,
      functionName: "airdropERC20",
      args: [token, recipients, amounts, total],
    });
    setSendHash(hash);
    return hash;
  };

  const sendEth = async (recipients: `0x${string}`[], amounts: bigint[], total: bigint) => {
    // One Multicall3 call per recipient, each forwarding its share of msg.value
    setStep("sending");
    const hash = await writeContractAsync({
      abi: multicall3Abi,
      address: MULTICALL3_ADDRESS,
      functionName: "aggregate3Value",
      args: [
        recipients.map((target, i) => ({
          target,
          allowFailure: false,
          value: amounts[i],
          callData: "0x" as const,
        })),
      ],
      value: total,
    });
    setSendHash(hash);
    return hash;
  };

  const handleSubmit = async () => {
    if (blocker) return blocker.action?.();
    if (decimals === null) return;
    setErrorMessage("");
    setApprovalHash(null);
    setSendHash(null);

    try {
      const recipients = filledRows.map((r) => r.address.trim() as `0x${string}`);
      const amounts = filledRows.map((r) =>
        mode === "eth" ? parseEther(r.amount.trim()) : parseUnits(r.amount.trim(), decimals)
      );
      const total = amounts.reduce((s, a) => s + a, BigInt(0));

      const hash =
        mode === "eth"
          ? await sendEth(recipients, amounts, total)
          : await sendErc20(recipients, amounts, total);

      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status !== "success") throw new Error("Transfer transaction reverted");

      setStep("complete");
      refetchEthBalance();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(
        /user (rejected|denied)/i.test(message)
          ? "The request was rejected in your wallet. Nothing was sent."
          : message.split("\n")[0]
      );
      setStep("error");
    }
  };

  const reset = () => {
    setStep("input");
    setErrorMessage("");
    setApprovalHash(null);
    setSendHash(null);
  };

  const txLink = (hash: `0x${string}`, label: string) =>
    explorerUrl ? (
      <a
        href={`${explorerUrl}/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sky hover:text-fg underline underline-offset-4"
      >
        {label} <FiExternalLink className="w-3.5 h-3.5" />
      </a>
    ) : (
      <span className="font-mono text-xs break-all">{hash}</span>
    );

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 6 });
  const tokenChoice = customToken
    ? "custom"
    : stablecoins.find((c) => c.address === tokenAddress)?.symbol ?? "custom";

  const stepState = (s: "approve" | "send") => {
    const order = { input: 0, approving: 1, sending: 2, complete: 3, error: -1 }[step];
    if (s === "approve") {
      if (order >= 2) return "done";
      if (step === "approving") return "active";
      return "idle";
    }
    if (step === "complete") return "done";
    if (step === "sending") return "active";
    return "idle";
  };

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
      {/* Left: build the batch */}
      <div className="bg-ink-2 border border-line rounded-2xl">
        {/* Asset */}
        <div className="p-6 sm:p-8 border-b border-line space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[20px] font-light">What are you sending?</h2>
            <div className="inline-grid grid-cols-2 p-1 rounded-full bg-ink border border-line text-sm">
              {(
                [
                  ["erc20", "Token"],
                  ["eth", nativeSymbol],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setMode(value);
                    reset();
                  }}
                  className={`px-5 py-1.5 rounded-full transition-colors ${
                    mode === value ? "bg-blue text-white" : "text-muted hover:text-fg"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "erc20" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {stablecoins.map((coin) => (
                  <button
                    key={coin.address}
                    type="button"
                    onClick={() => {
                      setCustomToken(false);
                      setTokenAddress(coin.address);
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      tokenChoice === coin.symbol
                        ? "border-blue bg-blue/15 text-fg"
                        : "border-line-strong text-muted hover:text-fg"
                    }`}
                  >
                    {coin.symbol}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setCustomToken(true);
                    setTokenAddress("");
                  }}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    tokenChoice === "custom"
                      ? "border-blue bg-blue/15 text-fg"
                      : "border-line-strong text-muted hover:text-fg"
                  }`}
                >
                  Other token
                </button>
              </div>

              {tokenChoice === "custom" && (
                <div className="relative">
                  <input
                    aria-label="Token contract address"
                    placeholder="Token contract address, 0x…"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value.trim())}
                    className="w-full bg-ink border border-line rounded-xl px-4 py-3 font-mono text-sm placeholder:font-sans placeholder:text-faint focus:border-blue focus:outline-none"
                  />
                  {tokenSymbol && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sky">
                      {tokenSymbol}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Native {nativeSymbol} is sent through Multicall3, a standard batching contract. No
              approval needed.
            </p>
          )}
        </div>

        {/* Recipients */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[20px] font-light">
              Recipients{" "}
              <span className="text-muted tabular-nums">{filledRows.length || ""}</span>
            </h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={openBulk}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-muted hover:text-fg transition-colors"
              >
                <FiClipboard className="w-3.5 h-3.5" /> Paste list
              </button>
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-muted hover:text-fg transition-colors"
              >
                <FiUpload className="w-3.5 h-3.5" /> Upload CSV
              </button>
              <button
                type="button"
                onClick={fillSample}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-muted hover:text-fg transition-colors"
                title="Fill five random test addresses"
              >
                <FiShuffle className="w-3.5 h-3.5" /> Sample list
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {bulkOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-blue/40 bg-ink p-4 space-y-3">
                  <textarea
                    autoFocus
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={"One per line: address, amount\n0xAbC…123, 10\n0xDeF…456, 2.5"}
                    className="w-full bg-transparent font-mono text-sm resize-y placeholder:text-faint focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 text-sm">
                    <button
                      type="button"
                      onClick={() => setBulkOpen(false)}
                      className="rounded-full px-4 py-1.5 text-muted hover:text-fg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        loadRows(parseBulk(bulkText));
                        setBulkOpen(false);
                      }}
                      className="rounded-full bg-blue hover:bg-blue-hover text-white px-4 py-1.5"
                    >
                      Use this list
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden sm:grid grid-cols-[28px_1fr_150px_32px] gap-3 px-1 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
            <span>#</span>
            <span>Wallet address</span>
            <span>Amount</span>
            <span />
          </div>

          <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1 -mr-1">
            {rows.map((row, i) => {
              const issue = rowIssues[row.id];
              return (
                <li
                  key={row.id}
                  className="grid grid-cols-[28px_1fr_32px] sm:grid-cols-[28px_1fr_150px_32px] gap-x-3 gap-y-2 items-center"
                >
                  <span className="text-faint text-sm tabular-nums text-right pr-1">{i + 1}</span>
                  <input
                    aria-label={`Recipient ${i + 1} address`}
                    placeholder="0x…"
                    value={row.address}
                    onChange={(e) => updateRow(row.id, { address: e.target.value })}
                    onPaste={(e) => {
                      // Pasting a multi-line list into any row expands it into rows
                      const text = e.clipboardData.getData("text");
                      if (text.includes("\n")) {
                        e.preventDefault();
                        const pasted = parseBulk(text);
                        setRows((rs) => {
                          const idx = rs.findIndex((r) => r.id === row.id);
                          const copy = [...rs];
                          copy.splice(idx + 1, 0, ...pasted);
                          return copy.filter((r) => r.address || r.amount);
                        });
                      }
                    }}
                    className={`min-w-0 bg-ink border rounded-xl px-3.5 py-2.5 font-mono text-[13px] placeholder:text-faint focus:outline-none transition-colors ${
                      issue?.address ? "border-bad/60 focus:border-bad" : "border-line focus:border-blue"
                    }`}
                  />
                  <div className="relative col-start-2 sm:col-start-auto">
                    <input
                      aria-label={`Recipient ${i + 1} amount`}
                      inputMode="decimal"
                      placeholder="0.0"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, { amount: e.target.value })}
                      className={`w-full bg-ink border rounded-xl pl-3.5 pr-14 py-2.5 text-[14px] tabular-nums placeholder:text-faint focus:outline-none transition-colors ${
                        issue?.amount ? "border-bad/60 focus:border-bad" : "border-line focus:border-blue"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
                      {symbol}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label={`Remove recipient ${i + 1}`}
                    className="row-start-1 col-start-3 sm:row-start-auto sm:col-start-auto grid place-items-center w-8 h-8 rounded-full text-faint hover:text-fg hover:bg-white/5 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow()])}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-3 text-sm text-muted hover:text-fg hover:border-sky/50 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Add recipient
          </button>
        </div>
      </div>

      {/* Right: summary and send */}
      <aside className="lg:sticky lg:top-24 bg-ink-2 border border-line rounded-2xl p-6 sm:p-7 space-y-6">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">Total</div>
          <div className="mt-2 text-[40px] leading-none font-light tabular-nums break-all">
            {fmt(totalDisplay)} <span className="text-[20px] text-muted">{symbol}</span>
          </div>
          <div className="mt-2 text-sm text-faint h-5">
            {usdPrice !== null && totalDisplay > 0 &&
              `≈ $${(totalDisplay * usdPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          </div>
        </div>

        <dl className="text-sm divide-y divide-line border-y border-line">
          {[
            ["Network", account.chain?.name ?? "Not connected"],
            ["Recipients", String(filledRows.length)],
            [
              "Your balance",
              balance !== null && decimals !== null
                ? `${fmt(Number(formatUnits(balance, decimals)))} ${symbol}`
                : "–",
            ],
            [
              "After sending",
              balance !== null && decimals !== null && totalUnits !== null
                ? `${fmt(Number(formatUnits(balance - totalUnits, decimals)))} ${symbol}`
                : "–",
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="tabular-nums text-right truncate">{v}</dd>
            </div>
          ))}
        </dl>

        {/* Progress through the wallet confirmations */}
        <ol className="space-y-3 text-sm">
          {(mode === "erc20"
            ? ([
                ["approve", `Approve ${symbol || "token"}`],
                ["send", `Send to ${filledRows.length || "all"} wallets`],
              ] as const)
            : ([["send", `Send to ${filledRows.length || "all"} wallets`]] as const)
          ).map(([key, label], i) => {
            const state = stepState(key);
            return (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`grid place-items-center w-6 h-6 rounded-full border text-xs ${
                    state === "done"
                      ? "bg-ok/15 border-ok/50 text-ok"
                      : state === "active"
                      ? "border-blue text-sky"
                      : "border-line-strong text-faint"
                  }`}
                >
                  {state === "done" ? (
                    <FiCheck className="w-3.5 h-3.5" />
                  ) : state === "active" ? (
                    <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={state === "idle" ? "text-muted" : "text-fg"}>{label}</span>
              </li>
            );
          })}
        </ol>

        <AnimatePresence>
          {(step === "complete" || step === "error" || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-xl p-4 text-sm space-y-2 ${
                step === "error"
                  ? "bg-bad/10 text-bad"
                  : step === "complete"
                  ? "bg-ok/10 text-ok"
                  : "bg-blue/10 text-sky"
              }`}
            >
              {step === "approving" && <p>Confirm the approval in your wallet, then wait for it to be mined.</p>}
              {step === "sending" && <p>Confirm the batch transfer in your wallet.</p>}
              {step === "complete" && (
                <p className="flex items-center gap-2">
                  <FiCheck /> Sent {fmt(totalDisplay)} {symbol} to {filledRows.length} wallets.
                </p>
              )}
              {step === "error" && (
                <p className="flex items-start gap-2">
                  <FiAlertTriangle className="mt-0.5 shrink-0" />
                  <span className="break-words">{errorMessage}</span>
                </p>
              )}
              <div className="flex flex-wrap gap-4">
                {approvalHash && txLink(approvalHash, "Approval")}
                {sendHash && txLink(sendHash, "Transfer")}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step === "complete" || step === "error" ? (
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-full border border-line-strong hover:bg-white/5 py-3.5 text-[15px] transition-colors"
          >
            {step === "complete" ? "Send another batch" : "Try again"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || (!!blocker && !blocker.action)}
            className={`w-full rounded-full py-3.5 text-[15px] transition-colors inline-flex items-center justify-center gap-2 ${
              isProcessing || (blocker && !blocker.action)
                ? "bg-ink-3 text-muted cursor-not-allowed"
                : "bg-blue hover:bg-blue-hover text-white"
            }`}
          >
            {isProcessing ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                {step === "approving" ? "Approving…" : "Sending…"}
              </>
            ) : blocker ? (
              blocker.label
            ) : (
              `Send ${fmt(totalDisplay)} ${symbol}`
            )}
          </button>
        )}

        {account.address && (
          <p className="text-xs text-faint text-center">
            Sending from {short(account.address)}
          </p>
        )}
      </aside>
    </div>
  );
}
