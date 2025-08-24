const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting final deployment to Base Sepolia...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const network = await ethers.provider.getNetwork();
    
    console.log("✅ Connected successfully!");
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    // Get initial nonce
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Starting nonce:", nonce);
    
    // Deploy TestNFT
    console.log("\n📦 Deploying TestNFT...");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy({ nonce: nonce++ });
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    console.log("✅ TestNFT deployed to:", testNFTAddress);
    
    // Deploy WinnerSBT
    console.log("\n📦 Deploying WinnerSBT...");
    const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
    const winnerSBT = await WinnerSBT.deploy({ nonce: nonce++ });
    await winnerSBT.waitForDeployment();
    const winnerSBTAddress = await winnerSBT.getAddress();
    console.log("✅ WinnerSBT deployed to:", winnerSBTAddress);
    
    // Deploy MockRandamuVRF
    console.log("\n📦 Deploying MockRandamuVRF...");
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    const mockRandamuVRF = await MockRandamuVRF.deploy({ nonce: nonce++ });
    await mockRandamuVRF.waitForDeployment();
    const mockVRFAddress = await mockRandamuVRF.getAddress();
    console.log("✅ MockRandamuVRF deployed to:", mockVRFAddress);
    
    // Deploy AuctionHouse
    console.log("\n📦 Deploying AuctionHouse...");
    const adminWallet = process.env.ADMIN_WALLET || deployer.address;
    const blocklockSender = process.env.BLOCKLOCK_SENDER_ADDRESS || "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e";
    
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy(
      winnerSBTAddress,
      mockVRFAddress,
      adminWallet,
      blocklockSender,
      { nonce: nonce++ }
    );
    await auctionHouse.waitForDeployment();
    const auctionHouseAddress = await auctionHouse.getAddress();
    console.log("✅ AuctionHouse deployed to:", auctionHouseAddress);
    
    console.log("\n🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log("🎯 DEPLOYMENT SUMMARY - BASE SEPOLIA");
    console.log("=".repeat(70));
    console.log("TestNFT:         ", testNFTAddress);
    console.log("WinnerSBT:       ", winnerSBTAddress);
    console.log("MockRandamuVRF:  ", mockVRFAddress);
    console.log("AuctionHouse:    ", auctionHouseAddress);
    console.log("Admin Wallet:    ", adminWallet);
    console.log("Blocklock Sender:", blocklockSender);
    console.log("=".repeat(70));
    
    // Setup roles
    console.log("\n🔑 Setting up roles...");
    const minterRole = await winnerSBT.MINTER_ROLE();
    await winnerSBT.grantRole(minterRole, auctionHouseAddress, { nonce: nonce++ });
    console.log("✅ Granted MINTER_ROLE to AuctionHouse");
    
    const sellerRole = await auctionHouse.SELLER_ROLE();
    await auctionHouse.grantRole(sellerRole, deployer.address, { nonce: nonce++ });
    console.log("✅ Granted SELLER_ROLE to deployer");
    
    // Save deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: 84532,
      deployer: deployer.address,
      adminWallet: adminWallet,
      blocklockSender: blocklockSender,
      contracts: {
        TestNFT: testNFTAddress,
        WinnerSBT: winnerSBTAddress,
        MockRandamuVRF: mockVRFAddress,
        AuctionHouse: auctionHouseAddress,
      },
      timestamp: new Date().toISOString(),
    };
    
    const fs = require("fs");
    fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment.json");
    
    // Update .env file
    console.log("\n📝 Updating .env file with contract addresses...");
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/AUCTION_HOUSE_ADDRESS=.*/, `AUCTION_HOUSE_ADDRESS=${auctionHouseAddress}`);
    envContent = envContent.replace(/WINNER_SBT_ADDRESS=.*/, `WINNER_SBT_ADDRESS=${winnerSBTAddress}`);
    envContent = envContent.replace(/TEST_NFT_ADDRESS=.*/, `TEST_NFT_ADDRESS=${testNFTAddress}`);
    envContent = envContent.replace(/MOCK_VRF_ADDRESS=.*/, `MOCK_VRF_ADDRESS=${mockVRFAddress}`);
    envContent = envContent.replace(/VITE_AUCTION_HOUSE_ADDRESS=.*/, `VITE_AUCTION_HOUSE_ADDRESS=${auctionHouseAddress}`);
    envContent = envContent.replace(/VITE_WINNER_SBT_ADDRESS=.*/, `VITE_WINNER_SBT_ADDRESS=${winnerSBTAddress}`);
    envContent = envContent.replace(/VITE_TEST_NFT_ADDRESS=.*/, `VITE_TEST_NFT_ADDRESS=${testNFTAddress}`);
    envContent = envContent.replace(/VITE_MOCK_VRF_ADDRESS=.*/, `VITE_MOCK_VRF_ADDRESS=${mockVRFAddress}`);
    fs.writeFileSync('.env', envContent);
    console.log("✅ .env file updated with contract addresses");
    
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("🔗 View on BaseScan:");
    console.log(`   AuctionHouse: https://sepolia.basescan.org/address/${auctionHouseAddress}`);
    console.log(`   TestNFT: https://sepolia.basescan.org/address/${testNFTAddress}`);
    console.log(`   WinnerSBT: https://sepolia.basescan.org/address/${winnerSBTAddress}`);
    
    console.log("\n🚀 NEXT STEPS:");
    console.log("1. Test auction creation: npm run demo:auction");
    console.log("2. Start frontend: npm run dev");
    console.log("3. Add Base Sepolia to MetaMask");
    console.log("4. Import your wallet to MetaMask");
    console.log("5. Start creating auctions!");
    
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    if (error.reason) console.error("Reason:", error.reason);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
