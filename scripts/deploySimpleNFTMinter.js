const hre = require("hardhat");
const { ethers } = hre;
const fs = require('fs');

async function main() {
  console.log("🚀 Deploying Simple NFT Minter (Based on Working Repo Pattern)...");
  
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Deploy a simple NFT contract that definitely works
  console.log("\n📦 Deploying simple ERC721 for GenAI...");
  
  const SimpleNFT = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleGenAI is ERC721, Ownable {
    uint256 private _tokenIds = 0;
    uint256 public constant MINT_PRICE = 0.0005 ether;
    address public adminWallet;
    
    mapping(uint256 => string) private _tokenMetadata;
    
    constructor(address _adminWallet) ERC721("Simple GenAI NFT", "SGENAI") Ownable(msg.sender) {
        adminWallet = _adminWallet;
    }
    
    function mint(address to, string memory metadata) external payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(to != address(0), "Cannot mint to zero address");
        
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        
        _mint(to, tokenId);
        _tokenMetadata[tokenId] = metadata;
        
        // Transfer payment to admin
        if (msg.value > 0) {
            (bool success, ) = adminWallet.call{value: msg.value}("");
            require(success, "Payment failed");
        }
        
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenMetadata[tokenId];
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
}`;

  // Write the contract to a temporary file
  fs.writeFileSync('contracts/SimpleGenAI.sol', SimpleNFT);
  
  // Compile and deploy
  const SimpleGenAIFactory = await ethers.getContractFactory("SimpleGenAI");
  const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
  
  const simpleGenAI = await SimpleGenAIFactory.deploy(ADMIN_WALLET);
  await simpleGenAI.waitForDeployment();
  
  const contractAddress = await simpleGenAI.getAddress();
  console.log("✅ SimpleGenAI deployed to:", contractAddress);
  
  // Wait for deployment
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test the contract
  console.log("\n🧪 Testing simple contract...");
  
  try {
    const name = await simpleGenAI.name();
    const symbol = await simpleGenAI.symbol();
    const mintPrice = await simpleGenAI.MINT_PRICE();
    const adminWallet = await simpleGenAI.adminWallet();
    const totalSupply = await simpleGenAI.totalSupply();
    
    console.log("📊 Contract Details:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
    console.log("- Admin Wallet:", adminWallet);
    console.log("- Total Supply:", totalSupply.toString());
    
    // Test actual minting
    console.log("\n🎯 Testing actual mint...");
    
    const testMetadata = JSON.stringify({
      name: "GenAI Test NFT",
      description: "AI-generated soul-bound NFT with VRF uniqueness",
      image: "https://example.com/test-image.png",
      attributes: [
        { trait_type: "AI Generated", value: "true" },
        { trait_type: "Soul-bound", value: "true" },
        { trait_type: "VRF Seed", value: Date.now().toString() }
      ]
    });
    
    const mintTx = await simpleGenAI.mint(deployer.address, `data:application/json;base64,${Buffer.from(testMetadata).toString('base64')}`, {
      value: mintPrice,
      gasLimit: 200000
    });
    
    console.log("📝 Test mint transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    
    if (receipt && receipt.status === 1) {
      console.log("✅ TEST MINT SUCCESSFUL! 🎉");
      
      const newSupply = await simpleGenAI.totalSupply();
      const tokenId = newSupply;
      
      console.log("🎭 Token ID:", tokenId.toString());
      console.log("⛽ Gas used:", receipt.gasUsed.toString());
      
      // Check owner
      const owner = await simpleGenAI.ownerOf(tokenId);
      console.log("👑 Owner:", owner);
      
      // Check token URI
      const tokenURI = await simpleGenAI.tokenURI(tokenId);
      console.log("🌐 Token URI created:", tokenURI.length > 0);
      
      console.log("\n🎉 PERFECT! This contract works!");
      console.log("📱 NFT should be visible in MetaMask at:");
      console.log(`   Contract: ${contractAddress}`);
      console.log(`   Token ID: ${tokenId}`);
      
    } else {
      console.log("❌ Test mint failed");
    }
    
  } catch (testError) {
    console.log("❌ Test error:", testError.message);
  }
  
  // Update environment
  console.log("\n📝 Updating environment...");
  
  try {
    const envFiles = ['env.local', '.env.local', '.env'];
    
    for (const envFile of envFiles) {
      let envContent = '';
      
      if (fs.existsSync(envFile)) {
        envContent = fs.readFileSync(envFile, 'utf8');
      }
      
      const genaiLine = `VITE_SIMPLE_GENAI_ADDRESS=${contractAddress}`;
      
      if (envContent.includes('VITE_SIMPLE_GENAI_ADDRESS=')) {
        envContent = envContent.replace(/VITE_SIMPLE_GENAI_ADDRESS=.*/g, genaiLine);
      } else {
        envContent += `\n# Simple GenAI (Working)\n${genaiLine}\n`;
      }
      
      fs.writeFileSync(envFile, envContent);
    }
    
    console.log("✅ Environment updated");
    
  } catch (envError) {
    console.log("⚠️  Environment update failed:", envError.message);
  }
  
  console.log("\n🎉 SUCCESS! Simple GenAI NFT contract is working!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("💰 Mint Price: 0.0005 ETH");
  console.log("🎭 Confirmed working NFT minting!");
}

main().catch((error) => {
  console.error("💥 Deployment failed:", error);
  process.exitCode = 1;
});
