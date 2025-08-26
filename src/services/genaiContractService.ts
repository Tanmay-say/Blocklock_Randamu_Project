import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';

// Contract ABIs (simplified for key functions)
const GENAI_NFT_ABI = [
  "function mintGenAINFT(address to, string memory prompt, string memory imageHash, string memory style, string memory size, uint256 vrfSeed) external payable returns (uint256)",
  "function getGenAIMetadata(uint256 tokenId) external view returns (tuple(string prompt, string imageHash, string style, string size, uint256 generatedAt, uint256 vrfSeed, address generator, bool isSoulBound))",
  "function totalSupply() external view returns (uint256)",
  "function BASE_MINT_PRICE() external view returns (uint256)",
  "function imageExists(string memory imageHash) external view returns (bool)",
  "function vrfSeedUsed(uint256 vrfSeed) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)"
];

const GENAI_SUBSCRIPTION_ABI = [
  "function purchaseMonthlySubscription() external payable",
  "function purchaseAnnualSubscription() external payable",
  "function recordImageGeneration(address user, string memory imageHash, string memory prompt) external returns (uint256)",
  "function markImageAsMinted(address user, uint256 imageIndex) external",
  "function getUserSubscription(address user) external view returns (tuple(uint8 subType, uint256 expiryTime, uint256 dailyUsed, uint256 lastUsageDay, bool active))",
  "function getUserDailyInfo(address user) external view returns (uint256 used, uint256 limit, bool canGenerate)",
  "function getUserActiveImages(address user) external view returns (tuple(string imageHash, string prompt, uint256 createdAt, uint256 blocklockRequestId, bool isMinted, bool isDeleted)[])",
  "function MONTHLY_PRICE() external view returns (uint256)",
  "function ANNUAL_PRICE() external view returns (uint256)",
  "function FREE_DAILY_LIMIT() external view returns (uint256)",
  "function PREMIUM_DAILY_LIMIT() external view returns (uint256)"
];

const GENAI_STORAGE_ABI = [
  "function storeImageWithVRF(string memory imageHash, string memory prompt, string memory style, string memory size, address generator, uint256 vrfSeed) external returns (uint256)",
  "function getImage(string memory imageHash) external view returns (tuple(string imageHash, string prompt, string style, string size, address generator, uint256 createdAt, uint256 vrfSeed, bool isUnique, bool isDeleted, bytes32 uniquenessProof))",
  "function getUserActiveImages(address user) external view returns (tuple(string imageHash, string prompt, string style, string size, address generator, uint256 createdAt, uint256 vrfSeed, bool isUnique, bool isDeleted, bytes32 uniquenessProof)[])",
  "function isImageUnique(string memory imageHash) external view returns (bool)",
  "function generateUniquenessScore(string memory imageHash, uint256 vrfSeed) external view returns (uint256)"
];

export interface UserSubscription {
  subType: number; // 0: FREE, 1: MONTHLY, 2: ANNUAL
  expiryTime: number;
  dailyUsed: number;
  lastUsageDay: number;
  active: boolean;
}

export interface UserDailyInfo {
  used: number;
  limit: number;
  canGenerate: boolean;
}

export interface StoredImage {
  imageHash: string;
  prompt: string;
  style: string;
  size: string;
  generator: string;
  createdAt: number;
  vrfSeed: number;
  isUnique: boolean;
  isDeleted: boolean;
  uniquenessProof: string;
}

export interface SubscriptionImage {
  imageHash: string;
  prompt: string;
  createdAt: number;
  blocklockRequestId: number;
  isMinted: boolean;
  isDeleted: boolean;
}

export interface NFTMetadata {
  prompt: string;
  imageHash: string;
  style: string;
  size: string;
  generatedAt: number;
  vrfSeed: number;
  generator: string;
  isSoulBound: boolean;
}

