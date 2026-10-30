"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowUpRight } from "react-icons/fi";
import Logo from "./Logo";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/get-tokens", label: "Get test tokens" },
  { href: "https://github.com/AshiqAhamed17/TSender", label: "GitHub", external: true },
];

export default function Nav() {
  const pathname = usePathname();
  const inApp = pathname?.startsWith("/app");

  return (
    <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5 text-fg">
          <Logo className="w-6 h-6" />
          <span className="text-[19px] tracking-tight">TSender</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-8">
          <ul className="hidden md:flex items-center gap-8 text-[15px]">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  className={`inline-flex items-center gap-1 transition-colors hover:text-fg ${
                    pathname === l.href || pathname === `${l.href}/` ? "text-fg" : "text-muted"
                  }`}
                >
                  {l.label}
                  {l.external && <FiArrowUpRight className="w-3.5 h-3.5" />}
                </Link>
              </li>
            ))}
          </ul>

          {inApp ? (
            <ConnectButton
              showBalance={{ smallScreen: false, largeScreen: true }}
              chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
              accountStatus="address"
              label="Connect wallet"
            />
          ) : (
            <Link
              href="/app"
              className="rounded-full bg-blue hover:bg-blue-hover text-white text-[15px] px-5 py-2.5 transition-colors"
            >
              Launch app
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
