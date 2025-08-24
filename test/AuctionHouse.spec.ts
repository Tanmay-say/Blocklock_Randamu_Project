import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("AuctionHouse", function () {
  let auctionHouse: any;
  let winnerSBT: any;
  let mockRandamuVRF: any;
  let testNFT: any;
  let deployer: any;
  let admin: any;
  let seller: any;
  let bidder1: any;
  let bidder2: any;
  let bidder3: any;

  beforeEach(async function () {
    // Get signers
    [deployer, admin, seller, bidder1, bidder2, bidder3] = await ethers.getSigners();

    // Deploy TestNFT
    const TestNFT = await ethers.getContractFactory("TestNFT");
    testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();

    // Deploy WinnerSBT
    const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
    winnerSBT = await WinnerSBT.deploy();
    await winnerSBT.waitForDeployment();

    // Deploy MockRandamuVRF
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    mockRandamuVRF = await MockRandamuVRF.deploy();
    await mockRandamuVRF.waitForDeployment();

    // Deploy AuctionHouse
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    auctionHouse = await AuctionHouse.deploy(
      await winnerSBT.getAddress(),
      await mockRandamuVRF.getAddress(),
      admin.address
    );
    await auctionHouse.waitForDeployment();

    // Setup roles
    const minterRole = await winnerSBT.MINTER_ROLE();
    await winnerSBT.grantRole(minterRole, await auctionHouse.getAddress());
    
    const sellerRole = await auctionHouse.SELLER_ROLE();
    await auctionHouse.grantRole(sellerRole, seller.address);

    // Mint test NFT to seller
    await testNFT.mint(seller.address, "https://example.com/nft/1");
    
    // Approve auction house to transfer NFT
    await testNFT.connect(seller).approve(await auctionHouse.getAddress(), 0);
  });

  describe("Deployment", function () {
    it("Should set the right admin wallet", async function () {
      expect(await auctionHouse.adminWallet()).to.equal(admin.address);
    });

    it("Should set the correct tax percentage", async function () {
      expect(await auctionHouse.TAX_PERCENTAGE()).to.equal(2000); // 20%
    });

    it("Should grant roles correctly", async function () {
      const adminRole = await auctionHouse.ADMIN_ROLE();
      const sellerRole = await auctionHouse.SELLER_ROLE();
      
      expect(await auctionHouse.hasRole(adminRole, deployer.address)).to.be.true;
      expect(await auctionHouse.hasRole(sellerRole, seller.address)).to.be.true;
    });
  });

  describe("Auction Creation", function () {
    it("Should create an auction successfully", async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100;
      const reserve = ethers.parseEther("1");
      const depositPct = 20;

      await expect(
        auctionHouse.connect(seller).createAuction(
          await testNFT.getAddress(),
          0,
          reserve,
          endBlock,
          depositPct
        )
      ).to.emit(auctionHouse, "AuctionCreated");

      const auction = await auctionHouse.getAuction(0);
      expect(auction.nft).to.equal(await testNFT.getAddress());
      expect(auction.tokenId).to.equal(0);
      expect(auction.reserve).to.equal(reserve);
      expect(auction.endBlock).to.equal(endBlock);
      expect(auction.seller).to.equal(seller.address);
    });

    it("Should transfer NFT to auction house", async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100;
      const reserve = ethers.parseEther("1");
      const depositPct = 20;

      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        reserve,
        endBlock,
        depositPct
      );

      expect(await testNFT.ownerOf(0)).to.equal(await auctionHouse.getAddress());
    });
  });

  describe("Bidding", function () {
    let auctionId: number;
    let endBlock: number;
    let reserve: bigint;

    beforeEach(async function () {
      const currentBlock = await ethers.provider.getBlockNumber();
      endBlock = currentBlock + 100;
      reserve = ethers.parseEther("1");
      const depositPct = 20;

      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        reserve,
        endBlock,
        depositPct
      );

      auctionId = 0;
    });

    it("Should allow valid bids", async function () {
      const minDeposit = (reserve * BigInt(20)) / BigInt(100); // 20% of reserve
      const ciphertext = ethers.toUtf8Bytes("encrypted_bid_data");
      const condition = ethers.toUtf8Bytes("decryption_condition");

      await expect(
        auctionHouse.connect(bidder1).commitBid(
          auctionId,
          ciphertext,
          condition,
          bidder1.address,
          { value: minDeposit }
        )
      ).to.emit(auctionHouse, "BidCommitted");

      expect(await auctionHouse.hasBid(auctionId, bidder1.address)).to.be.true;
      expect(await auctionHouse.getDeposit(auctionId, bidder1.address)).to.equal(minDeposit);
    });
  });

  describe("Auction Finalization", function () {
    let auctionId: number;
    let reserve: bigint;

    beforeEach(async function () {
      // Create auction
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100; // Longer auction for testing
      reserve = ethers.parseEther("1");
      const depositPct = 20;

      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        reserve,
        endBlock,
        depositPct
      );

      auctionId = 0;

      // Place bids
      const minDeposit = (reserve * BigInt(20)) / BigInt(100);
      const ciphertext = ethers.toUtf8Bytes("encrypted_bid_data");
      const condition = ethers.toUtf8Bytes("decryption_condition");

      await auctionHouse.connect(bidder1).commitBid(
        auctionId,
        ciphertext,
        condition,
        bidder1.address,
        { value: minDeposit }
      );

      await auctionHouse.connect(bidder2).commitBid(
        auctionId,
        ciphertext,
        condition,
        bidder2.address,
        { value: minDeposit }
      );

      // Wait for auction to end
      await ethers.provider.send("hardhat_mine", ["0x100"]); // Mine more blocks to ensure auction ends
    });

    it("Should decode bids manually for testing", async function () {
      const bid1Amount = ethers.parseEther("1.5");
      const bid2Amount = ethers.parseEther("2.0");

      await auctionHouse.decodeBid(auctionId, bidder1.address, bid1Amount);
      await auctionHouse.decodeBid(auctionId, bidder2.address, bid2Amount);

      expect(await auctionHouse.isBidDecoded(auctionId, bidder1.address)).to.be.true;
      expect(await auctionHouse.isBidDecoded(auctionId, bidder2.address)).to.be.true;
      expect(await auctionHouse.getDecodedBid(auctionId, bidder1.address)).to.equal(bid1Amount);
      expect(await auctionHouse.getDecodedBid(auctionId, bidder2.address)).to.equal(bid2Amount);
    });

    it("Should finalize auction with highest bidder", async function () {
      const bid1Amount = ethers.parseEther("1.5");
      const bid2Amount = ethers.parseEther("2.0");

      // Decode bids
      await auctionHouse.decodeBid(auctionId, bidder1.address, bid1Amount);
      await auctionHouse.decodeBid(auctionId, bidder2.address, bid2Amount);

      await expect(auctionHouse.finalize(auctionId))
        .to.emit(auctionHouse, "AuctionFinalized")
        .withArgs(auctionId, bidder2.address, bid2Amount);

      // Check auction state
      const auction = await auctionHouse.getAuction(auctionId);
      expect(auction.winner).to.equal(bidder2.address);
      expect(auction.winningBid).to.equal(bid2Amount);
      expect(auction.settled).to.be.true;

      // Check NFT transfer
      expect(await testNFT.ownerOf(0)).to.equal(bidder2.address);
    });
  });
});