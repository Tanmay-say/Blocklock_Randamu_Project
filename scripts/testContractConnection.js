const hre = require("hardhat");

async function main() {
  console.log("🔗 Testing SlotMachine contract connection...");
  
  const contractAddress = "0xe59D4a1Ddd687D3f19e385caaa33f4c0F44eE2bd";
  
  try {
    const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
    const slotMachine = SlotMachine.attach(contractAddress);
    
    console.log("📍 Contract Address:", contractAddress);
    console.log("🌐 Network:", hre.network.name);
    
    // Test read functions
    console.log("\n📊 Testing Contract Functions:");
    
    const stakeAmount = await slotMachine.STAKE_AMOUNT();
    console.log("✅ Stake Amount:", hre.ethers.formatEther(stakeAmount), "ETH");
    
    const maxPlayers = await slotMachine.MAX_PLAYERS_PER_ROUND();
    console.log("✅ Max Players:", maxPlayers.toString());
    
    const winPercentage = await slotMachine.WIN_PERCENTAGE();
    console.log("✅ Win Percentage:", winPercentage.toString() + "%");
    
    const adminWallet = await slotMachine.adminWallet();
    console.log("✅ Admin Wallet:", adminWallet);
    
    // Test getCurrentRound function
    const currentRound = await slotMachine.getCurrentRound();
    console.log("\n🎰 Current Round Info:");
    console.log("- Round ID:", currentRound[0].toString());
    console.log("- Player Count:", currentRound[1].toString());
    console.log("- Is Active:", currentRound[2]);
    console.log("- Start Time:", new Date(Number(currentRound[3]) * 1000).toISOString());
    console.log("- End Time:", new Date(Number(currentRound[4]) * 1000).toISOString());
    
    // Check if round is active
    if (currentRound[2]) {
      console.log("\n🟢 Round is ACTIVE - Ready to accept players!");
    } else {
      console.log("\n🔴 Round is INACTIVE - This might be the issue!");
    }
    
    console.log("\n✅ Contract is responding correctly!");
    
  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
    
    if (error.message.includes('call revert')) {
      console.log("💡 This might be a network issue. Make sure you're on Base Sepolia.");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
