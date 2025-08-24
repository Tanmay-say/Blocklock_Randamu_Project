import { ethers } from "hardhat";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";

async function main() {
    console.log("🎯 Creating auction and placing encrypted bid...\n");
    
    const [deployer, seller, bidder1, bidder2] = await ethers.getSigners();
    
    // Contract addresses from deployment
    const auctionHouseAddress = process.env.AUCTION_HOUSE_ADDRESS;
    const testNFTAddress = process.env.TEST_NFT_ADDRESS;
    
    if (!auctionHouseAddress || !testNFTAddress) {
        throw new Error("Contract addresses not found. Please deploy contracts first.");
    }
    
    console.log("📋 Contract Addresses:");
    console.log("AuctionHouse:", auctionHouseAddress);
    console.log("TestNFT:", testNFTAddress);
    console.log("Seller:", seller.address);
    console.log("Bidder1:", bidder1.address);
    console.log("Bidder2:", bidder2.address);
    console.log("");
    
    // Get contract instances
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = AuctionHouse.attach(auctionHouseAddress);
    
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = TestNFT.attach(testNFTAddress);
    
    // 1. Mint NFT to seller
    console.log("🎨 Minting NFT to seller...");
    const mintTx = await testNFT.connect(deployer).mint(seller.address, "https://example.com/nft/1");
    await mintTx.wait();
    console.log("✅ NFT minted (Token ID: 0)");
    
    // 2. Approve auction house
    console.log("📝 Approving auction house...");
    const approveTx = await testNFT.connect(seller).approve(auctionHouseAddress, 0);
    await approveTx.wait();
    console.log("✅ Approval granted");
    
    // 3. Grant seller role
    console.log("🔑 Granting seller role...");
    const sellerRole = await auctionHouse.SELLER_ROLE();
    const grantTx = await auctionHouse.connect(deployer).grantRole(sellerRole, seller.address);
    await grantTx.wait();
    console.log("✅ Seller role granted");
    
    // 4. Create auction
    console.log("\n🏗️ Creating auction...");
    const currentBlock = await ethers.provider.getBlockNumber();
    const endBlock = currentBlock + 50; // Auction ends in 50 blocks
    const reserve = ethers.parseEther("0.01"); // 0.01 ETH reserve
    const depositPct = 20; // 20% deposit required
    
    const createTx = await auctionHouse.connect(seller).createAuction(
        testNFTAddress,
        0, // token ID
        reserve,
        endBlock,
        depositPct
    );
    await createTx.wait();
    
    console.log("✅ Auction created!");
    console.log("   Reserve:", ethers.formatEther(reserve), "ETH");
    console.log("   End Block:", endBlock);
    console.log("   Current Block:", currentBlock);
    console.log("   Deposit Required:", depositPct + "%");
    
    // 5. Place encrypted bids using Blocklock
    console.log("\n🔐 Placing encrypted bids...");
    
    // Initialize Blocklock for Base Sepolia
    const blocklock = Blocklock.createBaseSepolia(bidder1);
    
    // Bidder 1 places bid
    await placeBid(auctionHouse, blocklock, bidder1, 0, endBlock, "0.02", reserve);
    
    // Bidder 2 places bid  
    await placeBid(auctionHouse, blocklock, bidder2, 0, endBlock, "0.03", reserve);
    
    console.log("\n🎉 Auction setup complete!");
    console.log("📊 Summary:");
    console.log("   Auction ID: 0");
    console.log("   NFT: Token #0");
    console.log("   Reserve: 0.01 ETH");
    console.log("   Bidders: 2");
    console.log("   End Block:", endBlock);
    console.log("   Bids will be automatically decrypted when auction ends!");
}

async function placeBid(
    auctionHouse: any,
    blocklock: any,
    bidder: any,
    auctionId: number,
    endBlock: number,
    bidAmountEth: string,
    reserve: bigint
) {
    console.log(`\n💰 ${bidder.address} placing bid...`);
    
    // 1. Encrypt the bid amount
    const bidAmount = ethers.parseEther(bidAmountEth);
    const encodedBid = encodeParams(["uint256"], [bidAmount]);
    const encryptedBid = blocklock.encrypt(ethers.getBytes(encodedBid), BigInt(endBlock));
    
    // 2. Create condition (decrypt at end block)
    const condition = encodeCondition(BigInt(endBlock));
    
    // 3. Calculate required deposit
    const deposit = (reserve * BigInt(20)) / BigInt(100); // 20%
    
    // 4. Estimate callback gas and get price
    const callbackGasLimit = 500000; // Conservative estimate
    const [callbackPrice] = await blocklock.calculateRequestPriceNative(BigInt(callbackGasLimit));
    
    const totalRequired = deposit + callbackPrice;
    
    console.log("   Bid Amount:", bidAmountEth, "ETH");
    console.log("   Deposit Required:", ethers.formatEther(deposit), "ETH");
    console.log("   Callback Fee:", ethers.formatEther(callbackPrice), "ETH");
    console.log("   Total Required:", ethers.formatEther(totalRequired), "ETH");
    
    // 5. Submit encrypted bid
    try {
        const bidTx = await auctionHouse.connect(bidder).commitBid(
            auctionId,
            encodeCiphertextToSolidity(encryptedBid),
            condition,
            callbackGasLimit,
            { value: totalRequired }
        );
        
        const receipt = await bidTx.wait();
        console.log("✅ Encrypted bid submitted!");
        console.log("   Transaction:", receipt.hash);
        
        // Find the BidCommitted event
        const bidEvent = receipt.logs.find((log: any) => {
            try {
                const parsed = auctionHouse.interface.parseLog(log);
                return parsed.name === "BidCommitted";
            } catch {
                return false;
            }
        });
        
        if (bidEvent) {
            const parsed = auctionHouse.interface.parseLog(bidEvent);
            console.log("   Blocklock Request ID:", parsed.args.blocklockRequestId.toString());
        }
        
    } catch (error) {
        console.error("❌ Bid failed:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
