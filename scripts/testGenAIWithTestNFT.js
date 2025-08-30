const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🎯 Testing GenAI Minting with TestNFT Contract...");
  
  const TEST_NFT_ADDRESS = "0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705";
  console.log("📍 TestNFT Address:", TEST_NFT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    
    // Get TestNFT contract
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = TestNFT.attach(TEST_NFT_ADDRESS);
    
    // Create GenAI metadata like the frontend will
    const prompt = "A magnificent phoenix rising from golden flames with iridescent feathers";
    const imageHash = "https://example.com/genai-image.png";
    const style = "digital-art";
    const size = "1024x1024";
    const vrfSeed = Date.now() + Math.floor(Math.random() * 1000000);
    
    const metadata = {
      name: `GenAI Soul-bound NFT #${Date.now()}`,
      description: `Soul-bound NFT generated using AI with VRF uniqueness. Prompt: "${prompt}"`,
      image: imageHash,
      attributes: [
        { trait_type: "Prompt", value: prompt },
        { trait_type: "Style", value: style },
        { trait_type: "Size", value: size },
        { trait_type: "AI Generated", value: "true" },
        { trait_type: "Soul-bound", value: "true" },
        { trait_type: "VRF Seed", value: vrfSeed.toString() },
        { trait_type: "Platform", value: "NGT Marketplace" },
        { trait_type: "Generated At", value: new Date().toISOString() }
      ],
      external_url: "https://ngt-marketplace.com",
      soul_bound: true,
      vrf_seed: vrfSeed
    };
    
    // Create metadata URI
    const metadataJSON = JSON.stringify(metadata, null, 2);
    const metadataURI = `data:application/json;base64,${Buffer.from(metadataJSON).toString('base64')}`;
    
    console.log("🎨 GenAI NFT Parameters:");
    console.log("- Prompt:", prompt.slice(0, 50) + "...");
    console.log("- Image Hash:", imageHash);
    console.log("- Style:", style);
    console.log("- Size:", size);
    console.log("- VRF Seed:", vrfSeed);
    console.log("- Metadata URI length:", metadataURI.length);
    
    // First, simulate payment to admin wallet
    const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
    const MINT_PRICE = "0.0005";
    
    console.log("\n💰 Sending payment to admin wallet...");
    const paymentTx = await deployer.sendTransaction({
      to: ADMIN_WALLET,
      value: ethers.parseEther(MINT_PRICE),
      gasLimit: 21000
    });
    
    console.log("📝 Payment transaction sent:", paymentTx.hash);
    await paymentTx.wait();
    console.log("✅ Payment confirmed");
    
    // Now mint the NFT
    console.log("\n🎯 Minting GenAI NFT using TestNFT...");
    
    const mintTx = await testNFT.mint(deployer.address, metadataURI, {
      gasLimit: 200000
    });
    
    console.log("📝 Mint transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log("✅ GENAI NFT MINTED SUCCESSFULLY! 🎉");
      
      // Parse token ID from logs
      const transferLog = receipt.logs.find(log => 
        log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      
      let tokenId = 0;
      if (transferLog) {
        tokenId = parseInt(transferLog.topics[3], 16);
      }
      
      console.log("🎭 Token ID:", tokenId);
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // Check owner
      const owner = await testNFT.ownerOf(tokenId);
      console.log("👑 Owner:", owner);
      
      // Check token URI
      const tokenURI = await testNFT.tokenURI(tokenId);
      console.log("🌐 Token URI length:", tokenURI.length);
      
      // Decode and verify metadata
      if (tokenURI.startsWith('data:application/json;base64,')) {
        const base64Data = tokenURI.split(',')[1];
        const decodedMetadata = JSON.parse(Buffer.from(base64Data, 'base64').toString());
        console.log("📋 Decoded Metadata:");
        console.log("- Name:", decodedMetadata.name);
        console.log("- Description:", decodedMetadata.description.slice(0, 50) + "...");
        console.log("- Attributes:", decodedMetadata.attributes.length);
        console.log("- VRF Seed:", decodedMetadata.vrf_seed);
        console.log("- Soul-bound:", decodedMetadata.soul_bound);
      }
      
      console.log("\n🎉 SUCCESS! GenAI NFT with VRF is working!");
      console.log("📱 To see in MetaMask:");
      console.log(`   1. Contract Address: ${TEST_NFT_ADDRESS}`);
      console.log(`   2. Token ID: ${tokenId}`);
      console.log("   3. Go to MetaMask > NFTs > Import NFT");
      console.log("   4. The NFT should display with all GenAI metadata!");
      
    } else {
      console.log("❌ Mint failed");
    }
    
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
