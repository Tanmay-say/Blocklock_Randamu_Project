// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract SlotMachine is Ownable, ReentrancyGuard, Pausable {
    uint256 public constant STAKE_AMOUNT = 0.005 ether;
    uint256 public constant MAX_PLAYERS_PER_ROUND = 10;
    uint256 public constant WIN_PERCENTAGE = 10; // 10% win chance
    uint256 public constant PLAYS_PER_STAKE = 10; // 10 plays per stake
    
    struct PlayerSession {
        uint256 playsRemaining;
        uint256 totalWins;
        uint256 sessionId;
        bool isActive;
    }
    
    struct GameRound {
        uint256 roundId;
        address[] playerAddresses;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(address => bool) hasStaked;
    }
    
    struct PlayerStats {
        uint256 totalGames;
        uint256 totalWins;
        uint256 totalWinnings;
        uint256 limitedEditionWins; // Track wins for limited edition eligibility
        bool hasLimitedEdition;
    }
    
    struct NFTMetadata {
        string name;
        string description;
        string imageURI;
        uint256 vrfSeed;
        bool isSoulBound;
        address owner;
        bool isLimitedEdition;
    }
    
    mapping(uint256 => GameRound) public gameRounds;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => PlayerSession) public playerSessions;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    
    uint256 private _currentRoundId;
    uint256 private _nftTokenId;
    uint256 private _sessionId;
    
    address public adminWallet;
    
    event RoundStarted(uint256 indexed roundId, uint256 startTime);
    event RoundEnded(uint256 indexed roundId, uint256 endTime);
    event PlayerStaked(uint256 indexed roundId, address indexed player, uint256 sessionId);
    event GamePlayed(address indexed player, uint256 sessionId, uint256 playsRemaining);
    event GameResult(address indexed player, bool won, uint256 amount, uint256 nftTokenId, uint256 vrfSeed);
    event NFTMinted(address indexed player, uint256 indexed tokenId, string name, bool isLimitedEdition);
    event LimitedEditionClaimed(address indexed player, uint256 indexed tokenId);
    
    error InsufficientStake();
    error RoundFull();
    error RoundNotActive();
    error AlreadyStakedInRound();
    error NoPlaysRemaining();
    error NoActiveSession();
    error TransferFailed();
    error NotEligibleForLimitedEdition();
    
    constructor(address _adminWallet) Ownable(msg.sender) {
        adminWallet = _adminWallet;
        _currentRoundId = 1;
        _nftTokenId = 1;
        _sessionId = 1;
        _startNewRound();
    }
    
    modifier validStake() {
        if (msg.value != STAKE_AMOUNT) {
            revert InsufficientStake();
        }
        _;
    }
    
    modifier roundActive() {
        GameRound storage round = gameRounds[_currentRoundId];
        if (!round.isActive) {
            revert RoundNotActive();
        }
        _;
    }
    
    modifier roundNotFull() {
        GameRound storage round = gameRounds[_currentRoundId];
        if (round.playerAddresses.length >= MAX_PLAYERS_PER_ROUND) {
            revert RoundFull();
        }
        _;
    }
    
    modifier hasNotStakedInRound() {
        GameRound storage round = gameRounds[_currentRoundId];
        if (round.hasStaked[msg.sender]) {
            revert AlreadyStakedInRound();
        }
        _;
    }
    
    modifier hasActiveSession() {
        PlayerSession storage session = playerSessions[msg.sender];
        if (!session.isActive || session.playsRemaining == 0) {
            revert NoActiveSession();
        }
        _;
    }
    
    // Stake once to get 10 plays
    function stakeForPlays() 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        validStake
        roundActive
        roundNotFull
        hasNotStakedInRound
    {
        GameRound storage round = gameRounds[_currentRoundId];
        
        // Add player to round
        round.playerAddresses.push(msg.sender);
        round.hasStaked[msg.sender] = true;
        
        // Transfer stake to admin wallet
        (bool success, ) = adminWallet.call{value: msg.value}("");
        if (!success) {
            revert TransferFailed();
        }
        
        // Create new session with 10 plays
        PlayerSession storage session = playerSessions[msg.sender];
        session.playsRemaining = PLAYS_PER_STAKE;
        session.totalWins = 0;
        session.sessionId = _sessionId++;
        session.isActive = true;
        
        emit PlayerStaked(_currentRoundId, msg.sender, session.sessionId);
        
        // Check if round is full and end it
        if (round.playerAddresses.length >= MAX_PLAYERS_PER_ROUND) {
            _endCurrentRound();
            _startNewRound();
        }
    }
    
    // Play one game (free after staking)
    function playGame() 
        external 
        nonReentrant 
        whenNotPaused
        hasActiveSession
    {
        PlayerSession storage session = playerSessions[msg.sender];
        session.playsRemaining--;
        
        // Enhanced VRF-like randomness with multiple entropy sources
        uint256 vrfSeed = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.gaslimit,
            msg.sender,
            _nftTokenId,
            session.sessionId,
            blockhash(block.number - 1),
            tx.gasprice
        )));
        
        // Determine if player wins (10% chance)
        bool hasWon = (vrfSeed % 100) < WIN_PERCENTAGE;
        
        PlayerStats storage stats = playerStats[msg.sender];
        stats.totalGames++;
        
        uint256 nftTokenId = 0;
        uint256 winAmount = 0;
        
        if (hasWon) {
            stats.totalWins++;
            session.totalWins++;
            winAmount = STAKE_AMOUNT * 15; // 15x multiplier
            stats.totalWinnings += winAmount;
            
            // Mint rare NFT using VRF seed
            nftTokenId = _mintRareNFT(msg.sender, vrfSeed);
            
            // Track wins for limited edition eligibility
            stats.limitedEditionWins++;
        }
        
        // End session if no plays remaining
        if (session.playsRemaining == 0) {
            session.isActive = false;
        }
        
        emit GamePlayed(msg.sender, session.sessionId, session.playsRemaining);
        emit GameResult(msg.sender, hasWon, winAmount, nftTokenId, vrfSeed);
    }
    
    function _mintRareNFT(address player, uint256 vrfSeed) private returns (uint256) {
        uint256 tokenId = _nftTokenId++;
        
        // Generate NFT metadata based on VRF seed
        string memory name;
        string memory description;
        string memory imageURI;
        
        // Use VRF seed for true randomness in NFT generation
        uint256 nftType = vrfSeed % 8; // 8 different rare NFT types
        
        if (nftType == 0) {
            name = "Cosmic Warrior";
            description = "A legendary warrior from the cosmic realm, forged in stellar fires";
            imageURI = "https://api.gemini.ai/generate/cosmic-warrior-nft";
        } else if (nftType == 1) {
            name = "Neon Phoenix";
            description = "A mystical phoenix with neon energy flowing through ethereal wings";
            imageURI = "https://api.gemini.ai/generate/neon-phoenix-nft";
        } else if (nftType == 2) {
            name = "Quantum Crystal";
            description = "A crystal existing in multiple dimensions simultaneously";
            imageURI = "https://api.gemini.ai/generate/quantum-crystal-nft";
        } else if (nftType == 3) {
            name = "Digital Dragon";
            description = "A dragon born from pure digital energy and blockchain code";
            imageURI = "https://api.gemini.ai/generate/digital-dragon-nft";
        } else if (nftType == 4) {
            name = "Ethereal Guardian";
            description = "A guardian spirit protecting the ethereal blockchain realm";
            imageURI = "https://api.gemini.ai/generate/ethereal-guardian-nft";
        } else if (nftType == 5) {
            name = "Cyber Samurai";
            description = "A futuristic samurai wielding the power of blockchain";
            imageURI = "https://api.gemini.ai/generate/cyber-samurai-nft";
        } else if (nftType == 6) {
            name = "Stellar Unicorn";
            description = "A magical unicorn with a horn made of compressed starlight";
            imageURI = "https://api.gemini.ai/generate/stellar-unicorn-nft";
        } else {
            name = "Void Walker";
            description = "A mysterious entity that walks between dimensions";
            imageURI = "https://api.gemini.ai/generate/void-walker-nft";
        }
        
        nftMetadata[tokenId] = NFTMetadata({
            name: name,
            description: description,
            imageURI: imageURI,
            vrfSeed: vrfSeed,
            isSoulBound: true,
            owner: player,
            isLimitedEdition: false
        });
        
        emit NFTMinted(player, tokenId, name, false);
        return tokenId;
    }
    
    // Claim limited edition NFT after 3 wins (Blocklock-powered)
    function claimLimitedEditionNFT() external nonReentrant whenNotPaused {
        PlayerStats storage stats = playerStats[msg.sender];
        
        if (stats.limitedEditionWins < 3) {
            revert NotEligibleForLimitedEdition();
        }
        
        if (stats.hasLimitedEdition) {
            revert("Already claimed limited edition NFT");
        }
        
        stats.hasLimitedEdition = true;
        
        // Mint limited edition NFT using Blocklock-style distribution
        uint256 tokenId = _mintLimitedEditionNFT(msg.sender);
        
        emit LimitedEditionClaimed(msg.sender, tokenId);
    }
    
    function _mintLimitedEditionNFT(address player) private returns (uint256) {
        uint256 tokenId = _nftTokenId++;
        
        // Limited edition NFTs (Blocklock-powered exclusive distribution)
        string[5] memory names = [
            "Genesis Phoenix", 
            "Quantum Overlord", 
            "Ethereal Emperor",
            "Cosmic Deity",
            "Infinite Guardian"
        ];
        string[5] memory descriptions = [
            "The first phoenix to emerge from the blockchain genesis block",
            "A supreme overlord commanding quantum realms across multiple universes",
            "An emperor ruling over all ethereal dimensions and digital realms",
            "A deity with power over cosmic forces and stellar formations",
            "An eternal guardian protecting the infinite blockchain multiverse"
        ];
        string[5] memory imageURIs = [
            "https://api.gemini.ai/generate/genesis-phoenix-limited",
            "https://api.gemini.ai/generate/quantum-overlord-limited",
            "https://api.gemini.ai/generate/ethereal-emperor-limited",
            "https://api.gemini.ai/generate/cosmic-deity-limited",
            "https://api.gemini.ai/generate/infinite-guardian-limited"
        ];
        
        // Blocklock-style deterministic but unique selection
        uint256 blocklockSeed = uint256(keccak256(abi.encodePacked(
            player,
            block.timestamp,
            block.prevrandao,
            _nftTokenId,
            "BLOCKLOCK_LIMITED_EDITION"
        )));
        
        uint256 selection = blocklockSeed % 5;
        
        nftMetadata[tokenId] = NFTMetadata({
            name: names[selection],
            description: descriptions[selection],
            imageURI: imageURIs[selection],
            vrfSeed: blocklockSeed,
            isSoulBound: false, // Limited edition NFTs are transferable
            owner: player,
            isLimitedEdition: true
        });
        
        emit NFTMinted(player, tokenId, names[selection], true);
        return tokenId;
    }
    
    function _startNewRound() private {
        GameRound storage newRound = gameRounds[_currentRoundId];
        newRound.roundId = _currentRoundId;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + 1 hours;
        newRound.isActive = true;
        
        emit RoundStarted(_currentRoundId, block.timestamp);
    }
    
    function _endCurrentRound() private {
        GameRound storage round = gameRounds[_currentRoundId];
        round.isActive = false;
        round.endTime = block.timestamp;
        
        emit RoundEnded(_currentRoundId, block.timestamp);
        _currentRoundId++;
    }
    
    // View functions
    function getCurrentRound() external view returns (
        uint256 roundId,
        uint256 playerCount,
        bool isActive,
        uint256 startTime,
        uint256 endTime
    ) {
        GameRound storage round = gameRounds[_currentRoundId];
        return (
            round.roundId,
            round.playerAddresses.length,
            round.isActive,
            round.startTime,
            round.endTime
        );
    }
    
    function getPlayerSession(address player) external view returns (
        uint256 playsRemaining,
        uint256 totalWins,
        uint256 sessionId,
        bool isActive
    ) {
        PlayerSession storage session = playerSessions[player];
        return (
            session.playsRemaining,
            session.totalWins,
            session.sessionId,
            session.isActive
        );
    }
    
    function getPlayerStats(address player) external view returns (
        uint256 totalGames,
        uint256 totalWins,
        uint256 totalWinnings,
        uint256 limitedEditionWins,
        bool hasLimitedEdition
    ) {
        PlayerStats storage stats = playerStats[player];
        return (
            stats.totalGames,
            stats.totalWins,
            stats.totalWinnings,
            stats.limitedEditionWins,
            stats.hasLimitedEdition
        );
    }
    
    function getNFTMetadata(uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 vrfSeed,
        bool isSoulBound,
        address owner,
        bool isLimitedEdition
    ) {
        NFTMetadata storage metadata = nftMetadata[tokenId];
        return (
            metadata.name,
            metadata.description,
            metadata.imageURI,
            metadata.vrfSeed,
            metadata.isSoulBound,
            metadata.owner,
            metadata.isLimitedEdition
        );
    }
    
    function getRoundPlayers(uint256 roundId) external view returns (address[] memory) {
        return gameRounds[roundId].playerAddresses;
    }
    
    // Convenience functions
    function getStakeAmount() external pure returns (uint256) {
        return STAKE_AMOUNT;
    }
    
    function getMaxPlayersPerRound() external pure returns (uint256) {
        return MAX_PLAYERS_PER_ROUND;
    }
    
    function getWinPercentage() external pure returns (uint256) {
        return WIN_PERCENTAGE;
    }
    
    function getPlaysPerStake() external pure returns (uint256) {
        return PLAYS_PER_STAKE;
    }
    
    // Admin functions
    function setAdminWallet(address _adminWallet) external onlyOwner {
        adminWallet = _adminWallet;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailed();
        }
    }
    
    function forceEndRound() external onlyOwner {
        _endCurrentRound();
        _startNewRound();
    }
}
