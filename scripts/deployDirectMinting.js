const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying updated TestNFT contract for direct minting...");

  // Get the contract factory
  const TestNFT = await ethers.getContractFactory("TestNFT");
  
  console.log("📝 Deploying TestNFT...");
  
  // Deploy the contract
  const testNFT = await TestNFT.deploy();
  
  // Wait for deployment to finish
  await testNFT.waitForDeployment();
  
  const address = await testNFT.getAddress();
  
  console.log("✅ TestNFT deployed to:", address);
  console.log("🔗 Contract address:", address);
  console.log("📋 Update your deployment.json and contracts.ts files with this new address");
  
  // Verify the contract on Base Sepolia
  console.log("\n🔍 To verify on Base Sepolia, run:");
  console.log(`npx hardhat verify --network base-sepolia ${address}`);
  
  return address;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment successful!");
    console.log("📍 New TestNFT address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
