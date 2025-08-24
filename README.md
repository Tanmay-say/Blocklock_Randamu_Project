# 🎯 NGT Auction Marketplace

> **Sealed-Bid NFT Auction Platform with Blocklock Encryption on Base Sepolia**

A revolutionary NFT auction marketplace featuring sealed-bid auctions with automatic encryption/decryption using Blocklock technology, deployed on Base Sepolia testnet.

## 🌟 Overview

This marketplace enables **truly private auctions** where bids are encrypted using Blocklock and automatically decrypted when the auction ends, ensuring fair and transparent sealed-bid auctions.

### 🔥 Key Features

- **🔒 Sealed-Bid Auctions** - Bids are encrypted with Blocklock until auction ends
- **⚡ Automatic Decryption** - Blocklock automatically reveals bids when conditions are met
- **💰 Revenue Model** - 20% tax on losing bidders + 100% of winning bids to admin
- **🏆 Winner SBTs** - Non-transferable soulbound tokens for auction winners
- **🎲 Fair Tie-Breaking** - Randamu VRF for random winner selection in ties
- **⛽ Gas Optimized** - Optimized for Base network's low fees

## 🚀 Live Deployment - Base Sepolia

### 📋 Contract Addresses

| Contract | Address | Purpose |
|----------|---------|---------|
| **🏛️ AuctionHouse** | [`0x6F8449Bb1E91970Ee39ECB3c71d7936e8e6d76Ba`](https://sepolia.basescan.org/address/0x6F8449Bb1E91970Ee39ECB3c71d7936e8e6d76Ba) | Main auction contract with Blocklock integration |
| **🏆 WinnerSBT** | [`0x12C2c5C8d2175Bc1dD80cD8A1b590C996B3f47d0`](https://sepolia.basescan.org/address/0x12C2c5C8d2175Bc1dD80cD8A1b590C996B3f47d0) | Soulbound tokens for auction winners |
| **🎨 TestNFT** | [`0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705`](https://sepolia.basescan.org/address/0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705) | ERC-721 tokens for auction testing |
| **🎲 MockRandamuVRF** | [`0x15F508eAE92bee6e8d27b61C4A129ECF094e9aa3`](https://sepolia.basescan.org/address/0x15F508eAE92bee6e8d27b61C4A129ECF094e9aa3) | Verifiable randomness for tie-breaking |

### 🌐 Network Information

- **Network**: Base Sepolia Testnet
- **Chain ID**: `84532`
- **RPC URL**: `https://sepolia.base.org`
- **Explorer**: https://sepolia.basescan.org
- **Deployed**: August 24, 2025
- **Deployer**: `0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC`

### 🔗 External Integrations

- **Blocklock Sender**: `0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e`
- **Encryption**: AES-256-GCM with block-based decryption
- **Randomness**: Randamu VRF for fair tie-breaking

## 🎮 How It Works

### 1. 🏗️ Auction Creation
- Sellers list NFTs with reserve price and auction duration
- 10-50% deposit required from bidders
- Auction duration set in blocks (e.g., 100 blocks ≈ 3.3 minutes)

### 2. 🔐 Encrypted Bidding
- Bidders place encrypted bids using Blocklock
- Bid amounts hidden until auction ends
- Minimum deposit required (percentage of reserve price)

### 3. ⏰ Automatic Decryption
- Blocklock automatically decrypts bids when auction end block is reached
- Highest valid bid wins the NFT
- Transparent and tamper-proof process

### 4. 💸 Settlement & Revenue
- **Winner**: Receives NFT + Winner SBT
- **Losing Bidders**: Pay 20% tax on their deposit
- **Admin**: Receives winning bid amount + all taxes

## 🛠️ Technical Architecture

### Smart Contracts

```solidity
// Main auction contract with Blocklock integration
contract AuctionHouse is AbstractBlocklockReceiver {
    // Sealed-bid auction with encrypted bids
    // Automatic decryption via Blocklock callbacks
    // 20% tax system for revenue generation
}

// Non-transferable winner certificates
contract WinnerSBT is ERC721 {
    // Soulbound tokens for auction winners
    // SVG-based metadata with auction details
}
```

### 🔧 Key Technologies

- **Solidity ^0.8.24** - Smart contract development
- **Blocklock** - Time-based encryption/decryption
- **OpenZeppelin** - Security and standards
- **Hardhat** - Development framework
- **React + TypeScript** - Frontend interface
- **Ethers.js** - Blockchain interaction

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- Base Sepolia ETH
- MetaMask or compatible wallet

### 1. Clone & Install

```bash
git clone <repository-url>
cd ngt-marketplace
npm install
```

### 2. Environment Setup

```bash
cp env.local.template .env
# Edit .env with your credentials
```

### 3. Add Base Sepolia to MetaMask

- **Network Name**: Base Sepolia Testnet
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Currency Symbol**: `ETH`
- **Block Explorer**: `https://sepolia.basescan.org`

### 4. Get Testnet ETH

- **Faucet**: https://www.alchemy.com/faucets/base-sepolia
- **Bridge**: https://bridge.base.org/deposit

### 5. Test the Platform

```bash
# Run auction demo with Blocklock encryption
npm run demo:auction

# Start frontend
npm run dev
```

## 📱 Usage Examples

### Creating an Auction

```javascript
// Create auction for NFT
await auctionHouse.createAuction(
  nftAddress,      // NFT contract
  tokenId,         // Token ID
  reserve,         // Minimum bid (in wei)
  endBlock,        // Auction end block
  depositPct       // Required deposit %
);
```

### Placing Encrypted Bids

```javascript
// Encrypt bid using Blocklock
const encryptedBid = blocklock.encrypt(bidAmount, endBlock);

// Submit encrypted bid
await auctionHouse.commitBid(
  auctionId,
  encryptedBid,
  condition,
  callbackGasLimit,
  { value: deposit }
);
```

### Automatic Settlement

- Blocklock automatically decrypts bids at end block
- Contract determines winner and processes payments
- Winner receives NFT + SBT certificate

## 💰 Revenue Model

| Event | Revenue Stream | Amount |
|-------|---------------|--------|
| **Winning Bid** | Admin receives full amount | 100% |
| **Losing Bids** | Tax on deposits | 20% |
| **Platform** | Combined revenue | ~120-200% of reserve |

### Example: 1 ETH Reserve Auction
- 5 bidders deposit 0.2 ETH each (20%)
- Winner bids 1.5 ETH → Admin gets 1.5 ETH
- 4 losers pay 0.04 ETH tax each → Admin gets 0.16 ETH
- **Total Admin Revenue**: 1.66 ETH (111% of winning bid)

## 🔒 Security Features

- **✅ Role-based Access Control** - Admin/Seller roles
- **✅ Reentrancy Protection** - No recursive calls
- **✅ Safe NFT Transfers** - ERC721Holder standard
- **✅ Bid Privacy** - Blocklock encryption
- **✅ Emergency Functions** - Admin recovery options

## 🧪 Testing

```bash
# Run smart contract tests
npm test

# Deploy to local network
npm run node
npm run deploy:local

# Deploy to Base Sepolia
npm run deploy:base-sepolia
```

## 📊 Gas Costs (Base Sepolia)

| Function | Gas Cost | USD Cost* |
|----------|----------|-----------|
| Create Auction | ~150,000 | ~$0.0001 |
| Place Bid | ~100,000 | ~$0.0001 |
| Finalize Auction | ~200,000 | ~$0.0001 |

*Based on Base Sepolia gas prices

## 🔮 Future Roadmap

- **🌐 Mainnet Deployment** - Launch on Base mainnet
- **🎨 NFT Creation** - Built-in NFT minting
- **📱 Mobile App** - React Native application
- **🤖 AI Integration** - Smart pricing recommendations
- **🔗 Cross-chain** - Multi-network support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Discord**: [Join our community](https://discord.gg/ngt-marketplace)
- **Documentation**: [docs.ngt-marketplace.com](https://docs.ngt-marketplace.com)
- **Issues**: [GitHub Issues](https://github.com/ngt-marketplace/issues)

## 🙏 Acknowledgments

- **Blocklock Team** - For time-based encryption technology
- **Base Network** - For low-cost, fast blockchain infrastructure
- **OpenZeppelin** - For secure smart contract standards
- **Randamu** - For verifiable randomness

---

**🎉 Ready to revolutionize NFT auctions with true bid privacy? Start bidding today!**

Built with ❤️ by the NGT Team | [Website](https://ngt-marketplace.com) | [Twitter](https://twitter.com/ngt_marketplace)