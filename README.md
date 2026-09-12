# 🚀 TSender

A hyper gas-efficient dApp for bulk ERC-20 token distribution, featuring a sleek carbon fiber UI and multi-chain support.

- **Live Link** - [TSender](https://t-sender.vercel.app/)


## ✨ Features

- **Gas Optimization**: Efficient batch processing for token airdrops
- **Multi-Chain Support**: Deploy and use across multiple EVM networks
- **Modern UI**: Sleek carbon fiber theme with responsive design
- **User-Friendly**: Simple interface for bulk token distribution
- **Web3 Integration**: Seamless wallet connection with RainbowKit

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Web3**: Wagmi + RainbowKit
- **Styling**: Tailwind CSS
- **Smart Contracts**: Solidity (Foundry)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask or any Web3 wallet

### Installation

1. Clone the repository:

```bash
git clone https://github.com/AshiqAhamed17/TSender.git
cd TSender
```

2. Install dependencies:

```bash
# Install frontend dependencies
cd tsender
npm install

# Install smart contract dependencies (requires Foundry: https://getfoundry.sh)
cd ../tsender-smart-contract
make install
forge build
```

3. Set up environment variables:

```bash
# In tsender directory
cp .env.example .env.local
```

Then fill in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` with a free project ID from [Reown Cloud](https://cloud.reown.com) (formerly WalletConnect Cloud).

4. Start the development server:

```bash
cd tsender
npm run dev
```

The TSender contract is already deployed on Sepolia, Ethereum mainnet, Arbitrum, Optimism, Base, zkSync, and a local Anvil chain (see `src/constants.ts`) — connect your wallet to one of those networks to use the app without deploying anything yourself.

## 📝 Usage

1. Connect your wallet using the RainbowKit button
2. Enter the ERC-20 token address
3. Input recipient addresses (comma or newline separated)
4. Specify token amounts for each recipient
5. Click "Send Tokens" to initiate the airdrop

## 🔧 Smart Contract

The smart contract is optimized for gas efficiency and supports:

- Batch token transfers
- Multi-chain deployment
- Gas optimization techniques

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

- **Ashiq Ahamed** - [GitHub](https://github.com/AshiqAhamed17)

## 🙏 Acknowledgments

- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
