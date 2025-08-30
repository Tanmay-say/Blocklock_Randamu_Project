const hre = require("hardhat");

async function main() {
  console.log('🔍 CHECKING USER STAKE STATUS...');
  
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  const userAddress = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
  
  console.log(`📍 Contract: ${contractAddress}`);
  console.log(`👤 User: ${userAddress}`);
  
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const contract = SlotMachine.attach(contractAddress);
  
  try {
    // Get current round
    const currentRound = await contract.getCurrentRound();
    console.log(`\n📊 CURRENT ROUND: ${currentRound.roundId}`);
    console.log(`- Player Count: ${currentRound.playerCount}`);
    console.log(`- Is Active: ${currentRound.isActive}`);
    
    // Check if user has staked in current round
    const hasStakedInRound = currentRound.hasStaked && currentRound.hasStaked[userAddress];
    console.log(`\n🎯 USER STATUS IN ROUND ${currentRound.roundId}:`);
    console.log(`- Has Staked in Round: ${hasStakedInRound || 'false'}`);
    
    // Get player session
    const playerSession = await contract.getPlayerSession(userAddress);
    console.log(`\n🎮 PLAYER SESSION:`);
    console.log(`- Session ID: ${playerSession.sessionId}`);
    console.log(`- Plays Remaining: ${playerSession.playsRemaining}`);
    console.log(`- Total Wins: ${playerSession.totalWins}`);
    console.log(`- Is Active: ${playerSession.isActive}`);
    
    // Get player stats
    const playerStats = await contract.getPlayerStats(userAddress);
    console.log(`\n📈 PLAYER STATS:`);
    console.log(`- Total Games: ${playerStats.totalGames}`);
    console.log(`- Total Wins: ${playerStats.totalWins}`);
    console.log(`- Limited Edition Wins: ${playerStats.limitedEditionWins}`);
    console.log(`- Has Limited Edition: ${playerStats.hasLimitedEdition}`);
    
    // Check why staking might fail
    console.log(`\n❓ POTENTIAL ISSUES:`);
    
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      console.log(`❌ User already has an active session with ${playerSession.playsRemaining} plays remaining`);
      console.log(`   → Should use playGame() instead of stakeForPlays()`);
    } else if (hasStakedInRound) {
      console.log(`❌ User has already staked in round ${currentRound.roundId}`);
      console.log(`   → Need to wait for next round or use remaining plays`);
    } else if (!currentRound.isActive) {
      console.log(`❌ Round ${currentRound.roundId} is not active`);
    } else if (currentRound.playerCount >= 10) {
      console.log(`❌ Round ${currentRound.roundId} is full (${currentRound.playerCount}/10 players)`);
    } else {
      console.log(`✅ User should be able to stake in round ${currentRound.roundId}`);
      console.log(`   → Check gas limit and account balance`);
    }
    
  } catch (error) {
    console.error('❌ Error checking user status:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
