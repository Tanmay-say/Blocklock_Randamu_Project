const { ethers } = require("hardhat");
require('dotenv').config();

async function testConnection() {
    console.log("🔗 Testing Smart Contract Connectivity...\n");
    
    try {
        // Test provider connection
        const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
        const network = await provider.getNetwork();
        console.log("✅ Network Connected:");
        console.log("   Chain ID:", network.chainId.toString());
        console.log("   Network Name:", network.name);
        
        // Test wallet connection
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const balance = await provider.getBalance(wallet.address);
        console.log("\n✅ Wallet Connected:");
        console.log("   Address:", wallet.address);
        console.log("   Balance:", ethers.formatEther(balance), "ETH");
        
        // Contract addresses from deployment
        const contracts = {
            auctionHouse: "0x6F8449Bb1E91970Ee39ECB3c71d7936e8e6d76Ba",
            testNFT: "0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705", 
            winnerSBT: "0x12C2c5C8d2175Bc1dD80cD8A1b590C996B3f47d0",
            mockVRF: "0x15F508eAE92bee6e8d27b61C4A129ECF094e9aa3"
        };
        
        console.log("\n🏗️ Testing Contract Connectivity:");
        
        // Test AuctionHouse contract
        const auctionHouseABI = [
            "function TAX_PERCENTAGE() external view returns (uint256)",
            "function adminWallet() external view returns (address)",
            "function hasRole(bytes32 role, address account) external view returns (bool)",
            "function ADMIN_ROLE() external view returns (bytes32)"
        ];
        
        const auctionHouse = new ethers.Contract(contracts.auctionHouse, auctionHouseABI, provider);
        
        const taxPercentage = await auctionHouse.TAX_PERCENTAGE();
        const adminWallet = await auctionHouse.adminWallet();
        const adminRole = await auctionHouse.ADMIN_ROLE();
        const isAdmin = await auctionHouse.hasRole(adminRole, wallet.address);
        
        console.log("✅ AuctionHouse Contract:");
        console.log("   Address:", contracts.auctionHouse);
        console.log("   Tax Percentage:", taxPercentage.toString() + "%");
        console.log("   Admin Wallet:", adminWallet);
        console.log("   Deployer is Admin:", isAdmin);
        
        // Test TestNFT contract
        const nftABI = [
            "function name() external view returns (string)",
            "function symbol() external view returns (string)",
            "function owner() external view returns (address)"
        ];
        
        const testNFT = new ethers.Contract(contracts.testNFT, nftABI, provider);
        const nftName = await testNFT.name();
        const nftSymbol = await testNFT.symbol();
        const nftOwner = await testNFT.owner();
        
        console.log("\n✅ TestNFT Contract:");
        console.log("   Address:", contracts.testNFT);
        console.log("   Name:", nftName);
        console.log("   Symbol:", nftSymbol);
        console.log("   Owner:", nftOwner);
        
        // Test WinnerSBT contract
        const sbtABI = [
            "function name() external view returns (string)",
            "function symbol() external view returns (string)"
        ];
        
        const winnerSBT = new ethers.Contract(contracts.winnerSBT, sbtABI, provider);
        const sbtName = await winnerSBT.name();
        const sbtSymbol = await winnerSBT.symbol();
        
        console.log("\n✅ WinnerSBT Contract:");
        console.log("   Address:", contracts.winnerSBT);
        console.log("   Name:", sbtName);
        console.log("   Symbol:", sbtSymbol);
        
        console.log("\n🎉 ALL CONTRACTS CONNECTED SUCCESSFULLY!");
        console.log("\n📋 Frontend Environment Variables:");
        console.log("VITE_CHAIN_ID=84532");
        console.log("VITE_RPC_URL=https://sepolia.base.org");
        console.log("VITE_AUCTION_HOUSE_ADDRESS=" + contracts.auctionHouse);
        console.log("VITE_WINNER_SBT_ADDRESS=" + contracts.winnerSBT);
        console.log("VITE_TEST_NFT_ADDRESS=" + contracts.testNFT);
        console.log("VITE_MOCK_VRF_ADDRESS=" + contracts.mockVRF);
        
        console.log("\n🌐 BaseScan Links:");
        console.log("AuctionHouse: https://sepolia.basescan.org/address/" + contracts.auctionHouse);
        console.log("TestNFT: https://sepolia.basescan.org/address/" + contracts.testNFT);
        console.log("WinnerSBT: https://sepolia.basescan.org/address/" + contracts.winnerSBT);
        
    } catch (error) {
        console.error("❌ Connection test failed:", error.message);
    }
}

testConnection();
