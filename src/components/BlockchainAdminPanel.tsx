import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlockchain } from '@/contexts/BlockchainContext';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Plus, 
  Clock, 
  Trophy, 
  Users, 
  Coins, 
  Settings,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const BlockchainAdminPanel: React.FC = () => {
  const { contractService, isContractsLoaded, currentBlock, adminWallet } = useBlockchain();
  const { isConnected, account } = useWallet();
  const { toast } = useToast();

  // State for auction creation
  const [auctionForm, setAuctionForm] = useState({
    nftAddress: '',
    tokenId: '',
    reservePrice: '',
    durationBlocks: '100', // Default 100 blocks (~20 minutes)
    depositPercentage: '10' // 10%
  });

  // State for auction management
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);

  // Load auctions on component mount
  useEffect(() => {
    if (isContractsLoaded && contractService) {
      loadAuctions();
    }
  }, [isContractsLoaded, contractService]);

  const loadAuctions = async () => {
    if (!contractService) return;
    
    try {
      setIsLoading(true);
      // For now, we'll simulate loading auctions
      // In real implementation, you'd query the contract for all auctions
      setAuctions([
        {
          id: 0,
          nft: "0x1234...5678",
          tokenId: "1",
          reserve: "1.0",
          endBlock: currentBlock + 50,
          seller: "0xabcd...efgh",
          settled: false,
          bidderCount: 3
        }
      ]);
    } catch (error) {
      console.error('Error loading auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    if (!contractService || !isConnected) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Validate form
      if (!auctionForm.nftAddress || !auctionForm.tokenId || !auctionForm.reservePrice) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create auction on blockchain
      const tx = await contractService.createAuction(
        auctionForm.nftAddress,
        parseInt(auctionForm.tokenId),
        auctionForm.reservePrice,
        parseInt(auctionForm.durationBlocks)
      );

      await tx.wait();

      toast({
        title: "Success!",
        description: "Auction created successfully on blockchain",
      });

      // Reset form and reload auctions
      setAuctionForm({
        nftAddress: '',
        tokenId: '',
        reservePrice: '',
        durationBlocks: '100',
        depositPercentage: '10'
      });
      
      loadAuctions();

    } catch (error: any) {
      console.error('Error creating auction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create auction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeAuction = async (auctionId: number) => {
    if (!contractService) return;

    try {
      setIsLoading(true);
      
      const tx = await contractService.finalizeAuction(auctionId);
      await tx.wait();

      toast({
        title: "Success!",
        description: "Auction finalized successfully",
      });

      loadAuctions();

    } catch (error: any) {
      console.error('Error finalizing auction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to finalize auction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBlockTime = (endBlock: number) => {
    const blocksRemaining = endBlock - currentBlock;
    const minutesRemaining = Math.ceil(blocksRemaining * 12 / 60); // ~12 seconds per block
    return `${blocksRemaining} blocks (~${minutesRemaining} min)`;
  };

  const getAuctionStatus = (auction: any) => {
    if (auction.settled) return { label: "Settled", color: "bg-green-500" };
    if (currentBlock >= auction.endBlock) return { label: "Ended", color: "bg-red-500" };
    return { label: "Active", color: "bg-blue-500" };
  };

  if (!isContractsLoaded) {
    return (
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white">Blockchain Admin Panel</CardTitle>
          <CardDescription>Loading smart contracts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-nft-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Blockchain Admin Panel
          </CardTitle>
          <CardDescription>
            Manage auctions directly on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Admin Wallet:</span>
              <Badge variant="outline" className="font-mono text-xs">
                {adminWallet ? `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}` : 'Not set'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Current Block:</span>
              <Badge variant="outline">{currentBlock}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tax Rate:</span>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                20%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-card border border-nft-border">
          <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Create Auction
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Manage Auctions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Trophy className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Create Auction Tab */}
        <TabsContent value="create" className="space-y-4">
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <CardTitle className="text-white">Create New Auction</CardTitle>
              <CardDescription>
                Deploy a new auction to the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nftAddress" className="text-muted-foreground">NFT Contract Address</Label>
                  <Input
                    id="nftAddress"
                    placeholder="0x..."
                    value={auctionForm.nftAddress}
                    onChange={(e) => setAuctionForm(prev => ({ ...prev, nftAddress: e.target.value }))}
                    className="bg-background border-nft-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="tokenId" className="text-muted-foreground">Token ID</Label>
                  <Input
                    id="tokenId"
                    type="number"
                    placeholder="1"
                    value={auctionForm.tokenId}
                    onChange={(e) => setAuctionForm(prev => ({ ...prev, tokenId: e.target.value }))}
                    className="bg-background border-nft-border text-foreground"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reservePrice" className="text-muted-foreground">Reserve Price (ETH)</Label>
                  <Input
                    id="reservePrice"
                    type="number"
                    step="0.001"
                    placeholder="1.0"
                    value={auctionForm.reservePrice}
                    onChange={(e) => setAuctionForm(prev => ({ ...prev, reservePrice: e.target.value }))}
                    className="bg-background border-nft-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="durationBlocks" className="text-muted-foreground">Duration (Blocks)</Label>
                  <Input
                    id="durationBlocks"
                    type="number"
                    placeholder="100"
                    value={auctionForm.durationBlocks}
                    onChange={(e) => setAuctionForm(prev => ({ ...prev, durationBlocks: e.target.value }))}
                    className="bg-background border-nft-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{Math.ceil(parseInt(auctionForm.durationBlocks || '0') * 12 / 60)} minutes
                  </p>
                </div>
                <div>
                  <Label htmlFor="depositPercentage" className="text-muted-foreground">Deposit %</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    placeholder="10"
                    value={auctionForm.depositPercentage}
                    onChange={(e) => setAuctionForm(prev => ({ ...prev, depositPercentage: e.target.value }))}
                    className="bg-background border-nft-border text-foreground"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateAuction}
                disabled={isLoading || !isConnected}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating Auction...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Auction on Blockchain
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Auctions Tab */}
        <TabsContent value="manage" className="space-y-4">
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Active Auctions</CardTitle>
                  <CardDescription>
                    Manage auctions on the blockchain
                  </CardDescription>
                </div>
                <Button 
                  onClick={loadAuctions}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
                </div>
              ) : auctions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No auctions found
                </div>
              ) : (
                <div className="space-y-3">
                  {auctions.map((auction) => {
                    const status = getAuctionStatus(auction);
                    return (
                      <div key={auction.id} className="p-4 bg-background/30 rounded-lg border border-nft-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">#{auction.id}</div>
                              <div className="text-xs text-muted-foreground">Auction ID</div>
                            </div>
                            <Separator orientation="vertical" className="h-12" />
                            <div>
                              <div className="font-semibold text-white">Token #{auction.tokenId}</div>
                              <div className="text-sm text-muted-foreground">{auction.nft}</div>
                            </div>
                            <Separator orientation="vertical" className="h-12" />
                            <div>
                              <div className="font-semibold text-white">{auction.reserve} ETH</div>
                              <div className="text-sm text-muted-foreground">Reserve</div>
                            </div>
                            <Separator orientation="vertical" className="h-12" />
                            <div>
                              <div className="font-semibold text-white">{auction.bidderCount}</div>
                              <div className="text-sm text-muted-foreground">Bidders</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                            {!auction.settled && currentBlock >= auction.endBlock && (
                              <Button
                                onClick={() => handleFinalizeAuction(auction.id)}
                                disabled={isLoading}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Trophy className="w-4 h-4 mr-2" />
                                Finalize
                              </Button>
                            )}
                          </div>
                        </div>
                        {!auction.settled && (
                          <div className="mt-3 pt-3 border-t border-nft-border">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Ends in: {formatBlockTime(auction.endBlock)}
                              </span>
                              <span className="text-muted-foreground">
                                Seller: {auction.seller}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gradient-card border-nft-border">
            <CardHeader>
              <CardTitle className="text-white">Blockchain Analytics</CardTitle>
              <CardDescription>
                Real-time blockchain data and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Network Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Block:</span>
                      <span className="font-mono text-white">{currentBlock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block Time:</span>
                      <span className="text-white">~12 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admin Wallet:</span>
                      <span className="font-mono text-white text-xs">
                        {adminWallet ? `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}` : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Contract Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AuctionHouse:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Deployed
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">WinnerSBT:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Deployed
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TestNFT:</span>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Deployed
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

