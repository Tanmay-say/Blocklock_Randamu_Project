const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🧪 Testing GenAI NFT Visibility in MetaMask...");
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    
    // Test both contracts
    const contracts = {
        "TestNFT (Working)": "0x72ADEB4DE31E0C1D5Bd6b24c24C9ca11d6eD5705",
        "GenAI (Problematic)": "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F"
    };
    
    for (const [name, address] of Object.entries(contracts)) {
        console.log(`\n📋 Testing ${name} at ${address}:`);
        
        try {
            // Test with simple ERC721 ABI
            const abi = [
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function totalSupply() view returns (uint256)",
                "function tokenURI(uint256) view returns (string)",
                "function balanceOf(address) view returns (uint256)",
                "function ownerOf(uint256) view returns (address)"
            ];
            
            const contract = new ethers.Contract(address, abi, deployer);
            
            const name_result = await contract.name();
            const symbol_result = await contract.symbol();
            const totalSupply = await contract.totalSupply();
            
            console.log(`  ✅ Name: ${name_result}`);
            console.log(`  ✅ Symbol: ${symbol_result}`);
            console.log(`  ✅ Total Supply: ${totalSupply}`);
            
            // Check user balance
            const balance = await contract.balanceOf(deployer.address);
            console.log(`  📊 Your balance: ${balance} NFTs`);
            
            // If user has NFTs, check their metadata
            if (balance > 0) {
                for (let i = 0; i < Math.min(balance, 3); i++) {
                    try {
                        // This might fail if the contract doesn't implement tokenByIndex
                        console.log(`  🔍 Checking token ${i}...`);
                        const tokenURI = await contract.tokenURI(i);
                        console.log(`    📄 Token ${i} URI: ${tokenURI.substring(0, 100)}...`);
                    } catch (err) {
                        console.log(`    ❌ Cannot get tokenURI for token ${i}: ${err.message}`);
                    }
                }
            }
            
            console.log(`  ✅ ${name} contract is accessible`);
            
        } catch (error) {
            console.log(`  ❌ ${name} failed: ${error.message}`);
        }
    }
    
    console.log("\n🎯 Recommendation:");
    console.log("If TestNFT works but GenAI doesn't, switch GenAI to use TestNFT contract");
    console.log("TestNFT has proven MetaMask compatibility");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
