"use client";

import { chainsToStablecoins } from "@/constants";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { FiArrowUpRight, FiCheck, FiCopy } from "react-icons/fi";
import { sepolia } from "viem/chains";
import { useAccount, useSwitchChain, useWatchAsset } from "wagmi";

const sepoliaCoins = chainsToStablecoins[sepolia.id];

const ethFaucets = [
  {
    name: "Google Cloud Web3 faucet",
    note: "A free daily drip. Sign in with a Google account.",
    href: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
  },
  {
    name: "Alchemy faucet",
    note: "Needs a free Alchemy account and a little mainnet ETH in the wallet.",
    href: "https://www.alchemy.com/faucets/ethereum-sepolia",
  },
  {
    name: "Sepolia PoW faucet",
    note: "No account needed. Your browser mines for a few minutes to earn ETH.",
    href: "https://sepolia-faucet.pk910.de/",
  },
];

function ExternalButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-blue hover:bg-blue-hover text-white px-4 py-2 text-sm transition-colors whitespace-nowrap"
    >
      {children}
      <FiArrowUpRight className="w-4 h-4" />
    </a>
  );
}

function CopyAddress({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-2 font-mono text-xs text-muted hover:text-fg transition-colors"
      title="Copy contract address"
    >
      {address.slice(0, 8)}…{address.slice(-6)}
      {copied ? <FiCheck className="w-3.5 h-3.5 text-ok" /> : <FiCopy className="w-3.5 h-3.5" />}
    </button>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-x-4 py-10 border-t border-line">
      <span className="font-mono text-sm text-sky pt-1.5">{n}</span>
      <div>
        <h2 className="text-[24px] sm:text-[28px] font-light tracking-[-0.01em]">{title}</h2>
        <div className="mt-4 text-muted leading-relaxed space-y-5">{children}</div>
      </div>
    </li>
  );
}

export default function GetTokens() {
  const { isConnected, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const { watchAsset } = useWatchAsset();
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const onSepolia = chainId === sepolia.id;

  const addToken = (coin: { symbol: string; address: string }) => {
    if (!isConnected) return openConnectModal?.();
    if (!onSepolia) return switchChain({ chainId: sepolia.id });
    watchAsset(
      {
        type: "ERC20",
        options: { address: coin.address as `0x${string}`, symbol: coin.symbol, decimals: 6 },
      },
      { onSuccess: () => setAdded((a) => ({ ...a, [coin.symbol]: true })) }
    );
  };

  return (
    <div className="mx-auto max-w-[860px] px-4 sm:px-6 pt-16 md:pt-24">
      <h1 className="text-[40px] sm:text-[56px] leading-[1.05] tracking-[-0.025em] font-light">
        Get test tokens
      </h1>
      <p className="mt-6 text-[18px] text-fg/85 leading-relaxed max-w-[52ch]">
        TSender runs on Sepolia, Ethereum&apos;s test network. Tokens there are free
        and have no real value, so you can try a full batch without spending money.
      </p>

      <ol className="mt-14">
        <Step n={1} title="Connect a wallet on Sepolia">
          <p>
            Any browser wallet works. MetaMask is the most common; install it from{" "}
            <a className="text-fg underline underline-offset-4" href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
              metamask.io
            </a>
            , then switch the network to Sepolia.
          </p>
          <div>
            {!isConnected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className="rounded-full bg-blue hover:bg-blue-hover text-white px-5 py-2.5 text-sm transition-colors"
              >
                Connect wallet
              </button>
            ) : onSepolia ? (
              <span className="inline-flex items-center gap-2 text-ok text-sm">
                <FiCheck /> Connected to Sepolia
              </span>
            ) : (
              <button
                type="button"
                onClick={() => switchChain({ chainId: sepolia.id })}
                className="rounded-full bg-blue hover:bg-blue-hover text-white px-5 py-2.5 text-sm transition-colors"
              >
                Switch to Sepolia
              </button>
            )}
          </div>
        </Step>

        <Step n={2} title="Get SepoliaETH for gas">
          <p>
            Every transaction costs a small gas fee, paid in ETH. A batch on Sepolia usually costs
            a small fraction of one SepoliaETH. Pick any faucet below and paste your wallet address.
          </p>
          <ul className="border border-line rounded-xl divide-y divide-line">
            {ethFaucets.map((f) => (
              <li key={f.href} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5">
                <div className="flex-1">
                  <div className="text-fg">{f.name}</div>
                  <div className="text-sm mt-1">{f.note}</div>
                </div>
                <ExternalButton href={f.href}>Open faucet</ExternalButton>
              </li>
            ))}
          </ul>
        </Step>

        <Step n={3} title="Get test USDC or EURC from Circle">
          <p>
            Circle, the company behind USDC, runs an official faucet. Choose{" "}
            <span className="text-fg">Ethereum Sepolia</span> as the network, paste your
            address and you&apos;ll receive a few test USDC or EURC. The faucet has a
            cooldown, so you can come back for more later.
          </p>
          <ExternalButton href="https://faucet.circle.com/">Open Circle faucet</ExternalButton>
        </Step>

        <Step n={4} title="Show the tokens in your wallet">
          <p>
            Wallets only display tokens they know about, so test tokens don&apos;t appear on their
            own. Add them once and your balance shows next to your ETH.
          </p>
          <ul className="border border-line rounded-xl divide-y divide-line">
            {sepoliaCoins.map((coin) => (
              <li key={coin.address} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5">
                <div className="flex-1">
                  <div className="text-fg">{coin.symbol}</div>
                  <CopyAddress address={coin.address} />
                </div>
                <button
                  type="button"
                  onClick={() => addToken(coin)}
                  disabled={added[coin.symbol]}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong hover:bg-white/5 px-4 py-2 text-sm text-fg transition-colors disabled:text-ok disabled:border-ok/40"
                >
                  {added[coin.symbol] ? (
                    <>
                      <FiCheck /> Added
                    </>
                  ) : (
                    `Add ${coin.symbol} to wallet`
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Step>

        <Step n={5} title="Send your first batch">
          <p>With ETH for gas and some USDC, you&apos;re ready to pay several wallets at once.</p>
          <Link
            href="/app"
            className="inline-block rounded-full bg-blue hover:bg-blue-hover text-white px-5 py-2.5 text-sm transition-colors"
          >
            Launch app
          </Link>
        </Step>
      </ol>
    </div>
  );
}
