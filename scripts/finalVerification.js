const hre = require("hardhat");

async function main() {
  console.log('🎉 FINAL VERIFICATION - COMPLETE SYSTEM CHECK');
  console.log('='.repeat(60));
  
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  const userAddress = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
  
  console.log(`📍 Contract: ${contractAddress}`);
  console.log(`👤 User: ${userAddress}`);
  
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const contract = SlotMachine.attach(contractAddress);
  
  try {
    // 1. Contract Configuration
    console.log('\n🔧 CONTRACT CONFIGURATION:');
    const stakeAmount = await contract.STAKE_AMOUNT();
    const maxPlayers = await contract.MAX_PLAYERS_PER_ROUND();
    const winPercentage = await contract.WIN_PERCENTAGE();
    const playsPerStake = await contract.PLAYS_PER_STAKE();
    
    console.log(`- Stake Amount: ${hre.ethers.formatEther(stakeAmount)} ETH`);
    console.log(`- Max Players: ${maxPlayers}`);
    console.log(`- Win Percentage: ${winPercentage}%`);
    console.log(`- Plays Per Stake: ${playsPerStake}`);
    
    // 2. Current Round Status
    console.log('\n🎯 CURRENT ROUND STATUS:');
    const currentRound = await contract.getCurrentRound();
    console.log(`- Round ID: ${currentRound.roundId}`);
    console.log(`- Player Count: ${currentRound.playerCount}/${maxPlayers}`);
    console.log(`- Is Active: ${currentRound.isActive ? '✅ YES' : '❌ NO'}`);
    
    // 3. User Session
    console.log('\n🎮 USER SESSION:');
    const playerSession = await contract.getPlayerSession(userAddress);
    console.log(`- Session ID: ${playerSession.sessionId}`);
    console.log(`- Plays Remaining: ${playerSession.playsRemaining}`);
    console.log(`- Total Session Wins: ${playerSession.totalWins}`);
    console.log(`- Is Active: ${playerSession.isActive ? '✅ YES' : '❌ NO'}`);
    
    // 4. User Stats
    console.log('\n📊 USER STATS:');
    const playerStats = await contract.getPlayerStats(userAddress);
    console.log(`- Total Games: ${playerStats.totalGames}`);
    console.log(`- Total Wins: ${playerStats.totalWins}`);
    console.log(`- Total Winnings: ${hre.ethers.formatEther(playerStats.totalWinnings)} ETH`);
    console.log(`- Limited Edition Wins: ${playerStats.limitedEditionWins}/3`);
    console.log(`- Has Limited Edition: ${playerStats.hasLimitedEdition ? '✅ YES' : '❌ NO'}`);
    
    // 5. Frontend Action Recommendation
    console.log('\n💡 FRONTEND ACTION RECOMMENDATION:');
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      console.log(`✅ SHOW: "PLAY GAME" button`);
      console.log(`❌ HIDE: "STAKE FOR 10 PLAYS" button`);
      console.log(`📝 SESSION INFO: "Active Session: ${playerSession.playsRemaining} plays remaining"`);
    } else {
      console.log(`✅ SHOW: "STAKE FOR 10 PLAYS" button`);
      console.log(`❌ HIDE: "PLAY GAME" button`);
      console.log(`📝 SESSION INFO: "No active session"`);
    }
    
    // 6. System Health Check
    console.log('\n🏥 SYSTEM HEALTH CHECK:');
    
    // Check if user can stake (if no active session)
    if (!playerSession.isActive || playerSession.playsRemaining === 0) {
      try {
        const gasEstimate = await contract.stakeForPlays.estimateGas({
          value: stakeAmount
        });
        console.log(`✅ STAKING: Ready (gas estimate: ${gasEstimate})`);
      } catch (stakeError) {
        console.log(`❌ STAKING: ${stakeError.message}`);
      }
    }
    
    // Check if user can play (if has active session)
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      try {
        const gasEstimate = await contract.playGame.estimateGas();
        console.log(`✅ PLAYING: Ready (gas estimate: ${gasEstimate})`);
      } catch (playError) {
        console.log(`❌ PLAYING: ${playError.message}`);
      }
    }
    
    // 7. Environment Variables Check
    console.log('\n🌍 ENVIRONMENT SETUP:');
    console.log(`- Contract in env.local: ${process.env.VITE_SLOT_MACHINE_ADDRESS || 'NOT SET'}`);
    console.log(`- Expected contract: ${contractAddress}`);
    console.log(`- Match: ${process.env.VITE_SLOT_MACHINE_ADDRESS === contractAddress ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 VERIFICATION COMPLETE!');
    
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      console.log('🎮 USER SHOULD SEE: PLAY GAME BUTTON');
    } else {
      console.log('💰 USER SHOULD SEE: STAKE FOR 10 PLAYS BUTTON');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
