import FanOut from "@/components/site/FanOut";
import Link from "next/link";
import { ReactNode } from "react";
import { FiArrowRight } from "react-icons/fi";

const networks = ["Ethereum", "Arbitrum", "Optimism", "Base", "zkSync", "Sepolia"];

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block font-mono text-[11px] uppercase tracking-[0.14em] text-muted border border-line-strong rounded-full px-2.5 py-1">
      {children}
    </span>
  );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-full bg-ink-3 hover:bg-[#2c3137] pl-5 pr-1.5 py-1.5 text-[15px] transition-colors"
    >
      {children}
      <span className="grid place-items-center w-7 h-7 rounded-full bg-blue text-white transition-transform group-hover:translate-x-0.5">
        <FiArrowRight className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

/* ---------- Feature artwork, all CSS/SVG on the blue panel ---------- */

function PanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="blue-panel rounded-2xl aspect-square w-full grid place-items-center overflow-hidden">
      <div className="relative w-[66%] aspect-square blue-panel-grid border border-white/25">
        {["-top-1.5 -left-1.5", "-top-1.5 -right-1.5", "-bottom-1.5 -left-1.5", "-bottom-1.5 -right-1.5"].map(
          (pos) => (
            <span key={pos} className={`absolute ${pos} w-3 h-3 text-white/70 text-[12px] leading-3 text-center`}>
              +
            </span>
          )
        )}
        {children}
      </div>
    </div>
  );
}

// ERC-20: one token disc, a ring of recipients around it
function TokenArt() {
  const dots = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * 40, y: 50 + Math.sin(a) * 40 };
  });
  return (
    <PanelFrame>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {dots.map((d, i) => (
          <line key={i} x1="50" y1="50" x2={d.x} y2={d.y} stroke="white" strokeOpacity="0.35" strokeWidth="0.3" />
        ))}
        <circle cx="50" cy="50" r="22" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.6" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="13" fill="white" fillOpacity="0.25" />
        {dots.map((d, i) => (
          <circle key={`d-${i}`} cx={d.x} cy={d.y} r="2.6" fill="white" fillOpacity="0.85" />
        ))}
      </svg>
    </PanelFrame>
  );
}

