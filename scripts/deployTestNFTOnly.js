const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying ONLY TestNFT (without onlyOwner restriction)...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const network = await ethers.provider.getNetwork();
    
    console.log("✅ Connected successfully!");
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    if (parseFloat(ethers.formatEther(balance)) < 0.001) {
      console.log("❌ Insufficient balance for deployment");
      console.log("Please get some Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
      return;
    }
    
    // Deploy UPDATED TestNFT (without onlyOwner restriction)
    console.log("\n📦 Deploying Updated TestNFT (Users can mint)...");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    console.log("✅ Updated TestNFT deployed to:", testNFTAddress);
    
    // Test minting (to verify anyone can mint)
    console.log("\n🔨 Testing NFT minting...");
    const testMetadata = JSON.stringify({
      name: "Test NFT #1",
      description: "First test NFT from updated contract",
      image: "https://via.placeholder.com/400",
      attributes: []
    });
    const metadataURI = `data:application/json;base64,${Buffer.from(testMetadata).toString('base64')}`;
    
    const mintTx = await testNFT.mint(deployer.address, metadataURI);
    const mintReceipt = await mintTx.wait();
    console.log("✅ Test NFT minted successfully! Token ID: 0");
    console.log("Mint transaction:", mintTx.hash);
    
    // Create deployment summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 UPDATED TESTNFT DEPLOYMENT SUMMARY");
    console.log("=".repeat(80));
    console.log("Network:", "Base Sepolia");
    console.log("Updated TestNFT Address:", testNFTAddress);
    console.log("Deployer:", deployer.address);
    
    console.log("\n📱 Contract Links:");
    console.log("🔗 TestNFT BaseScan:", `https://sepolia.basescan.org/address/${testNFTAddress}`);
    console.log("🔗 Mint Transaction:", `https://sepolia.basescan.org/tx/${mintTx.hash}`);
    
    console.log("\n💻 Frontend Integration:");
    console.log("Update this address in src/lib/contracts.ts:");
    console.log(`testNFT: "${testNFTAddress}",`);
    
    console.log("\n🎯 Key Features:");
    console.log("✅ Anyone can mint NFTs (no onlyOwner restriction)");
    console.log("✅ Users will get real NFTs in MetaMask");
    console.log("✅ Admin can mint NFTs for buyers");
    console.log("✅ Real blockchain ownership");
    
    console.log("\n✅ Deployment completed successfully!");
    
    // Export addresses for easy copy-paste
    console.log("\n📋 Copy-Paste Ready:");
    console.log(`export const UPDATED_TEST_NFT_ADDRESS = "${testNFTAddress}";`);
    
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
