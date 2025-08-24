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
  switchToBaseSepolia: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Base Sepolia network configuration
const BASE_SEPOLIA = {
  chainId: '0x14A34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// Admin addresses (actual deployed admin)
const ADMIN_ADDRESSES = [
  '0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC', // Deployed admin wallet
];

// Seller addresses (actual deployed seller)
const SELLER_ADDRESSES = [
  '0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC', // Deployed seller wallet
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
        
        // Check current network
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('Current Chain ID:', currentChainId);
        console.log('Target Chain ID:', BASE_SEPOLIA.chainId);
        
        // Force switch to Base Sepolia if not already on it
        if (currentChainId !== BASE_SEPOLIA.chainId) {
          console.log('Switching to Base Sepolia...');
          await switchToBaseSepolia();
        } else {
          console.log('Already on Base Sepolia');
        }
      } else {
        alert('Please install MetaMask or another Ethereum wallet!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Error connecting wallet. Please try again.');
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

  const switchToBaseSepolia = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        console.log('Attempting to switch to Base Sepolia...');
        
        try {
          // First try to switch to Base Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_SEPOLIA.chainId }],
          });
          console.log('Successfully switched to Base Sepolia');
        } catch (switchError: any) {
          console.log('Switch error:', switchError);
          
          // If Base Sepolia is not added to MetaMask, add it
          if (switchError.code === 4902) {
            console.log('Base Sepolia not found, adding network...');
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BASE_SEPOLIA],
              });
              console.log('Successfully added Base Sepolia network');
            } catch (addError) {
              console.error('Error adding Base Sepolia network:', addError);
              alert('Failed to add Base Sepolia network. Please add it manually in MetaMask.');
            }
          } else {
            console.error('Error switching to Base Sepolia:', switchError);
            alert('Failed to switch to Base Sepolia. Please switch manually in MetaMask.');
          }
        }
      }
    } catch (error) {
      console.error('Error in switchToBaseSepolia:', error);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (targetChainId === 84532) {
      await switchToBaseSepolia();
    } else {
      console.log('Unsupported network requested:', targetChainId);
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
    const newChainId = parseInt(chainId, 16);
    setChainId(newChainId);
    
    console.log('Network changed to:', newChainId);
    
    // If user switches away from Base Sepolia, prompt them to switch back
    if (newChainId !== 84532 && isConnected) {
      console.log('User switched away from Base Sepolia, prompting to switch back...');
      
      // Small delay to ensure UI updates
      setTimeout(() => {
        if (confirm('This app requires Base Sepolia network. Would you like to switch back to Base Sepolia?')) {
          switchToBaseSepolia();
        }
      }, 1000);
    }
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
    switchToBaseSepolia,
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
