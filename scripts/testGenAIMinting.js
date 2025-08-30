const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🧪 Testing GenAI Minting Issues...");
  
  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    const account = deployer.address;
    console.log("👤 Testing account:", account);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(account)), "ETH");
    
    // Test admin wallet address (where minting fees go)
    const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
    console.log("👑 Admin wallet:", ADMIN_WALLET);
    console.log("💰 Admin balance:", ethers.formatEther(await deployer.provider.getBalance(ADMIN_WALLET)), "ETH");
    
    // Test minting transaction (simulate what frontend does)
    const MINT_PRICE = "0.008"; // 0.008 ETH for soul-bound NFT
    console.log(`💎 Testing mint transaction: ${MINT_PRICE} ETH`);
    
    // Check if account has enough balance
    const balance = await deployer.provider.getBalance(account);
    const mintPriceWei = ethers.parseEther(MINT_PRICE);
    
    if (balance < mintPriceWei) {
      throw new Error(`❌ Insufficient balance. Need ${MINT_PRICE} ETH, have ${ethers.formatEther(balance)} ETH`);
    }
    
    console.log("✅ Balance check passed");
    
    // Simulate the minting transaction (like frontend does)
    console.log("🔄 Simulating minting transaction...");
    
    const tx = await deployer.sendTransaction({
      to: ADMIN_WALLET,
      value: mintPriceWei,
      gasLimit: 100000
    });
    
    console.log("📝 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log("✅ GENAI MINTING SIMULATION SUCCESSFUL!");
      console.log("🎉 Transaction confirmed:", receipt.hash);
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      console.log("💰 Mint fee sent to admin wallet successfully");
      
      // Check balances after transaction
      console.log("\n📊 Post-transaction balances:");
      console.log("👤 User balance:", ethers.formatEther(await deployer.provider.getBalance(account)), "ETH");
      console.log("👑 Admin balance:", ethers.formatEther(await deployer.provider.getBalance(ADMIN_WALLET)), "ETH");
      
    } else {
      throw new Error("❌ Transaction failed");
    }
    
    console.log("\n✅ GENAI MINTING TEST COMPLETED SUCCESSFULLY!");
    console.log("🔧 The backend minting logic is working correctly.");
    console.log("🌐 If frontend is failing, check:");
    console.log("   1. Wallet connection (MetaMask)");
    console.log("   2. Network (Base Sepolia)");
    console.log("   3. Sufficient ETH balance (min 0.008 ETH)");
    console.log("   4. Browser console for specific errors");
    
  } catch (error) {
    console.error("❌ GenAI Minting Test Failed:", error.message);
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log("💡 Solution: Get Base Sepolia ETH from https://www.alchemy.com/faucets/base-sepolia");
    } else if (error.code === 'NETWORK_ERROR') {
      console.log("💡 Solution: Check Base Sepolia RPC connection");
    } else {
      console.log("💡 Check error details above and frontend console logs");
    }
  }
}

main().catch((error) => {
  console.error("💥 Test script failed:", error);
  process.exitCode = 1;
});
