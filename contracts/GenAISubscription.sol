// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// Note: Blocklock integration can be added later for time-based cleanup

/**
 * @title GenAISubscription
 * @dev Manages subscription plans and daily limits for GenAI users
 */
contract GenAISubscription is AccessControl, ReentrancyGuard {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Subscription types
    enum SubscriptionType { FREE, MONTHLY, ANNUAL }
    
    // Subscription prices
    uint256 public constant MONTHLY_PRICE = 0.01 ether; // 0.01 ETH per month
    uint256 public constant ANNUAL_PRICE = 0.1 ether;   // 0.1 ETH per year (2 months free)
    
    // Daily limits
    uint256 public constant FREE_DAILY_LIMIT = 5;
    uint256 public constant PREMIUM_DAILY_LIMIT = 1000; // Essentially unlimited
    
    // Time constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant SECONDS_PER_MONTH = 2592000; // 30 days
    uint256 public constant SECONDS_PER_YEAR = 31536000;  // 365 days
    
    struct UserSubscription {
        SubscriptionType subType;
        uint256 expiryTime;
        uint256 dailyUsed;
        uint256 lastUsageDay;
        bool active;
    }
    
    struct UserImage {
        string imageHash;
        string prompt;
        uint256 createdAt;
        uint256 cleanupTime; // Timestamp when image should be cleaned up
        bool isMinted;
        bool isDeleted;
    }
    
    // Admin wallet for receiving subscription payments
    address public adminWallet;
    
    // User subscriptions
    mapping(address => UserSubscription) public userSubscriptions;
    
    // User images (for temporary storage and cleanup)
    mapping(address => UserImage[]) public userImages;
    
    // Events
    event SubscriptionPurchased(
        address indexed user,
        SubscriptionType subType,
        uint256 duration,
        uint256 expiryTime
    );
    
    event ImageGenerated(
        address indexed user,
        uint256 indexed imageIndex,
        string imageHash,
        uint256 cleanupTime
    );
    
    event ImageMinted(
        address indexed user,
        uint256 indexed imageIndex,
        string imageHash
    );
    
    event ImageCleaned(
        address indexed user,
        uint256 indexed imageIndex,
        string imageHash
    );
    
    event DailyLimitReset(
        address indexed user,
        uint256 newDay
    );
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }
    
    modifier onlyActiveUser() {
        require(_isUserActive(msg.sender), "User not active or limit exceeded");
        _;
    }
    
    constructor(address _adminWallet) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        
        adminWallet = _adminWallet;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Purchase monthly subscription
     */
    function purchaseMonthlySubscription() external payable nonReentrant {
        require(msg.value >= MONTHLY_PRICE, "Insufficient payment for monthly subscription");
        
        UserSubscription storage sub = userSubscriptions[msg.sender];
        
        uint256 newExpiry;
        if (sub.active && sub.expiryTime > block.timestamp) {
            // Extend existing subscription
            newExpiry = sub.expiryTime + SECONDS_PER_MONTH;
        } else {
            // New subscription
            newExpiry = block.timestamp + SECONDS_PER_MONTH;
        }
        
        sub.subType = SubscriptionType.MONTHLY;
        sub.expiryTime = newExpiry;
        sub.active = true;
        
        // Transfer payment to admin
        _transferPayment(msg.value);
        
        emit SubscriptionPurchased(msg.sender, SubscriptionType.MONTHLY, SECONDS_PER_MONTH, newExpiry);
    }
    
    /**
     * @dev Purchase annual subscription
     */
    function purchaseAnnualSubscription() external payable nonReentrant {
        require(msg.value >= ANNUAL_PRICE, "Insufficient payment for annual subscription");
        
        UserSubscription storage sub = userSubscriptions[msg.sender];
        
        uint256 newExpiry;
        if (sub.active && sub.expiryTime > block.timestamp) {
            // Extend existing subscription
            newExpiry = sub.expiryTime + SECONDS_PER_YEAR;
        } else {
            // New subscription
            newExpiry = block.timestamp + SECONDS_PER_YEAR;
        }
        
        sub.subType = SubscriptionType.ANNUAL;
        sub.expiryTime = newExpiry;
        sub.active = true;
        
        // Transfer payment to admin
        _transferPayment(msg.value);
        
        emit SubscriptionPurchased(msg.sender, SubscriptionType.ANNUAL, SECONDS_PER_YEAR, newExpiry);
    }
    
    /**
     * @dev Record image generation and schedule cleanup for free users
     */
    function recordImageGeneration(
        address user,
        string memory imageHash,
        string memory prompt
    ) external onlyAdmin returns (uint256) {
        require(_canGenerateImage(user), "User has exceeded daily limit");
        
        UserSubscription storage sub = userSubscriptions[user];
        
        // Reset daily usage if it's a new day
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        if (sub.lastUsageDay != currentDay) {
            sub.dailyUsed = 0;
            sub.lastUsageDay = currentDay;
            emit DailyLimitReset(user, currentDay);
        }
        
        // Increment daily usage
        sub.dailyUsed++;
        
        // Create image record
        uint256 cleanupTime = 0;
        if (sub.subType == SubscriptionType.FREE || !sub.active || sub.expiryTime <= block.timestamp) {
            cleanupTime = block.timestamp + (7 * SECONDS_PER_DAY); // 7 days for free users
        }
        
        UserImage memory newImage = UserImage({
            imageHash: imageHash,
            prompt: prompt,
            createdAt: block.timestamp,
            cleanupTime: cleanupTime,
            isMinted: false,
            isDeleted: false
        });
        
        userImages[user].push(newImage);
        uint256 imageIndex = userImages[user].length - 1;
        
        emit ImageGenerated(user, imageIndex, imageHash, cleanupTime);
        
        return imageIndex;
    }
    
    /**
     * @dev Mark image as minted (prevents cleanup)
     */
    function markImageAsMinted(address user, uint256 imageIndex) external onlyAdmin {
        require(imageIndex < userImages[user].length, "Invalid image index");
        require(!userImages[user][imageIndex].isDeleted, "Image already deleted");
        
        userImages[user][imageIndex].isMinted = true;
        
        emit ImageMinted(user, imageIndex, userImages[user][imageIndex].imageHash);
    }
    
    /**
     * @dev Clean up expired images (callable by admin or anyone)
     */
    function cleanupExpiredImages(address user) external {
        UserImage[] storage images = userImages[user];
        
        for (uint256 i = 0; i < images.length; i++) {
            if (!images[i].isDeleted && 
                !images[i].isMinted && 
                images[i].cleanupTime > 0 && 
                block.timestamp >= images[i].cleanupTime) {
                
                images[i].isDeleted = true;
                emit ImageCleaned(user, i, images[i].imageHash);
            }
        }
    }
    
    /**
     * @dev Batch cleanup expired images for multiple users
     */
    function batchCleanupExpiredImages(address[] calldata users) external {
        for (uint256 i = 0; i < users.length; i++) {
            this.cleanupExpiredImages(users[i]);
        }
    }
    
    /**
     * @dev Check if user can generate images
     */
    function _canGenerateImage(address user) internal view returns (bool) {
        UserSubscription storage sub = userSubscriptions[user];
        
        // Check if it's a new day
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        if (sub.lastUsageDay != currentDay) {
            return true; // New day, reset limit
        }
        
        // Check daily limits based on subscription
        if (sub.active && sub.expiryTime > block.timestamp) {
            // Premium user
            return sub.dailyUsed < PREMIUM_DAILY_LIMIT;
        } else {
            // Free user
            return sub.dailyUsed < FREE_DAILY_LIMIT;
        }
    }
    
    /**
     * @dev Check if user is active
     */
    function _isUserActive(address user) internal view returns (bool) {
        return _canGenerateImage(user);
    }
    
    /**
     * @dev Transfer payment to admin wallet
     */
    function _transferPayment(uint256 amount) internal {
        (bool success, ) = adminWallet.call{value: amount}("");
        require(success, "Payment transfer failed");
    }
    
    /**
     * @dev Get user subscription info
     */
    function getUserSubscription(address user) external view returns (UserSubscription memory) {
        return userSubscriptions[user];
    }
    
    /**
     * @dev Get user's daily usage and limit
     */
    function getUserDailyInfo(address user) external view returns (uint256 used, uint256 limit, bool canGenerate) {
        UserSubscription storage sub = userSubscriptions[user];
        
        // Check if it's a new day
        uint256 currentDay = block.timestamp / SECONDS_PER_DAY;
        if (sub.lastUsageDay != currentDay) {
            used = 0; // New day, usage resets
        } else {
            used = sub.dailyUsed;
        }
        
        // Determine limit based on subscription
        if (sub.active && sub.expiryTime > block.timestamp) {
            limit = PREMIUM_DAILY_LIMIT;
        } else {
            limit = FREE_DAILY_LIMIT;
        }
        
        canGenerate = used < limit;
    }
    
    /**
     * @dev Get user's images
     */
    function getUserImages(address user) external view returns (UserImage[] memory) {
        return userImages[user];
    }
    
    /**
     * @dev Get count of user's active (non-deleted) images
     */
    function getUserActiveImageCount(address user) external view returns (uint256) {
        UserImage[] storage allImages = userImages[user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allImages.length; i++) {
            if (!allImages[i].isDeleted) {
                activeCount++;
            }
        }
        
        return activeCount;
    }
    
    /**
     * @dev Get user's image by index
     */
    function getUserImage(address user, uint256 index) external view returns (UserImage memory) {
        require(index < userImages[user].length, "Invalid image index");
        return userImages[user][index];
    }
    
    /**
     * @dev Update admin wallet
     */
    function updateAdminWallet(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        adminWallet = newAdmin;
    }
    
    /**
     * @dev Emergency withdrawal
     */
    function emergencyWithdraw() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = adminWallet.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
