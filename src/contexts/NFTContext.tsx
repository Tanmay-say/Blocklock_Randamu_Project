import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NFT, Bid, nfts as initialNFTs } from '@/data/nfts';

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
  // Bid management functions
  placeBid: (nftId: string, bidder: string, amount: number, transactionHash?: string) => void;
  getBidsForNFT: (nftId: string) => Bid[];
  getBidsForUser: (userAddress: string) => Bid[];
  getAllBids: () => Bid[];
  getHighestBidForNFT: (nftId: string) => Bid | undefined;
  endAuction: (nftId: string) => void;
  getOwnedNFTs: (userAddress: string) => NFT[];
  hasUserBidOnNFT: (nftId: string, userAddress: string) => boolean;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const NFTProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with localStorage persistence
  const [nfts, setNfts] = useState<NFT[]>(() => {
    try {
      const savedNFTs = localStorage.getItem('nft-marketplace-data');
      if (savedNFTs) {
        const parsed = JSON.parse(savedNFTs);
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

  // Bid management functions
  const placeBid = (nftId: string, bidder: string, amount: number, transactionHash?: string) => {
    const newBid: Bid = {
      id: `bid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nftId,
      bidder,
      amount,
      timestamp: new Date().toISOString(),
      transactionHash
    };

    setNfts(prevNfts => {
      return prevNfts.map(nft => {
        if (nft.id === nftId) {
          const updatedBids = [...(nft.bids || []), newBid];
          const highestBid = updatedBids.reduce((highest, bid) => 
            bid.amount > highest.amount ? bid : highest
          );
          
          return {
            ...nft,
            bids: updatedBids,
            highestBid,
            currentBids: updatedBids.length,
            price: Math.max(nft.price, highestBid.amount) // Update current price to highest bid
          };
        }
        return nft;
      });
    });
  };

  const getBidsForNFT = (nftId: string): Bid[] => {
    const nft = nfts.find(n => n.id === nftId);
    return nft?.bids || [];
  };

  const getBidsForUser = (userAddress: string): Bid[] => {
    const allBids: Bid[] = [];
    nfts.forEach(nft => {
      if (nft.bids) {
        const userBids = nft.bids.filter(bid => 
          bid.bidder.toLowerCase() === userAddress.toLowerCase()
        );
        allBids.push(...userBids);
      }
    });
    return allBids.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getAllBids = (): Bid[] => {
    const allBids: Bid[] = [];
    nfts.forEach(nft => {
      if (nft.bids) {
        allBids.push(...nft.bids);
      }
    });
    return allBids.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getHighestBidForNFT = (nftId: string): Bid | undefined => {
    const nft = nfts.find(n => n.id === nftId);
    return nft?.highestBid;
  };

  const endAuction = (nftId: string) => {
    setNfts(prevNfts => {
      return prevNfts.map(nft => {
        if (nft.id === nftId && nft.status === 'auction') {
          const highestBid = nft.highestBid;
          return {
            ...nft,
            status: 'sold' as const,
            winner: highestBid?.bidder,
            owner: highestBid?.bidder
          };
        }
        return nft;
      });
    });
  };

  const getOwnedNFTs = (userAddress: string): NFT[] => {
    return nfts.filter(nft => 
      nft.owner?.toLowerCase() === userAddress.toLowerCase() ||
      (nft.status === 'sold' && nft.winner?.toLowerCase() === userAddress.toLowerCase())
    );
  };

  const hasUserBidOnNFT = (nftId: string, userAddress: string): boolean => {
    const nft = nfts.find(n => n.id === nftId);
    if (!nft || !nft.bids) return false;
    
    return nft.bids.some(bid => 
      bid.bidder.toLowerCase() === userAddress.toLowerCase()
    );
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
    // Bid management functions
    placeBid,
    getBidsForNFT,
    getBidsForUser,
    getAllBids,
    getHighestBidForNFT,
    endAuction,
    getOwnedNFTs,
    hasUserBidOnNFT,
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
