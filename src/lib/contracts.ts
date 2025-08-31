import { ethers } from 'ethers';

// Contract ABIs (simplified for key functions)
export const AUCTION_HOUSE_ABI = [
  "function createAuction(address nft, uint256 tokenId, uint256 reserve, uint256 endBlock, uint256 depositPct) external",
  // commitBid(auctionId, ciphertext, condition, callbackGasLimit)
  "function commitBid(uint256 auctionId, bytes ciphertext, bytes condition, uint32 callbackGasLimit) external payable",
  "function decodeBid(uint256 auctionId, address bidder, uint256 amount) external",
  "function finalize(uint256 auctionId) external",
  "function getAuction(uint256 auctionId) external view returns (address nft, uint256 tokenId, uint256 reserve, uint256 endBlock, address seller, bool settled, address winner, uint256 winningBid, uint256 bidderCount)",
  "function getAuctionBids(uint256 auctionId) external view returns (address[] memory bidders, uint256[] memory deposits, uint256[] memory decodedBids, bool[] memory decoded)",
  "function getTaxCollected(uint256 auctionId) external view returns (uint256)",
  "function adminWallet() external view returns (address)",
  "function TAX_PERCENTAGE() external view returns (uint256)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function SELLER_ROLE() external view returns (bytes32)",
  
  // Events
  "event AuctionCreated(uint256 indexed auctionId, address indexed nft, uint256 indexed tokenId, address seller, uint256 reserve, uint256 endBlock)",
  "event BidCommitted(uint256 indexed auctionId, uint256 indexed bidIndex, address indexed bidder, bytes ciphertext, bytes condition, uint256 deposit)",
  "event BidRevealed(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 amount)",
  "event TaxCollected(uint256 indexed auctionId, address indexed bidder, uint256 taxAmount)"
];

export const TEST_NFT_ABI = [
  "function mint(address to, string memory uri) external returns (uint256)",
  "function approve(address to, uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)"
];

