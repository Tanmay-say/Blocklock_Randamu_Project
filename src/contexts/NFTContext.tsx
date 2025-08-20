import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NFT, nfts as initialNFTs } from '@/data/nfts';

interface NFTContextType {
  nfts: NFT[];
  addNFT: (nft: NFT) => void;
  updateNFT: (id: string, updatedNFT: Partial<NFT>) => void;
  deleteNFT: (id: string) => void;
  getNFTById: (id: string) => NFT | undefined;
  getNFTsByStatus: (status: NFT['status']) => NFT[];
  getNFTsByCollection: (collection: string) => NFT[];
  getNFTsByTag: (tag: string) => NFT[];
  refreshNFTs: () => void;
  resetNFTs: () => void;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const NFTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with localStorage persistence
  const [nfts, setNfts] = useState<NFT[]>(() => {
    try {
      const savedNFTs = localStorage.getItem('nft-marketplace-data');
      if (savedNFTs) {
        const parsed = JSON.parse(savedNFTs);
        // Validate the data structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('NFTContext: Restored', parsed.length, 'NFTs from localStorage');
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to restore NFTs from localStorage:', error);
    }
    console.log('NFTContext: Initializing with', initialNFTs.length, 'default NFTs');
    return initialNFTs;
  });

  // Persist to localStorage whenever NFTs change
  useEffect(() => {
    try {
      localStorage.setItem('nft-marketplace-data', JSON.stringify(nfts));
      console.log('NFTContext: Persisted', nfts.length, 'NFTs to localStorage');
    } catch (error) {
      console.warn('Failed to persist NFTs to localStorage:', error);
    }
  }, [nfts]);

  const addNFT = (nft: NFT) => {
    console.log('NFTContext: Adding NFT:', nft.name);
    setNfts(prevNfts => [...prevNfts, nft]);
  };

  const updateNFT = (id: string, updatedNFT: Partial<NFT>) => {
    setNfts(prevNfts => 
      prevNfts.map(nft => 
        nft.id === id ? { ...nft, ...updatedNFT } : nft
      )
    );
  };

  const deleteNFT = (id: string) => {
    setNfts(prevNfts => prevNfts.filter(nft => nft.id !== id));
  };

  const getNFTById = (id: string): NFT | undefined => {
    return nfts.find(nft => nft.id === id);
  };

  const getNFTsByStatus = (status: NFT['status']): NFT[] => {
    return nfts.filter(nft => nft.status === status);
  };

  const getNFTsByCollection = (collection: string): NFT[] => {
    return nfts.filter(nft => nft.collection === collection);
  };

  const getNFTsByTag = (tag: string): NFT[] => {
    return nfts.filter(nft => nft.tags.includes(tag));
  };

  const refreshNFTs = () => {
    // Force a re-render by updating the state
    setNfts(prevNfts => [...prevNfts]);
  };

  const resetNFTs = () => {
    // Reset to initial data and clear localStorage
    localStorage.removeItem('nft-marketplace-data');
    setNfts(initialNFTs);
    console.log('NFTContext: Reset to initial', initialNFTs.length, 'NFTs');
  };

  const value: NFTContextType = {
    nfts,
    addNFT,
    updateNFT,
    deleteNFT,
    getNFTById,
    getNFTsByStatus,
    getNFTsByCollection,
    getNFTsByTag,
    refreshNFTs,
    resetNFTs,
  };

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  );
};

export const useNFT = (): NFTContextType => {
  const context = useContext(NFTContext);
  if (context === undefined) {
    throw new Error('useNFT must be used within an NFTProvider');
  }
  return context;
};
