import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useWallet } from '@/contexts/WalletContext';
import { useNFT } from '@/contexts/NFTContext';
import { User, Trophy, Clock, ExternalLink, Crown, ShoppingBag } from 'lucide-react';
import { AuctionCountdown } from './AuctionCountdown';
import { MetaMaskNFTGuide } from './MetaMaskNFTGuide';

export const UserProfile: React.FC = () => {
  const { account, isConnected, balance } = useWallet();
  const { getBidsForUser, getNFTById, getOwnedNFTs } = useNFT();

  if (!isConnected || !account) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="bg-gradient-card border-nft-border p-8 text-center">
          <CardHeader>
            <CardTitle className="text-white">Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your wallet to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userBids = getBidsForUser(account);
  const ownedNFTs = getOwnedNFTs(account);
  const activeBids = userBids.filter(bid => {
    const nft = getNFTById(bid.nftId);
    return nft?.status === 'auction';
  });
  const completedBids = userBids.filter(bid => {
    const nft = getNFTById(bid.nftId);
    return nft?.status === 'sold';
  });

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

  const getTotalBidValue = (bids: any[]) => {
    return bids.reduce((total, bid) => total + bid.amount, 0).toFixed(4);
  };

  const isWinningBid = (bid: any) => {
    const nft = getNFTById(bid.nftId);
    return nft?.highestBid?.id === bid.id;
  };

  const hasWonAuction = (bid: any) => {
    const nft = getNFTById(bid.nftId);
    return nft?.status === 'sold' && nft?.winner === account;
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-card border-nft-border mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl">My Profile</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Address: {formatAddress(account)}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Balance: {balance} ETH
                  </Badge>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Total Bids: {userBids.length}
                  </Badge>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Active: {activeBids.length}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    Owned: {ownedNFTs.length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-400">Active Bids</CardTitle>
              <div className="text-3xl font-bold text-white">{activeBids.length}</div>
              <CardDescription>
                Total Value: {getTotalBidValue(activeBids)} ETH
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-nft-border">
            <CardHeader className="text-center">
              <CardTitle className="text-green-400">Auctions Won</CardTitle>
              <div className="text-3xl font-bold text-white">
                {completedBids.filter(bid => hasWonAuction(bid)).length}
              </div>
              <CardDescription>Successful Purchases</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-nft-border">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-400">Total Bid Value</CardTitle>
              <div className="text-3xl font-bold text-white">{getTotalBidValue(userBids)} ETH</div>
              <CardDescription>Across All Auctions</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-nft-border">
            <CardHeader className="text-center">
              <CardTitle className="text-orange-400">Owned NFTs</CardTitle>
              <div className="text-3xl font-bold text-white">{ownedNFTs.length}</div>
              <CardDescription>Purchased & Won</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* MetaMask NFT Guide */}
        <div className="mb-8">
          <MetaMaskNFTGuide />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Bids */}
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Active Bids ({activeBids.length})
              </CardTitle>
              <CardDescription>Your current bids on ongoing auctions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeBids.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active bids. Start bidding on auction items!
                </div>
              ) : (
                activeBids.map((bid) => {
                  const nft = getNFTById(bid.nftId);
                  if (!nft) return null;

                  return (
                    <div key={bid.id} className="p-4 bg-background/30 rounded-lg border border-nft-border">
                      <div className="flex items-center gap-4">
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{nft.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Your Bid: {bid.amount} ETH
                            </span>
                            {isWinningBid(bid) && (
                              <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                                Leading Bid
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Placed: {formatDate(bid.timestamp)}
                          </div>
                          {nft.auctionEndTime && (
                            <div className="mt-2">
                              <AuctionCountdown 
                                endTime={nft.auctionEndTime} 
                                compact={true}
                              />
                            </div>
                          )}
                        </div>
                        {bid.transactionHash && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-nft-border text-muted-foreground hover:bg-background/50"
                            onClick={() => window.open(`https://sepolia.basescan.org/tx/${bid.transactionHash}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Bid History ({completedBids.length})
              </CardTitle>
              <CardDescription>Your bids on completed auctions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {completedBids.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No completed bids yet.
                </div>
              ) : (
                completedBids.slice(0, 10).map((bid) => {
                  const nft = getNFTById(bid.nftId);
                  if (!nft) return null;
                  const won = hasWonAuction(bid);

                  return (
                    <div key={bid.id} className="p-4 bg-background/30 rounded-lg border border-nft-border">
                      <div className="flex items-center gap-4">
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{nft.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Your Bid: {bid.amount} ETH
                            </span>
                            {won ? (
                              <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                                <Trophy className="w-3 h-3 mr-1" />
                                Won
                              </Badge>
                            ) : (
                              <Badge className="bg-red-900/20 text-red-400 border border-red-700/30">
                                Outbid
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Placed: {formatDate(bid.timestamp)}
                          </div>
                        </div>
                        {bid.transactionHash && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-nft-border text-muted-foreground hover:bg-background/50"
                            onClick={() => window.open(`https://sepolia.basescan.org/tx/${bid.transactionHash}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Owned NFTs */}
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-orange-400" />
                My NFTs ({ownedNFTs.length})
              </CardTitle>
              <CardDescription>NFTs you own from purchases and auction wins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedNFTs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  No NFTs owned yet. Start by purchasing or bidding on items!
                </div>
              ) : (
                ownedNFTs.slice(0, 10).map((nft) => {
                  const acquisitionMethod = nft.winner === account ? 'Won Auction' : 'Direct Purchase';
                  const paidAmount = nft.highestBid?.amount || nft.price;
                  
                  return (
                    <div key={nft.id} className="p-4 bg-background/30 rounded-lg border border-nft-border">
                      <div className="flex items-center gap-4">
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{nft.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-muted-foreground">
                              Paid: {paidAmount} ETH
                            </span>
                            <Badge className={
                              acquisitionMethod === 'Won Auction' 
                                ? "bg-green-900/20 text-green-400 border border-green-700/30"
                                : "bg-blue-900/20 text-blue-400 border border-blue-700/30"
                            }>
                              {acquisitionMethod === 'Won Auction' ? (
                                <>
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Won Auction
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3 mr-1" />
                                  Purchased
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Collection: {nft.collection}
                          </div>
                          {/* Transaction Hash */}
                          {nft.transactionHash && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="font-mono">Purchase Tx: {nft.transactionHash.slice(0, 8)}...{nft.transactionHash.slice(-6)}</span>
                            </div>
                          )}
                          
                          {/* Minting Status */}
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-green-400">
                              🎨 Real NFT: Check MetaMask NFTs Tab
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {nft.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-nft-border text-muted-foreground">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">Owned</div>
                            <div className="text-xs text-muted-foreground">
                              {nft.status === 'sold' ? 'Purchased' : 'Acquired'}
                            </div>
                          </div>
                          {/* Transaction Link */}
                          {nft.transactionHash && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-nft-border text-muted-foreground hover:bg-background/50"
                              onClick={() => window.open(`https://sepolia.basescan.org/tx/${nft.transactionHash}`, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
