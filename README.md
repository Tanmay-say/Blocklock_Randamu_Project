# 🎯 Blockto NFT Mart – Auctions, Gaming, Casino & AI NFT Generation

> **A Web3 platform powered by Randamu Blocklock & VRF: private NFT auctions, provably fair randomness games, AI NFT generation, and decentralized Casino.**

Blockto NFT Mart combines **sealed-bid NFT auctions**, **VRF-based gaming**, **slot-machine casino**, and **AI-powered NFT generation** into one decentralized platform. It leverages Randamu’s **Blocklock timelock encryption** for sealed bids, **verifiable randomness (VRF)** for fair gameplay, **GenAI contracts** for AI NFTs, and a **Casino dApp** for entertainment with real rewards.

---

## 🌟 Overview

* **🏛️ Sealed-Bid NFT Auctions:** Bids are encrypted with Randamu Blocklock and revealed only after the auction ends.
* **🎰 Randomness Games:** Raffles and mini-games use DCipher VRF randomness for provably fair outcomes.
* **🎲 Casino Slot Machine:** Spin-to-win casino game with blockchain transparency and provable fairness.
* **🤖 AI NFT Studio:** Generate, store, and mint AI NFTs on-chain via dedicated GenAI contracts.

![Images](/images/1.png)
![Images](/images/2.png)
![Images](/images/3.png)
![Images](/images/4.png)
![Images](/images/5.png)
![Images](/images/6.png)
![Images](/images/7.png)
![Images](/images/8.png)
![Images](/images/9.png)
![Images](/images/10.png)
![Images](/images/11.png)
![Images](/images/12.png)

---

## 🔑 Features

### 🏛️ NFT Auctions

* Timelocked sealed-bids via Blocklock encryption
* On-chain reveal & settlement after auction expiry
* Winner NFTs and optional **Soulbound Trophy Tokens** (non-transferable)

### 🎰 Verifiable Random Games

* Stake ETH to join games or raffles
* Random outcomes provided by Randamu DCipher VRF
* Transparent results via contract callbacks & events

### 🎲 Slot Machine Casino

* Decentralized slot machine with provable fairness
* Configurable by **Casino Admin Wallet**
* Winnings automatically distributed via smart contracts

### 🤖 AI NFT Generation (GenAI)

* Smart contracts for storage, VRF-based traits, subscriptions, and NFT minting
* Integration with **Gemini AI** or other models for art creation
* Mint and trade AI-generated NFTs

---

## 🏗️ Smart Contract Architecture

```solidity
// AuctionHouse: Sealed-bid Auction using Blocklock
type AuctionHouse is AbstractBlocklockReceiver;

// RandomLottery: VRF-powered Games
type RandomLottery is RandomnessReceiverBase;

// WinnerSBT: Soulbound NFTs for Auction Winners
type WinnerSBT is ERC721;

// SlotMachineCasino: Provably Fair Slot Machine
type SlotMachineCasino is VRFGame;

// GenAI Contracts: AI-driven NFT generation
// - VRF randomness for AI traits
// - Storage of metadata
// - Subscription manager
// - NFT contract for minted AI art
```

---

## 🔧 Technology Stack

* **Blockchain:** Base Sepolia Testnet (chain ID 84532)
* **Contracts:** Solidity ^0.8.19
* **Frameworks:** Hardhat / Foundry
* **Libraries:** OpenZeppelin, Randamu blocklock-solidity & randomness-solidity
* **Frontend:** React 18 + Vite + Tailwind CSS
* **AI Integration:** GenAI contracts for NFT minting
* **Casino Integration:** Slot Machine smart contract

---

## 🚀 Deployment Info (Base Sepolia)

### Core Contracts

| Contract      | Address       | Description                         |
| ------------- | ------------- | ----------------------------------- |
| AuctionHouse  | `0xAaBbCc...` | Main sealed-bid auction contract    |
| RandomLottery | `0x112233...` | VRF randomness-based game contract  |
| WinnerSBT     | `0x998877...` | Soulbound token for auction winners |
| DemoNFT       | `0xABCDEF...` | Sample ERC-721 NFT for testing      |

