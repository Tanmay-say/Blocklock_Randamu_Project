// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlocklockReceiver.sol";
import "./interfaces/IRandamuVRF.sol";
import "./WinnerSBT.sol";

contract AuctionHouse is AccessControl, ReentrancyGuard, ERC721Holder, IBlocklockReceiver, Ownable {
    uint256 private _auctionIds = 0;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    
    WinnerSBT public immutable winnerSBT;
    IRandamuVRF public immutable randamuVRF;
    
    struct Auction {
        address nft;
        uint256 tokenId;
        uint256 reserve;
        uint256 endBlock;
        uint256 depositPct;
        address seller;
        bool settled;
        address winner;
        uint256 winningBid;
        mapping(address => uint256) deposits;
        mapping(address => bytes) encryptedBids;
        mapping(address => bytes) conditions;
        address[] bidders;
    }
    
    struct EncryptedBid {
        address bidder;
        bytes ciphertext;
        bytes condition;
        uint256 deposit;
    }
    
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => bool)) public hasBid;
    
    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nft,
        uint256 indexed tokenId,
        address seller,
        uint256 reserve,
        uint256 endBlock
    );
    
    event BidCommitted(
        uint256 indexed auctionId,
        uint256 indexed bidIndex,
        address indexed bidder,
        bytes ciphertext,
        bytes condition,
        uint256 deposit
    );
    
    event BidRevealed(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    
    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );
    
    event TieBreakRandomnessRequested(
        uint256 indexed auctionId,
        uint256 indexed requestId
    );
    
    event TieBreakRandomnessFulfilled(
        uint256 indexed auctionId,
        uint256 indexed requestId,
        uint256 randomness
    );
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }
    
    modifier onlySeller() {
        require(hasRole(SELLER_ROLE, msg.sender), "Not seller");
        _;
    }
    
    modifier auctionExists(uint256 auctionId) {
        require(auctions[auctionId].nft != address(0), "Auction does not exist");
        _;
    }
    
    modifier auctionActive(uint256 auctionId) {
        require(block.number < auctions[auctionId].endBlock, "Auction ended");
        _;
    }
    
    modifier auctionEnded(uint256 auctionId) {
        require(block.number >= auctions[auctionId].endBlock, "Auction still active");
        _;
    }
    
    constructor(address _winnerSBT, address _randamuVRF) Ownable(msg.sender) {
        winnerSBT = WinnerSBT(_winnerSBT);
        randamuVRF = IRandamuVRF(_randamuVRF);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(SELLER_ROLE, msg.sender);
    }
    
    function createAuction(
        address nft,
        uint256 tokenId,
        uint256 reserve,
        uint256 endBlock,
        uint256 depositPct
    ) external onlySeller nonReentrant {
        require(nft != address(0), "Invalid NFT address");
        require(endBlock > block.number, "End block must be in future");
        require(depositPct >= 10 && depositPct <= 50, "Invalid deposit percentage");
        
        // Transfer NFT to this contract
        IERC721(nft).safeTransferFrom(msg.sender, address(this), tokenId);
        
        uint256 auctionId = _auctionIds;
        _auctionIds++;
        
        Auction storage auction = auctions[auctionId];
        auction.nft = nft;
        auction.tokenId = tokenId;
        auction.reserve = reserve;
        auction.endBlock = endBlock;
        auction.seller = msg.sender;
        auction.depositPct = depositPct;
        
        emit AuctionCreated(auctionId, nft, tokenId, msg.sender, reserve, endBlock);
    }
    
    function commitBid(
        uint256 auctionId,
        bytes calldata ciphertext,
        bytes calldata condition,
        address refundTo
    ) external payable auctionExists(auctionId) auctionActive(auctionId) nonReentrant {
        require(!hasBid[auctionId][msg.sender], "Already bid");
        require(ciphertext.length > 0, "Invalid ciphertext");
        require(condition.length > 0, "Invalid condition");
        
        uint256 minDeposit = (auctions[auctionId].reserve * auctions[auctionId].depositPct) / 10000;
        require(msg.value >= minDeposit, "Insufficient deposit");
        
        hasBid[auctionId][msg.sender] = true;
        auctions[auctionId].deposits[msg.sender] = msg.value;
        auctions[auctionId].encryptedBids[msg.sender] = ciphertext;
        auctions[auctionId].conditions[msg.sender] = condition;
        auctions[auctionId].bidders.push(msg.sender);
        
        emit BidCommitted(auctionId, auctions[auctionId].bidders.length - 1, msg.sender, ciphertext, condition, msg.value);
    }
    
    function onBlocklockDecryption(
        uint256 auctionId,
        address bidder,
        uint256 amount,
        bytes calldata proof
    ) external {
        // This function will be called by Blocklock service when bid is decrypted
        // Implementation depends on Blocklock integration
        require(hasBid[auctionId][bidder], "Bid not found");
        
        // Process decrypted bid
        // This is a placeholder - actual implementation will decode the bid
        // and store it for finalization
    }
    
    function requestTieBreakRandomness(uint256 auctionId) external onlyAdmin auctionExists(auctionId) auctionEnded(auctionId) {
        require(auctions[auctionId].bidders.length > 1, "Need multiple bidders for tie break");
        
        uint256 requestId = randamuVRF.requestRandomness(auctionId);
        emit TieBreakRandomnessRequested(auctionId, requestId);
    }
    
    function fulfillRandomness(uint256 requestId, uint256 randomness) external {
        // This will be called by Randamu service
        emit TieBreakRandomnessFulfilled(0, requestId, randomness);
    }
    
    function finalize(uint256 auctionId) external onlyAdmin auctionExists(auctionId) auctionEnded(auctionId) nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(!auction.settled, "Already settled");
        
        // Find highest bidder
        address winner = address(0);
        uint256 highestBid = 0;
        
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            address bidder = auction.bidders[i];
            // Here you would decode the actual bid amount from the decrypted data
            // For now, we'll use a placeholder
            uint256 bidAmount = auction.deposits[bidder]; // This is just the deposit
            
            if (bidAmount > highestBid) {
                highestBid = bidAmount;
                winner = bidder;
            }
        }
        
        require(winner != address(0), "No valid bids");
        require(highestBid >= auction.reserve, "Reserve not met");
        
        auction.winner = winner;
        auction.winningBid = highestBid;
        auction.settled = true;
        
        // Transfer NFT to winner
        IERC721(auction.nft).safeTransferFrom(address(this), winner, auction.tokenId);
        
        // Transfer winning bid to seller
        (bool success, ) = auction.seller.call{value: highestBid}("");
        require(success, "Transfer to seller failed");
        
        // Mint winner SBT
        winnerSBT.mintLocked(winner, auctionId);
        
        // Refund deposits to non-winners
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            address bidder = auction.bidders[i];
            if (bidder != winner && auction.deposits[bidder] > 0) {
                (bool refundSuccess, ) = bidder.call{value: auction.deposits[bidder]}("");
                require(refundSuccess, "Refund failed");
                auction.deposits[bidder] = 0;
            }
        }
        
        emit AuctionFinalized(auctionId, winner, highestBid);
    }
    
    function getAuction(uint256 auctionId) external view returns (
        address nft,
        uint256 tokenId,
        uint256 reserve,
        uint256 endBlock,
        address seller,
        bool settled,
        address winner,
        uint256 winningBid,
        uint256 bidderCount
    ) {
        Auction storage auction = auctions[auctionId];
        return (
            auction.nft,
            auction.tokenId,
            auction.reserve,
            auction.endBlock,
            auction.seller,
            auction.settled,
            auction.winner,
            auction.winningBid,
            auction.bidders.length
        );
    }
    
    function getBidder(uint256 auctionId, uint256 index) external view returns (address) {
        return auctions[auctionId].bidders[index];
    }
    
    function getBidderCount(uint256 auctionId) external view returns (uint256) {
        return auctions[auctionId].bidders.length;
    }
    
    function getDeposit(uint256 auctionId, address bidder) external view returns (uint256) {
        return auctions[auctionId].deposits[bidder];
    }
    
    // Admin functions
    function addSeller(address seller) external onlyAdmin {
        _grantRole(SELLER_ROLE, seller);
    }
    
    function removeSeller(address seller) external onlyAdmin {
        _revokeRole(SELLER_ROLE, seller);
    }
    
    function emergencyWithdraw() external onlyAdmin {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
    
    function emergencyWithdrawNFT(address nft, uint256 tokenId) external onlyAdmin {
        IERC721(nft).safeTransferFrom(address(this), msg.sender, tokenId);
    }
    
    // Override required functions
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
