import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Coins, 
  Clock, 
  Shield,
  Lock,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface BlockchainBidPanelProps {
  auctionId: number;
  nftName: string;
  reservePrice: string;
  endBlock: number;
  onBidPlaced?: () => void;
}

export const BlockchainBidPanel: React.FC<BlockchainBidPanelProps> = ({
  auctionId,
  nftName,
  reservePrice,
  endBlock,
  onBidPlaced
}) => {
  const { contractService, isContractsLoaded, currentBlock } = useBlockchain();
  const { isConnected, account } = useWallet();
  const { toast } = useToast();

  const [bidForm, setBidForm] = useState({
    bidAmount: '',
    depositAmount: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [auctionInfo, setAuctionInfo] = useState<any>(null);
  const [userBid, setUserBid] = useState<any>(null);

  // Load auction information
  useEffect(() => {
    if (isContractsLoaded && contractService) {
      loadAuctionInfo();
    }
  }, [isContractsLoaded, contractService, auctionId]);

  const loadAuctionInfo = async () => {
    if (!contractService) return;
    
    try {
      // Get auction details from blockchain
      const auction = await contractService.getAuction(auctionId);
      setAuctionInfo(auction);
      
      // Check if user has already bid
      if (account) {
        // In real implementation, you'd check the user's bid status
        // For now, we'll simulate it
        setUserBid(null);
      }
    } catch (error) {
      console.error('Error loading auction info:', error);
    }
  };

  const handleBidInputChange = (field: string, value: string) => {
    setBidForm(prev => ({ ...prev, [field]: value }));
  };

  const calculateDeposit = (bidAmount: string) => {
    if (!bidAmount || !auctionInfo) return '0';
    const amount = parseFloat(bidAmount);
    const depositPct = parseFloat(auctionInfo.depositPct || '10');
    return ((amount * depositPct) / 100).toFixed(6);
  };

  const handlePlaceBid = async () => {
    if (!contractService || !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!bidForm.bidAmount || !bidForm.depositAmount) {
      toast({
        title: "Validation Error",
        description: "Please enter both bid amount and deposit amount",
        variant: "destructive",
      });
      return;
    }

    const bidAmount = parseFloat(bidForm.bidAmount);
    const reservePrice = parseFloat(auctionInfo?.reserve || '0');

    if (bidAmount < reservePrice) {
      toast({
        title: "Bid Too Low",
        description: `Bid must be at least ${reservePrice} ETH`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create encrypted bid data (placeholder for Blocklock integration)
      const encryptedData = await import('@/lib/contracts').then(({ encryptBid }) => 
        encryptBid(auctionId, bidForm.bidAmount, account || '', endBlock)
      );

      // Place bid on blockchain
      const tx = await contractService.commitBid(
        auctionId,
        encryptedData.ciphertext,
        encryptedData.condition,
        bidForm.depositAmount
      );

      await tx.wait();

      toast({
        title: "Bid Placed Successfully!",
        description: `Your encrypted bid of ${bidForm.bidAmount} ETH has been submitted`,
      });

      // Reset form and reload auction info
      setBidForm({ bidAmount: '', depositAmount: '' });
      loadAuctionInfo();
      
      if (onBidPlaced) {
        onBidPlaced();
      }

    } catch (error: any) {
      console.error('Error placing bid:', error);
      toast({
        title: "Bid Failed",
        description: error.message || "Failed to place bid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBlockTime = (endBlock: number) => {
    const blocksRemaining = endBlock - currentBlock;
    if (blocksRemaining <= 0) return "Auction ended";
    
    const minutesRemaining = Math.ceil(blocksRemaining * 12 / 60); // ~12 seconds per block
    const hoursRemaining = Math.ceil(minutesRemaining / 60);
    
    if (hoursRemaining > 24) {
      const daysRemaining = Math.ceil(hoursRemaining / 24);
      return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''}`;
    } else if (hoursRemaining > 1) {
      return `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`;
    } else {
      return `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
    }
  };

  const getAuctionStatus = () => {
    if (currentBlock >= endBlock) return { label: "Ended", color: "bg-red-500" };
    return { label: "Active", color: "bg-green-500" };
  };

  if (!isContractsLoaded) {
    return (
      <Card className="bg-gradient-card border-nft-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getAuctionStatus();
  const isAuctionEnded = currentBlock >= endBlock;

  return (
    <div className="space-y-6">
      {/* Auction Info */}
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-primary" />
            Blockchain Auction: {nftName}
          </CardTitle>
          <CardDescription>
            Place your encrypted bid on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">#{auctionId}</div>
              <div className="text-sm text-muted-foreground">Auction ID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{reservePrice} ETH</div>
              <div className="text-sm text-muted-foreground">Reserve Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{formatBlockTime(endBlock)}</div>
              <div className="text-sm text-muted-foreground">Time Remaining</div>
            </div>
            <div className="text-center">
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Security Features
          </CardTitle>
          <CardDescription>
            Your bid is protected by blockchain security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Lock className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-medium text-white">Encrypted Bids</div>
                <div className="text-sm text-muted-foreground">No one can see your bid amount</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-medium text-white">Sealed Bidding</div>
                <div className="text-sm text-muted-foreground">Bids remain hidden until auction ends</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-medium text-white">Time-Locked</div>
                <div className="text-sm text-muted-foreground">Bids unlock automatically at end time</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Form */}
      {!isAuctionEnded && (
        <Card className="bg-gradient-card border border-nft-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-6 h-6 text-primary" />
              Place Your Bid
            </CardTitle>
            <CardDescription>
              {!isConnected 
                ? "Connect your wallet to place a bid"
                : "Enter your bid amount and deposit"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-8">
                <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Wallet Not Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your MetaMask wallet to participate in this auction
                </p>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => window.ethereum?.request({ method: 'eth_requestAccounts' })}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bidAmount" className="text-muted-foreground">
                      Bid Amount (ETH)
                    </Label>
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.001"
                      placeholder="1.0"
                      value={bidForm.bidAmount}
                      onChange={(e) => {
                        handleBidInputChange('bidAmount', e.target.value);
                        if (e.target.value) {
                          const deposit = calculateDeposit(e.target.value);
                          handleBidInputChange('depositAmount', deposit);
                        }
                      }}
                      className="bg-background border-nft-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least {reservePrice} ETH
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="depositAmount" className="text-muted-foreground">
                      Deposit Amount (ETH)
                    </Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      step="0.001"
                      placeholder="0.1"
                      value={bidForm.depositAmount}
                      onChange={(e) => handleBidInputChange('depositAmount', e.target.value)}
                      className="bg-background border-nft-border text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {auctionInfo?.depositPct || '10'}% of bid amount
                    </p>
                  </div>
                </div>

                {/* Tax Warning */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-yellow-400 mb-1">Important Notice</div>
                      <div className="text-sm text-muted-foreground">
                        If you don't win the auction, you'll receive a refund minus a 20% tax. 
                        This tax goes to the platform to cover operational costs.
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceBid}
                  disabled={isLoading || !bidForm.bidAmount || !bidForm.depositAmount}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Placing Bid...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Place Encrypted Bid
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* User's Current Bid */}
      {userBid && (
        <Card className="bg-gradient-card border border-nft-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Your Current Bid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-background/30 rounded-lg border border-nft-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Bid Amount: {userBid.amount} ETH</div>
                  <div className="text-sm text-muted-foreground">Deposit: {userBid.deposit} ETH</div>
                </div>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

