// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IRandamuVRF.sol";

/**
 * @title GenAIImageStorage
 * @dev Stores and manages AI-generated images with VRF uniqueness verification
 */
contract GenAIImageStorage is AccessControl, ReentrancyGuard {
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GENAI_ROLE = keccak256("GENAI_ROLE"); // For GenAI contracts
    
    // VRF for uniqueness verification
    IRandamuVRF public immutable randamuVRF;
    
    struct ImageMetadata {
        string imageHash; // IPFS or content hash
        string prompt;
        string style;
        string size;
        address generator;
        uint256 createdAt;
        uint256 vrfSeed;
        bool isUnique;
        bool isDeleted;
        bytes32 uniquenessProof; // VRF-generated proof
    }
    
    // Global image storage
    mapping(string => ImageMetadata) public images;
    mapping(string => bool) public imageExists;
    
    // User collections
    mapping(address => string[]) public userImageHashes;
    
    // Uniqueness tracking
    mapping(uint256 => bool) public vrfSeedUsed;
    mapping(bytes32 => bool) public uniquenessProofUsed;
    
    // VRF request tracking
    mapping(uint256 => string) public vrfRequests; // requestId -> imageHash
    mapping(string => uint256) public pendingVRFRequests; // imageHash -> requestId
    
    // Events
    event ImageStored(
        string indexed imageHash,
        address indexed generator,
        string prompt,
        uint256 vrfSeed
    );
    
    event UniquenessRequested(
        string indexed imageHash,
        uint256 indexed requestId,
        uint256 vrfSeed
    );
    
    event UniquenessVerified(
        string indexed imageHash,
        bytes32 uniquenessProof,
        bool isUnique
    );
    
    event ImageDeleted(
        string indexed imageHash,
        address indexed generator
    );
    
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }
    
    modifier onlyGenAI() {
        require(hasRole(GENAI_ROLE, msg.sender), "Not authorized GenAI contract");
        _;
    }
    
    constructor(address _randamuVRF) {
        require(_randamuVRF != address(0), "Invalid VRF address");
        
        randamuVRF = IRandamuVRF(_randamuVRF);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Store AI-generated image with VRF uniqueness verification
     */
    function storeImageWithVRF(
        string memory imageHash,
        string memory prompt,
        string memory style,
        string memory size,
        address generator,
        uint256 vrfSeed
    ) external onlyGenAI nonReentrant returns (uint256) {
        require(bytes(imageHash).length > 0, "Image hash cannot be empty");
        require(bytes(prompt).length > 0, "Prompt cannot be empty");
        require(generator != address(0), "Invalid generator address");
        require(!imageExists[imageHash], "Image already exists");
        require(!vrfSeedUsed[vrfSeed], "VRF seed already used");
        
        // Mark VRF seed as used
        vrfSeedUsed[vrfSeed] = true;
        
        // Create initial image metadata (uniqueness pending)
        images[imageHash] = ImageMetadata({
            imageHash: imageHash,
            prompt: prompt,
            style: style,
            size: size,
            generator: generator,
            createdAt: block.timestamp,
            vrfSeed: vrfSeed,
            isUnique: false, // Will be verified by VRF
            isDeleted: false,
            uniquenessProof: bytes32(0)
        });
        
        imageExists[imageHash] = true;
        userImageHashes[generator].push(imageHash);
        
        // Request VRF for uniqueness verification
        uint256 requestId = _requestVRFUniqueness(imageHash, vrfSeed);
        
        emit ImageStored(imageHash, generator, prompt, vrfSeed);
        
        return requestId;
    }
    
    /**
     * @dev Request VRF uniqueness verification
     */
    function _requestVRFUniqueness(
        string memory imageHash,
        uint256 vrfSeed
    ) internal returns (uint256) {
        // Request randomness from VRF
        uint256 requestId = randamuVRF.requestRandomness(vrfSeed);
        
        // Store request mapping
        vrfRequests[requestId] = imageHash;
        pendingVRFRequests[imageHash] = requestId;
        
        emit UniquenessRequested(imageHash, requestId, vrfSeed);
        
        return requestId;
    }
    
    /**
     * @dev VRF callback to verify uniqueness (called by VRF)
     */
    function fulfillRandomness(uint256 requestId, uint256 randomness) external {
        require(msg.sender == address(randamuVRF), "Only VRF can fulfill");
        
        string memory imageHash = vrfRequests[requestId];
        require(bytes(imageHash).length > 0, "Invalid request ID");
        require(imageExists[imageHash], "Image does not exist");
        
        ImageMetadata storage image = images[imageHash];
        require(!image.isUnique, "Image already verified");
        
        // Generate uniqueness proof
        bytes32 uniquenessProof = keccak256(abi.encodePacked(
            imageHash,
            image.vrfSeed,
            randomness,
            block.timestamp
        ));
        
        // Check if this proof has been used before
        bool isUnique = !uniquenessProofUsed[uniquenessProof];
        
        if (isUnique) {
            uniquenessProofUsed[uniquenessProof] = true;
            image.isUnique = true;
            image.uniquenessProof = uniquenessProof;
        }
        
        // Clean up request mappings
        delete vrfRequests[requestId];
        delete pendingVRFRequests[imageHash];
        
        emit UniquenessVerified(imageHash, uniquenessProof, isUnique);
    }
    
    /**
     * @dev Get image metadata
     */
    function getImage(string memory imageHash) external view returns (ImageMetadata memory) {
        require(imageExists[imageHash], "Image does not exist");
        return images[imageHash];
    }
    
    /**
     * @dev Get user's images
     */
    function getUserImages(address user) external view returns (string[] memory) {
        return userImageHashes[user];
    }
    
    /**
     * @dev Get user's active (non-deleted) images with metadata
     */
    function getUserActiveImages(address user) external view returns (ImageMetadata[] memory) {
        string[] memory userHashes = userImageHashes[user];
        
        // Count active images
        uint256 activeCount = 0;
        for (uint256 i = 0; i < userHashes.length; i++) {
            if (!images[userHashes[i]].isDeleted) {
                activeCount++;
            }
        }
        
        // Create array of active images
        ImageMetadata[] memory activeImages = new ImageMetadata[](activeCount);
        uint256 activeIndex = 0;
        
        for (uint256 i = 0; i < userHashes.length; i++) {
            if (!images[userHashes[i]].isDeleted) {
                activeImages[activeIndex] = images[userHashes[i]];
                activeIndex++;
            }
        }
        
        return activeImages;
    }
    
    /**
     * @dev Check if image is unique and verified
     */
    function isImageUnique(string memory imageHash) external view returns (bool) {
        if (!imageExists[imageHash]) {
            return false;
        }
        return images[imageHash].isUnique;
    }
    
    /**
     * @dev Delete image (admin only or for cleanup)
     */
    function deleteImage(string memory imageHash) external onlyGenAI {
        require(imageExists[imageHash], "Image does not exist");
        require(!images[imageHash].isDeleted, "Image already deleted");
        
        images[imageHash].isDeleted = true;
        
        emit ImageDeleted(imageHash, images[imageHash].generator);
    }
    
    /**
     * @dev Batch delete images for cleanup
     */
    function batchDeleteImages(string[] memory imageHashes) external onlyGenAI {
        for (uint256 i = 0; i < imageHashes.length; i++) {
            if (imageExists[imageHashes[i]] && !images[imageHashes[i]].isDeleted) {
                images[imageHashes[i]].isDeleted = true;
                emit ImageDeleted(imageHashes[i], images[imageHashes[i]].generator);
            }
        }
    }
    
    /**
     * @dev Generate uniqueness score for an image
     */
    function generateUniquenessScore(
        string memory imageHash,
        uint256 vrfSeed
    ) external view returns (uint256) {
        bytes32 hashBytes = keccak256(abi.encodePacked(imageHash, vrfSeed, block.timestamp));
        return uint256(hashBytes) % 1000000; // Score between 0-999999
    }
    
    /**
     * @dev Check if VRF seed has been used
     */
    function isVRFSeedUsed(uint256 vrfSeed) external view returns (bool) {
        return vrfSeedUsed[vrfSeed];
    }
    
    /**
     * @dev Check if uniqueness proof has been used
     */
    function isUniquenessProofUsed(bytes32 proof) external view returns (bool) {
        return uniquenessProofUsed[proof];
    }
    
    /**
     * @dev Grant GenAI role to authorized contracts
     */
    function grantGenAIRole(address genaiContract) external onlyAdmin {
        require(genaiContract != address(0), "Invalid contract address");
        _grantRole(GENAI_ROLE, genaiContract);
    }
    
    /**
     * @dev Revoke GenAI role
     */
    function revokeGenAIRole(address genaiContract) external onlyAdmin {
        _revokeRole(GENAI_ROLE, genaiContract);
    }
    
    /**
     * @dev Get total number of stored images
     */
    function getTotalImagesStored() external view returns (uint256) {
        // This would need to be tracked separately in a real implementation
        // For now, return 0 as placeholder
        return 0;
    }
    
    /**
     * @dev Emergency function to clean up storage
     */
    function emergencyCleanup(string[] memory imageHashes) external onlyAdmin {
        for (uint256 i = 0; i < imageHashes.length; i++) {
            if (imageExists[imageHashes[i]]) {
                images[imageHashes[i]].isDeleted = true;
                emit ImageDeleted(imageHashes[i], images[imageHashes[i]].generator);
            }
        }
    }
}
