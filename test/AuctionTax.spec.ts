import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

const { ethers } = hre;

describe("AuctionHouse Tax System", function () {
  async function deployAuctionFixture() {
    // Get signers
    const [owner, seller, bidder1, bidder2, bidder3, adminWallet] = await ethers.getSigners();

    // Deploy TestNFT
    const TestNFT = await ethers.getContractFactory("TestNFT");
    const testNFT = await TestNFT.deploy();
    await testNFT.waitForDeployment();

    // Deploy WinnerSBT
    const WinnerSBT = await ethers.getContractFactory("WinnerSBT");
    const winnerSBT = await WinnerSBT.deploy();
    await winnerSBT.waitForDeployment();

    // Deploy MockRandamuVRF
    const MockRandamuVRF = await ethers.getContractFactory("MockRandamuVRF");
    const mockRandamuVRF = await MockRandamuVRF.deploy();
    await mockRandamuVRF.waitForDeployment();

    // Deploy AuctionHouse
    const AuctionHouse = await ethers.getContractFactory("AuctionHouse");
    const auctionHouse = await AuctionHouse.deploy(
      await winnerSBT.getAddress(),
      await mockRandamuVRF.getAddress(),
      adminWallet.address
    );
    await auctionHouse.waitForDeployment();

    // Grant roles
    const minterRole = await winnerSBT.MINTER_ROLE();
    await winnerSBT.grantRole(minterRole, await auctionHouse.getAddress());

    const sellerRole = await auctionHouse.SELLER_ROLE();
    await auctionHouse.grantRole(sellerRole, seller.address);

    // Mint a test NFT
    await testNFT.mint(seller.address, "https://example.com/nft/1");
    await testNFT.connect(seller).approve(await auctionHouse.getAddress(), 0);

    return {
      auctionHouse,
      testNFT,
      winnerSBT,
      owner,
      seller,
      bidder1,
      bidder2,
      bidder3,
      adminWallet
    };
  }

  describe("Auction Creation and Bidding", function () {
    it("Should create an auction successfully", async function () {
      const { auctionHouse, testNFT, seller } = await loadFixture(deployAuctionFixture);

      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100;
      const reservePrice = ethers.parseEther("1.0");
      const depositPct = 10; // 10%

      await expect(
        auctionHouse.connect(seller).createAuction(
          await testNFT.getAddress(),
          0,
          reservePrice,
          endBlock,
          depositPct
        )
      ).to.emit(auctionHouse, "AuctionCreated");

      // Check auction details
      const auction = await auctionHouse.getAuction(0);
      expect(auction.nft).to.equal(await testNFT.getAddress());
      expect(auction.tokenId).to.equal(0);
      expect(auction.reserve).to.equal(reservePrice);
      expect(auction.endBlock).to.equal(endBlock);
      expect(auction.seller).to.equal(seller.address);
      expect(auction.settled).to.be.false;
    });

    it("Should allow multiple bidders to commit bids", async function () {
      const { auctionHouse, testNFT, seller, bidder1, bidder2, bidder3 } = await loadFixture(deployAuctionFixture);

      // Create auction
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100;
      const reservePrice = ethers.parseEther("1.0");
      
      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        reservePrice,
        endBlock,
        10 // 10%
      );

      // Commit bids (using deposits instead of actual encrypted bids for testing)
      const deposit1 = ethers.parseEther("0.1"); // 10% of 1 ETH
      const deposit2 = ethers.parseEther("0.15"); // 10% of 1.5 ETH  
      const deposit3 = ethers.parseEther("0.2"); // 10% of 2 ETH

      const ciphertext = "0x1234567890abcdef";
      const condition = "0xfedcba0987654321";

      await expect(
        auctionHouse.connect(bidder1).commitBid(0, ciphertext, condition, ethers.ZeroAddress, {
          value: deposit1
        })
      ).to.emit(auctionHouse, "BidCommitted");

      await expect(
        auctionHouse.connect(bidder2).commitBid(0, ciphertext, condition, ethers.ZeroAddress, {
          value: deposit2
        })
      ).to.emit(auctionHouse, "BidCommitted");

      await expect(
        auctionHouse.connect(bidder3).commitBid(0, ciphertext, condition, ethers.ZeroAddress, {
          value: deposit3
        })
      ).to.emit(auctionHouse, "BidCommitted");

      // Check bid count
      expect(await auctionHouse.getBidderCount(0)).to.equal(3);
    });

    it("Should prevent double bidding", async function () {
      const { auctionHouse, testNFT, seller, bidder1 } = await loadFixture(deployAuctionFixture);

      // Create auction
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 100;
      
      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        ethers.parseEther("1.0"),
        endBlock,
        10
      );

      // First bid
      await auctionHouse.connect(bidder1).commitBid(
        0,
        "0x1234567890abcdef",
        "0xfedcba0987654321",
        ethers.ZeroAddress,
        { value: ethers.parseEther("0.1") }
      );

      // Second bid should fail
      await expect(
        auctionHouse.connect(bidder1).commitBid(
          0,
          "0x1234567890abcdef",
          "0xfedcba0987654321",
          ethers.ZeroAddress,
          { value: ethers.parseEther("0.1") }
        )
      ).to.be.revertedWith("Already bid");
    });
  });

  describe("Bid Decoding and Finalization", function () {
    it("Should decode bids and finalize auction with tax system", async function () {
      const { auctionHouse, testNFT, seller, bidder1, bidder2, bidder3, adminWallet, owner } = await loadFixture(deployAuctionFixture);

      // Create auction
      const currentBlock = await ethers.provider.getBlockNumber();
      const endBlock = currentBlock + 5; // Short auction for testing
      
      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        ethers.parseEther("1.0"),
        endBlock,
        10
      );

      // Commit bids - Note: In real implementation, users would send the full bid amount
      // For this test, we'll send the actual bid amounts as deposits to simulate the funds being available
      const bid1 = ethers.parseEther("1.0");
      const bid2 = ethers.parseEther("1.5");
      const bid3 = ethers.parseEther("2.0");

      await auctionHouse.connect(bidder1).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, { value: bid1 });
      await auctionHouse.connect(bidder2).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, { value: bid2 });
      await auctionHouse.connect(bidder3).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, { value: bid3 });

      // Wait for auction to end
      await mine(10);

      // Decode bids (simulating Blocklock decryption)
      await auctionHouse.connect(owner).decodeBid(0, bidder1.address, bid1);
      await auctionHouse.connect(owner).decodeBid(0, bidder2.address, bid2);
      await auctionHouse.connect(owner).decodeBid(0, bidder3.address, bid3); // Winner

      // Get initial balances
      const bidder1InitialBalance = await ethers.provider.getBalance(bidder1.address);
      const bidder2InitialBalance = await ethers.provider.getBalance(bidder2.address);
      const bidder3InitialBalance = await ethers.provider.getBalance(bidder3.address);
      const adminInitialBalance = await ethers.provider.getBalance(adminWallet.address);

      // Finalize auction
      await expect(auctionHouse.connect(owner).finalize(0))
        .to.emit(auctionHouse, "AuctionFinalized")
        .withArgs(0, bidder3.address, ethers.parseEther("2.0"));

      // Check auction is settled
      const auction = await auctionHouse.getAuction(0);
      expect(auction.settled).to.be.true;
      expect(auction.winner).to.equal(bidder3.address);
      expect(auction.winningBid).to.equal(ethers.parseEther("2.0"));

      // Check NFT transferred to winner
      expect(await testNFT.ownerOf(0)).to.equal(bidder3.address);

      // Check tax collection (20% of losing bids)
      const expectedTax1 = (bid1 * 2000n) / 10000n; // 20% of 1.0 ETH
      const expectedTax2 = (bid2 * 2000n) / 10000n; // 20% of 1.5 ETH
      const expectedRefund1 = bid1 - expectedTax1;
      const expectedRefund2 = bid2 - expectedTax2;

      // Check refunds (losing bidders get 80% back)
      const bidder1FinalBalance = await ethers.provider.getBalance(bidder1.address);
      const bidder2FinalBalance = await ethers.provider.getBalance(bidder2.address);
      const adminFinalBalance = await ethers.provider.getBalance(adminWallet.address);

      // Bidders should receive refunds minus tax
      expect(bidder1FinalBalance).to.be.closeTo(bidder1InitialBalance + expectedRefund1, ethers.parseEther("0.001"));
      expect(bidder2FinalBalance).to.be.closeTo(bidder2InitialBalance + expectedRefund2, ethers.parseEther("0.001"));

      // Admin should receive winning bid + taxes
      const expectedAdminIncrease = bid3 + expectedTax1 + expectedTax2;
      expect(adminFinalBalance).to.be.closeTo(adminInitialBalance + expectedAdminIncrease, ethers.parseEther("0.001"));

      // Check tax collected tracking
      const taxCollected = await auctionHouse.getTaxCollected(0);
      expect(taxCollected).to.equal(expectedTax1 + expectedTax2);
    });

    it("Should mint winner SBT to auction winner", async function () {
      const { auctionHouse, testNFT, winnerSBT, seller, bidder1, owner } = await loadFixture(deployAuctionFixture);

      // Create and run auction
      const currentBlock = await ethers.provider.getBlockNumber();
      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        ethers.parseEther("1.0"),
        currentBlock + 5,
        10
      );

      const bidAmount = ethers.parseEther("1.0");
      await auctionHouse.connect(bidder1).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, {
        value: bidAmount
      });

      await mine(10);
      await auctionHouse.connect(owner).decodeBid(0, bidder1.address, bidAmount);
      await auctionHouse.connect(owner).finalize(0);

      // Check SBT was minted
      const tokenId = await winnerSBT.getTokenForAuction(0);
      expect(await winnerSBT.ownerOf(tokenId)).to.equal(bidder1.address);
      expect(await winnerSBT.getAuctionId(tokenId)).to.equal(0);
      expect(await winnerSBT.locked(tokenId)).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to update admin wallet", async function () {
      const { auctionHouse, owner, bidder1 } = await loadFixture(deployAuctionFixture);

      await expect(auctionHouse.connect(owner).updateAdminWallet(bidder1.address))
        .to.emit(auctionHouse, "AdminWalletUpdated");

      expect(await auctionHouse.adminWallet()).to.equal(bidder1.address);
    });

    it("Should return correct tax percentage", async function () {
      const { auctionHouse } = await loadFixture(deployAuctionFixture);

      expect(await auctionHouse.TAX_PERCENTAGE()).to.equal(2000); // 20%
    });

    it("Should provide detailed auction bid information", async function () {
      const { auctionHouse, testNFT, seller, bidder1, bidder2, owner } = await loadFixture(deployAuctionFixture);

      // Create auction and add bids
      const currentBlock = await ethers.provider.getBlockNumber();
      await auctionHouse.connect(seller).createAuction(
        await testNFT.getAddress(),
        0,
        ethers.parseEther("1.0"),
        currentBlock + 5,
        10
      );

      await auctionHouse.connect(bidder1).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, {
        value: ethers.parseEther("0.1")
      });
      await auctionHouse.connect(bidder2).commitBid(0, "0x1234", "0xabcd", ethers.ZeroAddress, {
        value: ethers.parseEther("0.15")
      });

      await mine(10);
      await auctionHouse.connect(owner).decodeBid(0, bidder1.address, ethers.parseEther("1.0"));

      const bids = await auctionHouse.getAuctionBids(0);
      expect(bids.bidders.length).to.equal(2);
      expect(bids.bidders[0]).to.equal(bidder1.address);
      expect(bids.bidders[1]).to.equal(bidder2.address);
      expect(bids.decoded[0]).to.be.true;
      expect(bids.decoded[1]).to.be.false;
    });
  });
});
