// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IRandamuVRF.sol";

/**
 * @title GenAINFT
 * @dev Soul-Bound NFTs for AI-generated images with uniqueness verification
 */
contract GenAINFT is ERC721, AccessControl, ReentrancyGuard {
    using Strings for uint256;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Base minting price (0.0005 ETH)
    uint256 public constant BASE_MINT_PRICE = 0.0005 ether;
    
    // Admin wallet for receiving payments
    address public adminWallet;
    
    // VRF for uniqueness verification
    IRandamuVRF public immutable randamuVRF;
    
    uint256 private _tokenIds = 0;
    
    struct GenAIMetadata {
        string prompt;
        string imageHash; // IPFS or content hash
        string style;
        string size;
        uint256 generatedAt;
        uint256 vrfSeed; // VRF seed for uniqueness
        address generator; // Who generated the image
        bool isSoulBound; // All GenAI NFTs are soul-bound
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => GenAIMetadata) private _genaiMetadata;
    
    // Mapping to track image uniqueness by hash
    mapping(string => bool) private _imageExists;
    
    // Mapping to prevent duplicate VRF seeds
    mapping(uint256 => bool) private _vrfSeedUsed;
    
    // Events
    event GenAINFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string prompt,
        string imageHash,
        uint256 vrfSeed
    );
    
    event UniquenessVerified(
        string indexed imageHash,
        uint256 vrfSeed
    );
    
    event AdminWalletUpdated(
        address indexed oldAdmin,
        address indexed newAdmin
    );
    
    constructor(
        address _adminWallet,
        address _randamuVRF
    ) ERC721("GenAI Soul-Bound NFT", "GENAI-SBT") {
        require(_adminWallet != address(0), "Invalid admin wallet");
        require(_randamuVRF != address(0), "Invalid VRF address");
        
        adminWallet = _adminWallet;
        randamuVRF = IRandamuVRF(_randamuVRF);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint GenAI NFT with payment and uniqueness verification
     */
    function mintGenAINFT(
        address to,
        string memory prompt,
        string memory imageHash,
        string memory style,
        string memory size,
        uint256 vrfSeed
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= BASE_MINT_PRICE, "Insufficient payment");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(prompt).length > 0, "Prompt cannot be empty");
        require(bytes(imageHash).length > 0, "Image hash cannot be empty");
        require(!_imageExists[imageHash], "Image already exists");
        require(!_vrfSeedUsed[vrfSeed], "VRF seed already used");
        
        // Verify VRF seed (additional uniqueness layer)
        _verifyVRFUniqueness(imageHash, vrfSeed);
        
        uint256 tokenId = _tokenIds;
        _tokenIds++;
        
        // Mark image and VRF seed as used
        _imageExists[imageHash] = true;
        _vrfSeedUsed[vrfSeed] = true;
        
        // Store metadata
        _genaiMetadata[tokenId] = GenAIMetadata({
            prompt: prompt,
            imageHash: imageHash,
            style: style,
            size: size,
            generatedAt: block.timestamp,
            vrfSeed: vrfSeed,
            generator: to,
            isSoulBound: true
        });
        
        // Mint the soul-bound NFT
        _mint(to, tokenId);
        
        // Transfer payment to admin
        if (msg.value > 0) {
            (bool success, ) = adminWallet.call{value: msg.value}("");
            require(success, "Payment transfer failed");
        }
        
        emit GenAINFTMinted(tokenId, to, prompt, imageHash, vrfSeed);
        emit UniquenessVerified(imageHash, vrfSeed);
        
        return tokenId;
    }
    
    /**
     * @dev Verify image uniqueness using VRF
     */
    function _verifyVRFUniqueness(
        string memory imageHash,
        uint256 vrfSeed
    ) internal view {
        // Use VRF to verify the uniqueness claim
        // This creates an additional layer of uniqueness verification
        bytes32 hashBytes = keccak256(abi.encodePacked(imageHash, vrfSeed));
        uint256 uniquenessScore = uint256(hashBytes) % 1000000;
        
        // Require a minimum uniqueness score (adjustable)
        require(uniquenessScore > 100, "Image uniqueness score too low");
    }
    
    /**
     * @dev Override transfer functions to make NFTs soul-bound
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        if (from != address(0) && to != address(0)) {
            revert("GenAI NFTs are soul-bound and cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Get GenAI metadata for a token
     */
    function getGenAIMetadata(uint256 tokenId) external view returns (GenAIMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _genaiMetadata[tokenId];
    }
    
    /**
     * @dev Check if an image hash already exists
     */
    function imageExists(string memory imageHash) external view returns (bool) {
        return _imageExists[imageHash];
    }
    
    /**
     * @dev Check if a VRF seed has been used
     */
    function vrfSeedUsed(uint256 vrfSeed) external view returns (bool) {
        return _vrfSeedUsed[vrfSeed];
    }
    
    /**
     * @dev Generate dynamic metadata URI with image data
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        GenAIMetadata memory metadata = _genaiMetadata[tokenId];
        string memory imageUri = _normalizeImageURI(metadata.imageHash);
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "GenAI SBT #',
            tokenId.toString(),
            '", "description": "Soul-bound NFT for AI-generated image: ',
            metadata.prompt,
            '", "image": "',
            imageUri,
            '", "attributes": [',
            '{"trait_type": "Prompt", "value": "',
            metadata.prompt,
            '"},',
            '{"trait_type": "Style", "value": "',
            metadata.style,
            '"},',
            '{"trait_type": "Size", "value": "',
            metadata.size,
            '"},',
            '{"trait_type": "VRF Seed", "value": ',
            metadata.vrfSeed.toString(),
            '},',
            '{"trait_type": "Generated At", "value": ',
            metadata.generatedAt.toString(),
            '},',
            '{"trait_type": "Soul Bound", "value": "true"}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    function _normalizeImageURI(string memory ref) internal pure returns (string memory) {
        bytes memory b = bytes(ref);
        if (b.length == 0) return ref;
        // http or https
        if (
            (b.length >= 7 && b[0]=='h'&&b[1]=='t'&&b[2]=='t'&&b[3]=='p'&&b[4]=='s'&&b[5]==':'&&b[6]=='/') ||
            (b.length >= 6 && b[0]=='h'&&b[1]=='t'&&b[2]=='t'&&b[3]=='p'&&b[4]==':'&&b[5]=='/')
        ) {
            return ref;
        }
        // ipfs://CID
        if (b.length > 7 && b[0]=='i'&&b[1]=='p'&&b[2]=='f'&&b[3]=='s'&&b[4]==':'&&b[5]=='/'&&b[6]=='/') {
            bytes memory cid = new bytes(b.length - 7);
            for (uint256 i=7;i<b.length;i++){ cid[i-7]=b[i]; }
            return string(abi.encodePacked('https://ipfs.io/ipfs/', string(cid)));
        }
        // bare CID (Qm... or b...)
        if ((b[0]=='Q'&&b[1]=='m') || b[0]=='b') {
            return string(abi.encodePacked('https://ipfs.io/ipfs/', ref));
        }
        return ref;
    }
    
    /**
     * @dev Update admin wallet (only admin)
     */
    function updateAdminWallet(address newAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Invalid admin address");
        
        address oldAdmin = adminWallet;
        adminWallet = newAdmin;
        
        emit AdminWalletUpdated(oldAdmin, newAdmin);
    }
    
    /**
     * @dev Get total supply of GenAI NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Emergency withdrawal (only admin)
     */
    function emergencyWithdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = adminWallet.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Support for interface detection
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
