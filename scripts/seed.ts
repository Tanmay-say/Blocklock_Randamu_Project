import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Seeding test data with account:", deployer.address);
  
  // Load deployment info
  const fs = require("fs");
  let deploymentInfo;
  
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment.json", "utf8"));
  } catch (error) {
    console.error("Please run deploy script first to get contract addresses");
    return;
  }
  
  const { TestNFT, AuctionHouse } = deploymentInfo.contracts;
  
  // Get contract instances
  const testNFT = await ethers.getContractAt("TestNFT", TestNFT);
  const auctionHouse = await ethers.getContractAt("AuctionHouse", AuctionHouse);
  
  console.log("\n=== Seeding Test Data ===");
  
  // Mint some test NFTs
  console.log("\nMinting test NFTs...");
  
  const nftMetadata = [
    "ipfs://QmTest1/metadata1.json",
    "ipfs://QmTest2/metadata2.json",
    "ipfs://QmTest3/metadata3.json",
    "ipfs://QmTest4/metadata4.json",
    "ipfs://QmTest5/metadata5.json"
  ];
  
  for (let i = 0; i < nftMetadata.length; i++) {
    try {
      const tx = await testNFT.mint(deployer.address, nftMetadata[i]);
      await tx.wait();
      console.log(`Minted NFT #${i + 1} with metadata: ${nftMetadata[i]}`);
    } catch (error) {
      console.log(`Failed to mint NFT #${i + 1}:`, error);
    }
  }
  
  // Get current block number
  const currentBlock = await ethers.provider.getBlockNumber();
  const endBlock = currentBlock + 1000; // End in ~1000 blocks
  
  // Create a test auction
  console.log("\nCreating test auction...");
  
  try {
    // Approve NFT transfer
    const approveTx = await testNFT.approve(auctionHouse.address, 1);
    await approveTx.wait();
    console.log("Approved NFT transfer to AuctionHouse");
    
    // Create auction
    const createTx = await auctionHouse.createAuction(
      testNFT.address,
      1, // tokenId
      ethers.parseEther("0.1"), // reserve price: 0.1 ETH
      endBlock,
      1000 // deposit percent: 10% (1000 basis points)
    );
    await createTx.wait();
    console.log("Created auction for NFT #1");
    
    // Get auction details
    const auction = await auctionHouse.getAuction(0);
    console.log("Auction details:", {
      nft: auction.nft,
      tokenId: auction.tokenId.toString(),
      reserve: ethers.formatEther(auction.reserve),
      endBlock: auction.endBlock.toString(),
      seller: auction.seller
    });
    
  } catch (error) {
    console.log("Failed to create auction:", error);
  }
  
  console.log("\n=== Seeding Complete ===");
  console.log("Test NFTs minted and auction created successfully!");
  console.log("You can now test the auction system with these assets.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
