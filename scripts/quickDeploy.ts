import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Quick deployment starting...");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await deployer.getBalance()), "ETH");

  try {
    // Deploy TestNFT
    console.log("\n📦 Deploying TestNFT...");
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    console.log("✅ TestNFT deployed:", testNFTAddress);

    // Deploy WinnerSBT
    console.log("\n🏆 Deploying WinnerSBT...");
    const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
    const winnerSBT = await WinnerSBT.deploy();
    await winnerSBT.waitForDeployment();
    const winnerSBTAddress = await winnerSBT.getAddress();
    console.log("✅ WinnerSBT deployed:", winnerSBTAddress);

    // Deploy MockRandamuVRF
    console.log("\n🎲 Deploying MockRandamuVRF...");
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    const mockVRF = await MockRandamuVRF.deploy();
    await mockVRF.waitForDeployment();
    const mockVRFAddress = await mockVRF.getAddress();
    console.log("✅ MockRandamuVRF deployed:", mockVRFAddress);

    // Deploy AuctionHouse
    console.log("\n🏠 Deploying AuctionHouse...");
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy(
      winnerSBTAddress,
      mockVRFAddress,
      deployer.address
    );
    await auctionHouse.waitForDeployment();
    const auctionHouseAddress = await auctionHouse.getAddress();
    console.log("✅ AuctionHouse deployed:", auctionHouseAddress);

    // Grant roles
    console.log("\n🔐 Setting up roles...");
    const minterRole = await winnerSBT.MINTER_ROLE();
    await winnerSBT.grantRole(minterRole, auctionHouseAddress);
    console.log("✅ MINTER_ROLE granted to AuctionHouse");

    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=====================================");
    console.log("TestNFT:         ", testNFTAddress);
    console.log("WinnerSBT:       ", winnerSBTAddress);
    console.log("MockRandamuVRF:  ", mockVRFAddress);
    console.log("AuctionHouse:    ", auctionHouseAddress);
    console.log("Admin:           ", deployer.address);
    console.log("=====================================");

    // Save deployment addresses
    const deployment = {
      network: "localhost",
      chainId: 1337,
      deployer: deployer.address,
      contracts: {
        TestNFT: testNFTAddress,
        WinnerSBT: winnerSBTAddress,
        MockRandamuVRF: mockVRFAddress,
        AuctionHouse: auctionHouseAddress,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("\n📝 Contract addresses for .env file:");
    console.log(`VITE_TEST_NFT_ADDRESS=${testNFTAddress}`);
    console.log(`VITE_WINNER_SBT_ADDRESS=${winnerSBTAddress}`);
    console.log(`VITE_MOCK_VRF_ADDRESS=${mockVRFAddress}`);
    console.log(`VITE_AUCTION_HOUSE_ADDRESS=${auctionHouseAddress}`);
    console.log(`ADMIN_WALLET=${deployer.address}`);

    return deployment;
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✨ Ready for testing!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });

