const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying GenAI NFT System to Base Sepolia...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const network = await ethers.provider.getNetwork();
    
    console.log("✅ Connected successfully!");
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
      console.log("❌ Insufficient balance for deployment");
      console.log("Please get some Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
      return;
    }
    
    // Configuration
    const adminWallet = deployer.address; // Change this to your admin wallet
    const blocklockSender = "0x82Fed730CbdeC5A2D8724F2e3b316a70A565e27e"; // Base Sepolia Blocklock
    
    console.log("📋 Deployment Configuration:");
    console.log("Admin Wallet:", adminWallet);
    console.log("Blocklock Sender:", blocklockSender);
    
    // 1. Deploy MockRandamuVRF for GenAI uniqueness
    console.log("\n🎲 Deploying MockRandamuVRF for GenAI...");
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    const vrfContract = await MockRandamuVRF.deploy();
    await vrfContract.waitForDeployment();
    const vrfAddress = await vrfContract.getAddress();
    console.log("✅ MockRandamuVRF deployed to:", vrfAddress);
    
    // 2. Deploy GenAIImageStorage
    console.log("\n🖼️ Deploying GenAIImageStorage...");
    const GenAIImageStorage = await ethers.getContractFactory("GenAIImageStorage");
    const imageStorage = await GenAIImageStorage.deploy(vrfAddress);
    await imageStorage.waitForDeployment();
    const imageStorageAddress = await imageStorage.getAddress();
    console.log("✅ GenAIImageStorage deployed to:", imageStorageAddress);
    
    // 3. Deploy GenAISubscription
    console.log("\n📅 Deploying GenAISubscription...");
    const GenAISubscription = await ethers.getContractFactory("GenAISubscription");
    const subscription = await GenAISubscription.deploy(adminWallet);
    await subscription.waitForDeployment();
    const subscriptionAddress = await subscription.getAddress();
    console.log("✅ GenAISubscription deployed to:", subscriptionAddress);
    
    // 4. Deploy GenAINFT
    console.log("\n🎨 Deploying GenAINFT...");
    const GenAINFT = await ethers.getContractFactory("GenAINFT");
    const genaiNFT = await GenAINFT.deploy(adminWallet, vrfAddress);
    await genaiNFT.waitForDeployment();
    const genaiNFTAddress = await genaiNFT.getAddress();
    console.log("✅ GenAINFT deployed to:", genaiNFTAddress);
    
    // 5. Setup permissions
    console.log("\n🔐 Setting up permissions...");
    
    // Grant GenAI role to subscription contract in image storage
    console.log("Granting GenAI role to subscription contract...");
    const grantTx1 = await imageStorage.grantGenAIRole(subscriptionAddress);
    await grantTx1.wait();
    console.log("✅ GenAI role granted to subscription contract");
    
    // Grant MINTER role to subscription contract in NFT contract
    console.log("Granting MINTER role to subscription contract...");
    const MINTER_ROLE = await genaiNFT.MINTER_ROLE();
    const grantTx2 = await genaiNFT.grantRole(MINTER_ROLE, subscriptionAddress);
    await grantTx2.wait();
    console.log("✅ MINTER role granted to subscription contract");
    
    // 6. Test the system
    console.log("\n🧪 Testing GenAI System...");
    
    // Test VRF
    console.log("Testing VRF...");
    const requestTx = await vrfContract.requestRandomWords();
    const requestReceipt = await requestTx.wait();
    console.log("✅ VRF test successful");
    
    // Test image storage (simulate)
    console.log("Testing image storage...");
    const testImageHash = "QmTestHash123";
    const testPrompt = "A beautiful sunset over mountains";
    const testStyle = "digital-art";
    const testSize = "1024x1024";
    const testVRFSeed = 12345;
    
    // Grant temporary GenAI role to deployer for testing
    const tempGrantTx = await imageStorage.grantGenAIRole(deployer.address);
    await tempGrantTx.wait();
    
    const storeTx = await imageStorage.storeImageWithVRF(
      testImageHash,
      testPrompt,
      testStyle,
      testSize,
      deployer.address,
      testVRFSeed
    );
    await storeTx.wait();
    console.log("✅ Image storage test successful");
    
    // Revoke temporary role
    const revokeTemp = await imageStorage.revokeGenAIRole(deployer.address);
    await revokeTemp.wait();
    
    // Test subscription (purchase monthly)
    console.log("Testing subscription purchase...");
    const monthlyPrice = await subscription.MONTHLY_PRICE();
    const subTx = await subscription.purchaseMonthlySubscription({ value: monthlyPrice });
    await subTx.wait();
    console.log("✅ Subscription test successful");
    
    // Test NFT minting
    console.log("Testing GenAI NFT minting...");
    const mintPrice = await genaiNFT.BASE_MINT_PRICE();
    const mintTx = await genaiNFT.mintGenAINFT(
      deployer.address,
      "Test AI generated image",
      "QmTestNFTHash456",
      "cyberpunk",
      "1024x1024",
      67890,
      { value: mintPrice }
    );
    await mintTx.wait();
    console.log("✅ GenAI NFT minting test successful");
    
    // Create deployment summary
    console.log("\n" + "=".repeat(80));
    console.log("🎉 GENAI NFT SYSTEM DEPLOYMENT SUMMARY");
    console.log("=".repeat(80));
    console.log("Network: Base Sepolia Testnet");
    console.log("Deployer:", deployer.address);
    console.log("Admin Wallet:", adminWallet);
    console.log("Deployment Gas Used: ~2.5M gas");
    console.log("");
    console.log("📋 CONTRACT ADDRESSES:");
    console.log("├─ MockRandamuVRF:    ", vrfAddress);
    console.log("├─ GenAIImageStorage: ", imageStorageAddress);
    console.log("├─ GenAISubscription: ", subscriptionAddress);
    console.log("└─ GenAINFT:          ", genaiNFTAddress);
    console.log("");
    console.log("💰 PRICING:");
    console.log("├─ NFT Mint Price:    0.0005 ETH");
    console.log("├─ Monthly Sub:       0.01 ETH");
    console.log("└─ Annual Sub:        0.1 ETH");
    console.log("");
    console.log("📊 LIMITS:");
    console.log("├─ Free Users:        5 images/day");
    console.log("├─ Premium Users:     1000 images/day");
    console.log("└─ Free Storage:      7 days (auto-cleanup)");
    console.log("");
    console.log("🔗 NEXT STEPS:");
    console.log("1. Set these addresses in your .env.local:");
    console.log(`   VITE_GENAI_VRF_ADDRESS=${vrfAddress}`);
    console.log(`   VITE_GENAI_STORAGE_ADDRESS=${imageStorageAddress}`);
    console.log(`   VITE_GENAI_SUBSCRIPTION_ADDRESS=${subscriptionAddress}`);
    console.log(`   VITE_GENAI_NFT_ADDRESS=${genaiNFTAddress}`);
    console.log("");
    console.log("2. Update your frontend to use these contracts");
    console.log("3. Set up Gemini API key for image generation");
    console.log("4. Configure IPFS for image storage");
    console.log("5. Test the complete GenAI flow");
    console.log("");
    console.log("✅ GenAI NFT System deployed successfully!");
    console.log("=".repeat(80));
    
    // Save addresses to file for easy access
    const deploymentInfo = {
      network: "Base Sepolia",
      chainId: network.chainId.toString(),
      deployer: deployer.address,
      adminWallet: adminWallet,
      blocklockSender: blocklockSender,
      contracts: {
        mockRandamuVRF: vrfAddress,
        genaiImageStorage: imageStorageAddress,
        genaiSubscription: subscriptionAddress,
        genaiNFT: genaiNFTAddress
      },
      deployedAt: new Date().toISOString(),
      pricing: {
        nftMintPrice: "0.0005",
        monthlySubscription: "0.01",
        annualSubscription: "0.1"
      },
      limits: {
        freeUserDaily: 5,
        premiumUserDaily: 1000,
        freeStorageDays: 7
      }
    };
    
    // Write to file
    const fs = require('fs');
    fs.writeFileSync(
      'genai-deployment.json',
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("📁 Deployment info saved to: genai-deployment.json");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
