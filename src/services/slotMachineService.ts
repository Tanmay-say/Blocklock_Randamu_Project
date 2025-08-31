import { ethers } from 'ethers';

// SlotMachine contract ABI (updated for new game mechanics)
const SLOT_MACHINE_ABI = [
  "function stakeForPlays() external payable",
  "function playGame() external",
  "function claimLimitedEditionNFT() external",
  "function getCurrentRound() external view returns (uint256 roundId, uint256 playerCount, bool isActive, uint256 startTime, uint256 endTime)",
  "function getPlayerSession(address player) external view returns (uint256 playsRemaining, uint256 totalWins, uint256 sessionId, bool isActive)",
  "function getPlayerStats(address player) external view returns (uint256 totalGames, uint256 totalWins, uint256 totalWinnings, uint256 limitedEditionWins, bool hasLimitedEdition)",
  "function getNFTMetadata(uint256 tokenId) external view returns (string memory name, string memory description, string memory imageURI, uint256 vrfSeed, bool isSoulBound, address owner, bool isLimitedEdition)",
  "function getRoundPlayers(uint256 roundId) external view returns (address[] memory)",
  "function STAKE_AMOUNT() external view returns (uint256)",
  "function MAX_PLAYERS_PER_ROUND() external view returns (uint256)",
  "function WIN_PERCENTAGE() external view returns (uint256)",
  "function PLAYS_PER_STAKE() external view returns (uint256)",
  "function adminWallet() external view returns (address)",
  "event PlayerStaked(uint256 indexed roundId, address indexed player, uint256 sessionId)",
  "event GamePlayed(address indexed player, uint256 sessionId, uint256 playsRemaining)",
  "event GameResult(address indexed player, bool won, uint256 amount, uint256 nftTokenId, uint256 vrfSeed)",
  "event NFTMinted(address indexed player, uint256 indexed tokenId, string name, bool isLimitedEdition)",
  "event LimitedEditionClaimed(address indexed player, uint256 indexed tokenId)"
];

export interface CurrentRound {
  roundId: number;
  playerCount: number;
  isActive: boolean;
  startTime: number;
  endTime: number;
}

export interface PlayerSession {
  playsRemaining: number;
  totalWins: number;
  sessionId: number;
  isActive: boolean;
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalWinnings: number;
  limitedEditionWins: number;
  hasLimitedEdition: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  imageURI: string;
  vrfSeed: number;
  isSoulBound: boolean;
  owner: string;
  isLimitedEdition: boolean;
}

export interface GameResult {
  player: string;
  won: boolean;
  amount: number;
  nftTokenId: number;
  vrfSeed: number;
}