class GenAIContractService {
  private nftContract: ethers.Contract | null = null;
  private subscriptionContract: ethers.Contract | null = null;
  private storageContract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  // Contract addresses (will be set from environment)
  private addresses = {
    nft: import.meta.env.VITE_GENAI_NFT_ADDRESS || '',
    subscription: import.meta.env.VITE_GENAI_SUBSCRIPTION_ADDRESS || '',
    storage: import.meta.env.VITE_GENAI_STORAGE_ADDRESS || ''
  };

  /**
   * Initialize contracts with signer
   */
  public async initialize(signer: ethers.Signer): Promise<void> {
    this.signer = signer;

    if (this.addresses.nft) {
      this.nftContract = new ethers.Contract(this.addresses.nft, GENAI_NFT_ABI, signer);
    }

    if (this.addresses.subscription) {
      this.subscriptionContract = new ethers.Contract(this.addresses.subscription, GENAI_SUBSCRIPTION_ABI, signer);
    }

    if (this.addresses.storage) {
      this.storageContract = new ethers.Contract(this.addresses.storage, GENAI_STORAGE_ABI, signer);
    }
  }

  /**
   * Set contract addresses manually
   */
  public setAddresses(addresses: { nft: string; subscription: string; storage: string }): void {
    this.addresses = addresses;
    
    if (this.signer) {
      this.initialize(this.signer);
    }
  }

  /**
   * Check if contracts are initialized
   */
  public isInitialized(): boolean {
    return this.nftContract !== null && this.subscriptionContract !== null && this.storageContract !== null;
  }

  // ===========================================
  // SUBSCRIPTION FUNCTIONS
  // ===========================================

  /**
   * Get subscription pricing
   */
  public async getSubscriptionPricing(): Promise<{ monthly: string; annual: string; mintPrice: string }> {
    if (!this.subscriptionContract || !this.nftContract) {
      throw new Error('Contracts not initialized');
    }

    const [monthlyPrice, annualPrice, mintPrice] = await Promise.all([
      this.subscriptionContract.MONTHLY_PRICE(),
      this.subscriptionContract.ANNUAL_PRICE(),
      this.nftContract.BASE_MINT_PRICE()
    ]);

    return {
      monthly: ethers.formatEther(monthlyPrice),
      annual: ethers.formatEther(annualPrice),
      mintPrice: ethers.formatEther(mintPrice)
    };
  }

