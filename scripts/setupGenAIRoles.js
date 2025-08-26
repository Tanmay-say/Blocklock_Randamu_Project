const { ethers } = require("hardhat");

async function main() {
  console.log("🔐 Setting up GenAI contract roles...");
  
  // Load deployment data or set addresses manually
  const addresses = {
    mockRandamuVRF: "0x785c2FbA7d753Fe80b4afe5746E9E54a5c421e26",
    genaiImageStorage: "0x65AC9024c5ED38c0EbFed17Eb0748c291ae50481",
    genaiSubscription: "0xDf7f52a035E7ECb25D17c90afbda13EbA64aAB7E",
    genaiNFT: "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F"
  };
  
  const [deployer] = await ethers.getSigners();
  console.log("Setting up with deployer:", deployer.address);
  
  // Get contract instances
  const imageStorage = await ethers.getContractAt("GenAIImageStorage", addresses.genaiImageStorage);
  const genaiNFT = await ethers.getContractAt("GenAINFT", addresses.genaiNFT);
  
  try {
    // Grant GenAI role to subscription contract in image storage
    console.log("Granting GenAI role to subscription contract...");
    const grantTx1 = await imageStorage.grantGenAIRole(addresses.genaiSubscription);
    await grantTx1.wait();
    console.log("✅ GenAI role granted to subscription contract");
    
    // Grant MINTER role to subscription contract in NFT contract
    console.log("Granting MINTER role to subscription contract...");
    const MINTER_ROLE = await genaiNFT.MINTER_ROLE();
    const grantTx2 = await genaiNFT.grantRole(MINTER_ROLE, addresses.genaiSubscription);
    await grantTx2.wait();
    console.log("✅ MINTER role granted to subscription contract");
    
    console.log("\n✅ All roles set up successfully!");
    
    // Test the setup
    console.log("\n🧪 Testing contract setup...");
    
    const subscription = await ethers.getContractAt("GenAISubscription", addresses.genaiSubscription);
    
    // Test subscription pricing
    const pricing = await Promise.all([
      subscription.MONTHLY_PRICE(),
      subscription.ANNUAL_PRICE(),
      genaiNFT.BASE_MINT_PRICE()
    ]);
    
    console.log("Monthly price:", ethers.formatEther(pricing[0]), "ETH");
    console.log("Annual price:", ethers.formatEther(pricing[1]), "ETH");
    console.log("NFT mint price:", ethers.formatEther(pricing[2]), "ETH");
    
    // Test user daily info
    const dailyInfo = await subscription.getUserDailyInfo(deployer.address);
    console.log("User daily info - Used:", dailyInfo.used.toString(), "Limit:", dailyInfo.limit.toString());
    
    console.log("\n🎉 GenAI system is ready!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
