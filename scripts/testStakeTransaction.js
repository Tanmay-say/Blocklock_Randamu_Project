const hre = require("hardhat");

async function main() {
  console.log('🧪 TESTING STAKE TRANSACTION DIRECTLY...');
  
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  
  console.log(`📍 Contract: ${contractAddress}`);
  
  // Get the contract
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const contract = SlotMachine.attach(contractAddress);
  
  // Get the first signer (should be the same account as user)
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Signer: ${signer.address}`);
  
  // Check signer balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  
  try {
    // Get stake amount
    const stakeAmount = await contract.STAKE_AMOUNT();
    console.log(`💰 Required stake: ${hre.ethers.formatEther(stakeAmount)} ETH`);
    
    // Check current round
    const currentRound = await contract.getCurrentRound();
    console.log(`\n📊 CURRENT ROUND: ${currentRound.roundId}`);
    console.log(`- Player Count: ${currentRound.playerCount}`);
    console.log(`- Is Active: ${currentRound.isActive}`);
    
    // Check player session
    const playerSession = await contract.getPlayerSession(signer.address);
    console.log(`\n🎮 PLAYER SESSION:`);
    console.log(`- Plays Remaining: ${playerSession.playsRemaining}`);
    console.log(`- Is Active: ${playerSession.isActive}`);
    
    if (playerSession.isActive && playerSession.playsRemaining > 0) {
      console.log(`\n✅ User has active session with ${playerSession.playsRemaining} plays`);
      console.log(`🎯 Testing playGame() instead...`);
      
      // Test play game
      const playTx = await contract.playGame({
        gasLimit: 800000
      });
      
      console.log(`✅ Play transaction sent: ${playTx.hash}`);
      console.log(`⏳ Waiting for confirmation...`);
      
      const playReceipt = await playTx.wait();
      console.log(`✅ Play transaction confirmed in block: ${playReceipt.blockNumber}`);
      
    } else {
      console.log(`\n🎯 Testing stakeForPlays()...`);
      
      // Estimate gas first
      try {
        const gasEstimate = await contract.stakeForPlays.estimateGas({
          value: stakeAmount
        });
        console.log(`⛽ Estimated gas: ${gasEstimate}`);
      } catch (gasError) {
        console.log(`❌ Gas estimation failed: ${gasError.message}`);
        return;
      }
      
      // Try the actual transaction
      const tx = await contract.stakeForPlays({
        value: stakeAmount,
        gasLimit: 800000
      });
      
      console.log(`✅ Stake transaction sent: ${tx.hash}`);
      console.log(`⏳ Waiting for confirmation...`);
      
      const receipt = await tx.wait();
      console.log(`✅ Stake transaction confirmed in block: ${receipt.blockNumber}`);
      
      // Check new session state
      const newSession = await contract.getPlayerSession(signer.address);
      console.log(`\n🎉 NEW SESSION STATE:`);
      console.log(`- Plays Remaining: ${newSession.playsRemaining}`);
      console.log(`- Is Active: ${newSession.isActive}`);
    }
    
  } catch (error) {
    console.error('❌ Transaction failed:', error);
    
    if (error.message.includes('AlreadyStakedInRound')) {
      console.log('\n💡 SOLUTION: User has already staked in this round');
    } else if (error.message.includes('insufficient funds')) {
      console.log('\n💡 SOLUTION: Insufficient ETH balance or gas fees');
    } else if (error.message.includes('Round is full')) {
      console.log('\n💡 SOLUTION: Wait for next round to start');
    } else {
      console.log('\n💡 Check contract state and network connection');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
