import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from '@/contexts/WalletContext';
import { useNFT } from '@/contexts/NFTContext';
import { ethers } from 'ethers';
import { AuctionCountdown } from './AuctionCountdown';
import { ArrowLeft, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';

export const PlaceBid: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, account, signer, chainId } = useWallet();
  const { getNFTById, placeBid, hasUserBidOnNFT } = useNFT();
  
  const [nft, setNft] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAuctionExpired, setIsAuctionExpired] = useState(false);


  useEffect(() => {
    if (id) {
      const nftData = getNFTById(id);
      if (nftData) {
        setNft(nftData);
        
        // Validate NFT is available for bidding
        if (nftData.status !== 'auction') {
          setError(`This NFT is not available for bidding. Status: ${nftData.status}`);
          return;
        }
        
        // Check if auction has expired
        if (nftData.auctionEndTime) {
          const now = new Date().getTime();
          const endTime = new Date(nftData.auctionEndTime).getTime();
          if (now >= endTime) {
            setIsAuctionExpired(true);
            setError('This auction has ended. You can no longer place bids.');
            return;
          }
        }
        
        // Set minimum bid amount (base price)
        setBidAmount(nftData.price.toFixed(4));
      }
    }
  }, [id, getNFTById]);

  // Real-time auction expiration check
  useEffect(() => {
    if (!nft?.auctionEndTime) return;

    const checkExpiration = () => {
      const now = new Date().getTime();
      const endTime = new Date(nft.auctionEndTime).getTime();
      if (now >= endTime && !isAuctionExpired) {
        setIsAuctionExpired(true);
        setError('This auction has ended. You can no longer place bids.');
      }
    };

    // Check immediately
    checkExpiration();

    // Check every second
    const interval = setInterval(checkExpiration, 1000);

    return () => clearInterval(interval);
  }, [nft?.auctionEndTime, isAuctionExpired]);



  if (!nft) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">NFT not found</h2>
            <p className="text-muted-foreground mb-4">The NFT you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/nfts')} className="bg-primary hover:bg-primary/90">
              Back to NFTs
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePlaceBid = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!account) {
      setError('Wallet account not found');
      return;
    }

    // Check if auction has expired
    if (isAuctionExpired) {
      setError('This auction has ended. You can no longer place bids.');
      return;
    }

    // Double-check auction expiration before proceeding
    if (nft.auctionEndTime) {
      const now = new Date().getTime();
      const endTime = new Date(nft.auctionEndTime).getTime();
      if (now >= endTime) {
        setIsAuctionExpired(true);
        setError('This auction has ended. You can no longer place bids.');
        return;
      }
    }

    // Check if user has already bid on this NFT
    if (hasUserBidOnNFT(nft.id, account)) {
      setError('You have already placed a bid on this NFT. Multiple bids from the same user are not allowed.');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (bidValue < nft.price) {
      setError(`Bid must be at least ${nft.price} ETH`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if on correct network
      if (chainId !== 84532) {
        setError('Please switch to Base Sepolia network to place bids.');
        return;
      }

      if (!signer) {
        setError('Please connect your wallet to place a bid.');
        return;
      }

      // Check if user has enough balance
      const balance = await signer.provider!.getBalance(account);
      const bidWei = ethers.parseEther(bidValue.toString());
      
      if (balance < bidWei) {
        setError(`Insufficient balance. You need ${bidValue} ETH but only have ${ethers.formatEther(balance)} ETH.`);
        return;
      }

      // For auction bids, send ETH to admin wallet as escrow
      const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
      
      console.log('Placing bid:');
      console.log('Bidder:', account);
      console.log('NFT:', nft.name);
      console.log('Bid amount:', bidValue, 'ETH');
      console.log('Admin wallet (escrow):', ADMIN_WALLET);
      
      // Send bid amount to admin wallet as escrow
      console.log('Sending bid to escrow...');
      const tx = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: bidWei,
        gasLimit: 25000
      });

      console.log('Bid transaction submitted:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        console.log('Bid transaction confirmed');
        
        // Place the bid in our system with real transaction hash
        placeBid(nft.id, account!, bidValue, tx.hash);
        
        // Update local NFT data
        const updatedNFT = getNFTById(nft.id);
        if (updatedNFT) {
          setNft(updatedNFT);
        }
        
        setSuccess(`Bid of ${bidValue} ETH placed successfully! Transaction: ${tx.hash.slice(0, 10)}...`);
        
        // Reset form to next increment
        setBidAmount((bidValue * 1.05).toFixed(4)); // 5% increment for next bid
        
        console.log('Bid placed successfully');
      } else {
        throw new Error(`Transaction failed. Status: ${receipt?.status || 'unknown'}`);
      }
      
    } catch (err: any) {
      console.error('Bid placement failed:', err);
      
      let errorMessage = 'Failed to place bid. Please try again.';
      
      if (err.message) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction.';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled by user.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${price} ETH`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/nfts')}
              className="flex items-center gap-2 border-nft-border text-muted-foreground hover:bg-background/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to NFTs
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Place Bid</h1>
              <p className="text-muted-foreground">Bid on this unique NFT</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NFT Details */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-nft-border shadow-nft">
                <CardHeader>
                  <CardTitle className="text-xl text-white">{nft.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{nft.collection}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-80 object-cover rounded-xl"
                  />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Base Price:</span>
                      <span className="text-lg font-bold text-primary">{formatPrice(nft.price)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Creator:</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">Minted:</span>
                      <span className="text-sm text-muted-foreground">{formatDate(nft.mintDate)}</span>
                    </div>
                    
                    {nft.status === 'auction' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">Current Bids:</span>
                          <span className="text-sm text-muted-foreground">{nft.currentBids || 0}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">Auction Ends:</span>
                          <span className="text-sm text-red-400 font-medium">
                            {formatDate(nft.auctionEndTime || '')}
                          </span>
                        </div>
                        
                        {nft.auctionEndTime && (
                          <div className="p-4 bg-gradient-card/50 rounded-lg border border-nft-border">
                            <AuctionCountdown 
                              endTime={nft.auctionEndTime}
                              onExpired={() => {
                                setIsAuctionExpired(true);
                                setError('This auction has ended. You can no longer place bids.');
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <Separator className="bg-nft-border" />
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{nft.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {nft.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-nft-border text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bid Form */}
            <div className="space-y-6">
              <Card className="bg-gradient-card border-nft-border shadow-nft">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Place Your Bid</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter your bid amount and confirm the transaction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!isConnected ? (
                    <Alert className="bg-primary/10 border-primary/20">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-primary">
                        Please connect your wallet to place a bid
                      </AlertDescription>
                    </Alert>
                  ) : account && hasUserBidOnNFT(nft.id, account) ? (
                    <Alert className="bg-orange-500/10 border-orange-500/20">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                      <AlertDescription className="text-orange-300">
                        You have already placed a bid on this NFT. Multiple bids from the same user are not allowed.
                        You can view your bid in your <Button 
                          variant="link" 
                          className="p-0 h-auto text-orange-400 underline"
                          onClick={() => navigate('/profile')}
                        >
                          profile
                        </Button>.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bidAmount" className="text-white">Bid Amount (ETH)</Label>
                          <Input
                            id="bidAmount"
                            type="number"
                            step="0.001"
                            min={nft.price}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder="Enter bid amount"
                            className="mt-1 bg-background/50 border-nft-border text-white placeholder:text-muted-foreground focus:border-primary"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Minimum bid: {formatPrice(nft.price)}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                          <h4 className="font-medium text-primary mb-2">Bid Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white">Your bid:</span>
                              <span className="font-medium text-primary">{bidAmount} ETH</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white">Network fee:</span>
                              <span className="font-medium text-primary">~0.001 ETH</span>
                            </div>
                            <Separator className="bg-primary/20" />
                            <div className="flex justify-between font-medium">
                              <span className="text-white">Total:</span>
                              <span className="text-primary">{(parseFloat(bidAmount || '0') + 0.001).toFixed(4)} ETH</span>
                            </div>
                          </div>
                        </div>
                        
                        {error && (
                          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-300">{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {success && (
                          <Alert className="bg-green-500/10 border-green-500/20">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <AlertDescription className="text-green-300">{success}</AlertDescription>
                          </Alert>
                        )}
                        
                        <Button
                          onClick={handlePlaceBid}
                          disabled={isLoading || !bidAmount || parseFloat(bidAmount) < nft.price || isAuctionExpired}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          size="lg"
                        >
                          {isLoading ? 'Processing...' : isAuctionExpired ? 'Auction Ended' : 'Place Bid'}
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-background/20 rounded-lg border border-nft-border">
                        <h4 className="font-medium text-white mb-2">Important Notes</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Bids are sealed and confidential until auction ends</li>
                          <li>• You can only place one bid per NFT</li>
                          <li>• Bids cannot be modified once placed</li>
                          <li>• Ensure you have sufficient ETH for the bid and gas fees</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};