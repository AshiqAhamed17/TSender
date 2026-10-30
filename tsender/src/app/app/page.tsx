import AirdropForms from "@/components/AirdropForms";
import Link from "next/link";

export const metadata = { title: "Send a batch · TSender" };

export default function AppPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 sm:px-6 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[34px] sm:text-[44px] leading-tight tracking-[-0.02em] font-light">
            Send a batch
          </h1>
          <p className="text-muted mt-2">
            Pay many wallets in one transaction.
          </p>
        </div>
        <Link href="/get-tokens" className="text-sm text-sky hover:text-fg underline underline-offset-4">
          Need test tokens?
        </Link>
      </div>
      <AirdropForms />
    </div>
  );
}
