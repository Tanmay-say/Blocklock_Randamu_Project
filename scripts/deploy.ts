import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy TestNFT first
  console.log("\nDeploying TestNFT...");
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const testNFT = await TestNFT.deploy();
  await testNFT.deployed();
  console.log("TestNFT deployed to:", testNFT.address);
  
  // Deploy WinnerSBT
  console.log("\nDeploying WinnerSBT...");
  const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
  const winnerSBT = await WinnerSBT.deploy();
  await winnerSBT.deployed();
  console.log("WinnerSBT deployed to:", winnerSBT.address);
  
  // Deploy MockRandamuVRF for testing
  console.log("\nDeploying MockRandamuVRF...");
  const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
  const mockRandamuVRF = await MockRandamuVRF.deploy();
  await mockRandamuVRF.deployed();
  console.log("MockRandamuVRF deployed to:", mockRandamuVRF.address);
  
  // Deploy AuctionHouse
  console.log("\nDeploying AuctionHouse...");
  const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  const auctionHouse = await AuctionHouse.deploy(winnerSBT.address, mockRandamuVRF.address);
  await auctionHouse.deployed();
  console.log("AuctionHouse deployed to:", auctionHouse.address);
  
  // Set up roles
  console.log("\nSetting up roles...");
  
  // Grant MINTER_ROLE to AuctionHouse
  const minterRole = await winnerSBT.MINTER_ROLE();
  await winnerSBT.grantRole(minterRole, auctionHouse.address);
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
  console.log("TestNFT:", testNFT.address);
  console.log("WinnerSBT:", winnerSBT.address);
  console.log("MockRandamuVRF:", mockRandamuVRF.address);
  console.log("AuctionHouse:", auctionHouse.address);
  console.log("Deployer:", deployer.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    contracts: {
      TestNFT: testNFT.address,
      WinnerSBT: winnerSBT.address,
      MockRandamuVRF: mockRandamuVRF.address,
      AuctionHouse: auctionHouse.address,
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
  if (process.env.ETHERSCAN_API_KEY && (await ethers.provider.getNetwork()).chainId !== 1337) {
    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await verify(testNFT.address, []);
      await verify(winnerSBT.address, []);
      await verify(mockRandamuVRF.address, []);
      await verify(auctionHouse.address, [winnerSBT.address, mockRandamuVRF.address]);
      console.log("All contracts verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
