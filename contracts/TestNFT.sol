// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestNFT
 * @dev Simple ERC-721 token for testing auctions
 */
contract TestNFT is ERC721, Ownable {
    uint256 private _tokenIds = 0;
    
    // Mapping for token metadata
    mapping(uint256 => string) private _tokenURIs;
    
    constructor() ERC721("TestNFT", "TNFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new token
     * @param to The address to mint the token to
     * @param uri The URI for the token
     */
    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIds;
        _tokenIds++;
        _mint(to, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}
