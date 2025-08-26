import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable intermediate representation to fix stack too deep
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Base Sepolia (Primary testnet for Blocklock)
    ...(process.env.PRIVATE_KEY && {
      "base-sepolia": {
        url: process.env.RPC_URL || "https://sepolia.base.org",
        accounts: [process.env.PRIVATE_KEY],
        chainId: 84532,
        gasPrice: 1000000000, // 1 gwei
        gas: 3000000,
      },
    }),
    // Regular Sepolia (backup)
    ...(process.env.PRIVATE_KEY && process.env.SEPOLIA_RPC_URL && {
      sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        chainId: 11155111,
      },
    }),
  },
  etherscan: {
    apiKey: {
      "base-sepolia": process.env.BASESCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;
