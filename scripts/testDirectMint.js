const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🎯 Testing Direct Mint on GenAINFTFixed...");
  
  const CONTRACT_ADDRESS = "0x2Bfa3983D3b9dB102E98066D61cd45921CcFB0E2";
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Minting with account:", deployer.address);
    
    // Get contract instance
    const GenAINFTFixed = await ethers.getContractFactory("GenAINFTFixed");
    const contract = GenAINFTFixed.attach(CONTRACT_ADDRESS);
    
    // Get basic info
    const mintPrice = await contract.BASE_MINT_PRICE();
    const totalSupply = await contract.totalSupply();
    
    console.log("💰 Mint Price:", ethers.formatEther(mintPrice), "ETH");
    console.log("🎭 Current Supply:", totalSupply.toString());
    
    // Test manual VRF seed minting (simpler approach)
    console.log("\n🔄 Testing manual VRF seed minting...");
    
    const prompt = "A magnificent phoenix rising from flames with golden feathers";
    const imageHash = `manual_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const style = "digital-art";
    const size = "1024x1024";
    const vrfSeed = Date.now() + Math.floor(Math.random() * 1000000);
    
    console.log("🎨 Parameters:");
    console.log("- Prompt:", prompt.slice(0, 50) + "...");
    console.log("- Image Hash:", imageHash);
    console.log("- VRF Seed:", vrfSeed);
    
    try {
      const tx = await contract.mintGenAINFT(
        deployer.address,
        prompt,
        imageHash,
        style,
        size,
        vrfSeed,
        {
          value: mintPrice,
          gasLimit: 300000
        }
      );
      
      console.log("📝 Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        console.log("✅ MANUAL VRF MINT SUCCESSFUL! 🎉");
        
        const newSupply = await contract.totalSupply();
        const tokenId = newSupply;
        
        console.log("🎭 New Token ID:", tokenId.toString());
        console.log("⛽ Gas used:", receipt.gasUsed.toString());
        
        // Get metadata
        const metadata = await contract.getGenAIMetadata(tokenId);
        console.log("\n📋 NFT Metadata:");
        console.log("- Token ID:", tokenId.toString());
        console.log("- Prompt:", metadata.prompt.slice(0, 50) + "...");
        console.log("- VRF Seed:", metadata.vrfSeed.toString());
        console.log("- VRF Randomness:", metadata.vrfRandomness.toString());
        console.log("- Soul-bound:", metadata.isSoulBound);
        
        // Check owner
        const owner = await contract.ownerOf(tokenId);
        console.log("- Owner:", owner);
        
        console.log("\n🎉 SUCCESS! NFT MINTED AND READY!");
        console.log("📱 To see in MetaMask:");
        console.log(`   1. Contract: ${CONTRACT_ADDRESS}`);
        console.log(`   2. Token ID: ${tokenId}`);
        console.log("   3. Go to MetaMask > NFTs > Import NFT");
        
      } else {
        console.log("❌ Manual mint failed");
      }
      
    } catch (mintError) {
      console.log("❌ Manual mint error:", mintError.message);
      
      if (mintError.message.includes('VRF seed already used')) {
        console.log("💡 Trying with a different VRF seed...");
        
        const newVrfSeed = Date.now() + Math.floor(Math.random() * 10000000);
        const newImageHash = `retry_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          const retryTx = await contract.mintGenAINFT(
            deployer.address,
            prompt,
            newImageHash,
            style,
            size,
            newVrfSeed,
            {
              value: mintPrice,
              gasLimit: 300000
            }
          );
          
          console.log("📝 Retry transaction sent:", retryTx.hash);
          const retryReceipt = await retryTx.wait();
          
          if (retryReceipt && retryReceipt.status === 1) {
            console.log("✅ RETRY MINT SUCCESSFUL! 🎉");
            
            const newSupply = await contract.totalSupply();
            console.log("🎭 Token ID:", newSupply.toString());
            console.log("🔥 VRF Uniqueness enforced and working!");
          }
          
        } catch (retryError) {
          console.log("❌ Retry mint also failed:", retryError.message);
        }
      }
    }
    
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
