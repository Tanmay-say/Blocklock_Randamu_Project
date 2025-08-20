// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRandamuVRF
 * @dev Interface for Randamu Verifiable Randomness
 */
interface IRandamuVRF {
    /**
     * @dev Request randomness for a specific seed
     * @param seed The seed for randomness generation
     * @return requestId The ID of the randomness request
     */
    function requestRandomness(uint256 seed) external returns (uint256 requestId);
    
    /**
     * @dev Check if randomness request is fulfilled
     * @param requestId The ID of the randomness request
     * @return fulfilled Whether the request is fulfilled
     */
    function isRequestFulfilled(uint256 requestId) external view returns (bool fulfilled);
    
    /**
     * @dev Get the randomness value for a fulfilled request
     * @param requestId The ID of the randomness request
     * @return randomness The randomness value
     */
    function getRandomness(uint256 requestId) external view returns (uint256 randomness);
}
