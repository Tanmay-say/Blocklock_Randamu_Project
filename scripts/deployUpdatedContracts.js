const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying UPDATED contracts to Base Sepolia...");
  
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
    
    // Get initial nonce
    let nonce = await ethers.provider.getTransactionCount(deployer.address);
    console.log("Starting nonce:", nonce);
    
    // Deploy UPDATED TestNFT (without onlyOwner restriction)
    console.log("\n📦 Deploying Updated TestNFT (Users can mint)...");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy({ nonce: nonce++ });
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    console.log("✅ Updated TestNFT deployed to:", testNFTAddress);
    
    // Deploy SimpleMarketplace
    console.log("\n📦 Deploying SimpleMarketplace...");
    const platformFeePercentage = 250; // 2.5%
    const SimpleMarketplace = await ethers.getContractFactory("SimpleMarketplace");
    const marketplace = await SimpleMarketplace.deploy(adminWallet, platformFeePercentage, { nonce: nonce++ });
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ SimpleMarketplace deployed to:", marketplaceAddress);
    
    // Test minting (to verify anyone can mint)
    console.log("\n🔨 Testing NFT minting...");
    const testMetadata = JSON.stringify({
      name: "Test NFT #1",
      description: "First test NFT from updated contract",
      image: "https://via.placeholder.com/400",
      attributes: []
    });
    const metadataURI = `data:application/json;base64,${Buffer.from(testMetadata).toString('base64')}`;
    
    const mintTx = await testNFT.mint(deployer.address, metadataURI, { nonce: nonce++ });
    const mintReceipt = await mintTx.wait();
    console.log("✅ Test NFT minted successfully! Token ID: 0");
    
    // Create deployment summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 UPDATED CONTRACTS DEPLOYMENT SUMMARY");
    console.log("=".repeat(80));
    console.log("Network:", "Base Sepolia");
    console.log("Updated TestNFT Address:", testNFTAddress);
    console.log("SimpleMarketplace Address:", marketplaceAddress);
    console.log("Admin Wallet:", adminWallet);
    console.log("Platform Fee:", platformFeePercentage / 100, "%");
    
    console.log("\n📱 Contract Links:");
    console.log("🔗 TestNFT BaseScan:", `https://sepolia.basescan.org/address/${testNFTAddress}`);
    console.log("🔗 Marketplace BaseScan:", `https://sepolia.basescan.org/address/${marketplaceAddress}`);
    
    console.log("\n💻 Frontend Integration:");
    console.log("Update these addresses in src/lib/contracts.ts:");
    console.log(`testNFT: "${testNFTAddress}",`);
    console.log(`marketplace: "${marketplaceAddress}",`);
    
    console.log("\n🎯 Key Features:");
    console.log("✅ Users can mint their own NFTs after purchase");
    console.log("✅ NFTs will appear in MetaMask wallet");
    console.log("✅ Marketplace handles profit sharing");
    console.log("✅ Real blockchain ownership");
    
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
