const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🎯 Testing REAL GenAI NFT Contract Minting...");
  
  const CONTRACT_ADDRESS = "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F";
  console.log("📍 GenAI NFT Contract:", CONTRACT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Minting with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    
    // Get contract instance
    const GenAINFT = await ethers.getContractFactory("GenAINFT");
    const contract = GenAINFT.attach(CONTRACT_ADDRESS);
    
    // Test mint parameters
    const to = deployer.address;
    const prompt = "A beautiful digital art piece with neon colors and futuristic elements";
    const imageHash = `test_hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const style = "digital-art";
    const size = "1024x1024";
    const vrfSeed = Math.floor(Math.random() * 1000000) + Date.now();
    
    console.log("🎨 Mint Parameters:");
    console.log("- To:", to);
    console.log("- Prompt:", prompt.slice(0, 50) + "...");
    console.log("- Image Hash:", imageHash);
    console.log("- Style:", style);
    console.log("- Size:", size);
    console.log("- VRF Seed:", vrfSeed);
    
    // Get mint price
    const mintPrice = await contract.BASE_MINT_PRICE();
    console.log("💰 Mint Price:", ethers.formatEther(mintPrice), "ETH");
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    if (balance < mintPrice) {
      throw new Error(`❌ Insufficient balance. Need ${ethers.formatEther(mintPrice)} ETH, have ${ethers.formatEther(balance)} ETH`);
    }
    
    console.log("✅ Balance check passed");
    console.log("🔄 Minting GenAI NFT...");
    
    // Mint the NFT
    const tx = await contract.mintGenAINFT(
      to,
      prompt,
      imageHash,
      style,
      size,
      vrfSeed,
      {
        value: mintPrice,
        gasLimit: 150000
      }
    );
    
    console.log("📝 Mint transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt && receipt.status === 1) {
      // Parse the minted token ID from logs
      const transferLog = receipt.logs.find(log => 
        log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      
      let tokenId = 0;
      if (transferLog) {
        tokenId = parseInt(transferLog.topics[3], 16);
      }
      
      console.log("✅ GENAI NFT MINTED SUCCESSFULLY! 🎉");
      console.log("🎭 Token ID:", tokenId);
      console.log("🔗 Transaction Hash:", tx.hash);
      console.log("⛽ Gas Used:", receipt.gasUsed.toString());
      
      // Get token URI
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        console.log("🌐 Token URI:", tokenURI.slice(0, 100) + "...");
      } catch (uriError) {
        console.log("⚠️  Token URI not available yet");
      }
      
      // Check owner
      const owner = await contract.ownerOf(tokenId);
      console.log("👑 NFT Owner:", owner);
      
      console.log("\n🎯 SUCCESS! The NFT is now minted and will be visible in MetaMask!");
      console.log("📱 To see it in MetaMask:");
      console.log(`   1. Go to NFTs tab`);
      console.log(`   2. Import NFT`);
      console.log(`   3. Contract Address: ${CONTRACT_ADDRESS}`);
      console.log(`   4. Token ID: ${tokenId}`);
      
    } else {
      throw new Error("❌ Mint transaction failed");
    }
    
  } catch (error) {
    console.error("💥 GenAI NFT minting test failed:", error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log("💡 Solution: Get more Base Sepolia ETH from https://www.alchemy.com/faucets/base-sepolia");
    } else if (error.message.includes('MINTER_ROLE')) {
      console.log("💡 Solution: Account needs MINTER_ROLE permission");
    } else {
      console.log("💡 Check contract deployment and network connection");
    }
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
