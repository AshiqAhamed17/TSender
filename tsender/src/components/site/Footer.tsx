import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Logo from "./Logo";

const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Launch app", href: "/app" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Get test tokens", href: "/get-tokens" },
    ],
  },
  {
    title: "Code",
    links: [
      { label: "Frontend", href: "https://github.com/AshiqAhamed17/TSender", external: true },
      { label: "Smart contracts", href: "https://github.com/Cyfrin/TSender", external: true },
      { label: "Security audit", href: "https://codehawks.cyfrin.io/c/2024-05-tsender", external: true },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "What is ERC-20?", href: "https://ethereum.org/en/developers/docs/standards/tokens/erc-20/", external: true },
      { label: "Sepolia testnet", href: "https://sepolia.etherscan.io", external: true },
      { label: "Cyfrin Updraft", href: "https://updraft.cyfrin.io", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line mt-24">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg mb-5">
                {col.title}
              </h3>
              <ul className="space-y-3 text-[15px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-muted hover:text-fg transition-colors"
                    >
                      {l.label}
                      {l.external && <FiArrowUpRight className="w-3.5 h-3.5 text-faint" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-line flex items-center gap-3 text-sm text-muted">
          <Logo className="w-5 h-5 text-fg" />
          One signature, every recipient.
        </div>
      </div>

      <div
        aria-hidden="true"
        className="select-none pointer-events-none text-center font-medium leading-[0.8] tracking-[-0.04em] text-ink-2 text-[26vw] mt-6 -mb-[4vw]"
      >
        TSender
      </div>
    </footer>
  );
}
