const hre = require("hardhat");

async function main() {
  console.log('🚀 STARTING NEW ROUND...');
  
  const contractAddress = "0x87C730bf649e419Cc5810a14695AcDEB1f220FC1";
  
  console.log(`📍 Contract: ${contractAddress}`);
  
  const SlotMachine = await hre.ethers.getContractFactory("SlotMachine");
  const contract = SlotMachine.attach(contractAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Admin: ${signer.address}`);
  
  try {
    // Check current round
    const currentRound = await contract.getCurrentRound();
    console.log(`\n📊 CURRENT ROUND: ${currentRound.roundId}`);
    console.log(`- Player Count: ${currentRound.playerCount}`);
    console.log(`- Is Active: ${currentRound.isActive}`);
    
    // Force end current round and start new one
    console.log(`\n🎯 Force ending current round and starting new one...`);
    const tx = await contract.forceEndRound({
      gasLimit: 300000
    });
    
    console.log(`✅ New round transaction sent: ${tx.hash}`);
    console.log(`⏳ Waiting for confirmation...`);
    
    const receipt = await tx.wait();
    console.log(`✅ New round started in block: ${receipt.blockNumber}`);
    
    // Check new round state
    const newRound = await contract.getCurrentRound();
    console.log(`\n🎉 NEW ROUND: ${newRound.roundId}`);
    console.log(`- Player Count: ${newRound.playerCount}`);
    console.log(`- Is Active: ${newRound.isActive}`);
    
    console.log(`\n✅ Players can now stake for Round ${newRound.roundId}!`);
    
  } catch (error) {
    console.error('❌ Failed to start new round:', error.message);
    
    if (error.message.includes('Ownable')) {
      console.log('\n💡 Only the contract owner can start new rounds');
    } else if (error.message.includes('Round is still active')) {
      console.log('\n💡 Wait for current round to finish or force end it');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
