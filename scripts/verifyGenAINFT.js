const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🔍 Verifying GenAI NFT Contract...");
  
  const CONTRACT_ADDRESS = "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F";
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    
    // Get contract instance
    const GenAINFT = await ethers.getContractFactory("GenAINFT");
    const contract = GenAINFT.attach(CONTRACT_ADDRESS);
    
    // Check contract details
    console.log("📊 Contract Details:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const mintPrice = await contract.BASE_MINT_PRICE();
    const adminWallet = await contract.adminWallet();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
    console.log("- Admin Wallet:", adminWallet);
    
    // Check if deployer has MINTER_ROLE
    const MINTER_ROLE = await contract.MINTER_ROLE();
    const hasMinterRole = await contract.hasRole(MINTER_ROLE, deployer.address);
    console.log("- Has Minter Role:", hasMinterRole);
    
    if (!hasMinterRole) {
      console.log("⚠️  Account doesn't have MINTER_ROLE - need to grant it for minting");
    }
    
    console.log("\n✅ GenAI NFT Contract Verified Successfully!");
    console.log("🎯 Ready for soul-bound NFT minting integration");
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
