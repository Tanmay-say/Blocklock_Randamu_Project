const hre = require("hardhat");

async function main() {
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  
  console.log("🔍 DEBUGGING CASINO TRANSACTION ISSUES...");
  console.log("📍 Contract Address:", contractAddress);
  
  try {
    const [signer] = await hre.ethers.getSigners();
    console.log("Testing with account:", signer.address);
    
    // Check account balance
    const balance = await signer.provider.getBalance(signer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
    
    // Connect to contract
    const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
    const slotMachine = SlotMachine.attach(contractAddress);
    
    console.log("\n📊 CONTRACT STATE:");
    
    // Check basic contract info
    const stakeAmount = await slotMachine.STAKE_AMOUNT();
    console.log("- Stake Amount:", hre.ethers.formatEther(stakeAmount), "ETH");
    
    const adminWallet = await slotMachine.adminWallet();
    console.log("- Admin Wallet:", adminWallet);
    
    const currentRound = await slotMachine.getCurrentRound();
    console.log("- Round ID:", Number(currentRound.roundId));
    console.log("- Player Count:", Number(currentRound.playerCount));
    console.log("- Round Active:", currentRound.isActive);
    
    const playerSession = await slotMachine.getPlayerSession(signer.address);
    console.log("- Session Active:", playerSession.isActive);
    console.log("- Plays Remaining:", Number(playerSession.playsRemaining));
    
    console.log("\n🔍 CHECKING TRANSACTION REQUIREMENTS:");
    
    // Check if user can stake
    if (!playerSession.isActive || Number(playerSession.playsRemaining) === 0) {
      console.log("✅ User needs to stake (no active session)");
      
      // Check if round allows staking
      if (!currentRound.isActive) {
        console.log("❌ ISSUE: Round is not active!");
        return;
      }
      
      if (Number(currentRound.playerCount) >= 10) {
        console.log("❌ ISSUE: Round is full!");
        return;
      }
      
      // Check if user has enough balance
      if (balance < stakeAmount) {
        console.log("❌ ISSUE: Insufficient balance!");
        console.log("Need:", hre.ethers.formatEther(stakeAmount), "ETH");
        console.log("Have:", hre.ethers.formatEther(balance), "ETH");
        return;
      }
      
      console.log("✅ All requirements met for staking");
      
      // Test the transaction parameters
      console.log("\n🧪 TESTING TRANSACTION PARAMETERS:");
      try {
        // Estimate gas for stakeForPlays
        const gasEstimate = await slotMachine.stakeForPlays.estimateGas({
          value: stakeAmount
        });
        console.log("✅ Gas estimate for stakeForPlays:", gasEstimate.toString());
      } catch (gasError) {
        console.log("❌ GAS ESTIMATION FAILED:", gasError.message);
        
        // Try to call the function statically to see what reverts
        try {
          await slotMachine.stakeForPlays.staticCall({
            value: stakeAmount
          });
          console.log("✅ Static call succeeded");
        } catch (staticError) {
          console.log("❌ STATIC CALL FAILED:", staticError.message);
          
          // Check specific error conditions
          if (staticError.message.includes("AlreadyStakedInRound")) {
            console.log("🔍 ERROR: User already staked in this round");
          } else if (staticError.message.includes("RoundNotActive")) {
            console.log("🔍 ERROR: Round is not active");
          } else if (staticError.message.includes("RoundFull")) {
            console.log("🔍 ERROR: Round is full");
          } else if (staticError.message.includes("InsufficientStake")) {
            console.log("🔍 ERROR: Incorrect stake amount");
          } else {
            console.log("🔍 UNKNOWN ERROR:", staticError.message);
          }
        }
      }
      
    } else {
      console.log("✅ User has active session, should be able to play games");
      
      // Test playGame function
      try {
        const gasEstimate = await slotMachine.playGame.estimateGas();
        console.log("✅ Gas estimate for playGame:", gasEstimate.toString());
      } catch (gasError) {
        console.log("❌ PLAY GAME GAS ESTIMATION FAILED:", gasError.message);
      }
    }
    
  } catch (error) {
    console.error("❌ DEBUGGING FAILED:", error.message);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Debugging completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
