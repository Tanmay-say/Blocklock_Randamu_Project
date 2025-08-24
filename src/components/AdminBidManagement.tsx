import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNFT } from '@/contexts/NFTContext';
import { Bid, NFT } from '@/data/nfts';
import { Trophy, Clock, Users, ExternalLink, Gavel } from 'lucide-react';
import { AuctionCountdown } from './AuctionCountdown';

export const AdminBidManagement: React.FC = () => {
  const { nfts, getAllBids, endAuction } = useNFT();
  const [selectedNFT, setSelectedNFT] = useState<string>('all');

  const auctionNFTs = nfts.filter(nft => nft.status === 'auction');
  const allBids = getAllBids();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredNFTs = () => {
    if (selectedNFT === 'all') {
      return auctionNFTs;
    }
    return auctionNFTs.filter(nft => nft.id === selectedNFT);
  };

  const getBidsForNFT = (nftId: string) => {
    const nft = nfts.find(n => n.id === nftId);
    return (nft?.bids || []).sort((a, b) => b.amount - a.amount);
  };

  const getTotalBidValue = (bids: Bid[]) => {
    return bids.reduce((total, bid) => total + bid.amount, 0).toFixed(4);
  };

  const isAuctionExpired = (nft: NFT) => {
    if (!nft.auctionEndTime) return false;
    return new Date() > new Date(nft.auctionEndTime);
  };

  const handleEndAuction = (nftId: string) => {
    endAuction(nftId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gavel className="w-6 h-6 text-primary" />
            Bid Management Dashboard
          </CardTitle>
          <CardDescription>
            Monitor and manage all auction bids across your NFT marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{auctionNFTs.length}</div>
              <div className="text-sm text-muted-foreground">Active Auctions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{allBids.length}</div>
              <div className="text-sm text-muted-foreground">Total Bids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {[...new Set(allBids.map(bid => bid.bidder))].length}
              </div>
              <div className="text-sm text-muted-foreground">Unique Bidders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {getTotalBidValue(allBids)} ETH
              </div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white text-lg">Filter by NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedNFT} onValueChange={setSelectedNFT}>
            <SelectTrigger className="bg-background border-nft-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-nft-border">
              <SelectItem value="all">All Auction NFTs</SelectItem>
              {auctionNFTs.map((nft) => (
                <SelectItem key={nft.id} value={nft.id}>
                  {nft.name} ({nft.bids?.length || 0} bids)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* NFT Auction Details */}
      <div className="space-y-6">
        {getFilteredNFTs().map((nft) => {
          const bids = getBidsForNFT(nft.id);
          const isExpired = isAuctionExpired(nft);

          return (
            <Card key={nft.id} className="bg-gradient-card border-nft-border">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {nft.name}
                      <Badge className={isExpired ? 'bg-red-900/20 text-red-400 border border-red-700/30' : 'bg-blue-900/20 text-blue-400 border border-blue-700/30'}>
                        {isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Collection: {nft.collection} | Creator: {formatAddress(nft.creator)}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Starting Price: {nft.price} ETH
                      </span>
                      {nft.highestBid && (
                        <span className="text-sm text-green-400">
                          Highest Bid: {nft.highestBid.amount} ETH
                        </span>
                      )}
                      <span className="text-sm text-blue-400">
                        {bids.length} bid{bids.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {nft.auctionEndTime && (
                      <div className="mb-2">
                        <AuctionCountdown 
                          endTime={nft.auctionEndTime} 
                          compact={true}
                        />
                      </div>
                    )}
                    {isExpired && nft.highestBid && (
                      <Button
                        onClick={() => handleEndAuction(nft.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        End Auction
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <Separator className="bg-nft-border" />
                  
                  {/* Bid List */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Bid History ({bids.length})
                    </h4>
                    
                    {bids.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No bids placed yet for this auction
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bids.map((bid, index) => (
                          <div 
                            key={bid.id} 
                            className={`p-3 rounded-lg border ${
                              index === 0 
                                ? 'bg-green-900/20 border-green-700/30' 
                                : 'bg-background/30 border-nft-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold">
                                      {formatAddress(bid.bidder)}
                                    </span>
                                    {index === 0 && (
                                      <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                                        <Trophy className="w-3 h-3 mr-1" />
                                        Winning Bid
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(bid.timestamp)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                  {bid.amount} ETH
                                </div>
                                {bid.transactionHash && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-nft-border text-muted-foreground hover:bg-background/50 mt-1"
                                    onClick={() => window.open(`https://sepolia.basescan.org/tx/${bid.transactionHash}`, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    Tx
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Auction Winner */}
                  {isExpired && nft.highestBid && (
                    <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                      <h4 className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Auction Winner
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">
                            {formatAddress(nft.highestBid.bidder)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Winning Bid: {nft.highestBid.amount} ETH
                          </div>
                        </div>
                        <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                          Winner
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {auctionNFTs.length === 0 && (
        <Card className="bg-gradient-card border-nft-border">
          <CardContent className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-white mb-2">No Active Auctions</CardTitle>
            <CardDescription>
              Create some auctions from your NFT collection to start receiving bids.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
