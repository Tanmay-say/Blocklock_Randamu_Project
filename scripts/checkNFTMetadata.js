const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🔍 Checking NFT Metadata for MetaMask Visibility...");
    
    const [deployer] = await ethers.getSigners();
    const userAddress = deployer.address;
    console.log("👤 User address:", userAddress);
    
    const contractAddress = "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F";
    console.log("📋 GenAI Contract:", contractAddress);
    
    // Extended ABI for GenAI contract
    const abi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)", 
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function tokenOfOwnerByIndex(address, uint256) view returns (uint256)",
        "function tokenURI(uint256) view returns (string)",
        "function ownerOf(uint256) view returns (address)",
        "function getGenAIMetadata(uint256) view returns (tuple(string prompt, string imageHash, string style, string size, uint256 generatedAt, uint256 vrfSeed, address generator, bool isSoulBound))"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, abi, deployer);
        
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const balance = await contract.balanceOf(userAddress);
        
        console.log(`\n📊 Contract Info:`);
        console.log(`  Name: ${name}`);
        console.log(`  Symbol: ${symbol}`);
        console.log(`  Total Supply: ${totalSupply}`);
        console.log(`  Your Balance: ${balance} NFTs`);
        
        if (balance > 0) {
            console.log(`\n🎨 Your NFTs:`);
            
            // Check the last 3 NFTs you own
            const numToCheck = Math.min(Number(balance), 3);
            
            for (let i = 0; i < numToCheck; i++) {
                try {
                    const tokenId = await contract.tokenOfOwnerByIndex(userAddress, i);
                    console.log(`\n  🎭 NFT #${i + 1} (Token ID: ${tokenId}):`);
                    
                    // Get basic token info
                    const owner = await contract.ownerOf(tokenId);
                    const tokenURI = await contract.tokenURI(tokenId);
                    
                    console.log(`    Owner: ${owner}`);
                    console.log(`    Token URI: ${tokenURI.substring(0, 150)}...`);
                    
                    // Get GenAI-specific metadata
                    try {
                        const metadata = await contract.getGenAIMetadata(tokenId);
                        console.log(`    Prompt: ${metadata.prompt.substring(0, 50)}...`);
                        console.log(`    Style: ${metadata.style}`);
                        console.log(`    Size: ${metadata.size}`);
                        console.log(`    Soul-bound: ${metadata.isSoulBound}`);
                        console.log(`    VRF Seed: ${metadata.vrfSeed}`);
                    } catch (metaError) {
                        console.log(`    ⚠️ Cannot get GenAI metadata: ${metaError.message}`);
                    }
                    
                } catch (tokenError) {
                    console.log(`    ❌ Error getting token ${i}: ${tokenError.message}`);
                }
            }
        }
        
        console.log(`\n🦊 MetaMask Setup Instructions:`);
        console.log(`To see your NFTs in MetaMask:`);
        console.log(`1. Open MetaMask`);
        console.log(`2. Go to the NFTs tab`);
        console.log(`3. Click "Import NFT"`);
        console.log(`4. Enter contract address: ${contractAddress}`);
        console.log(`5. Enter any token ID you own (e.g., 0, 1, 2, etc.)`);
        console.log(`6. Click "Add"`);
        console.log(`\n💡 Note: You need to add each NFT individually in MetaMask`);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        console.log(`\n🔧 Troubleshooting:`);
        console.log(`1. Make sure you're connected to Base Sepolia network`);
        console.log(`2. Contract address: ${contractAddress}`);
        console.log(`3. Your address: ${userAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
