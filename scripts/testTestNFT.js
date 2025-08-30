const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🧪 Testing existing TestNFT contract...");
  
  const TEST_NFT_ADDRESS = "0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705";
  console.log("📍 TestNFT Address:", TEST_NFT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    
    // Get TestNFT contract
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = TestNFT.attach(TEST_NFT_ADDRESS);
    
    // Get basic info
    const name = await testNFT.name();
    const symbol = await testNFT.symbol();
    const totalSupply = await testNFT.totalSupply();
    
    console.log("📊 TestNFT Details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Total Supply:", totalSupply.toString());
    
    // Test minting (TestNFT should work)
    console.log("\n🎯 Testing TestNFT mint...");
    
    const metadataURI = "https://example.com/metadata/test.json";
    
    try {
      const mintTx = await testNFT.mint(deployer.address, metadataURI, {
        gasLimit: 200000
      });
      
      console.log("📝 Mint transaction sent:", mintTx.hash);
      const receipt = await mintTx.wait();
      
      if (receipt && receipt.status === 1) {
        console.log("✅ TEST NFT MINTED SUCCESSFULLY! 🎉");
        
        const newSupply = await testNFT.totalSupply();
        const tokenId = newSupply;
        
        console.log("🎭 Token ID:", tokenId.toString());
        console.log("⛽ Gas used:", receipt.gasUsed.toString());
        
        // Check owner
        const owner = await testNFT.ownerOf(tokenId);
        console.log("👑 Owner:", owner);
        
        // Check token URI
        const tokenURI = await testNFT.tokenURI(tokenId);
        console.log("🌐 Token URI:", tokenURI);
        
        console.log("\n✅ TestNFT is working perfectly!");
        console.log("📱 This NFT should be visible in MetaMask:");
        console.log(`   Contract: ${TEST_NFT_ADDRESS}`);
        console.log(`   Token ID: ${tokenId}`);
        
        // Now let's use TestNFT for GenAI minting
        console.log("\n💡 Solution: Use TestNFT for GenAI minting!");
        console.log("Since TestNFT works, we can use it for GenAI with custom metadata in the tokenURI");
        
      } else {
        console.log("❌ TestNFT mint failed");
      }
      
    } catch (mintError) {
      console.log("❌ TestNFT mint error:", mintError.message);
    }
    
  } catch (error) {
    console.error("💥 TestNFT test failed:", error.message);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
