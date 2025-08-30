const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🔍 Finding Your GenAI NFT Token IDs...");
    
    const [deployer] = await ethers.getSigners();
    const userAddress = deployer.address;
    console.log("👤 User address:", userAddress);
    
    const contractAddress = "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F";
    console.log("📋 GenAI Contract:", contractAddress);
    
    const abi = [
        "function ownerOf(uint256) view returns (address)",
        "function tokenURI(uint256) view returns (string)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)"
    ];
    
    try {
        const contract = new ethers.Contract(contractAddress, abi, deployer);
        
        const totalSupply = await contract.totalSupply();
        const balance = await contract.balanceOf(userAddress);
        
        console.log(`📊 Total Supply: ${totalSupply}`);
        console.log(`📊 Your Balance: ${balance} NFTs`);
        
        console.log(`\n🔍 Searching for your tokens...`);
        const userTokens = [];
        
        // Check tokens 0 through totalSupply
        for (let tokenId = 0; tokenId < Number(totalSupply); tokenId++) {
            try {
                const owner = await contract.ownerOf(tokenId);
                if (owner.toLowerCase() === userAddress.toLowerCase()) {
                    console.log(`✅ Found your token: #${tokenId}`);
                    
                    try {
                        const tokenURI = await contract.tokenURI(tokenId);
                        console.log(`   URI: ${tokenURI.substring(0, 100)}...`);
                        userTokens.push(tokenId);
                    } catch (uriError) {
                        console.log(`   ⚠️ No URI for token ${tokenId}`);
                        userTokens.push(tokenId);
                    }
                }
            } catch (error) {
                // Token doesn't exist or error, continue
            }
        }
        
        console.log(`\n🎭 Summary:`);
        console.log(`Found ${userTokens.length} tokens owned by you:`);
        userTokens.forEach(tokenId => {
            console.log(`  - Token ID: ${tokenId}`);
        });
        
        if (userTokens.length > 0) {
            console.log(`\n🦊 To add NFTs to MetaMask:`);
            console.log(`1. Open MetaMask`);
            console.log(`2. Switch to Base Sepolia network`);
            console.log(`3. Go to NFTs tab`);
            console.log(`4. Click "Import NFT"`);
            console.log(`5. Contract Address: ${contractAddress}`);
            console.log(`6. Try these Token IDs one by one:`);
            userTokens.slice(0, 5).forEach(tokenId => {
                console.log(`   - Token ID: ${tokenId}`);
            });
        } else {
            console.log(`\n❌ No tokens found. This might indicate:`);
            console.log(`1. The contract balance is wrong`);
            console.log(`2. Tokens are not properly minted`);
            console.log(`3. Contract implementation issue`);
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
