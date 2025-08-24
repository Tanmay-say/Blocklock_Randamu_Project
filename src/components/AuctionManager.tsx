import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNFT } from '@/contexts/NFTContext';
import { useWallet } from '@/contexts/WalletContext';
import { LOCAL_CONTRACT_ADDRESSES } from '@/lib/contracts';
import { ethers } from 'ethers';
import { Trophy, Clock, Users, Gavel } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export const AuctionManager: React.FC = () => {
  const { nfts, endAuction, getHighestBidForNFT } = useNFT();
  const { account, signer, isConnected } = useWallet();
  
  // Get all active auctions
  const activeAuctions = nfts.filter(nft => nft.status === 'auction');
  
  const handleEndAuction = async (nftId: string) => {
    if (!signer || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet to end auctions.",
        variant: "destructive",
      });
      return;
    }
    
    const nft = nfts.find(n => n.id === nftId);
    const highestBid = getHighestBidForNFT(nftId);
    
    if (!nft || !highestBid) {
      toast({
        title: "Error",
        description: "No valid bids found for this auction.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Try to mint NFT to auction winner
      let nftMinted = false;
      
      try {
        const testNFTContract = new ethers.Contract(
          LOCAL_CONTRACT_ADDRESSES.testNFT,
          [
            "function mint(address to, string memory uri) external returns (uint256)",
            "function ownerOf(uint256 tokenId) external view returns (address)",
            "function tokenURI(uint256 tokenId) external view returns (string memory)"
          ],
          signer
        );
        
        // Create metadata for the auction winner
        const metadata = {
          name: nft.name,
          description: nft.description,
          image: nft.image,
          attributes: nft.attributes || [],
          won_from: "NGT Marketplace Auction",
          winning_bid: highestBid.amount,
          auction_end_date: new Date().toISOString(),
          winner: highestBid.bidder
        };
        
        const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
        
        console.log('Minting NFT to auction winner:', highestBid.bidder);
        
        // Mint NFT to the auction winner
        const mintTx = await testNFTContract.mint(highestBid.bidder, metadataURI);
        const mintReceipt = await mintTx.wait();
        
        if (mintReceipt?.status === 1) {
          nftMinted = true;
          console.log('NFT minted to auction winner:', mintTx.hash);
        }
        
      } catch (mintError: any) {
        console.warn('NFT minting to winner failed:', mintError);
        if (mintError.message.includes('Ownable: caller is not the owner')) {
          console.log('Contract requires owner permission - using local tracking');
        }
      }
      
      // End the auction in our local system
      endAuction(nftId);
      
      toast({
        title: "Auction Ended!",
        description: nftMinted 
          ? `${nft.name} won by ${highestBid.bidder.slice(0, 6)}...${highestBid.bidder.slice(-4)} for ${highestBid.amount} ETH. NFT minted to winner!`
          : `${nft.name} won by ${highestBid.bidder.slice(0, 6)}...${highestBid.bidder.slice(-4)} for ${highestBid.amount} ETH. Ownership recorded!`,
      });
      
    } catch (error: any) {
      console.error('Error ending auction:', error);
      toast({
        title: "Error",
        description: "Failed to end auction. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!isConnected) {
    return (
      <Card className="bg-gradient-card border border-nft-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect your wallet to manage auctions</p>
        </CardContent>
      </Card>
    );
  }
  
  if (activeAuctions.length === 0) {
    return (
      <Card className="bg-gradient-card border border-nft-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            Auction Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No active auctions to manage
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-card border border-nft-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Gavel className="w-5 h-5 text-primary" />
          Active Auctions ({activeAuctions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAuctions.map((nft) => {
          const highestBid = getHighestBidForNFT(nft.id);
          const bidCount = nft.bids?.length || 0;
          
          return (
            <div key={nft.id} className="p-4 bg-background/30 rounded-lg border border-nft-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{nft.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {bidCount} bids
                      </div>
                      {highestBid && (
                        <div className="flex items-center gap-1 text-sm text-green-400">
                          <Trophy className="w-3 h-3" />
                          Highest: {highestBid.amount} ETH
                        </div>
                      )}
                    </div>
                    {highestBid && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Leading bidder: {highestBid.bidder.slice(0, 6)}...{highestBid.bidder.slice(-4)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-blue-900/20 text-blue-400 border border-blue-700/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                  
                  {highestBid ? (
                    <Button
                      size="sm"
                      onClick={() => handleEndAuction(nft.id)}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      End Auction
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled
                      className="bg-gray-600 text-gray-400"
                    >
                      No Bids Yet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