export const WINNER_SBT_ABI = [
  "function getTokenForAuction(uint256 auctionId) external view returns (uint256)",
  "function getAuctionId(uint256 tokenId) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

// Contract addresses (will be populated after deployment)
export interface ContractAddresses {
  auctionHouse: string;
  testNFT: string;
  winnerSBT: string;
  mockRandamuVRF: string;
}

// Default addresses for Base Sepolia deployment - use environment variables when available
export const LOCAL_CONTRACT_ADDRESSES: ContractAddresses = {
  auctionHouse: import.meta.env.VITE_AUCTION_HOUSE_ADDRESS || "0x6F8449Bb1E91970Ee39ECB3c71d7936e8e6d76Ba",
  testNFT: import.meta.env.VITE_TEST_NFT_ADDRESS || "0xb9e3daD67Fe425A382049Cb04720172F3F0A2c1a", 
  winnerSBT: import.meta.env.VITE_WINNER_SBT_ADDRESS || "0x12C2c5C8d2175Bc1dD80cD8A1b590C996B3f47d0",
  mockRandamuVRF: import.meta.env.VITE_MOCK_VRF_ADDRESS || "0x15F508eAE92bee6e8d27b61C4A129ECF094e9aa3"
};

// Contract instance helpers
export class ContractService {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private addresses: ContractAddresses;

  constructor(provider: ethers.Provider, addresses: ContractAddresses, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.addresses = addresses;
  }

  // Get contract instances
  getAuctionHouse() {
    return new ethers.Contract(
      this.addresses.auctionHouse,
      AUCTION_HOUSE_ABI,
      this.signer || this.provider
    );
  }

  getTestNFT() {
    return new ethers.Contract(
      this.addresses.testNFT,
      TEST_NFT_ABI,
      this.signer || this.provider
    );
  }

  getWinnerSBT() {
    return new ethers.Contract(
      this.addresses.winnerSBT,
      WINNER_SBT_ABI,
      this.signer || this.provider
    );
  }

  // Auction Management Functions
  async createAuction(
    nftAddress: string,
    tokenId: number,
    reservePrice: string, // in ETH
    duration: number, // in blocks
    depositPercentage: number = 10 // 10% default
  ) {
    const auctionHouse = this.getAuctionHouse();
    const reserveWei = ethers.parseEther(reservePrice);
    const currentBlock = await this.provider.getBlockNumber();
    const endBlock = currentBlock + duration;

    return await auctionHouse.createAuction(
      nftAddress,
      tokenId,
      reserveWei,
      endBlock,
      depositPercentage * 100 // Convert to basis points
    );
  }

  async commitBid(
    auctionId: number,
    encryptedBid: string,
    condition: string,
    depositAmount: string, // in ETH
    callbackGasLimit: number = 200000
  ) {
    const auctionHouse = this.getAuctionHouse();
    const depositWei = ethers.parseEther(depositAmount);

    return await auctionHouse.commitBid(
      auctionId,
      encryptedBid,
      condition,
      callbackGasLimit,
      { value: depositWei }
    );
  }

  async decodeBid(auctionId: number, bidder: string, amount: string) {
    const auctionHouse = this.getAuctionHouse();
    const amountWei = ethers.parseEther(amount);

    return await auctionHouse.decodeBid(auctionId, bidder, amountWei);
  }

  async finalizeAuction(auctionId: number) {
    const auctionHouse = this.getAuctionHouse();
    return await auctionHouse.finalize(auctionId);
  }

  // View Functions
  async getAuction(auctionId: number) {
    const auctionHouse = this.getAuctionHouse();
    const result = await auctionHouse.getAuction(auctionId);
    
    return {
      nft: result[0],
      tokenId: result[1].toString(),
      reserve: ethers.formatEther(result[2]),
      endBlock: result[3].toString(),
      seller: result[4],
      settled: result[5],
      winner: result[6],
      winningBid: ethers.formatEther(result[7]),
      bidderCount: result[8].toString()
    };
  }

  async getAuctionBids(auctionId: number) {
    const auctionHouse = this.getAuctionHouse();
    const result = await auctionHouse.getAuctionBids(auctionId);
    
    return {
      bidders: result[0],
      deposits: result[1].map((d: any) => ethers.formatEther(d)),
      decodedBids: result[2].map((b: any) => ethers.formatEther(b)),
      decoded: result[3]
    };
  }

  async getTaxCollected(auctionId: number) {
    const auctionHouse = this.getAuctionHouse();
    const result = await auctionHouse.getTaxCollected(auctionId);
    return ethers.formatEther(result);
  }

  async getAdminWallet() {
    const auctionHouse = this.getAuctionHouse();
    return await auctionHouse.adminWallet();
  }

  async isAdmin(address: string) {
    const auctionHouse = this.getAuctionHouse();
    const adminRole = await auctionHouse.ADMIN_ROLE();
    return await auctionHouse.hasRole(adminRole, address);
  }

  async isSeller(address: string) {
    const auctionHouse = this.getAuctionHouse();
    const sellerRole = await auctionHouse.SELLER_ROLE();
    return await auctionHouse.hasRole(sellerRole, address);
  }

  // NFT Functions
  async mintTestNFT(to: string, uri: string) {
    const testNFT = this.getTestNFT();
    return await testNFT.mint(to, uri);
  }

  async approveNFT(nftAddress: string, tokenId: number, spender: string) {
    const nftContract = new ethers.Contract(
      nftAddress,
      TEST_NFT_ABI,
      this.signer || this.provider
    );
    return await nftContract.approve(spender, tokenId);
  }

  // Utility Functions
  async getCurrentBlock() {
    return await this.provider.getBlockNumber();
  }

  async getBlocksUntilEnd(endBlock: number) {
    const currentBlock = await this.getCurrentBlock();
    return Math.max(0, endBlock - currentBlock);
  }

  async estimateTimeUntilBlock(targetBlock: number) {
    const currentBlock = await this.getCurrentBlock();
    const blocksRemaining = targetBlock - currentBlock;
    const avgBlockTime = 12; // seconds (Ethereum average)
    return blocksRemaining * avgBlockTime;
  }
}

// Helper function to encrypt bid data (placeholder for Blocklock integration)
export async function encryptBid(
  auctionId: number,
  bidAmount: string,
  bidder: string,
  endBlock: number
): Promise<{ ciphertext: string; condition: string }> {
  // This is a placeholder implementation
  // In real implementation, this would use Blocklock to encrypt the bid
  const bidData = {
    auctionId,
    bidAmount,
    bidder,
    timestamp: Date.now(),
    chainId: 84532 // Base Sepolia
  };

  // For now, we'll just encode the data as a simple string
  // TODO: Implement actual Blocklock encryption
  const ciphertext = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(bidData)));
  const condition = ethers.hexlify(ethers.toUtf8Bytes(`endBlock:${endBlock}`));

  return { ciphertext, condition };
}

// Tax calculation helper
export function calculateTaxAmount(depositAmount: string, taxPercentage: number = 20): string {
  const deposit = parseFloat(depositAmount);
  const tax = (deposit * taxPercentage) / 100;
  return tax.toFixed(6);
}

export function calculateRefundAfterTax(depositAmount: string, taxPercentage: number = 20): string {
  const deposit = parseFloat(depositAmount);
  const tax = (deposit * taxPercentage) / 100;
  const refund = deposit - tax;
  return refund.toFixed(6);
}
