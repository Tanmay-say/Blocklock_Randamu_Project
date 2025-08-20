// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract WinnerSBT is ERC721, AccessControl {
    using Strings for uint256;
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIds = 0;
    
    // Mapping from token ID to auction ID
    mapping(uint256 => uint256) private _auctionIds;
    
    // Mapping from auction ID to token ID
    mapping(uint256 => uint256) private _auctionTokens;
    
    event WinnerBadgeMinted(uint256 indexed tokenId, address indexed to, uint256 indexed auctionId);
    
    constructor() ERC721("Winner SBT", "WSBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
    
    function mintLocked(address to, uint256 auctionId) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(_auctionTokens[auctionId] == 0, "Auction already has winner badge");
        
        uint256 tokenId = _tokenIds;
        _tokenIds++;
        
        _mint(to, tokenId);
        _auctionIds[tokenId] = auctionId;
        _auctionTokens[auctionId] = tokenId;
        
        emit WinnerBadgeMinted(tokenId, to, auctionId);
        
        return tokenId;
    }
    
    function locked(uint256 tokenId) external pure returns (bool) {
        return true; // SBTs are always locked (non-transferable)
    }
    
    function getAuctionId(uint256 tokenId) external view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _auctionIds[tokenId];
    }
    
    function getTokenForAuction(uint256 auctionId) external view returns (uint256) {
        return _auctionTokens[auctionId];
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        uint256 auctionId = _auctionIds[tokenId];
        
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name": "Winner Badge #', tokenId.toString(), '",',
            '"description": "Soulbound token for winning auction #', auctionId.toString(), '",',
            '"image": "data:image/svg+xml;base64,', _generateSVG(tokenId, auctionId), '",',
            '"attributes": [',
            '{"trait_type": "Auction ID", "value": "', auctionId.toString(), '"},',
            '{"trait_type": "Type", "value": "Winner Badge"},',
            '{"trait_type": "Transferable", "value": "No"}',
            ']}'
        ))));
        
        return string(abi.encodePacked('data:application/json;base64,', json));
    }
    
    function _generateSVG(uint256 tokenId, uint256 auctionId) internal pure returns (string memory) {
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="#1a1a1a"/>',
            '<circle cx="200" cy="200" r="150" fill="#4a90e2" stroke="#ffffff" stroke-width="4"/>',
            '<text x="200" y="180" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="24" font-weight="bold">WINNER</text>',
            '<text x="200" y="210" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="18">Auction #', auctionId.toString(), '</text>',
            '<text x="200" y="240" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16">Badge #', tokenId.toString(), '</text>',
            '<text x="200" y="270" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="14">Soulbound Token</text>',
            '</svg>'
        ));
        
        return Base64.encode(bytes(svg));
    }
    
    // Override transfer functions to make it non-transferable
    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("SBT: transfer not allowed");
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("SBT: transfer not allowed");
    }
    
    function approve(address to, uint256 tokenId) public pure override {
        revert("SBT: approval not allowed");
    }
    
    function setApprovalForAll(address operator, bool approved) public pure override {
        revert("SBT: approval not allowed");
    }
    
    function getApproved(uint256 tokenId) public pure override returns (address) {
        return address(0);
    }
    
    function isApprovedForAll(address owner, address operator) public pure override returns (bool) {
        return false;
    }
    
    // Required override
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