### GENAI Contracts

| Contract            | Address                                      | Purpose                      |
| ------------------- | -------------------------------------------- | ---------------------------- |
| GENAI\_VRF          | `0x785c2FbA7d753Fe80b4afe5746E9E54a5c421e26` | Randomness for AI NFT traits |
| GENAI\_STORAGE      | `0x65AC9024c5ED38c0EbFed17Eb0748c291ae50481` | Metadata & asset storage     |
| GENAI\_SUBSCRIPTION | `0xDf7f52a035E7ECb25D17c90afbda13EbA64aAB7E` | Subscription/payment manager |
| GENAI\_NFT          | `0x5ad80677f48a841E52426e59E1c1751aF9b8F72F` | Main AI NFT minting contract |

### Casino Contracts

| Contract              | Address                                      | Purpose                      |
| --------------------- | -------------------------------------------- | ---------------------------- |
| SLOT\_MACHINE\_CASINO | `0x9568cd176Eb3B5912e1e5c70bdc768C6e744D42b` | Slot machine casino contract |
| CASINO\_ADMIN\_WALLET | `0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC` | Casino owner/admin wallet    |

**Network:** Base Sepolia Testnet
**RPC URL:** `https://sepolia.base.org`
**Chain ID:** `84532`
**Explorer:** [BaseScan Sepolia](https://sepolia.basescan.org)

---

## 💻 Quick Start

### Prerequisites

* Node.js v18+, npm/yarn
* MetaMask with Base Sepolia added
* Some testnet ETH (from [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia))

### Setup

```bash
git clone https://github.com/Tanmay-say/Blocklock_Randamu_Project.git
cd Blocklock_Randamu_Project
npm install
```

### Configure

Create `.env` file:

```env
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://sepolia.base.org
AUCTION_CONTRACT_ADDRESS=0x...
RANDOM_LOTTERY_ADDRESS=0x...
BLOCKLOCK_SENDER_ADDRESS=0x...
GENAI_VRF_ADDRESS=0x785c2FbA7d753Fe80b4afe5746E9E54a5c421e26
GENAI_STORAGE_ADDRESS=0x65AC9024c5ED38c0EbFed17Eb0748c291ae50481
GENAI_SUBSCRIPTION_ADDRESS=0xDf7f52a035E7ECb25D17c90afbda13EbA64aAB7E
GENAI_NFT_ADDRESS=0x5ad80677f48a841E52426e59E1c1751aF9b8F72F
VITE_SLOT_MACHINE_ADDRESS=0x9568cd176Eb3B5912e1e5c70bdc768C6e744D42b
VITE_CASINO_ADMIN_WALLET=0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC
```

### Run

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🌍 Live Deployment

👉 [**Blockto NFT Mart Live on Vercel**](https://blocklock-randamu-project.vercel.app/)

---

## 📱 Usage

### Auction Example

```javascript
const encryptedBid = await blocklock.encrypt(bidValue, revealBlock);
await auctionHouse.commitBid(auctionId, encryptedBid, { value: deposit });

// After reveal
await auctionHouse.finalizeAuction(auctionId);
```

### Random Game Example

```javascript
await randomLottery.playGame({ value: ethers.parseEther("0.01") });
// Result emitted via event after VRF callback
```

### Casino Example

```javascript
await slotMachine.playSpin({ value: ethers.parseEther("0.05") });
// Spin result emitted in VRF callback
```

### AI NFT Mint Example

```javascript
await genaiNFT.mintNFT(userAddress, metadataURI);
```

---

## 🔒 Security

* Blocklock timelock keeps bids sealed until reveal
* Randamu VRF ensures unpredictable randomness
* Slot Machine provably fair randomness
* OpenZeppelin ERC-721 standard for NFTs
* Reentrancy guards, pausable contracts, access control

---

## 🤝 Contributing

* Fork the repo & create feature branch
* Run `npm run test` before PR
* Submit PR with detailed description

---

## 📄 License

MIT License – see [LICENSE](LICENSE)

---

<p align="center">
  Built with ❤️ by the Blockto NFT Mart Team
</p>