export class SlotMachineService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contractAddress: string = '';

  constructor(contractAddress?: string) {
    if (contractAddress) {
      this.contractAddress = contractAddress;
    } else {
      this.contractAddress = import.meta.env.VITE_SLOT_MACHINE_ADDRESS || '0x9568cd176Eb3B5912e1e5c70bdc768C6e744D42b';
    }
  }

  async initialize(provider: ethers.BrowserProvider) {
    try {
      this.provider = provider;
      this.signer = await provider.getSigner();
      
      if (!this.contractAddress) {
        throw new Error('SlotMachine contract address not configured');
      }

      // Check network - Base Sepolia support
      const network = await provider.getNetwork();
      console.log('🌐 Network detected:', {
        name: network.name,
        chainId: network.chainId.toString(),
        isBaseSepolia: network.chainId === 84532n
      });
      
      const allowedChainIds = [84532n, 1337n, 31337n]; // Base Sepolia, Localhost
      
      if (!allowedChainIds.includes(network.chainId)) {
        throw new Error(`❌ Unsupported network. Please switch to Base Sepolia (84532). Currently on Chain ID: ${network.chainId}`);
      }
      
      console.log('✅ Network check passed - proceeding with contract initialization');

      this.contract = new ethers.Contract(
        this.contractAddress,
        SLOT_MACHINE_ABI,
        this.signer
      );

      // Test contract connection with detailed logging
      console.log('🔗 Testing contract connection at:', this.contractAddress);
      try {
        const stakeAmount = await this.contract.STAKE_AMOUNT();
        const maxPlayers = await this.contract.MAX_PLAYERS_PER_ROUND();
        const winPercentage = await this.contract.WIN_PERCENTAGE();
        
        console.log('✅ SlotMachine contract connected successfully!');
        console.log('📊 Contract Config:', {
          stakeAmount: ethers.formatEther(stakeAmount),
          maxPlayers: maxPlayers.toString(),
          winPercentage: winPercentage.toString()
        });
      } catch (contractError: any) {
        console.error('❌ Contract connection failed:', {
          address: this.contractAddress,
          error: contractError.message,
          code: contractError.code
        });
        
        if (contractError.code === 'CALL_EXCEPTION') {
          throw new Error(`Contract not deployed at ${this.contractAddress}. Please verify deployment on Base Sepolia.`);
        } else {
          throw new Error(`Contract connection failed: ${contractError.message}`);
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize SlotMachine service:', error);
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.contract || !this.signer || !this.provider) {
      throw new Error('SlotMachine service not initialized. Call initialize() first.');
    }
  }

  // NEW GAME MECHANICS: Stake once for 10 plays
  async stakeForPlays(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    
    try {
      const stakeAmount = await this.contract!.STAKE_AMOUNT();
      const userBalance = await this.provider!.getBalance(await this.signer!.getAddress());
      
      console.log('💰 Staking for 10 plays...');
      console.log('Stake amount required:', ethers.formatEther(stakeAmount), 'ETH');
      console.log('User balance:', ethers.formatEther(userBalance), 'ETH');
      
      if (userBalance < stakeAmount) {
        throw new Error('Insufficient ETH balance for stake');
      }
      
      // Check current round
      const currentRound = await this.getCurrentRound();
      if (!currentRound.isActive) {
        throw new Error('Round is not active');
      }
      
      if (currentRound.playerCount >= 10) {
        throw new Error('Round is full (max 10 players)');
      }
      
      // Check if user has already staked in this round by looking at events
      try {
        const userAddress = await this.signer!.getAddress();
        const filter = this.contract!.filters.PlayerStaked(currentRound.roundId, userAddress);
        const events = await this.contract!.queryFilter(filter, -1000); // Check last 1000 blocks
        
        if (events.length > 0) {
          throw new Error('You have already staked in this round. Please wait for the next round to start.');
        }
      } catch (eventError) {
        console.log('Could not check staking history, proceeding with transaction');
      }
      
      const tx = await this.contract!.stakeForPlays({
        value: stakeAmount,
        gasLimit: 800000  // Increased gas limit
      });
      
      console.log('✅ Stake transaction sent:', tx.hash);
      return tx;
    } catch (error: any) {
      console.error('❌ Failed to stake for plays:', error);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient ETH for transaction + gas fees');
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction cancelled by user');
      } else if (error.message.includes('AlreadyStakedInRound')) {
        throw new Error('You have already staked in this round. Please wait for the next round to start.');
      } else if (error.message.includes('execution reverted')) {
        // More specific error based on contract state
        try {
          const currentRound = await this.getCurrentRound();
          const playerSession = await this.getPlayerSession(await this.signer!.getAddress());
          
          if (playerSession.isActive && playerSession.playsRemaining > 0) {
            throw new Error('You already have an active session! Use PLAY GAME button instead.');
          } else if (currentRound.playerCount >= 10) {
            throw new Error('Round is full! Wait for the next round to start.');
          } else if (!currentRound.isActive) {
            throw new Error('Round is not active. Wait for the next round.');
          } else {
            throw new Error('Transaction failed: Please check your network connection and try again');
          }
        } catch (checkError) {
          throw new Error('Network error: Please check your connection to Base Sepolia and try again');
        }
      }
      
      throw new Error(`Stake failed: ${error.message}`);
    }
  }

  // NEW: Play one game (free after staking)
  async playGame(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    
    try {
      console.log('🎰 Playing game...');
      
      const tx = await this.contract!.playGame({
        gasLimit: 800000  // Increased gas limit
      });
      
      console.log('✅ Play game transaction sent:', tx.hash);
      return tx;
    } catch (error: any) {
      console.error('❌ Failed to play game:', error);
      
      if (error.message.includes('NoActiveSession')) {
        throw new Error('No active session. Please stake first to get 10 plays.');
      } else if (error.message.includes('NoPlaysRemaining')) {
        throw new Error('No plays remaining. Please stake again to get more plays.');
      } else if (error.message.includes('user rejected')) {
        throw new Error('Transaction cancelled by user');
      }
      
      // Parse specific JSON-RPC errors
      if (error.message.includes('Internal JSON-RPC error') || error.code === -32603) {
        throw new Error('Network error: Please check your connection to Base Sepolia and try again');
      } else if (error.message.includes('execution reverted')) {
        throw new Error('Transaction reverted: Your session may have ended. Please refresh and stake again.');
      }
      
      throw new Error(`Play failed: ${error.message}`);
    }
  }

  async claimLimitedEditionNFT(): Promise<ethers.ContractTransactionResponse> {
    this.ensureInitialized();
    
    try {
      const tx = await this.contract!.claimLimitedEditionNFT({
        gasLimit: 200000
      });
      
      console.log('Limited edition NFT claim transaction sent:', tx.hash);
      return tx;
    } catch (error: any) {
      console.error('Failed to claim limited edition NFT:', error);
      
      if (error.message.includes('NotEligibleForLimitedEdition')) {
        throw new Error('You need 3 wins to claim a Limited Edition NFT');
      } else if (error.message.includes('Already claimed')) {
        throw new Error('You have already claimed your Limited Edition NFT');
      }
      
      throw new Error(`Claim failed: ${error.message}`);
    }
  }

  // View methods
  async getCurrentRound(): Promise<CurrentRound> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getCurrentRound();
      
      return {
        roundId: Number(result[0]),
        playerCount: Number(result[1]),
        isActive: result[2],
        startTime: Number(result[3]),
        endTime: Number(result[4])
      };
    } catch (error) {
      console.error('Failed to get current round:', error);
      throw error;
    }
  }

  // NEW: Get player session info
  async getPlayerSession(playerAddress: string): Promise<PlayerSession> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getPlayerSession(playerAddress);
      
      return {
        playsRemaining: Number(result[0]),
        totalWins: Number(result[1]),
        sessionId: Number(result[2]),
        isActive: result[3]
      };
    } catch (error) {
      console.error('Failed to get player session:', error);
      throw error;
    }
  }

  async getPlayerStats(playerAddress: string): Promise<PlayerStats> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getPlayerStats(playerAddress);
      
      return {
        totalGames: Number(result[0]),
        totalWins: Number(result[1]),
        totalWinnings: Number(ethers.formatEther(result[2])),
        limitedEditionWins: Number(result[3]),
        hasLimitedEdition: result[4]
      };
    } catch (error) {
      console.error('Failed to get player stats:', error);
      throw error;
    }
  }

  async getNFTMetadata(tokenId: number): Promise<NFTMetadata> {
    this.ensureInitialized();
    
    try {
      const result = await this.contract!.getNFTMetadata(tokenId);
      
      return {
        name: result[0],
        description: result[1],
        imageURI: result[2],
        vrfSeed: Number(result[3]),
        isSoulBound: result[4],
        owner: result[5],
        isLimitedEdition: result[6]
      };
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      throw error;
    }
  }

  // Contract constants
  async getStakeAmount(): Promise<bigint> {
    this.ensureInitialized();
    return await this.contract!.STAKE_AMOUNT();
  }

  async getMaxPlayersPerRound(): Promise<number> {
    this.ensureInitialized();
    return Number(await this.contract!.MAX_PLAYERS_PER_ROUND());
  }

  async getWinPercentage(): Promise<number> {
    this.ensureInitialized();
    return Number(await this.contract!.WIN_PERCENTAGE());
  }

  async getPlaysPerStake(): Promise<number> {
    this.ensureInitialized();
    return Number(await this.contract!.PLAYS_PER_STAKE());
  }

  // Event listeners
  onPlayerStaked(callback: (roundId: number, player: string, sessionId: number) => void) {
    if (!this.contract) return;
    
    this.contract.on('PlayerStaked', (roundId: bigint, player: string, sessionId: bigint) => {
      callback(Number(roundId), player, Number(sessionId));
    });
  }

  onGamePlayed(callback: (player: string, sessionId: number, playsRemaining: number) => void) {
    if (!this.contract) return;
    
    this.contract.on('GamePlayed', (player: string, sessionId: bigint, playsRemaining: bigint) => {
      callback(player, Number(sessionId), Number(playsRemaining));
    });
  }

  onGameResult(callback: (result: GameResult) => void) {
    if (!this.contract) return;
    
    this.contract.on('GameResult', (player: string, won: boolean, amount: bigint, nftTokenId: bigint, vrfSeed: bigint) => {
      callback({
        player,
        won,
        amount: Number(ethers.formatEther(amount)),
        nftTokenId: Number(nftTokenId),
        vrfSeed: Number(vrfSeed)
      });
    });
  }

  onNFTMinted(callback: (player: string, tokenId: number, name: string, isLimitedEdition: boolean) => void) {
    if (!this.contract) return;
    
    this.contract.on('NFTMinted', (player: string, tokenId: bigint, name: string, isLimitedEdition: boolean) => {
      callback(player, Number(tokenId), name, isLimitedEdition);
    });
  }

  onLimitedEditionClaimed(callback: (player: string, tokenId: number) => void) {
    if (!this.contract) return;
    
    this.contract.on('LimitedEditionClaimed', (player: string, tokenId: bigint) => {
      callback(player, Number(tokenId));
    });
  }

  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}

// Export singleton instance
export const slotMachineService = new SlotMachineService();
