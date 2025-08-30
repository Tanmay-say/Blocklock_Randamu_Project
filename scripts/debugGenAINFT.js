const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("🔍 Debugging GenAI NFT Contract Issues...");
  
  const CONTRACT_ADDRESS = "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F";
  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("👤 Account:", deployer.address);
    
    // Check if contract exists
    const code = await deployer.provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x') {
      throw new Error("❌ Contract not deployed at this address");
    }
    console.log("✅ Contract exists");
    
    // Get contract instance
    const GenAINFT = await ethers.getContractFactory("GenAINFT");
    const contract = GenAINFT.attach(CONTRACT_ADDRESS);
    
    // Check basic contract info
    console.log("\n📊 Contract Info:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const mintPrice = await contract.BASE_MINT_PRICE();
    const adminWallet = await contract.adminWallet();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
    console.log("- Admin Wallet:", adminWallet);
    
    // Check roles
    console.log("\n👑 Role Checks:");
    const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const MINTER_ROLE = await contract.MINTER_ROLE();
    
    console.log("- Default Admin Role:", DEFAULT_ADMIN_ROLE);
    console.log("- Minter Role:", MINTER_ROLE);
    
    const hasAdminRole = await contract.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinterRole = await contract.hasRole(MINTER_ROLE, deployer.address);
    
    console.log("- Account has Admin Role:", hasAdminRole);
    console.log("- Account has Minter Role:", hasMinterRole);
    
    if (!hasMinterRole) {
      console.log("\n⚠️  ISSUE FOUND: Account doesn't have MINTER_ROLE!");
      console.log("💡 Solution: Grant MINTER_ROLE to this account");
      
      if (hasAdminRole) {
        console.log("🔧 Attempting to grant MINTER_ROLE...");
        const grantTx = await contract.grantRole(MINTER_ROLE, deployer.address);
        await grantTx.wait();
        console.log("✅ MINTER_ROLE granted!");
        
        // Re-check
        const newMinterRole = await contract.hasRole(MINTER_ROLE, deployer.address);
        console.log("- Account now has Minter Role:", newMinterRole);
      } else {
        console.log("❌ Cannot grant role - account is not admin");
      }
    }
    
    // Check if VRF contract is set
    console.log("\n🎲 VRF Check:");
    try {
      const vrfAddress = await contract.randamuVRF();
      console.log("- VRF Address:", vrfAddress);
      
      // Check if VRF address is valid
      const vrfCode = await deployer.provider.getCode(vrfAddress);
      if (vrfCode === '0x') {
        console.log("⚠️  VRF contract not deployed at this address");
      } else {
        console.log("✅ VRF contract exists");
      }
    } catch (vrfError) {
      console.log("❌ VRF check failed:", vrfError.message);
    }
    
    // Try a simple mint if we have permissions
    const finalMinterCheck = await contract.hasRole(MINTER_ROLE, deployer.address);
    if (finalMinterCheck) {
      console.log("\n🎯 Attempting test mint...");
      
      const testPrompt = "Test NFT";
      const testImageHash = `test_${Date.now()}`;
      const testStyle = "digital-art";
      const testSize = "1024x1024";
      const testVrfSeed = Date.now();
      
      try {
        const mintTx = await contract.mintGenAINFT(
          deployer.address,
          testPrompt,
          testImageHash,
          testStyle,
          testSize,
          testVrfSeed,
          {
            value: mintPrice,
            gasLimit: 200000
          }
        );
        
        console.log("📝 Test mint transaction sent:", mintTx.hash);
        const receipt = await mintTx.wait();
        
        if (receipt && receipt.status === 1) {
          console.log("✅ TEST MINT SUCCESSFUL! 🎉");
          
          // Get token ID from logs
          const transferLog = receipt.logs.find(log => 
            log.topics[0] === ethers.id('Transfer(address,address,uint256)')
          );
          
          if (transferLog) {
            const tokenId = parseInt(transferLog.topics[3], 16);
            console.log("🎭 Token ID:", tokenId);
          }
        } else {
          console.log("❌ Test mint failed");
        }
        
      } catch (mintError) {
        console.log("❌ Test mint error:", mintError.message);
      }
    } else {
      console.log("\n❌ Cannot test mint - no MINTER_ROLE");
    }
    
  } catch (error) {
    console.error("💥 Debug failed:", error.message);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exitCode = 1;
});
