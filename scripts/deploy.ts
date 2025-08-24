import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  try {
    console.log("🚀 Starting deployment to Base Sepolia...\n");
    
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    
    console.log("📋 Deployment Info:");
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", (await ethers.provider.getNetwork()).name);
    console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
    console.log("");
  
  // Deploy TestNFT first
  console.log("\nDeploying TestNFT...");
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const testNFT = await TestNFT.deploy();
  await testNFT.waitForDeployment();
  console.log("TestNFT deployed to:", await testNFT.getAddress());
  
  // Deploy WinnerSBT
  console.log("\nDeploying WinnerSBT...");
  const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
  const winnerSBT = await WinnerSBT.deploy();
  await winnerSBT.waitForDeployment();
  console.log("WinnerSBT deployed to:", await winnerSBT.getAddress());
  
  // Deploy MockRandamuVRF for testing
  console.log("\nDeploying MockRandamuVRF...");
  const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
  const mockRandamuVRF = await MockRandamuVRF.deploy();
  await mockRandamuVRF.waitForDeployment();
  console.log("MockRandamuVRF deployed to:", await mockRandamuVRF.getAddress());
  
  // Deploy AuctionHouse with admin wallet and Blocklock sender
  console.log("\nDeploying AuctionHouse...");
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const adminWallet = process.env.ADMIN_WALLET || deployer.address;
  const blocklockSender = process.env.BLOCKLOCK_SENDER_ADDRESS || "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e"; // Base Sepolia
  
  const auctionHouse = await AuctionHouse.deploy(
    await winnerSBT.getAddress(), 
    await mockRandamuVRF.getAddress(), 
    adminWallet,
    blocklockSender
  );
  await auctionHouse.waitForDeployment();
  console.log("AuctionHouse deployed to:", await auctionHouse.getAddress());
  console.log("Admin wallet set to:", adminWallet);
  console.log("Blocklock sender:", blocklockSender);
  
  // Set up roles
  console.log("\nSetting up roles...");
  
  // Grant MINTER_ROLE to AuctionHouse
  const minterRole = await winnerSBT.MINTER_ROLE();
  await winnerSBT.grantRole(minterRole, await auctionHouse.getAddress());
  console.log("Granted MINTER_ROLE to AuctionHouse");
  
  // Grant ADMIN_ROLE to deployer in AuctionHouse
  const adminRole = await auctionHouse.ADMIN_ROLE();
  await auctionHouse.grantRole(adminRole, deployer.address);
  console.log("Granted ADMIN_ROLE to deployer");
  
  // Grant SELLER_ROLE to deployer in AuctionHouse
  const sellerRole = await auctionHouse.SELLER_ROLE();
  await auctionHouse.grantRole(sellerRole, deployer.address);
  console.log("Granted SELLER_ROLE to deployer");
  
  console.log("\n=== Deployment Summary ===");
  console.log("TestNFT:", await testNFT.getAddress());
  console.log("WinnerSBT:", await winnerSBT.getAddress());
  console.log("MockRandamuVRF:", await mockRandamuVRF.getAddress());
  console.log("AuctionHouse:", await auctionHouse.getAddress());
  console.log("Deployer:", deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    contracts: {
      TestNFT: await testNFT.getAddress(),
      WinnerSBT: await winnerSBT.getAddress(),
      MockRandamuVRF: await mockRandamuVRF.getAddress(),
      AuctionHouse: await auctionHouse.getAddress(),
    },
    timestamp: new Date().toISOString(),
  };
  
  const fs = require("fs");
  fs.writeFileSync(
    "deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment.json");
  
  // Verify contracts on Etherscan if not on localhost
  if (process.env.BASESCAN_API_KEY && (await ethers.provider.getNetwork()).chainId !== 1337) {
    console.log("\n🔍 Verifying contracts on BaseScan...");
    
    try {
      await verify(await testNFT.getAddress(), []);
      await verify(await winnerSBT.getAddress(), []);
      await verify(await mockRandamuVRF.getAddress(), []);
      await verify(await auctionHouse.getAddress(), [await winnerSBT.getAddress(), await mockRandamuVRF.getAddress(), adminWallet, blocklockSender]);
      console.log("✅ All contracts verified successfully!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error);
    }
  }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("🎉 Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
