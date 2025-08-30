const hre = require("hardhat");

async function main() {
  console.log('🔍 CHECKING ROUND MAPPING AND PLAYER STATE...');
  
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
    console.log(`- Player Addresses: ${currentRound.playerAddresses || 'Not accessible'}`);
    
    // Try to read the gameRounds mapping directly (might not work if not public)
    try {
      const roundData = await contract.gameRounds(currentRound.roundId);
      console.log(`\n🔍 ROUND ${currentRound.roundId} DATA:`);
      console.log(`- Round ID: ${roundData.roundId}`);
      console.log(`- Player Count: ${roundData.playerCount}`);
      console.log(`- Is Active: ${roundData.isActive}`);
      
      // Try to check if user has staked in round
      try {
        const hasStaked = await contract.gameRounds(currentRound.roundId).hasStaked(userAddress);
        console.log(`- User has staked: ${hasStaked}`);
      } catch (e) {
        console.log(`- Cannot check hasStaked mapping: ${e.message}`);
      }
      
    } catch (e) {
      console.log(`❌ Cannot access gameRounds mapping: ${e.message}`);
    }
    
    // Check what happens when we try to call stakeForPlays
    console.log(`\n🧪 TESTING CONTRACT CALL CONDITIONS:`);
    
    // Test 1: Check if round is active
    if (!currentRound.isActive) {
      console.log(`❌ ISSUE 1: Round ${currentRound.roundId} is not active`);
    } else {
      console.log(`✅ PASS 1: Round ${currentRound.roundId} is active`);
    }
    
    // Test 2: Check player count
    if (currentRound.playerCount >= 10) {
      console.log(`❌ ISSUE 2: Round is full (${currentRound.playerCount}/10)`);
    } else {
      console.log(`✅ PASS 2: Round has space (${currentRound.playerCount}/10)`);
    }
    
    // Test 3: Check user session
    const playerSession = await contract.getPlayerSession(userAddress);
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      console.log(`❌ ISSUE 3: User already has active session (${playerSession.playsRemaining} plays)`);
    } else {
      console.log(`✅ PASS 3: User session is inactive`);
    }
    
    // Test 4: Balance check
    const balance = await hre.ethers.provider.getBalance(userAddress);
    const stakeAmount = await contract.STAKE_AMOUNT();
    if (balance < stakeAmount) {
      console.log(`❌ ISSUE 4: Insufficient balance (${hre.ethers.formatEther(balance)} < ${hre.ethers.formatEther(stakeAmount)})`);
    } else {
      console.log(`✅ PASS 4: Sufficient balance (${hre.ethers.formatEther(balance)} >= ${hre.ethers.formatEther(stakeAmount)})`);
    }
    
    // Test 5: Manual check using events
    console.log(`\n🔍 CHECKING RECENT EVENTS...`);
    const filter = contract.filters.PlayerStaked(null, userAddress);
    const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
    
    console.log(`Found ${events.length} PlayerStaked events for user`);
    for (const event of events) {
      console.log(`- Round ${event.args.roundId}, Session ${event.args.sessionId}`);
    }
    
    // Check if user staked in current round
    const currentRoundEvents = events.filter(e => e.args.roundId.toString() === currentRound.roundId.toString());
    if (currentRoundEvents.length > 0) {
      console.log(`❌ ISSUE 5: User has already staked in round ${currentRound.roundId}!`);
      console.log(`   Event found: Round ${currentRoundEvents[0].args.roundId}, Session ${currentRoundEvents[0].args.sessionId}`);
    } else {
      console.log(`✅ PASS 5: User has not staked in round ${currentRound.roundId}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking round mapping:', error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