// ETH: a payout list, each row a wallet getting its share
function PayoutArt() {
  const rows = [0.62, 0.4, 0.78, 0.5, 0.3, 0.68];
  return (
    <PanelFrame>
      <div className="absolute inset-[12%] flex flex-col justify-between">
        {rows.map((w, i) => (
          <div key={i} className="flex items-center gap-[6%]">
            <span className="w-[9%] aspect-square rounded-full bg-white/85" />
            <span className="h-[3px] rounded-full bg-white/40 flex-1" style={{ maxWidth: `${w * 70}%` }} />
            <span className="ml-auto h-[10px] w-[18%] rounded-full bg-white/70" />
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

// CSV: rows of a spreadsheet lifting into the app
function CsvArt() {
  return (
    <PanelFrame>
      <div className="absolute inset-[14%] grid grid-cols-[1.6fr_1fr] gap-[3px]">
        {Array.from({ length: 14 }, (_, i) => (
          <div
            key={i}
            className={`rounded-[3px] ${
              i < 2 ? "bg-white/80" : i % 4 === 2 || i % 4 === 3 ? "bg-white/30" : "bg-white/18"
            }`}
          />
        ))}
      </div>
    </PanelFrame>
  );
}

function Feature({
  tag,
  title,
  body,
  cta,
  href,
  art,
  flip = false,
}: {
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  art: ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="mx-auto max-w-[1100px] px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-20 items-center">
      <div className={flip ? "md:order-2" : ""}>{art}</div>
      <div className={`space-y-6 ${flip ? "md:order-1" : ""}`}>
        <Tag>{tag}</Tag>
        <h2 className="text-[34px] sm:text-[40px] leading-[1.15] tracking-[-0.01em] font-light max-w-[16ch]">
          {title}
        </h2>
        <p className="text-muted text-[17px] leading-relaxed max-w-[46ch]">{body}</p>
        <ArrowLink href={href}>{cta}</ArrowLink>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-6">
        <div className="frame border border-line grid-bg relative overflow-hidden min-h-[640px] md:min-h-[700px] flex flex-col justify-between">
          <FanOut className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent md:via-ink/20 pointer-events-none" />

          <div className="relative px-6 sm:px-14 pt-24 md:pt-40 max-w-[720px]">
            <h1 className="text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.04] tracking-[-0.025em] font-light">
              Send tokens to a whole list of wallets at once
            </h1>
            <p className="mt-8 text-[18px] sm:text-[20px] leading-relaxed text-fg/85 max-w-[44ch]">
              TSender bundles hundreds of ERC-20 or ETH transfers into a single
              transaction. You sign once, every recipient gets paid.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-full bg-blue hover:bg-blue-hover text-white px-6 py-3 text-[15px] transition-colors"
              >
                Launch app
              </Link>
              <Link
                href="/get-tokens"
                className="rounded-full border border-line-strong hover:bg-white/5 px-6 py-3 text-[15px] transition-colors"
              >
                Get test tokens
              </Link>
            </div>
          </div>

          <dl className="relative self-end text-right px-6 sm:px-14 pb-12 pt-16 space-y-7">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Gas for 100 recipients
              </dt>
              <dd className="text-[32px] sm:text-[40px] font-light tabular-nums mt-1">2,580,360</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                Live networks
              </dt>
              <dd className="text-[32px] sm:text-[40px] font-light tabular-nums mt-1">6</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Networks strip */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 mt-4">
        <ul className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {networks.map((n) => (
            <li
              key={n}
              className="bg-ink-2 rounded-lg h-20 grid place-items-center text-muted text-[15px] tracking-tight"
            >
              {n}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16" />

      <Feature
        tag="ERC-20"
        title="Airdrop any token in one go"
        body="Paste a token address, or pick USDC or EURC on Sepolia. TSender checks your balance, asks for one approval, then pays every address in a single transfer."
        cta="Send a token"
        href="/app"
        art={<TokenArt />}
      />
      <Feature
        flip
        tag="Native ETH"
        title="Pay out ETH to a list of people"
        body="Switch to ETH and the batch goes through Multicall3, a standard contract already on every major network. No approval step, one confirmation."
        cta="Send ETH"
        href="/app"
        art={<PayoutArt />}
      />
      <Feature
        tag="CSV import"
        title="Bring your list from a spreadsheet"
        body="Upload a two-column CSV of addresses and amounts. Every row is checked before you sign, so a typo shows up in red instead of on the blockchain."
        cta="Try with a CSV"
        href="/app"
        art={<CsvArt />}
      />

      {/* How it works: a real sequence, so it's numbered */}
      <section id="how-it-works" className="mx-auto max-w-[1100px] px-4 sm:px-6 py-20 scroll-mt-20">
        <h2 className="text-[34px] sm:text-[40px] font-light tracking-[-0.01em]">How a batch is sent</h2>
        <ol className="mt-12 grid md:grid-cols-3 border-t border-line">
          {[
            [
              "Build the list",
              "Pick a token and add recipients and amounts, by hand or from a CSV. The app checks every address and your balance.",
            ],
            [
              "Approve the total",
              "For ERC-20 tokens you allow the TSender contract to move exactly the batch total. Skipped for ETH.",
            ],
            [
              "Send once",
              "One transaction runs every transfer. If any single transfer would fail, the whole batch reverts and nothing moves.",
            ],
          ].map(([title, body], i) => (
            <li key={title} className="pt-8 pb-4 md:pr-10 md:border-r border-line last:border-r-0 md:[&:not(:first-child)]:pl-10">
              <span className="font-mono text-sm text-sky">{i + 1}</span>
              <h3 className="mt-4 text-[22px] font-light">{title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-[1fr_1.3fr] gap-10 md:gap-20 items-start">
          <div className="space-y-5">
            <h2 className="text-[34px] sm:text-[40px] font-light tracking-[-0.01em] leading-[1.15]">
              Paying 100 people, two ways
            </h2>
            <p className="text-muted text-[17px] leading-relaxed max-w-[42ch]">
              Every Ethereum transaction carries a fixed 21,000 gas overhead. Sending
              one by one pays it a hundred times; a batch pays it once.
            </p>
          </div>
          <div className="frame border border-line">
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="font-normal px-5 py-4"></th>
                  <th className="font-normal px-5 py-4">One by one</th>
                  <th className="font-normal px-5 py-4 text-sky">TSender</th>
                </tr>
              </thead>
              <tbody className="[&_td]:px-5 [&_td]:py-4 [&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-0">
                <tr>
                  <td className="text-muted">Transactions</td>
                  <td className="tabular-nums">100</td>
                  <td className="tabular-nums">2</td>
                </tr>
                <tr>
                  <td className="text-muted">Wallet confirmations</td>
                  <td className="tabular-nums">100</td>
                  <td className="tabular-nums">2</td>
                </tr>
                <tr>
                  <td className="text-muted">21,000 gas base fee paid</td>
                  <td className="tabular-nums">100×</td>
                  <td className="tabular-nums">2×</td>
                </tr>
                <tr>
                  <td className="text-muted">If one transfer fails</td>
                  <td>Partial payout</td>
                  <td>Nothing moves</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-16">
        <div className="rounded-2xl bg-ink-2 px-6 sm:px-12 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-[30px] sm:text-[36px] font-light leading-tight">Try it on Sepolia.</h2>
            <p className="text-muted mt-2 text-[17px]">Free test tokens, real transactions, nothing to lose.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/get-tokens"
              className="rounded-full border border-line-strong hover:bg-white/5 px-6 py-3 text-[15px] transition-colors"
            >
              Get test tokens
            </Link>
            <Link
              href="/app"
              className="rounded-full bg-blue hover:bg-blue-hover text-white px-6 py-3 text-[15px] transition-colors"
            >
              Launch app
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
