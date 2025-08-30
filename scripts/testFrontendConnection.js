const hre = require("hardhat");

async function main() {
  console.log("🔧 Testing Frontend Service Connection...");
  
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  const [signer] = await hre.ethers.getSigners();
  
  console.log("Testing with account:", signer.address);
  
  // Simulate what the frontend service does
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const slotMachine = SlotMachine.attach(contractAddress);
  
  console.log("\n📋 Testing getPlayerSession (what frontend should see):");
  try {
    const session = await slotMachine.getPlayerSession(signer.address);
    console.log("✅ Session Data:");
    console.log("  - Plays Remaining:", Number(session.playsRemaining));
    console.log("  - Total Wins:", Number(session.totalWins));  
    console.log("  - Session ID:", Number(session.sessionId));
    console.log("  - Is Active:", session.isActive);
    
    if (session.isActive && Number(session.playsRemaining) > 0) {
      console.log("\n💡 FRONTEND SHOULD SHOW:");
      console.log("  - STAKE button: DISABLED (user already has session)");
      console.log("  - PLAY GAME button: ENABLED (user can play)");
      console.log("  - Session info: '🎮 Active Session: " + Number(session.playsRemaining) + " plays remaining'");
    } else {
      console.log("\n💡 FRONTEND SHOULD SHOW:");
      console.log("  - STAKE button: ENABLED (user needs to stake)");
      console.log("  - PLAY GAME button: DISABLED (no session)");
    }
    
  } catch (error) {
    console.log("❌ Error getting session:", error.message);
  }
  
  console.log("\n📋 Testing getCurrentRound:");
  try {
    const round = await slotMachine.getCurrentRound();
    console.log("✅ Round Data:");
    console.log("  - Round ID:", Number(round.roundId));
    console.log("  - Player Count:", Number(round.playerCount));
    console.log("  - Is Active:", round.isActive);
  } catch (error) {
    console.log("❌ Error getting round:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Frontend connection test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
