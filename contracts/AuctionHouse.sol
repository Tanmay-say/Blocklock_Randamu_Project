// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import {TypesLib} from "blocklock-solidity/src/libraries/TypesLib.sol";
import {AbstractBlocklockReceiver} from "blocklock-solidity/src/AbstractBlocklockReceiver.sol";
import "./interfaces/IRandamuVRF.sol";
import "./WinnerSBT.sol";

contract AuctionHouse is AccessControl, ReentrancyGuard, ERC721Holder, AbstractBlocklockReceiver {
    uint256 private _auctionIds = 0;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    
    WinnerSBT public immutable winnerSBT;
    IRandamuVRF public immutable randamuVRF;
    
    // Admin wallet that receives winning amounts
    address public adminWallet;
    
    // Tax percentage for losing bidders (in basis points, 2000 = 20%)
    uint256 public constant TAX_PERCENTAGE = 2000; // 20%
    uint256 public constant BASIS_POINTS = 10000;
    
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
        mapping(address => TypesLib.Ciphertext) encryptedBids;
        mapping(address => bytes) conditions;
        mapping(address => uint256) blocklockRequestIds;
        mapping(address => uint256) decodedBids; // Store decoded bid amounts
        mapping(address => bool) bidDecoded; // Track which bids have been decoded
        address[] bidders;
        uint256 totalTaxCollected; // Track tax collected from this auction
    }
    
    struct EncryptedBid {
        address bidder;
        TypesLib.Ciphertext ciphertext;
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
        uint256 blocklockRequestId,
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
    
    event TaxCollected(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 taxAmount
    );
    
    event AdminWalletUpdated(
        address indexed oldAdmin,
        address indexed newAdmin
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
    
    constructor(address _winnerSBT, address _randamuVRF, address _adminWallet, address _blocklockSender) 
        AbstractBlocklockReceiver(_blocklockSender) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        
        winnerSBT = WinnerSBT(_winnerSBT);
        randamuVRF = IRandamuVRF(_randamuVRF);
        adminWallet = _adminWallet;
        
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
        TypesLib.Ciphertext calldata encryptedBid,
        bytes calldata condition,
        uint32 callbackGasLimit
    ) external payable auctionExists(auctionId) auctionActive(auctionId) nonReentrant {
        require(!hasBid[auctionId][msg.sender], "Already bid");
        require(condition.length > 0, "Invalid condition");
        
        uint256 minDeposit = (auctions[auctionId].reserve * auctions[auctionId].depositPct) / 100;
        require(msg.value >= minDeposit, "Insufficient deposit");
        
        // Request blocklock decryption for the auction end block
        (uint256 requestId,) = _requestBlocklockPayInNative(
            callbackGasLimit,
            condition,
            encryptedBid
        );
        
        hasBid[auctionId][msg.sender] = true;
        auctions[auctionId].deposits[msg.sender] = msg.value;
        auctions[auctionId].encryptedBids[msg.sender] = encryptedBid;
        auctions[auctionId].conditions[msg.sender] = condition;
        auctions[auctionId].blocklockRequestIds[msg.sender] = requestId;
        auctions[auctionId].bidders.push(msg.sender);
        
        emit BidCommitted(auctionId, auctions[auctionId].bidders.length - 1, msg.sender, requestId, msg.value);
    }
    
    function _onBlocklockReceived(uint256 requestId, bytes calldata decryptionKey) internal override {
        // Find which auction and bidder this request belongs to
        (uint256 auctionId, address bidder) = _findBidderByRequestId(requestId);
        
        require(hasBid[auctionId][bidder], "Bid not found");
        require(!auctions[auctionId].bidDecoded[bidder], "Bid already decoded");
        
        // Decrypt the bid using the provided key
        bytes memory decryptedData = _decrypt(auctions[auctionId].encryptedBids[bidder], decryptionKey);
        uint256 bidAmount = abi.decode(decryptedData, (uint256));
        
        require(bidAmount > 0, "Invalid bid amount");
        
        // Store the decoded bid amount
        auctions[auctionId].decodedBids[bidder] = bidAmount;
        auctions[auctionId].bidDecoded[bidder] = true;
        
        emit BidRevealed(auctionId, bidder, bidAmount);
    }
    
    function _findBidderByRequestId(uint256 requestId) internal view returns (uint256 auctionId, address bidder) {
        // Search through auctions to find the matching request ID
        for (uint256 i = 0; i < _auctionIds; i++) {
            Auction storage auction = auctions[i];
            for (uint256 j = 0; j < auction.bidders.length; j++) {
                address currentBidder = auction.bidders[j];
                if (auction.blocklockRequestIds[currentBidder] == requestId) {
                    return (i, currentBidder);
                }
            }
        }
        revert("Request ID not found");
    }
    
    // Manual function to decode bids (for testing or emergency use)
    function decodeBid(
        uint256 auctionId,
        address bidder,
        uint256 amount
    ) external onlyAdmin auctionExists(auctionId) auctionEnded(auctionId) {
        require(hasBid[auctionId][bidder], "Bid not found");
        require(!auctions[auctionId].bidDecoded[bidder], "Bid already decoded");
        require(amount > 0, "Invalid bid amount");
        
        auctions[auctionId].decodedBids[bidder] = amount;
        auctions[auctionId].bidDecoded[bidder] = true;
        
        emit BidRevealed(auctionId, bidder, amount);
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
        
        // Find highest bidder among decoded bids
        address winner = address(0);
        uint256 highestBid = 0;
        
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            address bidder = auction.bidders[i];
            if (auction.bidDecoded[bidder]) {
                uint256 bidAmount = auction.decodedBids[bidder];
                if (bidAmount > highestBid && bidAmount >= auction.reserve) {
                    highestBid = bidAmount;
                    winner = bidder;
                }
            }
        }
        
        require(winner != address(0), "No valid bids or reserve not met");
        
        auction.winner = winner;
        auction.winningBid = highestBid;
        auction.settled = true;
        
        // Transfer NFT to winner
        IERC721(auction.nft).safeTransferFrom(address(this), winner, auction.tokenId);
        
        // Transfer winning bid amount to admin wallet (not seller)
        (bool adminSuccess, ) = adminWallet.call{value: highestBid}("");
        require(adminSuccess, "Transfer to admin failed");
        
        // Mint winner SBT
        winnerSBT.mintLocked(winner, auctionId);
        
        // Process refunds for non-winners with tax deduction
        uint256 totalTax = 0;
        for (uint256 i = 0; i < auction.bidders.length; i++) {
            address bidder = auction.bidders[i];
            if (bidder != winner && auction.deposits[bidder] > 0) {
                uint256 deposit = auction.deposits[bidder];
                
                // Calculate 20% tax on the deposit
                uint256 tax = (deposit * TAX_PERCENTAGE) / BASIS_POINTS;
                uint256 refundAmount = deposit - tax;
                
                totalTax += tax;
                auction.deposits[bidder] = 0;
                
                // Refund the amount after tax deduction
                if (refundAmount > 0) {
                    (bool refundSuccess, ) = bidder.call{value: refundAmount}("");
                    require(refundSuccess, "Refund failed");
                }
            }
        }
        
        // Transfer collected tax to admin wallet
        if (totalTax > 0) {
            auction.totalTaxCollected = totalTax;
            (bool taxSuccess, ) = adminWallet.call{value: totalTax}("");
            require(taxSuccess, "Tax transfer failed");
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

    /**
     * @dev View helper to read configured deposit percentage for an auction
     */
    function getDepositPct(uint256 auctionId) external view returns (uint256) {
        return auctions[auctionId].depositPct;
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
    
    function getDecodedBid(uint256 auctionId, address bidder) external view returns (uint256) {
        return auctions[auctionId].decodedBids[bidder];
    }
    
    function isBidDecoded(uint256 auctionId, address bidder) external view returns (bool) {
        return auctions[auctionId].bidDecoded[bidder];
    }
    
    function getTaxCollected(uint256 auctionId) external view returns (uint256) {
        return auctions[auctionId].totalTaxCollected;
    }
    
    function getAuctionBids(uint256 auctionId) external view returns (
        address[] memory bidders,
        uint256[] memory deposits,
        uint256[] memory decodedBids,
        bool[] memory decoded
    ) {
        Auction storage auction = auctions[auctionId];
        uint256 length = auction.bidders.length;
        
        bidders = new address[](length);
        deposits = new uint256[](length);
        decodedBids = new uint256[](length);
        decoded = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            address bidder = auction.bidders[i];
            bidders[i] = bidder;
            deposits[i] = auction.deposits[bidder];
            decodedBids[i] = auction.decodedBids[bidder];
            decoded[i] = auction.bidDecoded[bidder];
        }
    }
    
    // Admin functions
    function addSeller(address seller) external onlyAdmin {
        _grantRole(SELLER_ROLE, seller);
    }
    
    function removeSeller(address seller) external onlyAdmin {
        _revokeRole(SELLER_ROLE, seller);
    }
    
    function updateAdminWallet(address newAdminWallet) external onlyAdmin {
        require(newAdminWallet != address(0), "Invalid admin wallet");
        address oldAdmin = adminWallet;
        adminWallet = newAdminWallet;
        emit AdminWalletUpdated(oldAdmin, newAdminWallet);
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
