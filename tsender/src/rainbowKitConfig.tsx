"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { anvil, sepolia, zksync } from "wagmi/chains";

export default getDefaultConfig({
    appName: "TSender",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, anvil, zksync],
    // The default Sepolia RPC (drpc.org) rejects eth_call to the multicall3
    // contract on its free tier, which wagmi's readContract relies on.
    transports: {
        [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    },
    ssr: false
})