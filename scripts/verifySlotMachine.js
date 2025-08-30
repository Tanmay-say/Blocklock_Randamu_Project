const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying SlotMachine contract...");
  
  const contractAddress = "0xe59D4a1Ddd687D3f19e385caaa33f4c0F44eE2bd";
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const slotMachine = SlotMachine.attach(contractAddress);
  
  console.log("Contract Address:", contractAddress);
  
  try {
    // Test read-only functions
    const stakeAmount = await slotMachine.STAKE_AMOUNT();
    const maxPlayers = await slotMachine.MAX_PLAYERS_PER_ROUND();
    const winPercentage = await slotMachine.WIN_PERCENTAGE();
    const adminWallet = await slotMachine.adminWallet();
    
    console.log("✅ Contract verification successful!");
    console.log("Configuration:");
    console.log("- Stake Amount:", hre.ethers.formatEther(stakeAmount), "ETH");
    console.log("- Max Players:", maxPlayers.toString());
    console.log("- Win Percentage:", winPercentage.toString() + "%");
    console.log("- Admin Wallet:", adminWallet);
    
    // Get current round info
    const currentRound = await slotMachine.getCurrentRound();
    console.log("- Round ID:", currentRound[0].toString());
    console.log("- Player Count:", currentRound[1].toString());
    console.log("- Is Active:", currentRound[2]);
    
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