  /**
   * Purchase monthly subscription
   */
  public async purchaseMonthlySubscription(): Promise<ethers.TransactionResponse> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }

    const monthlyPrice = await this.subscriptionContract.MONTHLY_PRICE();
    return await this.subscriptionContract.purchaseMonthlySubscription({ value: monthlyPrice });
  }

  /**
   * Purchase annual subscription
   */
  public async purchaseAnnualSubscription(): Promise<ethers.TransactionResponse> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }

    const annualPrice = await this.subscriptionContract.ANNUAL_PRICE();
    return await this.subscriptionContract.purchaseAnnualSubscription({ value: annualPrice });
  }

  /**
   * Record an image generation for a user (affects daily limits)
   */
  public async recordImageGeneration(userAddress: string, imageHash: string, prompt: string): Promise<ethers.TransactionResponse> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }
    return await this.subscriptionContract.recordImageGeneration(userAddress, imageHash, prompt);
  }

  /**
   * Store image metadata with VRF in storage contract
   */
  public async storeImageWithVRF(
    imageHash: string,
    prompt: string,
    style: string,
    size: string,
    generator: string,
    vrfSeed: number
  ): Promise<ethers.TransactionResponse> {
    if (!this.storageContract) {
      throw new Error('Storage contract not initialized');
    }
    return await this.storageContract.storeImageWithVRF(imageHash, prompt, style, size, generator, vrfSeed);
  }

  /**
   * Get user subscription info
   */
  public async getUserSubscription(userAddress: string): Promise<UserSubscription> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }

    const sub = await this.subscriptionContract.getUserSubscription(userAddress);
    return {
      subType: Number(sub.subType),
      expiryTime: Number(sub.expiryTime),
      dailyUsed: Number(sub.dailyUsed),
      lastUsageDay: Number(sub.lastUsageDay),
      active: sub.active
    };
  }

  /**
   * Get user daily usage info
   */
  public async getUserDailyInfo(userAddress: string): Promise<UserDailyInfo> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }

    const info = await this.subscriptionContract.getUserDailyInfo(userAddress);
    return {
      used: Number(info.used),
      limit: Number(info.limit),
      canGenerate: info.canGenerate
    };
  }

  /**
   * Get user's subscription images
   */
  public async getUserSubscriptionImages(userAddress: string): Promise<SubscriptionImage[]> {
    if (!this.subscriptionContract) {
      throw new Error('Subscription contract not initialized');
    }

    const images = await this.subscriptionContract.getUserActiveImages(userAddress);
    return images.map((img: any) => ({
      imageHash: img.imageHash,
      prompt: img.prompt,
      createdAt: Number(img.createdAt),
      blocklockRequestId: Number(img.blocklockRequestId),
      isMinted: img.isMinted,
      isDeleted: img.isDeleted
    }));
  }

  // ===========================================
  // IMAGE STORAGE FUNCTIONS
  // ===========================================

  /**
   * Get stored image metadata
   */
  public async getStoredImage(imageHash: string): Promise<StoredImage> {
    if (!this.storageContract) {
      throw new Error('Storage contract not initialized');
    }

    const img = await this.storageContract.getImage(imageHash);
    return {
      imageHash: img.imageHash,
      prompt: img.prompt,
      style: img.style,
      size: img.size,
      generator: img.generator,
      createdAt: Number(img.createdAt),
      vrfSeed: Number(img.vrfSeed),
      isUnique: img.isUnique,
      isDeleted: img.isDeleted,
      uniquenessProof: img.uniquenessProof
    };
  }

  /**
   * Get user's stored images
   */
  public async getUserStoredImages(userAddress: string): Promise<StoredImage[]> {
    if (!this.storageContract) {
      throw new Error('Storage contract not initialized');
    }

    const images = await this.storageContract.getUserActiveImages(userAddress);
    return images.map((img: any) => ({
      imageHash: img.imageHash,
      prompt: img.prompt,
      style: img.style,
      size: img.size,
      generator: img.generator,
      createdAt: Number(img.createdAt),
      vrfSeed: Number(img.vrfSeed),
      isUnique: img.isUnique,
      isDeleted: img.isDeleted,
      uniquenessProof: img.uniquenessProof
    }));
  }

  /**
   * Check if image is unique
   */
  public async isImageUnique(imageHash: string): Promise<boolean> {
    if (!this.storageContract) {
      throw new Error('Storage contract not initialized');
    }

    return await this.storageContract.isImageUnique(imageHash);
  }

  /**
   * Generate uniqueness score
   */
  public async generateUniquenessScore(imageHash: string, vrfSeed: number): Promise<number> {
    if (!this.storageContract) {
      throw new Error('Storage contract not initialized');
    }

    const score = await this.storageContract.generateUniquenessScore(imageHash, vrfSeed);
    return Number(score);
  }

  // ===========================================
  // NFT FUNCTIONS
  // ===========================================

  /**
   * Mint GenAI NFT
   */
  public async mintGenAINFT(
    to: string,
    prompt: string,
    imageHash: string,
    style: string,
    size: string,
    vrfSeed: number
  ): Promise<ethers.TransactionResponse> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    const mintPrice = await this.nftContract.BASE_MINT_PRICE();
    
    return await this.nftContract.mintGenAINFT(
      to,
      prompt,
      imageHash,
      style,
      size,
      vrfSeed,
      { value: mintPrice }
    );
  }

  /**
   * Get base mint price from contract
   */
  public async getBaseMintPrice(): Promise<string> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }
    const mintPrice = await this.nftContract.BASE_MINT_PRICE();
    return ethers.formatEther(mintPrice);
  }

  /**
   * Mint with a custom price value provided by user (in ETH)
   */
  public async mintGenAINFTWithPrice(
    to: string,
    prompt: string,
    imageHash: string,
    style: string,
    size: string,
    vrfSeed: number,
    priceInEth: string
  ): Promise<ethers.TransactionResponse> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }
    const value = ethers.parseEther(priceInEth);
    return await this.nftContract.mintGenAINFT(
      to,
      prompt,
      imageHash,
      style,
      size,
      vrfSeed,
      { value }
    );
  }

  /**
   * Get NFT metadata
   */
  public async getNFTMetadata(tokenId: number): Promise<NFTMetadata> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    const metadata = await this.nftContract.getGenAIMetadata(tokenId);
    return {
      prompt: metadata.prompt,
      imageHash: metadata.imageHash,
      style: metadata.style,
      size: metadata.size,
      generatedAt: Number(metadata.generatedAt),
      vrfSeed: Number(metadata.vrfSeed),
      generator: metadata.generator,
      isSoulBound: metadata.isSoulBound
    };
  }

  /**
   * Get total NFT supply
   */
  public async getTotalSupply(): Promise<number> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    const supply = await this.nftContract.totalSupply();
    return Number(supply);
  }

  /**
   * Check if image hash exists in NFT contract
   */
  public async nftImageExists(imageHash: string): Promise<boolean> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    return await this.nftContract.imageExists(imageHash);
  }

  /**
   * Check if VRF seed is used in NFT contract
   */
  public async nftVRFSeedUsed(vrfSeed: number): Promise<boolean> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    return await this.nftContract.vrfSeedUsed(vrfSeed);
  }

  /**
   * Get NFT token URI
   */
  public async getTokenURI(tokenId: number): Promise<string> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    return await this.nftContract.tokenURI(tokenId);
  }

  /**
   * Get NFT owner
   */
  public async getNFTOwner(tokenId: number): Promise<string> {
    if (!this.nftContract) {
      throw new Error('NFT contract not initialized');
    }

    return await this.nftContract.ownerOf(tokenId);
  }

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  /**
   * Get user's complete GenAI profile
   */
  public async getUserProfile(userAddress: string): Promise<{
    subscription: UserSubscription;
    dailyInfo: UserDailyInfo;
    subscriptionImages: SubscriptionImage[];
    storedImages: StoredImage[];
    pricing: { monthly: string; annual: string; mintPrice: string };
  }> {
    const [subscription, dailyInfo, subscriptionImages, storedImages, pricing] = await Promise.all([
      this.getUserSubscription(userAddress),
      this.getUserDailyInfo(userAddress),
      this.getUserSubscriptionImages(userAddress),
      this.getUserStoredImages(userAddress),
      this.getSubscriptionPricing()
    ]);

    return {
      subscription,
      dailyInfo,
      subscriptionImages,
      storedImages,
      pricing
    };
  }

  /**
   * Check if user can generate images
   */
  public async canUserGenerate(userAddress: string): Promise<boolean> {
    const dailyInfo = await this.getUserDailyInfo(userAddress);
    return dailyInfo.canGenerate;
  }

  /**
   * Get subscription type name
   */
  public getSubscriptionTypeName(subType: number): string {
    switch (subType) {
      case 0: return 'Free';
      case 1: return 'Monthly';
      case 2: return 'Annual';
      default: return 'Unknown';
    }
  }

  /**
   * Format timestamp to readable date
   */
  public formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  /**
   * Check if subscription is active
   */
  public isSubscriptionActive(subscription: UserSubscription): boolean {
    return subscription.active && subscription.expiryTime > Math.floor(Date.now() / 1000);
  }

  /**
   * Get time until subscription expiry
   */
  public getTimeUntilExpiry(expiryTime: number): string {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiryTime - now;

    if (timeLeft <= 0) {
      return 'Expired';
    }

    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);

    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else {
      return `${hours} hours`;
    }
  }
}

// Export singleton instance
export const genaiContractService = new GenAIContractService();
