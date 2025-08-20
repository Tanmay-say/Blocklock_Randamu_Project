import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/contexts/WalletContext";
import { Plus, Eye, Trophy, Users, Clock, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Auction {
  id: number;
  nft: string;
  tokenId: number;
  reserve: string;
  endBlock: number;
  seller: string;
  settled: boolean;
  winner: string;
  winningBid: string;
  bidders: string[];
}

interface BidSubmission {
  id: number;
  auctionId: number;
  bidder: string;
  deposit: string;
  timestamp: number;
  status: 'pending' | 'processed' | 'refunded';
}

export const AdminPanel: React.FC = () => {
  const { isAdmin, provider, signer } = useWallet();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bidSubmissions, setBidSubmissions] = useState<BidSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states for creating auctions
  const [nftAddress, setNftAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [reserve, setReserve] = useState('');
  const [endBlock, setEndBlock] = useState('');
  const [depositPct, setDepositPct] = useState('10');

  // Mock data for demonstration
  useEffect(() => {
    if (isAdmin) {
      // Load mock data
      setAuctions([
        {
          id: 1,
          nft: "0x1234...5678",
          tokenId: 1,
          reserve: "0.1",
          endBlock: 12345678,
          seller: "0xabcd...efgh",
          settled: false,
          winner: "",
          winningBid: "0",
          bidders: ["0xuser1...", "0xuser2...", "0xuser3..."]
        },
        {
          id: 2,
          nft: "0x8765...4321",
          tokenId: 5,
          reserve: "0.05",
          endBlock: 12345680,
          seller: "0xdcba...hgfe",
          settled: true,
          winner: "0xwinner...",
          winningBid: "0.08",
          bidders: ["0xuser4...", "0xuser5..."]
        }
      ]);

      setBidSubmissions([
        {
          id: 1,
          auctionId: 1,
          bidder: "0xuser1...",
          deposit: "0.01",
          timestamp: Date.now() - 3600000,
          status: 'pending'
        },
        {
          id: 2,
          auctionId: 1,
          bidder: "0xuser2...",
          deposit: "0.01",
          timestamp: Date.now() - 1800000,
          status: 'processed'
        },
        {
          id: 3,
          auctionId: 1,
          bidder: "0xuser3...",
          deposit: "0.01",
          timestamp: Date.now() - 900000,
          status: 'pending'
        }
      ]);
    }
  }, [isAdmin]);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would call the smart contract to create auction
      // For now, just show success message
      toast({
        title: "Success",
        description: "Auction created successfully!",
      });
      
      // Reset form
      setNftAddress('');
      setTokenId('');
      setReserve('');
      setEndBlock('');
      setDepositPct('10');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create auction",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBid = async (bidId: number) => {
    try {
      // Here you would call the smart contract to process the bid
      setBidSubmissions(prev => 
        prev.map(bid => 
          bid.id === bidId 
            ? { ...bid, status: 'processed' as const }
            : bid
        )
      );
      
      toast({
        title: "Success",
        description: "Bid processed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process bid",
        variant: "destructive",
      });
    }
  };

  const handleFinalizeAuction = async (auctionId: number) => {
    try {
      // Here you would call the smart contract to finalize the auction
      setAuctions(prev => 
        prev.map(auction => 
          auction.id === auctionId 
            ? { ...auction, settled: true }
            : auction
        )
      );
      
      toast({
        title: "Success",
        description: "Auction finalized successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finalize auction",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You need admin privileges to access this panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage auctions, view bid submissions, and control the marketplace
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="auctions">Auctions</TabsTrigger>
            <TabsTrigger value="bids">Bid Submissions</TabsTrigger>
            <TabsTrigger value="create">Create Auction</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Auctions</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{auctions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {auctions.filter(a => !a.settled).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bidSubmissions.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {bidSubmissions.filter(b => b.status === 'pending').length} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {auctions.reduce((sum, a) => sum + parseFloat(a.winningBid || '0'), 0).toFixed(3)} ETH
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From settled auctions
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auctions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Auctions</CardTitle>
                <CardDescription>
                  Manage and monitor all auctions in the marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auctions.map((auction) => (
                    <div key={auction.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Auction #{auction.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            NFT: {auction.nft} | Token ID: {auction.tokenId}
                          </p>
                        </div>
                        <Badge variant={auction.settled ? "secondary" : "default"}>
                          {auction.settled ? "Settled" : "Active"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reserve:</span>
                          <p className="font-medium">{auction.reserve} ETH</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End Block:</span>
                          <p className="font-medium">{auction.endBlock}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bidders:</span>
                          <p className="font-medium">{auction.bidders.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Winner:</span>
                          <p className="font-medium">
                            {auction.winner || "TBD"}
                          </p>
                        </div>
                      </div>

                      {!auction.settled && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleFinalizeAuction(auction.id)}
                          >
                            Finalize Auction
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bid Submissions</CardTitle>
                <CardDescription>
                  View and manage all submitted bids across auctions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bidSubmissions.map((bid) => (
                    <div key={bid.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Bid #{bid.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Auction #{bid.auctionId} | Bidder: {bid.bidder}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            bid.status === 'pending' ? 'default' : 
                            bid.status === 'processed' ? 'secondary' : 'outline'
                          }
                        >
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Deposit:</span>
                          <p className="font-medium">{bid.deposit} ETH</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted:</span>
                          <p className="font-medium">
                            {new Date(bid.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium capitalize">{bid.status}</p>
                        </div>
                      </div>

                      {bid.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessBid(bid.id)}
                          >
                            Process Bid
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Auction</CardTitle>
                <CardDescription>
                  Set up a new sealed-bid auction for an NFT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAuction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nftAddress">NFT Contract Address</Label>
                      <Input
                        id="nftAddress"
                        value={nftAddress}
                        onChange={(e) => setNftAddress(e.target.value)}
                        placeholder="0x..."
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tokenId">Token ID</Label>
                      <Input
                        id="tokenId"
                        type="number"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        placeholder="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reserve">Reserve Price (ETH)</Label>
                      <Input
                        id="reserve"
                        type="number"
                        step="0.001"
                        value={reserve}
                        onChange={(e) => setReserve(e.target.value)}
                        placeholder="0.1"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endBlock">End Block</Label>
                      <Input
                        id="endBlock"
                        type="number"
                        value={endBlock}
                        onChange={(e) => setEndBlock(e.target.value)}
                        placeholder="12345678"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositPct">Deposit Percentage (Basis Points)</Label>
                    <Input
                      id="depositPct"
                      type="number"
                      value={depositPct}
                      onChange={(e) => setDepositPct(e.target.value)}
                      placeholder="10"
                      min="10"
                      max="50"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      10 = 0.1%, 50 = 0.5% (minimum deposit as percentage of reserve)
                    </p>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Auction...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Auction
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
