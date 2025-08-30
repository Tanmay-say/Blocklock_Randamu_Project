const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Simple GenAI NFT Contract...");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Admin wallet address
  const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
  console.log("👑 Admin wallet:", ADMIN_WALLET);
  
  // Deploy SimpleGenAINFT
  console.log("\n📦 Deploying SimpleGenAINFT...");
  
  const SimpleGenAINFT = await ethers.getContractFactory("SimpleGenAINFT");
  const simpleGenAINFT = await SimpleGenAINFT.deploy(ADMIN_WALLET);
  
  await simpleGenAINFT.waitForDeployment();
  const simpleGenAINFTAddress = await simpleGenAINFT.getAddress();
  
  console.log("✅ SimpleGenAINFT deployed to:", simpleGenAINFTAddress);
  
  // Test the contract
  console.log("\n🧪 Testing contract...");
  
  const name = await simpleGenAINFT.name();
  const symbol = await simpleGenAINFT.symbol();
  const mintPrice = await simpleGenAINFT.BASE_MINT_PRICE();
  const adminWallet = await simpleGenAINFT.adminWallet();
  const totalSupply = await simpleGenAINFT.totalSupply();
  
  console.log("📊 Contract Details:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
  console.log("- Admin Wallet:", adminWallet);
  console.log("- Total Supply:", totalSupply.toString());
  
  // Test mint
  console.log("\n🎯 Testing mint functionality...");
  
  try {
    const testPrompt = "A beautiful digital art piece with vibrant colors and futuristic elements";
    const testImageHash = `simple_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testStyle = "digital-art";
    const testSize = "1024x1024";
    
    const mintTx = await simpleGenAINFT.mintGenAINFT(
      deployer.address,
      testPrompt,
      testImageHash,
      testStyle,
      testSize,
      {
        value: mintPrice,
        gasLimit: 200000
      }
    );
    
    console.log("📝 Test mint transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log("✅ TEST MINT SUCCESSFUL! 🎉");
      
      const newTotalSupply = await simpleGenAINFT.totalSupply();
      console.log("🎭 Token ID:", newTotalSupply.toString());
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // Check metadata
      const metadata = await simpleGenAINFT.getGenAIMetadata(newTotalSupply);
      console.log("📋 Metadata:");
      console.log("- Prompt:", metadata.prompt.slice(0, 50) + "...");
      console.log("- Image Hash:", metadata.imageHash);
      console.log("- Style:", metadata.style);
      console.log("- Size:", metadata.size);
      console.log("- Soul-bound:", metadata.isSoulBound);
      
      // Check token URI
      const tokenURI = await simpleGenAINFT.tokenURI(newTotalSupply);
      console.log("🌐 Token URI length:", tokenURI.length);
      
    } else {
      console.log("❌ Test mint failed");
    }
    
  } catch (mintError) {
    console.log("❌ Test mint error:", mintError.message);
  }
  
  // Update environment file
  console.log("\n📝 Updating environment file...");
  
  try {
    let envContent = '';
    
    if (fs.existsSync('env.local')) {
      envContent = fs.readFileSync('env.local', 'utf8');
    }
    
    // Update or add the SimpleGenAINFT address
    const simpleGenAINFTLine = `VITE_SIMPLE_GENAI_NFT_ADDRESS=${simpleGenAINFTAddress}`;
    
    if (envContent.includes('VITE_SIMPLE_GENAI_NFT_ADDRESS=')) {
      envContent = envContent.replace(/VITE_SIMPLE_GENAI_NFT_ADDRESS=.*/g, simpleGenAINFTLine);
    } else {
      envContent += `\n# Simple GenAI NFT (Working Contract)\n${simpleGenAINFTLine}\n`;
    }
    
    fs.writeFileSync('env.local', envContent);
    fs.writeFileSync('.env.local', envContent);
    fs.writeFileSync('.env', envContent);
    
    console.log("✅ Environment files updated");
    
  } catch (envError) {
    console.log("⚠️  Could not update environment file:", envError.message);
  }
  
  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log("📍 SimpleGenAINFT Contract:", simpleGenAINFTAddress);
  console.log("💰 Mint Price: 0.0005 ETH");
  console.log("🎭 Soul-bound: NFTs cannot be transferred");
  console.log("🔧 Ready for frontend integration!");
  
  // Instructions
  console.log("\n📋 Frontend Integration:");
  console.log("1. Use VITE_SIMPLE_GENAI_NFT_ADDRESS in your .env");
  console.log("2. Update GenAI service to use SimpleGenAINFT");
  console.log("3. Refresh browser to load new environment variables");
  console.log("4. Test minting from the GenAI page");
}

main().catch((error) => {
  console.error("💥 Deployment failed:", error);
  process.exitCode = 1;
});
