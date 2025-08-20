// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IRandamuVRF.sol";

/**
 * @title MockRandamuVRF
 * @dev Mock implementation of Randamu VRF for testing
 */
contract MockRandamuVRF is IRandamuVRF {
    mapping(uint256 => bool) public requestFulfilled;
    mapping(uint256 => uint256) public randomnessValues;
    
    event RandomnessRequested(uint256 indexed requestId, uint256 indexed seed);
    event RandomnessFulfilled(uint256 indexed requestId, uint256 randomness);
    
    /**
     * @dev Request randomness (mock implementation)
     * @param seed The seed for randomness generation
     * @return requestId The ID of the randomness request
     */
    function requestRandomness(uint256 seed) external override returns (uint256 requestId) {
        requestId = uint256(keccak256(abi.encodePacked(block.timestamp, seed, msg.sender)));
        
        emit RandomnessRequested(requestId, seed);
        
        // Auto-fulfill after a short delay (for testing)
        _fulfillRandomness(requestId, seed);
        
        return requestId;
    }
    
    /**
     * @dev Check if randomness request is fulfilled
     * @param requestId The ID of the randomness request
     * @return fulfilled Whether the request is fulfilled
     */
    function isRequestFulfilled(uint256 requestId) external view override returns (bool fulfilled) {
        return requestFulfilled[requestId];
    }
    
    /**
     * @dev Get the randomness value for a fulfilled request
     * @param requestId The ID of the randomness request
     * @return randomness The randomness value
     */
    function getRandomness(uint256 requestId) external view override returns (uint256 randomness) {
        require(requestFulfilled[requestId], "Request not fulfilled");
        return randomnessValues[requestId];
    }
    
    /**
     * @dev Internal function to fulfill randomness
     * @param requestId The ID of the randomness request
     * @param seed The seed used for the request
     */
    function _fulfillRandomness(uint256 requestId, uint256 seed) internal {
        // Generate pseudo-random value based on seed and block data
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            seed,
            block.timestamp,
            block.difficulty,
            block.coinbase
        )));
        
        requestFulfilled[requestId] = true;
        randomnessValues[requestId] = randomness;
        
        emit RandomnessFulfilled(requestId, randomness);
    }
    
    /**
     * @dev Manually fulfill a randomness request (for testing)
     * @param requestId The ID of the randomness request
     * @param randomness The randomness value to set
     */
    function fulfillRandomness(uint256 requestId, uint256 randomness) external {
        requestFulfilled[requestId] = true;
        randomnessValues[requestId] = randomness;
        
        emit RandomnessFulfilled(requestId, randomness);
    }
    
    /**
     * @dev Reset a request (for testing)
     * @param requestId The ID of the randomness request
     */
    function resetRequest(uint256 requestId) external {
        delete requestFulfilled[requestId];
        delete randomnessValues[requestId];
    }
}
