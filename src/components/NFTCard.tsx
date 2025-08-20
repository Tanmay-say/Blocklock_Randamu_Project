import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NFT } from '@/data/nfts';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/contexts/WalletContext';

interface NFTCardProps {
  nft: NFT;
  showBidButton?: boolean;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, showBidButton = true }) => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();

  const handlePlaceBid = () => {
    if (!isConnected) {
      // Show wallet connection prompt
      return;
    }
    navigate(`/place-bid/${nft.id}`);
  };

  const handleBuyNow = () => {
    if (!isConnected) {
      // Show wallet connection prompt
      return;
    }
    // Navigate to buy page or handle direct purchase
    navigate(`/buy/${nft.id}`);
  };

  const formatPrice = (price: number) => {
    return `${price} ETH`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-900/20 text-green-400 border border-green-700/30';
      case 'auction':
        return 'bg-blue-900/20 text-blue-400 border border-blue-700/30';
      case 'sold':
        return 'bg-gray-900/20 text-gray-400 border border-gray-700/30';
      default:
        return 'bg-gray-900/20 text-gray-400 border border-gray-700/30';
    }
  };

  return (
    <Card className="bg-gradient-card rounded-2xl p-4 shadow-nft hover:shadow-glow transition-all duration-300 group border-nft-border overflow-hidden">
      <div className="relative mb-4">
        <img
          src={nft.image}
          alt={nft.name}
          className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <Badge className={getStatusColor(nft.status)}>
            {nft.status.charAt(0).toUpperCase() + nft.status.slice(1)}
          </Badge>
        </div>
        {nft.status === 'auction' && nft.currentBids && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {nft.currentBids} bids
            </Badge>
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
          <span className="text-white text-sm font-semibold">{formatPrice(nft.price)}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg truncate">{nft.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{nft.description}</p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Collection:</span>
            <span className="text-sm text-white">{nft.collection}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Creator:</span>
            <span className="text-xs text-muted-foreground font-mono">
              {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
            </span>
          </div>
          
          {nft.status === 'auction' && nft.auctionEndTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auction Ends:</span>
              <span className="text-sm text-red-400 font-medium">
                {formatDate(nft.auctionEndTime)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {nft.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs border-nft-border text-muted-foreground">
              {tag}
            </Badge>
          ))}
          {nft.tags.length > 2 && (
            <Badge variant="outline" className="text-xs border-nft-border text-muted-foreground">
              +{nft.tags.length - 2}
            </Badge>
          )}
        </div>
        
        {showBidButton && (
          <>
            {/* Available NFTs - Direct Buy Button */}
            {nft.status === 'available' && (
              <Button 
                onClick={handleBuyNow}
                className="w-full bg-green-600 text-white hover:bg-green-700"
                variant="default"
              >
                Buy Now - {formatPrice(nft.price)}
              </Button>
            )}

            {/* Auction NFTs - Place Bid Button */}
            {nft.status === 'auction' && (
              <Button 
                onClick={handlePlaceBid}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                variant="default"
              >
                Place Bid (Min: {formatPrice(nft.price)})
              </Button>
            )}

            {/* Sold NFTs - Disabled Display Only */}
            {nft.status === 'sold' && (
              <Button 
                className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
                variant="outline"
                disabled
              >
                Sold Out
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};