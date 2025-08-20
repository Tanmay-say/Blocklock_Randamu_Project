# 🚀 Tanmay's NFT Mart - Sealed-Bid Auction Marketplace

A modern, decentralized NFT marketplace featuring **sealed-bid auctions** with **Blocklock encryption** and **Randamu verifiable randomness**. Built with React, TypeScript, Solidity, and Hardhat.

## ✨ Features

- **🔐 Sealed-Bid Auctions** - Bids are encrypted until auction ends
- **🔒 Blocklock Integration** - Time-locked encryption for bid privacy
- **🎲 Verifiable Randomness** - Randamu VRF for tie-breaking
- **🏆 Winner SBTs** - Soulbound tokens for auction winners (ERC-5192)
- **👛 MetaMask Integration** - Seamless wallet connection
- **👨‍💼 Admin Panel** - Comprehensive auction management
- **🤖 GenAI Studio** - AI-powered content generation
- **🌐 Ethereum Sepolia** - Built for Ethereum testnet

## 🏗️ Architecture

### Smart Contracts
- **`AuctionHouse.sol`** - Main auction logic with sealed-bid mechanics
- **`WinnerSBT.sol`** - ERC-5192 soulbound tokens for winners
- **`TestNFT.sol`** - ERC-721 tokens for testing
- **`MockRandamuVRF.sol`** - Mock randomness for development

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom design system
- **Shadcn/ui** components
- **MetaMask** wallet integration
- **Responsive design** for all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet
- Ethereum Sepolia testnet ETH

### 1. Clone & Install
```bash
git clone <repository-url>
cd nft-marketplace
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
# Network Configuration
RPC_URL=https://sepolia.infura.io/v3/your-project-id
CHAIN_ID=11155111

# Deployer Account
PRIVATE_KEY=your_private_key_here

# Etherscan API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Deploy to Local Network
```bash
# Start local Hardhat node
npm run node

# In new terminal, deploy contracts
npm run deploy:local
```

### 5. Seed Test Data
```bash
npm run seed
```

### 6. Start Frontend
```bash
npm run dev
```

Visit `http://localhost:8080` to see your marketplace!

## 🚀 Deployment

### Ethereum Sepolia Testnet
```bash
npm run deploy:sepolia
```

### Mainnet (when ready)
```bash
npm run deploy:mainnet
```

## 📱 Usage

### For Users
1. **Connect Wallet** - Click "Connect Wallet" to link MetaMask
2. **Browse Collections** - View available NFTs and auctions
3. **Place Bids** - Submit encrypted bids on active auctions
4. **Track Status** - Monitor auction progress and results
5. **Claim Prizes** - Winners receive NFTs and SBT badges

### For Admins
1. **Access Admin Panel** - Available after connecting admin wallet
2. **Create Auctions** - Set up new sealed-bid auctions
3. **Manage Bids** - Process and reveal encrypted bids
4. **Finalize Auctions** - Complete auctions and distribute prizes
5. **Monitor System** - View analytics and system status

### GenAI Features
1. **Image Generation** - Create AI art from text descriptions
2. **Style Transfer** - Apply artistic styles to existing images
3. **Text Generation** - Generate creative content with AI

## 🔧 Configuration

### Admin Addresses
Update admin addresses in `src/contexts/WalletContext.tsx`:
```typescript
const ADMIN_ADDRESSES = [
  '0xYourAdminAddress1',
  '0xYourAdminAddress2'
];
```

### Network Configuration
Modify network settings in `hardhat.config.ts`:
```typescript
networks: {
  sepolia: {
    url: process.env.RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111,
  }
}
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Specific Contracts
```bash
npx hardhat test test/AuctionHouse.spec.ts
npx hardhat test test/WinnerSBT.spec.ts
```

### Local Testing
```bash
# Start local node
npm run node

# Deploy and test locally
npm run deploy:local
npm run seed
```

## 📊 Contract Addresses

After deployment, contract addresses are saved to `deployment.json`:
```json
{
  "network": "sepolia",
  "contracts": {
    "TestNFT": "0x...",
    "WinnerSBT": "0x...",
    "MockRandamuVRF": "0x...",
    "AuctionHouse": "0x..."
  }
}
```

## 🔒 Security Features

- **Reentrancy Protection** - Prevents reentrancy attacks
- **Access Control** - Role-based permissions for admin functions
- **Input Validation** - Comprehensive parameter checking
- **Emergency Functions** - Admin controls for critical situations
- **Encrypted Bids** - Bid amounts hidden until auction ends

## 🌐 Network Support

- **Ethereum Sepolia** - Primary testnet (Chain ID: 11155111)
- **Local Hardhat** - Development and testing
- **Ethereum Mainnet** - Production deployment (when ready)

## 📚 API Reference

### Smart Contract Functions

#### AuctionHouse
- `createAuction(nft, tokenId, reserve, endBlock, depositPct)` - Create new auction
- `commitBid(auctionId, ciphertext, condition, refundTo)` - Submit encrypted bid
- `finalize(auctionId)` - Complete auction and distribute prizes
- `getAuction(auctionId)` - Get auction details

#### WinnerSBT
- `mintLocked(to, auctionId)` - Mint winner badge
- `locked(tokenId)` - Check if token is transferable (always true)
- `getAuctionId(tokenId)` - Get associated auction ID

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check this README and inline code comments
- **Issues** - Report bugs via GitHub Issues
- **Discussions** - Join community discussions
- **Discord** - Join our Discord server for real-time help

## 🔮 Roadmap

- [ ] **Q1 2024** - Mainnet deployment
- [ ] **Q2 2024** - Mobile app development
- [ ] **Q3 2024** - Advanced analytics dashboard
- [ ] **Q4 2024** - Cross-chain auction support
- [ ] **2025** - DAO governance implementation

## 🙏 Acknowledgments

- **OpenZeppelin** - Secure smart contract libraries
- **Hardhat** - Development framework
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful UI components
- **Ethereum Foundation** - Blockchain platform

---

**Built with ❤️ by the Tanmay's NFT Mart team**

*Transform your digital art into valuable assets with the power of blockchain technology!*