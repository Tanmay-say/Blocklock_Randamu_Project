const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying SlotMachine to Base Sepolia testnet...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.log("⚠️  WARNING: Low balance. Get more ETH from https://www.alchemy.com/faucets/base-sepolia");
  }

  // Admin wallet address (where winnings go)
  const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
  console.log("Admin wallet:", ADMIN_WALLET);

  console.log("\n📋 Deploying SlotMachine contract...");
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  
  const slotMachine = await SlotMachine.deploy(ADMIN_WALLET);
  console.log("⏳ Waiting for deployment...");
  
  await slotMachine.waitForDeployment();
  const contractAddress = await slotMachine.getAddress();
  
  console.log("✅ SlotMachine deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  
  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");
  try {
    const stakeAmount = await slotMachine.STAKE_AMOUNT();
    const maxPlayers = await slotMachine.MAX_PLAYERS_PER_ROUND();
    const winPercentage = await slotMachine.WIN_PERCENTAGE();
    const adminWallet = await slotMachine.adminWallet();
    const currentRound = await slotMachine.getCurrentRound();
    
    console.log("- Stake Amount:", hre.ethers.formatEther(stakeAmount), "ETH");
    console.log("- Max Players per Round:", maxPlayers.toString());
    console.log("- Win Percentage:", winPercentage.toString() + "%");
    console.log("- Admin Wallet:", adminWallet);
    console.log("- Current Round ID:", currentRound[0].toString());
    console.log("- Round is Active:", currentRound[2]);
    
    console.log("\n🎯 Contract is ready for use!");
    
  } catch (error) {
    console.log("⚠️  Could not verify configuration:", error.message);
  }
  
  // Output environment variables
  console.log("\n🔧 UPDATE YOUR .env FILE:");
  console.log("=====================================");
  console.log(`VITE_SLOT_MACHINE_ADDRESS=${contractAddress}`);
  console.log(`VITE_CASINO_ADMIN_WALLET=${ADMIN_WALLET}`);
  console.log("=====================================");
  
  // Create deployment record
  const deploymentInfo = {
    SlotMachine: {
      address: contractAddress,
      adminWallet: ADMIN_WALLET,
      stakeAmount: "0.005",
      maxPlayers: 10,
      winPercentage: 10,
      network: "base-sepolia",
      deployedAt: new Date().toISOString(),
      blockNumber: await deployer.provider.getBlockNumber()
    }
  };
  
  // Save deployment info
  const fs = require('fs');
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");
  
  console.log("\n🎰 Casino is ready! Update your .env and restart the dev server!");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✅ Base Sepolia deployment completed successfully!");
    console.log("🎮 Contract Address:", address);
    console.log("🌐 View on BaseScan: https://sepolia.basescan.org/address/" + address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
