import { ethers } from "hardhat";

async function main() {
  console.log("Starting local deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.getBalance()));

  try {
    // Deploy TestNFT
    console.log("\n1. Deploying TestNFT...");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    console.log("✅ TestNFT deployed to:", testNFTAddress);

    // Deploy WinnerSBT
    console.log("\n2. Deploying WinnerSBT...");
    const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
    const winnerSBT = await WinnerSBT.deploy();
    await winnerSBT.waitForDeployment();
    const winnerSBTAddress = await winnerSBT.getAddress();
    console.log("✅ WinnerSBT deployed to:", winnerSBTAddress);

    // Deploy MockRandamuVRF
    console.log("\n3. Deploying MockRandamuVRF...");
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    const mockRandamuVRF = await MockRandamuVRF.deploy();
    await mockRandamuVRF.waitForDeployment();
    const mockRandamuVRFAddress = await mockRandamuVRF.getAddress();
    console.log("✅ MockRandamuVRF deployed to:", mockRandamuVRFAddress);

    // Deploy AuctionHouse
    console.log("\n4. Deploying AuctionHouse...");
    const adminWallet = deployer.address; // Use deployer as admin for testing
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy(
      winnerSBTAddress,
      mockRandamuVRFAddress,
      adminWallet
    );
    await auctionHouse.waitForDeployment();
    const auctionHouseAddress = await auctionHouse.getAddress();
    console.log("✅ AuctionHouse deployed to:", auctionHouseAddress);
    console.log("   Admin wallet:", adminWallet);

    // Setup roles
    console.log("\n5. Setting up roles...");
    
    // Grant MINTER_ROLE to AuctionHouse
    const minterRole = await winnerSBT.MINTER_ROLE();
    await winnerSBT.grantRole(minterRole, auctionHouseAddress);
    console.log("✅ Granted MINTER_ROLE to AuctionHouse");

    // Check tax percentage
    const taxPercentage = await auctionHouse.TAX_PERCENTAGE();
    console.log("✅ Tax percentage configured:", taxPercentage.toString(), "basis points (20%)");

    // Create deployment summary
    const deployment = {
      network: "localhost",
      chainId: (await ethers.provider.getNetwork()).chainId.toString(),
      deployer: deployer.address,
      adminWallet: adminWallet,
      contracts: {
        TestNFT: testNFTAddress,
        WinnerSBT: winnerSBTAddress,
        MockRandamuVRF: mockRandamuVRFAddress,
        AuctionHouse: auctionHouseAddress,
      },
      features: {
        taxPercentage: "20%",
        adminWalletReceivesWinnings: true,
        soulboundWinnerTokens: true,
      },
      timestamp: new Date().toISOString(),
    };

    // Save deployment info
    const fs = require("fs");
    fs.writeFileSync("deployment.json", JSON.stringify(deployment, null, 2));
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("=====================================");
    console.log("TestNFT:        ", testNFTAddress);
    console.log("WinnerSBT:      ", winnerSBTAddress);
    console.log("MockRandamuVRF: ", mockRandamuVRFAddress);
    console.log("AuctionHouse:   ", auctionHouseAddress);
    console.log("Admin Wallet:   ", adminWallet);
    console.log("=====================================");
    console.log("Deployment info saved to deployment.json");
    
    // Test deployment
    console.log("\n6. Testing deployment...");
    try {
      // Mint a test NFT
      const tx1 = await testNFT.mint(deployer.address, "https://example.com/nft/1");
      await tx1.wait();
      console.log("✅ Test NFT minted");

      // Check if deployer has seller role
      const sellerRole = await auctionHouse.SELLER_ROLE();
      const hasSeller = await auctionHouse.hasRole(sellerRole, deployer.address);
      console.log("✅ Deployer has seller role:", hasSeller);

      console.log("\n🚀 All systems ready for auction creation!");
      
    } catch (testError) {
      console.log("⚠️  Warning: Post-deployment test failed:", testError);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✨ Deployment script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });

