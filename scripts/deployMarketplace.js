const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleMarketplace to Base Sepolia...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const network = await ethers.provider.getNetwork();
    
    console.log("✅ Connected successfully!");
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    // Admin wallet address (your wallet)
    const adminWallet = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
    
    // Platform fee: 2.5% (250 basis points)
    const platformFeePercentage = 250;
    
    // Deploy SimpleMarketplace
    console.log("\n📦 Deploying SimpleMarketplace...");
    console.log("Admin Wallet:", adminWallet);
    console.log("Platform Fee:", platformFeePercentage / 100, "%");
    
    const SimpleMarketplace = await ethers.getContractFactory("SimpleMarketplace");
    const marketplace = await SimpleMarketplace.deploy(adminWallet, platformFeePercentage);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    
    console.log("✅ SimpleMarketplace deployed to:", marketplaceAddress);
    
    // Verify contract deployment
    console.log("\n🔍 Verifying deployment...");
    const deployedAdminWallet = await marketplace.adminWallet();
    const deployedFeePercentage = await marketplace.platformFeePercentage();
    
    console.log("Verified Admin Wallet:", deployedAdminWallet);
    console.log("Verified Platform Fee:", deployedFeePercentage.toString(), "basis points");
    
    // Create some test listings
    console.log("\n📋 Creating test listings...");
    
    const prices = [
      ethers.parseEther("0.001"), // 0.001 ETH
      ethers.parseEther("0.002"), // 0.002 ETH
      ethers.parseEther("0.005"), // 0.005 ETH
    ];
    
    for (let i = 0; i < prices.length; i++) {
      console.log(`Creating listing ${i + 1} with price: ${ethers.formatEther(prices[i])} ETH`);
      const tx = await marketplace.createListing(prices[i]);
      await tx.wait();
      console.log(`✅ Listing ${i + 1} created`);
    }
    
    // Create deployment summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 MARKETPLACE DEPLOYMENT SUMMARY");
    console.log("=".repeat(80));
    console.log("Network:", "Base Sepolia");
    console.log("Marketplace Address:", marketplaceAddress);
    console.log("Admin Wallet:", adminWallet);
    console.log("Platform Fee:", platformFeePercentage / 100, "%");
    console.log("\n📱 Contract Links:");
    console.log("🔗 BaseScan:", `https://sepolia.basescan.org/address/${marketplaceAddress}`);
    
    console.log("\n🛒 Test Listings Created:");
    for (let i = 0; i < prices.length; i++) {
      console.log(`Listing ${i + 1}: ${ethers.formatEther(prices[i])} ETH`);
    }
    
    console.log("\n💻 Frontend Integration:");
    console.log("Add this to src/lib/contracts.ts:");
    console.log(`marketplace: "${marketplaceAddress}",`);
    
    console.log("\n🎯 Next Steps:");
    console.log("1. Update frontend contract addresses");
    console.log("2. Test marketplace purchases");
    console.log("3. Verify admin wallet receives profits");
    
    console.log("\n✅ Deployment completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
