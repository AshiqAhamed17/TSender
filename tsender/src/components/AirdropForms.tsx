"use client"

import InputField from "@/components/ui/InputField";
import { chainsToTSender, erc20Abi, tsenderAbi } from "@/constants";
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { useState, useMemo } from "react";
import { useAccount, useChainId, useConfig, useWriteContract } from 'wagmi';
import { calculateTotal } from "@/utils";

export default function AirdropForms() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();
    const config = useConfig();
    const account = useAccount();
    const total: number = useMemo(() => calculateTotal(amounts), [amounts]);
    const { data: hash, isPending, writeContractAsync } = useWriteContract();

    const getApprovedAmount = async (tSenderAddress: string | null): Promise<number> => {

        if (!tSenderAddress) {
            alert("No address found, Please use a supported chain");
            return 0;
        }

        // Read form the chain to see if we have the enough approved token
        const response = await readContract(config, {
            abi: erc20Abi,
            address: tokenAddress as `0x${string}`,
            functionName: "allowance",
            args: [account.address, tokenAddress as `0x${string}`] // => token.allowance(account, tsSender)
        })

        return response as number;

    }

    const handleSubmit = async () => {
        // 1.a If already approved, move to step 2
        // 1.b Approve our tsender contract to sent out tokens
        // 2 Call the airdrop function on the tsender contract
        // 3. wait for the transaction to be mined

        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        const approvedAmount = await getApprovedAmount(tSenderAddress);

        if(approvedAmount < total) {
            const approvalHash = await writeContractAsync({
                abi: erc20Abi,
                address: tokenAddress as `0x${string}`,
                functionName: "approve",
                args: [tSenderAddress as `0x${string}`, total]
            });
            const approvalReceipt = await waitForTransactionReceipt(config, { hash: approvalHash });
            console.log("Approval Confirmed: ", approvalReceipt);

            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            })
        }
        else {
            await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`,
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    // Comma or new line separated
                    recipients.split(/[,\n]+/).map(addr => addr.trim()).filter(addr => addr !== ''),
                    amounts.split(/[,\n]+/).map(amt => amt.trim()).filter(amt => amt !== ''),
                    BigInt(total),
                ],
            },)
        }

    }




    return (
        <div>
            <InputField
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />

            <InputField
                label="Recipients"
                placeholder="0x123..., 0x5678..., 0x9abc..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />

            <InputField
                label="Amount"
                placeholder="100, 200, 300, ..."
                value={amounts}
                onChange={e => setAmounts(e.target.value)}
                large={true}
            />

            <button
                onClick={handleSubmit}
                className="relative group inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-gradient-to-br from-[#496de3] to-[#0c52a8] rounded-xl shadow-lg border border-[#0d54c5] hover:shadow-violet-500/50 transition-all duration-300 ease-in-out"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#00ddff] to-[rgb(4,245,245)] opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 rounded-xl" />
                <span className="relative z-10">🚀 Send Tokens</span>
            </button>

        </div>
    );
}