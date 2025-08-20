import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Ethereum Sepolia network configuration
const ETHEREUM_SEPOLIA = {
  chainId: '0xAA36A7', // 11155111 in hex
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/your-project-id'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Admin addresses (you can add more)
const ADMIN_ADDRESSES = [
  '0x1234567890123456789012345678901234567890', // Replace with actual admin addresses
  // Add your actual admin wallet address here
  // For testing, you can temporarily add any address you want to test with
];

// Seller addresses (you can add more)
const SELLER_ADDRESSES = [
  '0x1234567890123456789012345678901234567890', // Replace with actual seller addresses
];

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await handleAccountsChanged(accounts);
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await handleAccountsChanged(accounts);
        
        // Check and switch to Ethereum Sepolia if needed
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== ETHEREUM_SEPOLIA.chainId) {
          await switchNetwork(11155111);
        }
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
    setIsSeller(false);
    setChainId(null);
    setProvider(null);
    setSigner(null);
  };

  const switchNetwork = async (targetChainId: number) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const targetChainIdHex = '0x' + targetChainId.toString(16);
        
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainIdHex }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [ETHEREUM_SEPOLIA],
              });
            } catch (addError) {
              console.error('Error adding network:', addError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const newAccount = accounts[0];
      setAccount(newAccount);
      setIsConnected(true);
      
      // Check if account is admin or seller
      const accountLower = newAccount.toLowerCase();
      setIsAdmin(ADMIN_ADDRESSES.some(addr => addr.toLowerCase() === accountLower));
      setIsSeller(SELLER_ADDRESSES.some(addr => addr.toLowerCase() === accountLower));
      
      // Set up provider and signer
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      setProvider(newProvider);
      setSigner(newSigner);
      
      // Get chain ID
      const network = await newProvider.getNetwork();
      setChainId(Number(network.chainId));
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(parseInt(chainId, 16));
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const value: WalletContextType = {
    account,
    isConnected,
    isAdmin,
    isSeller,
    chainId,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    provider,
    signer,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
