// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SimpleGenAINFT
 * @dev Simplified Soul-Bound NFTs for AI-generated images
 */
contract SimpleGenAINFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Base minting price (0.0005 ETH)
    uint256 public constant BASE_MINT_PRICE = 0.0005 ether;
    
    // Admin wallet for receiving payments
    address public adminWallet;
    
    uint256 private _tokenIds = 0;
    
    struct GenAIMetadata {
        string prompt;
        string imageHash;
        string style;
        string size;
        uint256 generatedAt;
        address generator;
        bool isSoulBound; // All GenAI NFTs are soul-bound
    }
    
    // Mapping from token ID to metadata
    mapping(uint256 => GenAIMetadata) private _genaiMetadata;
    
    // Mapping to track image uniqueness by hash
    mapping(string => bool) private _imageExists;
    
    // Soul-bound: prevent transfers (except mint/burn)
    mapping(uint256 => bool) private _soulBound;
    
    event GenAINFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string prompt,
        string imageHash,
        string style,
        string size
    );
    
    constructor(address _adminWallet) ERC721("Simple GenAI Soul-Bound NFT", "SGENAI-SBT") Ownable(msg.sender) {
        require(_adminWallet != address(0), "Admin wallet cannot be zero");
        adminWallet = _adminWallet;
    }
    
    /**
     * @dev Mint a soul-bound GenAI NFT
     */
    function mintGenAINFT(
        address to,
        string memory prompt,
        string memory imageHash,
        string memory style,
        string memory size
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= BASE_MINT_PRICE, "Insufficient payment");
        require(to != address(0), "Cannot mint to zero address");
        require(bytes(prompt).length > 0, "Prompt cannot be empty");
        require(bytes(imageHash).length > 0, "Image hash cannot be empty");
        require(!_imageExists[imageHash], "Image hash already exists");
        
        // Increment token ID
        _tokenIds++;
        uint256 tokenId = _tokenIds;
        
        // Mark image as existing
        _imageExists[imageHash] = true;
        
        // Store metadata
        _genaiMetadata[tokenId] = GenAIMetadata({
            prompt: prompt,
            imageHash: imageHash,
            style: style,
            size: size,
            generatedAt: block.timestamp,
            generator: to,
            isSoulBound: true
        });
        
        // Mark as soul-bound
        _soulBound[tokenId] = true;
        
        // Mint the NFT
        _mint(to, tokenId);
        
        // Transfer payment to admin wallet
        (bool success, ) = adminWallet.call{value: msg.value}("");
        require(success, "Payment transfer failed");
        
        emit GenAINFTMinted(tokenId, to, prompt, imageHash, style, size);
        
        return tokenId;
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
     * @dev Get total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Check if a token is soul-bound
     */
    function isSoulBound(uint256 tokenId) external view returns (bool) {
        return _soulBound[tokenId];
    }
    
    /**
     * @dev Override transfer functions to prevent transfers of soul-bound NFTs
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from != address(0) && to != address(0)) {
            require(!_soulBound[tokenId], "Soul-bound NFTs cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @dev Generate token URI with metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        GenAIMetadata memory metadata = _genaiMetadata[tokenId];
        
        // Create JSON metadata
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"GenAI Soul-Bound NFT #', tokenId.toString(), '",',
                        '"description":"Soul-bound NFT generated using AI. This NFT cannot be transferred.",',
                        '"image":"', metadata.imageHash, '",',
                        '"attributes":[',
                        '{"trait_type":"Prompt","value":"', metadata.prompt, '"},',
                        '{"trait_type":"Style","value":"', metadata.style, '"},',
                        '{"trait_type":"Size","value":"', metadata.size, '"},',
                        '{"trait_type":"AI Generated","value":"true"},',
                        '{"trait_type":"Soul-bound","value":"true"},',
                        '{"trait_type":"Generated At","value":"', metadata.generatedAt.toString(), '"},',
                        '{"trait_type":"Generator","value":"', Strings.toHexString(uint160(metadata.generator), 20), '"}',
                        ']}'
                    )
                )
            )
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }
    
    /**
     * @dev Update admin wallet (only owner)
     */
    function setAdminWallet(address _adminWallet) external onlyOwner {
        require(_adminWallet != address(0), "Admin wallet cannot be zero");
        adminWallet = _adminWallet;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
