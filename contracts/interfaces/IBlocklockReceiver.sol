// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IBlocklockReceiver
 * @dev Interface for receiving decrypted data from Blocklock
 */
interface IBlocklockReceiver {
    /**
     * @dev Callback function called when Blocklock decryption is complete
     * @param auctionId The ID of the auction
     * @param bidder The address of the bidder
     * @param amount The decrypted bid amount
     * @param proof The proof of decryption
     */
    function onBlocklockDecryption(
        uint256 auctionId,
        address bidder,
        uint256 amount,
        bytes calldata proof
    ) external;
}
