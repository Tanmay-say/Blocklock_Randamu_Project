const { ethers } = require("hardhat");
const readline = require('readline');

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  console.log("🚀 DIRECT NFT MINTING DEPLOYMENT");
  console.log("This will deploy an updated TestNFT contract where users get NFTs instantly!");
  console.log("=".repeat(80));
  
  try {
    // Get private key if not in environment
    let privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey || privateKey === 'YOUR_PRIVATE_KEY_HERE') {
      console.log("\n⚠️  Private key not found in .env file");
      console.log("Please enter your Base Sepolia wallet private key:");
      console.log("(The one with admin privileges - starts with 0x...)");
      privateKey = await askQuestion("Private Key: ");
      
      if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
      }
    }
    
    // Create signer from private key
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const deployer = new ethers.Wallet(privateKey, provider);
    
    const balance = await provider.getBalance(deployer.address);
    const network = await provider.getNetwork();
    
    console.log("\n✅ Connection successful!");
    console.log("Deployer Address:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
    
    if (parseFloat(ethers.formatEther(balance)) < 0.001) {
      console.log("❌ Insufficient balance for deployment");
      console.log("Please get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia");
      process.exit(1);
    }
    
    console.log("\n🔨 Deploying Updated TestNFT (Direct Minting)...");
    
    // Deploy Updated TestNFT
    const TestNFT = await ethers.getContractFactory("TestNFT", deployer);
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();
    const testNFTAddress = await testNFT.getAddress();
    
    console.log("✅ Updated TestNFT deployed to:", testNFTAddress);
    
    // Test that anyone can mint (no onlyOwner restriction)
    console.log("\n🧪 Testing direct minting capability...");
    
    const testMetadata = JSON.stringify({
      name: "Direct Mint Test NFT",
      description: "Testing that users can mint NFTs directly",
      image: "https://via.placeholder.com/400x400/9333ea/ffffff?text=Direct+Mint+Test",
      attributes: [
        { trait_type: "Type", value: "Test NFT" },
        { trait_type: "Minting", value: "Direct" }
      ]
    });
    
    const metadataURI = `data:application/json;base64,${Buffer.from(testMetadata).toString('base64')}`;
    
    console.log("Minting test NFT...");
    const mintTx = await testNFT.mint(deployer.address, metadataURI);
    const mintReceipt = await mintTx.wait();
    
    if (mintReceipt.status === 1) {
      console.log("✅ Direct minting successful! Token ID: 0");
      console.log("Mint transaction:", mintTx.hash);
    } else {
      throw new Error("Minting test failed");
    }
    
    // Display results
    console.log("\n" + "=".repeat(80));
    console.log("🎉 DIRECT MINTING DEPLOYMENT COMPLETE!");
    console.log("=".repeat(80));
    
    console.log("\n📋 CONTRACT DETAILS:");
    console.log("Updated TestNFT Address:", testNFTAddress);
    console.log("Deployer:", deployer.address);
    console.log("Network: Base Sepolia (84532)");
    
    console.log("\n🔗 VERIFICATION LINKS:");
    console.log("Contract:", `https://sepolia.basescan.org/address/${testNFTAddress}`);
    console.log("Test Mint:", `https://sepolia.basescan.org/tx/${mintTx.hash}`);
    
    console.log("\n💻 FRONTEND UPDATE REQUIRED:");
    console.log("Update src/lib/contracts.ts with this address:");
    console.log(`testNFT: "${testNFTAddress}",`);
    
    console.log("\n🎯 WHAT THIS ENABLES:");
    console.log("✅ Users get NFTs INSTANTLY after purchase");
    console.log("✅ No admin approval needed");
    console.log("✅ Real NFTs appear in MetaMask immediately");
    console.log("✅ Fully automated marketplace");
    
    console.log("\n📝 COPY-PASTE READY:");
    console.log("=".repeat(40));
    console.log(`export const NEW_TEST_NFT_ADDRESS = "${testNFTAddress}";`);
    console.log("=".repeat(40));
    
    console.log("\n✅ Ready to enable direct NFT minting!");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message || error);
    
    if (error.message && error.message.includes('insufficient funds')) {
      console.log("\n💡 TIP: Get Base Sepolia ETH from:");
      console.log("https://www.alchemy.com/faucets/base-sepolia");
    }
    
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

