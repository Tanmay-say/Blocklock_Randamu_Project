import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { ContractService, ContractAddresses, LOCAL_CONTRACT_ADDRESSES } from '@/lib/contracts';

interface BlockchainContextType {
  contractService: ContractService | null;
  isContractsLoaded: boolean;
  contractAddresses: ContractAddresses;
  currentBlock: number;
  isAdmin: boolean;
  isSeller: boolean;
  adminWallet: string;
  
  // Functions
  loadContracts: (provider: ethers.Provider, signer?: ethers.Signer) => Promise<void>;
  checkUserRoles: (address: string) => Promise<void>;
  refreshBlockNumber: () => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [isContractsLoaded, setIsContractsLoaded] = useState(false);
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses>(LOCAL_CONTRACT_ADDRESSES);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [adminWallet, setAdminWallet] = useState('');

  // Load contract addresses from deployment file or localStorage
  useEffect(() => {
    const loadSavedAddresses = () => {
      try {
        // Try to load from localStorage first
        const saved = localStorage.getItem('contract-addresses');
        if (saved) {
          const addresses = JSON.parse(saved);
          setContractAddresses(addresses);
          console.log('Loaded contract addresses from localStorage:', addresses);
          return;
        }

        // Try to load from deployment.json if available
        fetch('/deployment.json')
          .then(response => response.json())
          .then(data => {
            if (data.contracts) {
              const addresses: ContractAddresses = {
                auctionHouse: data.contracts.AuctionHouse,
                testNFT: data.contracts.TestNFT,
                winnerSBT: data.contracts.WinnerSBT,
                mockRandamuVRF: data.contracts.MockRandamuVRF
              };
              setContractAddresses(addresses);
              localStorage.setItem('contract-addresses', JSON.stringify(addresses));
              console.log('Loaded contract addresses from deployment.json:', addresses);
            }
          })
          .catch(error => {
            console.log('No deployment.json found, using default addresses');
          });
      } catch (error) {
        console.error('Error loading contract addresses:', error);
      }
    };

    loadSavedAddresses();
  }, []);

  const loadContracts = async (provider: ethers.Provider, signer?: ethers.Signer) => {
    try {
      if (!contractAddresses.auctionHouse) {
        console.warn('Contract addresses not loaded yet');
        return;
      }

      const service = new ContractService(provider, contractAddresses, signer);
      setContractService(service);
      setIsContractsLoaded(true);

      // Load admin wallet address
      try {
        const adminAddr = await service.getAdminWallet();
        setAdminWallet(adminAddr);
      } catch (error) {
        console.error('Error loading admin wallet:', error);
      }

      // Get current block number
      await refreshBlockNumber();

      console.log('Contracts loaded successfully');
    } catch (error) {
      console.error('Error loading contracts:', error);
      setIsContractsLoaded(false);
    }
  };

  const checkUserRoles = async (address: string) => {
    if (!contractService) {
      setIsAdmin(false);
      setIsSeller(false);
      return;
    }

    try {
      const [adminResult, sellerResult] = await Promise.all([
        contractService.isAdmin(address),
        contractService.isSeller(address)
      ]);

      setIsAdmin(adminResult);
      setIsSeller(sellerResult);
    } catch (error) {
      console.error('Error checking user roles:', error);
      setIsAdmin(false);
      setIsSeller(false);
    }
  };

  const refreshBlockNumber = async () => {
    if (!contractService) return;

    try {
      const blockNumber = await contractService.getCurrentBlock();
      setCurrentBlock(blockNumber);
    } catch (error) {
      console.error('Error getting current block:', error);
    }
  };

  // Auto-refresh block number every 30 seconds
  useEffect(() => {
    if (!contractService) return;

    const interval = setInterval(refreshBlockNumber, 30000);
    return () => clearInterval(interval);
  }, [contractService]);

  const value: BlockchainContextType = {
    contractService,
    isContractsLoaded,
    contractAddresses,
    currentBlock,
    isAdmin,
    isSeller,
    adminWallet,
    loadContracts,
    checkUserRoles,
    refreshBlockNumber
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

// Helper hook for auction operations
export const useAuctionOperations = () => {
  const { contractService, isContractsLoaded } = useBlockchain();

  const createAuction = async (
    nftAddress: string,
    tokenId: number,
    reservePrice: string,
    durationBlocks: number
  ) => {
    if (!contractService) throw new Error('Contracts not loaded');
    return await contractService.createAuction(nftAddress, tokenId, reservePrice, durationBlocks);
  };

  const placeBid = async (
    auctionId: number,
    bidAmount: string,
    depositAmount: string
  ) => {
    if (!contractService) throw new Error('Contracts not loaded');
    
    // TODO: Implement actual Blocklock encryption
    // For now, we'll use a simple encoding
    const encryptedData = await import('@/lib/contracts').then(({ encryptBid }) => 
      encryptBid(auctionId, bidAmount, 'bidder', 0)
    );

    return await contractService.commitBid(
      auctionId,
      encryptedData.ciphertext,
      encryptedData.condition,
      depositAmount
    );
  };

  const finalizeAuction = async (auctionId: number) => {
    if (!contractService) throw new Error('Contracts not loaded');
    return await contractService.finalizeAuction(auctionId);
  };

  const getAuction = async (auctionId: number) => {
    if (!contractService) throw new Error('Contracts not loaded');
    return await contractService.getAuction(auctionId);
  };

  const getAuctionBids = async (auctionId: number) => {
    if (!contractService) throw new Error('Contracts not loaded');
    return await contractService.getAuctionBids(auctionId);
  };

  return {
    createAuction,
    placeBid,
    finalizeAuction,
    getAuction,
    getAuctionBids,
    isReady: isContractsLoaded
  };
};

