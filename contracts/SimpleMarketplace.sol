// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SimpleMarketplace
 * @dev A simple marketplace for buying NFTs with admin profit sharing
 */
contract SimpleMarketplace is Ownable, ReentrancyGuard, Pausable {
    
    // Admin wallet that receives platform fees
    address public adminWallet;
    
    // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeePercentage;
    
    // Listing struct
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }
    
    // Mapping from listing ID to listing details
    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId = 1;
    
    // Events
    event NFTListed(uint256 indexed listingId, address indexed seller, uint256 price);
    event NFTPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 price, uint256 platformFee);
    event ListingCancelled(uint256 indexed listingId);
    event PlatformFeeUpdated(uint256 newFeePercentage);
    event AdminWalletUpdated(address newAdminWallet);
    
    constructor(address _adminWallet, uint256 _platformFeePercentage) Ownable(msg.sender) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        require(_platformFeePercentage <= 1000, "Fee too high"); // Max 10%
        
        adminWallet = _adminWallet;
        platformFeePercentage = _platformFeePercentage;
    }
    
    /**
     * @dev Create a listing for an NFT (for demo purposes, we'll just store price)
     * @param price The price in ETH (wei)
     */
    function createListing(uint256 price) external whenNotPaused returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        
        uint256 listingId = nextListingId++;
        
        listings[listingId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });
        
        emit NFTListed(listingId, msg.sender, price);
        return listingId;
    }
    
    /**
     * @dev Purchase an NFT from a listing
     * @param listingId The ID of the listing to purchase
     */
    function purchaseNFT(uint256 listingId) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own listing");
        
        // Calculate platform fee
        uint256 platformFee = (listing.price * platformFeePercentage) / 10000;
        uint256 sellerAmount = listing.price - platformFee;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Transfer platform fee to admin wallet
        if (platformFee > 0) {
            (bool adminSuccess, ) = adminWallet.call{value: platformFee}("");
            require(adminSuccess, "Admin payment failed");
        }
        
        // Transfer remaining amount to seller
        (bool sellerSuccess, ) = listing.seller.call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment failed");
        
        // Refund excess payment
        if (msg.value > listing.price) {
            uint256 refund = msg.value - listing.price;
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTPurchased(listingId, msg.sender, listing.seller, listing.price, platformFee);
    }
    
    /**
     * @dev Cancel a listing (only seller can cancel)
     * @param listingId The ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        
        require(listing.active, "Listing not active");
        require(msg.sender == listing.seller || msg.sender == owner(), "Only seller or owner can cancel");
        
        listing.active = false;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param newFeePercentage New fee percentage in basis points
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFeePercentage;
        emit PlatformFeeUpdated(newFeePercentage);
    }
    
    /**
     * @dev Update admin wallet (only owner)
     * @param newAdminWallet New admin wallet address
     */
    function updateAdminWallet(address newAdminWallet) external onlyOwner {
        require(newAdminWallet != address(0), "Invalid admin wallet");
        adminWallet = newAdminWallet;
        emit AdminWalletUpdated(newAdminWallet);
    }
    
    /**
     * @dev Get listing details
     * @param listingId The ID of the listing
     */
    function getListing(uint256 listingId) external view returns (address seller, uint256 price, bool active) {
        Listing storage listing = listings[listingId];
        return (listing.seller, listing.price, listing.active);
    }
    
    /**
     * @dev Calculate platform fee for a given price
     * @param price The price to calculate fee for
     */
    function calculatePlatformFee(uint256 price) external view returns (uint256) {
        return (price * platformFeePercentage) / 10000;
    }
    
    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
