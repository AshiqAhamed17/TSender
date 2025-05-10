"use client"

import InputField from "@/components/ui/InputField";
import { useState } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, } from 'wagmi';
import { readContract } from '@wagmi/core';

export default function AirdropForms() {
    const [tokenAddress, setTokenAddress] = useState("");
    const [recipients, setRecipients] = useState("");
    const [amounts, setAmounts] = useState("");
    const chainId = useChainId();

    const getApprovedAmout = async (tSenderAddress: string | null): Promise<number> => {
        
    }

    const handleSubmit = async () => {
        // 1.a If already approved, move to step 2
        // 1.b Approve our tsender contract to sent out tokens
        // 2 Call the airdrop function on the tsender contract
        // 3. wait for the transaction to be mined

        const tSenderAddress = chainsToTSender[chainId]["tsender"];
        
    
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

            <button onClick={handleSubmit}>
                Send Tokens
            </button>

        </div>
    );
}