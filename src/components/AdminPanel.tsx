import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWallet } from "@/contexts/WalletContext";
import { useNFT } from "@/contexts/NFTContext";
import { Plus, Edit, Trash2, Eye, Trophy, Users, Clock, DollarSign, Image, Tag, Settings, Wallet, Coins } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { NFT } from '@/data/nfts';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const { account, isConnected, provider, chainId } = useWallet();
  const { nfts, addNFT, updateNFT, deleteNFT, getNFTsByStatus, resetNFTs } = useNFT();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [networkName, setNetworkName] = useState<string>('Unknown');
  const [isSepolia, setIsSepolia] = useState<boolean>(false);
  
  // Form states for NFT management
  const [isAddingNFT, setIsAddingNFT] = useState(false);
  const [editingNFT, setEditingNFT] = useState<NFT | null>(null);
  const [nftForm, setNftForm] = useState({
    name: '',
    description: '',
    price: '',
    collection: '',
    tags: '',
    image: '',
    creator: '',
    mintDate: '',
    status: 'available' as 'available' | 'auction' | 'sold'
  });

  // Auction form states
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [auctionForm, setAuctionForm] = useState({
    nftId: '',
    startingPrice: '',
    reservePrice: '',
    duration: '24', // hours
    startTime: new Date().toISOString().slice(0, 16), // Set default to current time
    description: '',
    creator: ''
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Filter state for admin view
  const [nftFilter, setNftFilter] = useState<'all' | 'available' | 'auction' | 'sold'>('all');

  // Filtered NFTs for display
  const filteredNFTs = nftFilter === 'all' ? nfts : getNFTsByStatus(nftFilter);

  // Load NFTs and wallet info on component mount
  useEffect(() => {
    if (isConnected && provider) {
      loadWalletInfo();
    }
  }, [isConnected, provider]);

  // Load wallet information
  const loadWalletInfo = async () => {
    if (!provider || !account) return;
    
    try {
      // Get wallet balance
      const balance = await provider.getBalance(account);
      const balanceInEth = parseFloat(balance.toString()) / Math.pow(10, 18);
      setWalletBalance(balanceInEth.toFixed(4));

      // Get network information
      const network = await provider.getNetwork();
      const networkId = Number(network.chainId);
      
      if (networkId === 11155111) { // Ethereum Sepolia
        setNetworkName('Ethereum Sepolia');
        setIsSepolia(true);
      } else if (networkId === 1) { // Ethereum Mainnet
        setNetworkName('Ethereum Mainnet');
        setIsSepolia(false);
      } else {
        setNetworkName(`Network ID: ${networkId}`);
        setIsSepolia(false);
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };



  const resetForm = () => {
    setNftForm({
      name: '',
      description: '',
      price: '',
      collection: '',
      tags: '',
      image: '',
      creator: '',
      mintDate: '',
      status: 'available'
    });
    setIsAddingNFT(false);
    setEditingNFT(null);
    setImagePreview('');
    setSelectedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting NFT form:', nftForm);
    console.log('Image preview:', imagePreview);
    console.log('Selected image:', selectedImage);

    try {
      // Validate required fields
      if (!nftForm.name || !nftForm.description || !nftForm.price || !nftForm.collection) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      if (editingNFT) {
        // Update existing NFT
        const updatedData = {
          name: nftForm.name,
          description: nftForm.description,
          price: parseFloat(nftForm.price),
          collection: nftForm.collection,
          tags: nftForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image: nftForm.image || imagePreview || editingNFT.image,
          creator: nftForm.creator,
          mintDate: nftForm.mintDate,
          status: nftForm.status
        };
        
        updateNFT(editingNFT.id, updatedData);
        toast({
          title: "NFT Updated",
          description: "The NFT has been successfully updated.",
        });
      } else {
        // Add new NFT
        const newNFT: NFT = {
          id: Date.now().toString(),
          name: nftForm.name,
          description: nftForm.description,
          image: nftForm.image || imagePreview || "/src/assets/nft-1.png",
          price: parseFloat(nftForm.price),
          tags: nftForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          creator: nftForm.creator || account || "0x0000000000000000000000000000000000000000",
          collection: nftForm.collection,
          mintDate: nftForm.mintDate || new Date().toISOString().split('T')[0],
          attributes: [],
          status: nftForm.status,
          currentBids: 0
        };
        
        console.log('Adding new NFT:', newNFT);
        addNFT(newNFT);
        toast({
          title: "NFT Added",
          description: "New NFT has been successfully added to the marketplace.",
        });
      }
      
      resetForm();
      setImagePreview('');
      setSelectedImage(null);
    } catch (error) {
      console.error('NFT save error:', error);
      toast({
        title: "Error",
        description: "Failed to save NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nft: NFT) => {
    setEditingNFT(nft);
    setNftForm({
      name: nft.name,
      description: nft.description,
      price: nft.price.toString(),
      collection: nft.collection,
      tags: nft.tags.join(', '),
      image: nft.image,
      creator: nft.creator,
      mintDate: nft.mintDate,
      status: nft.status
    });
    setIsAddingNFT(true);
  };

  const handleDelete = async (nftId: string) => {
    if (window.confirm('Are you sure you want to delete this NFT?')) {
      deleteNFT(nftId);
      toast({
        title: "NFT Deleted",
        description: "The NFT has been successfully removed.",
      });
    }
  };

  const handleConvertToAuction = (nft: NFT) => {
    // Pre-fill the auction form with the selected NFT
    setAuctionForm({
      nftId: nft.id,
      startingPrice: nft.price.toString(),
      reservePrice: (nft.price * 1.2).toString(), // 20% higher than base price
      duration: '24',
      startTime: new Date().toISOString().slice(0, 16),
      description: `Auction for ${nft.name}`,
      creator: nft.creator
    });
    setIsCreatingAuction(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setNftForm(prev => ({ ...prev, [field]: value }));
  };

  // Image upload functions
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedImage) return '';
    
    setUploadingImage(true);
    try {
      // Simulate image upload to IPFS or cloud storage
      // In production, you would upload to IPFS, Arweave, or similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock IPFS hash (in production, this would be the actual hash)
      const mockHash = `ipfs://Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      toast({
        title: "Image Uploaded",
        description: "Image has been successfully uploaded to IPFS.",
      });
      
      return mockHash;
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  // Auction functions
  const handleAuctionInputChange = (field: string, value: string) => {
    setAuctionForm(prev => ({ ...prev, [field]: value }));
  };

  const createAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Creating auction with form data:', auctionForm);
    console.log('Available NFTs:', nfts.filter(nft => nft.status === 'available'));

    try {
      // Validate required fields
      if (!auctionForm.nftId) {
        toast({
          title: "Error",
          description: "Please select an NFT to auction.",
          variant: "destructive",
        });
        return;
      }

      if (!auctionForm.startingPrice || parseFloat(auctionForm.startingPrice) <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid starting price.",
          variant: "destructive",
        });
        return;
      }

      // Find the NFT to auction
      const nftToAuction = nfts.find(nft => nft.id === auctionForm.nftId);
      console.log('NFT to auction:', nftToAuction);
      
      if (!nftToAuction) {
        toast({
          title: "Error",
          description: "Selected NFT not found.",
          variant: "destructive",
        });
        return;
      }

      // Check if NFT is available
      if (nftToAuction.status !== 'available') {
        toast({
          title: "Error",
          description: "Selected NFT is not available for auction.",
          variant: "destructive",
        });
        return;
      }

      // Update NFT status to auction
      updateNFT(auctionForm.nftId, {
        status: 'auction' as const,
        price: parseFloat(auctionForm.startingPrice),
        auctionEndTime: new Date(Date.now() + parseInt(auctionForm.duration) * 60 * 60 * 1000).toISOString(),
        currentBids: 0
      });
      
      toast({
        title: "Auction Created",
        description: `Auction for ${nftToAuction.name} has been successfully created.`,
      });

      // Reset auction form
      setAuctionForm({
        nftId: '',
        startingPrice: '',
        reservePrice: '',
        duration: '24',
        startTime: new Date().toISOString().slice(0, 16),
        description: '',
        creator: ''
      });
      setIsCreatingAuction(false);
      
    } catch (error) {
      console.error('Auction creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAuctionForm = () => {
    setAuctionForm({
      nftId: '',
      startingPrice: '',
      reservePrice: '',
      duration: '24',
      startTime: new Date().toISOString().slice(0, 16),
      description: '',
      creator: ''
    });
    setIsCreatingAuction(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="bg-gradient-card border-b border-nft-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-muted-foreground">Manage your NFT marketplace</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet Info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="text-white font-mono">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-white font-mono">{walletBalance} ETH</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Network</p>
                <p className={`font-mono ${isSepolia ? 'text-green-400' : 'text-orange-400'}`}>
                  {networkName}
                </p>
              </div>
              <Button 
                onClick={loadWalletInfo} 
                size="sm" 
                variant="outline" 
                className="border-nft-border text-muted-foreground hover:bg-background"
              >
                <Coins className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-nft-border text-muted-foreground hover:bg-background">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-card border border-nft-border">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Account
            </TabsTrigger>
            <TabsTrigger value="nfts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              NFT Management
            </TabsTrigger>
            <TabsTrigger value="auctions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Auctions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Debug Info */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-2">🔍 Debug Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="text-yellow-400">Total: {nfts.length}</div>
                <div className="text-green-400">Available: {nfts.filter(n => n.status === 'available').length}</div>
                <div className="text-blue-400">Auction: {nfts.filter(n => n.status === 'auction').length}</div>
                <div className="text-gray-400">Sold: {nfts.filter(n => n.status === 'sold').length}</div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-card border border-nft-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Image className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{nfts.length}</p>
                      <p className="text-muted-foreground">Total NFTs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border border-nft-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {nfts.filter(nft => nft.status === 'auction').length}
                      </p>
                      <p className="text-muted-foreground">Active Auctions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border border-nft-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {nfts.filter(nft => nft.status === 'sold').length}
                      </p>
                      <p className="text-muted-foreground">Sold NFTs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border border-nft-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {nfts.reduce((total, nft) => total + nft.price, 0).toFixed(3)}
                      </p>
                      <p className="text-muted-foreground">Total Value (ETH)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

                         <div className="flex items-center justify-between">
               <h3 className="text-xl font-semibold text-white">Recent Activity</h3>

             </div>
             <Card className="bg-gradient-card border border-nft-border">
               <CardContent>
                 <div className="space-y-4">
                   {nfts.slice(0, 5).map((nft) => (
                     <div key={nft.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                       <div className="flex items-center gap-4">
                         <img src={nft.image} alt={nft.name} className="w-12 h-12 rounded-lg object-cover" />
                         <div>
                           <p className="font-medium text-white">{nft.name}</p>
                           <p className="text-sm text-muted-foreground">{nft.collection}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-medium text-primary">{nft.price} ETH</p>
                         <Badge variant="outline" className="border-nft-border text-muted-foreground">
                           {nft.status}
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-gradient-card border border-nft-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="w-6 h-6" />
                  Wallet Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View your connected wallet details and network information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-background/50 rounded-lg border border-nft-border">
                    <h4 className="font-medium text-white mb-3">Connection Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={isConnected ? "default" : "destructive"}>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="text-white font-mono text-sm">
                          {account || 'Not connected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-lg border border-nft-border">
                    <h4 className="font-medium text-white mb-3">Network Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Network:</span>
                        <Badge variant={isSepolia ? "default" : "secondary"}>
                          {networkName}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Chain ID:</span>
                        <span className="text-white font-mono text-sm">
                          {chainId || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Information */}
                <div className="p-4 bg-background/50 rounded-lg border border-nft-border">
                  <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Balance Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-hero/20 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{walletBalance}</p>
                      <p className="text-muted-foreground">ETH Balance</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-hero/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-400">
                        {isSepolia ? '✓' : '✗'}
                      </p>
                      <p className="text-muted-foreground">Sepolia Network</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-hero/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">
                        {isConnected ? '✓' : '✗'}
                      </p>
                      <p className="text-muted-foreground">Wallet Connected</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={loadWalletInfo} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Refresh Balance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-nft-border text-muted-foreground hover:bg-background"
                    onClick={() => window.open('https://sepolia.etherscan.io/', '_blank')}
                  >
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFT Management Tab */}
          <TabsContent value="nfts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">NFT Management</h2>
              <div className="flex gap-3">

                <Button 
                  onClick={() => setIsAddingNFT(true)} 
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New NFT
                </Button>
              </div>
            </div>

            {/* NFT Filters */}
            <div className="flex items-center gap-4">
              <Button 
                variant={nftFilter === 'available' ? 'default' : 'outline'}
                className={nftFilter === 'available' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background'}
                onClick={() => setNftFilter('available')}
              >
                Available ({nfts.filter(nft => nft.status === 'available').length})
              </Button>
              <Button 
                variant={nftFilter === 'auction' ? 'default' : 'outline'}
                className={nftFilter === 'auction' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background'}
                onClick={() => setNftFilter('auction')}
              >
                Ongoing Auctions ({nfts.filter(nft => nft.status === 'auction').length})
              </Button>
              <Button 
                variant={nftFilter === 'sold' ? 'default' : 'outline'}
                className={nftFilter === 'sold' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background'}
                onClick={() => setNftFilter('sold')}
              >
                Ended/Sold ({nfts.filter(nft => nft.status === 'sold').length})
              </Button>
              <Button 
                variant={nftFilter === 'all' ? 'default' : 'outline'}
                className={nftFilter === 'all' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background'}
                onClick={() => setNftFilter('all')}
              >
                Show All ({nfts.length})
              </Button>
            </div>

            {/* Convert to Auction Form */}
            {isCreatingAuction && (
              <Card className="bg-gradient-card border border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-green-400" />
                    Convert NFT to Auction
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {auctionForm.nftId ? `Converting "${nfts.find(n => n.id === auctionForm.nftId)?.name}" to auction` : 'Set up auction parameters for your NFT'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createAuction} className="space-y-6">
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                         <Label htmlFor="nftSelect" className="text-muted-foreground">Select NFT</Label>
                         <Select 
                           value={auctionForm.nftId} 
                           onValueChange={(value) => handleAuctionInputChange('nftId', value)}
                           disabled={!!auctionForm.nftId} // Disable if NFT already selected
                         >
                           <SelectTrigger className="bg-background border-nft-border text-foreground">
                             <SelectValue placeholder="Choose an NFT to auction" />
                           </SelectTrigger>
                           <SelectContent className="bg-background border-nft-border">
                             {nfts.filter(nft => nft.status === 'available').map((nft) => (
                               <SelectItem key={nft.id} value={nft.id}>
                                 {nft.name} - {nft.price} ETH
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                         {auctionForm.nftId && (
                           <p className="text-sm text-green-400 mt-1">
                             ✓ NFT selected for auction conversion
                           </p>
                         )}
                       </div>

                       <div>
                         <Label htmlFor="startingPrice" className="text-muted-foreground">Starting Price (ETH)</Label>
                         <Input
                           id="startingPrice"
                           type="number"
                           step="0.001"
                           value={auctionForm.startingPrice}
                           onChange={(e) => handleAuctionInputChange('startingPrice', e.target.value)}
                           placeholder="0.005"
                           className="bg-background border-nft-border text-foreground"
                           required
                         />
                       </div>

                       <div>
                         <Label htmlFor="reservePrice" className="text-muted-foreground">Reserve Price (ETH)</Label>
                         <Input
                           id="reservePrice"
                           type="number"
                           step="0.001"
                           value={auctionForm.reservePrice}
                           onChange={(e) => handleAuctionInputChange('reservePrice', e.target.value)}
                           placeholder="0.003"
                           className="bg-background border-nft-border text-foreground"
                         />
                       </div>

                       <div>
                         <Label htmlFor="duration" className="text-muted-foreground">Duration (hours)</Label>
                         <Select value={auctionForm.duration} onValueChange={(value) => handleAuctionInputChange('duration', value)}>
                           <SelectTrigger className="bg-background border-nft-border text-foreground">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-background border-nft-border">
                             <SelectItem value="1">1 hour</SelectItem>
                             <SelectItem value="6">6 hours</SelectItem>
                             <SelectItem value="12">12 hours</SelectItem>
                             <SelectItem value="24">24 hours</SelectItem>
                             <SelectItem value="48">48 hours</SelectItem>
                             <SelectItem value="72">72 hours</SelectItem>
                           </SelectContent>
                         </Select>
                       </div>

                       <div>
                         <Label htmlFor="creator" className="text-muted-foreground">Creator Address</Label>
                         <Input
                           id="creator"
                           value={auctionForm.creator || account || ''}
                           onChange={(e) => handleAuctionInputChange('creator', e.target.value)}
                           placeholder="0x..."
                           className="bg-background border-nft-border text-foreground"
                         />
                       </div>

                       <div>
                         <Label htmlFor="startTime" className="text-muted-foreground">Start Time</Label>
                         <Input
                           id="startTime"
                           type="datetime-local"
                           value={auctionForm.startTime}
                           onChange={(e) => handleAuctionInputChange('startTime', e.target.value)}
                           className="bg-background border-nft-border text-foreground"
                         />
                       </div>
                     </div>

                    <div>
                      <Label htmlFor="auctionDescription" className="text-muted-foreground">Auction Description</Label>
                      <Textarea
                        id="auctionDescription"
                        value={auctionForm.description}
                        onChange={(e) => handleAuctionInputChange('description', e.target.value)}
                        placeholder="Describe the auction terms and conditions..."
                        className="bg-background border-nft-border text-foreground min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-4">
                                             <Button 
                         type="submit" 
                         className="bg-green-600 hover:bg-green-700"
                         disabled={loading || !auctionForm.nftId || !auctionForm.startingPrice || parseFloat(auctionForm.startingPrice) <= 0}
                       >
                         {loading ? 'Creating...' : 'Create Auction'}
                       </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetAuctionForm}
                        className="border-nft-border text-muted-foreground hover:bg-background"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Add/Edit NFT Form */}
            {isAddingNFT && (
              <Card className="bg-gradient-card border border-nft-border">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingNFT ? 'Edit NFT' : 'Add New NFT'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-muted-foreground">NFT Name</Label>
                        <Input
                          id="name"
                          value={nftForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter NFT name"
                          className="bg-background border-nft-border text-foreground"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="price" className="text-muted-foreground">Price (ETH)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.001"
                          value={nftForm.price}
                          onChange={(e) => handleInputChange('price', e.target.value)}
                          placeholder="0.005"
                          className="bg-background border-nft-border text-foreground"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="collection" className="text-muted-foreground">Collection</Label>
                        <Input
                          id="collection"
                          value={nftForm.collection}
                          onChange={(e) => handleInputChange('collection', e.target.value)}
                          placeholder="Enter collection name"
                          className="bg-background border-nft-border text-foreground"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="status" className="text-muted-foreground">Status</Label>
                        <Select value={nftForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger className="bg-background border-nft-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border-nft-border">
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="auction">Auction</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="tags" className="text-muted-foreground">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={nftForm.tags}
                          onChange={(e) => handleInputChange('tags', e.target.value)}
                          placeholder="Space, Cosmic, Mystical"
                          className="bg-background border-nft-border text-foreground"
                        />
                      </div>

                                             <div>
                         <Label htmlFor="image" className="text-muted-foreground">Image Upload</Label>
                         <div className="space-y-3">
                                                       {/* Image Preview */}
                            {imagePreview && (
                              <div className="relative">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="w-32 h-32 object-cover rounded-lg border border-nft-border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview('');
                                    setNftForm(prev => ({ ...prev, image: '' }));
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 border-0"
                                >
                                  ×
                                </Button>
                              </div>
                            )}

                            {/* Current Image Display */}
                            {nftForm.image && !imagePreview && (
                              <div className="relative">
                                <img 
                                  src={nftForm.image} 
                                  alt="Current" 
                                  className="w-32 h-32 object-cover rounded-lg border border-nft-border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setNftForm(prev => ({ ...prev, image: '' }));
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 border-0"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                           
                           {/* File Input */}
                           <Input
                             id="image"
                             type="file"
                             accept="image/*"
                             onChange={handleImageSelect}
                             className="bg-background border-nft-border text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                           />
                           
                                                       {/* Upload Button */}
                            {selectedImage && !imagePreview && (
                              <Button
                                type="button"
                                onClick={async () => {
                                  const imageUrl = await uploadImage();
                                  if (imageUrl) {
                                    setNftForm(prev => ({ ...prev, image: imageUrl }));
                                    setImagePreview(imageUrl);
                                  }
                                }}
                                disabled={uploadingImage}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                              </Button>
                            )}
                           
                           {/* Manual URL Input */}
                           <div className="pt-2">
                             <Label htmlFor="imageUrl" className="text-xs text-muted-foreground">Or enter image URL manually:</Label>
                             <Input
                               id="imageUrl"
                               value={nftForm.image}
                               onChange={(e) => handleInputChange('image', e.target.value)}
                               placeholder="https://example.com/image.png or ipfs://..."
                               className="bg-background border-nft-border text-foreground text-sm"
                             />
                           </div>
                         </div>
                       </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-muted-foreground">Description</Label>
                      <Textarea
                        id="description"
                        value={nftForm.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter detailed description"
                        className="bg-background border-nft-border text-foreground min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (editingNFT ? 'Update NFT' : 'Add NFT')}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                        className="border-nft-border text-muted-foreground hover:bg-background"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* NFT List */}
            <Card className="bg-gradient-card border border-nft-border">
              <CardHeader>
                <CardTitle className="text-white">All NFTs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNFTs.map((nft) => (
                    <div key={nft.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-white">{nft.name}</p>
                          <p className="text-sm text-muted-foreground">{nft.collection}</p>
                          <p className="text-sm text-muted-foreground">{nft.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-primary">{nft.price} ETH</p>
                          <Badge variant="outline" className="border-nft-border text-muted-foreground">
                            {nft.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(nft)}
                            className="border-nft-border text-muted-foreground hover:bg-background"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {nft.status === 'available' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleConvertToAuction(nft)}
                              className="border-green-500 text-green-400 hover:bg-green-500/20"
                            >
                              <Trophy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(nft.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

                     {/* Auctions Tab */}
           <TabsContent value="auctions" className="space-y-6">
             <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold text-white">Auction Management</h2>
               <Button 
                 onClick={() => setIsCreatingAuction(true)} 
                 className="bg-green-600 hover:bg-green-700"
               >
                 <Trophy className="w-4 h-4 mr-2" />
                 Create New Auction
               </Button>
             </div>

             {/* Active Auctions */}
             <Card className="bg-gradient-card border border-nft-border">
               <CardHeader>
                 <CardTitle className="text-white flex items-center gap-2">
                   <Clock className="w-6 h-6" />
                   Active Auctions
                 </CardTitle>
                 <CardDescription className="text-muted-foreground">
                   Monitor ongoing auctions and bidding activity
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {nfts.filter(nft => nft.status === 'auction').length > 0 ? (
                   <div className="space-y-4">
                     {nfts.filter(nft => nft.status === 'auction').map((nft) => (
                       <div key={nft.id} className="p-4 bg-background/50 rounded-lg border border-nft-border">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-lg object-cover" />
                             <div>
                               <h4 className="font-medium text-white">{nft.name}</h4>
                               <p className="text-sm text-muted-foreground">{nft.collection}</p>
                               <p className="text-sm text-muted-foreground">
                                 Starting Price: <span className="text-primary">{nft.price} ETH</span>
                               </p>
                               {nft.auctionEndTime && (
                                 <p className="text-sm text-muted-foreground">
                                   Ends: {new Date(nft.auctionEndTime).toLocaleString()}
                                 </p>
                               )}
                             </div>
                           </div>
                           <div className="text-right">
                             <Badge variant="default" className="bg-green-600">
                               Active Auction
                             </Badge>
                             <p className="text-sm text-muted-foreground mt-2">
                               Bids: {nft.currentBids || 0}
                             </p>
                             <div className="flex gap-2 mt-3">
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="border-nft-border text-muted-foreground hover:bg-background"
                               >
                                 <Eye className="w-4 h-4 mr-2" />
                                 View Details
                               </Button>
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="border-nft-border text-muted-foreground hover:bg-background"
                               >
                                 <Users className="w-4 h-4 mr-2" />
                                 View Bids
                               </Button>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-12">
                     <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-white mb-2">No Active Auctions</h3>
                     <p className="text-muted-foreground mb-4">
                       Create your first auction to get started.
                     </p>
                     <Button 
                       onClick={() => setIsCreatingAuction(true)} 
                       className="bg-green-600 hover:bg-green-700"
                     >
                       <Trophy className="w-4 h-4 mr-2" />
                       Create Auction
                     </Button>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Ended Auctions */}
             <Card className="bg-gradient-card border border-nft-border">
               <CardHeader>
                 <CardTitle className="text-white flex items-center gap-2">
                   <Trophy className="w-6 h-6" />
                   Ended Auctions
                 </CardTitle>
                 <CardDescription className="text-muted-foreground">
                   View completed auctions and results
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 {nfts.filter(nft => nft.status === 'sold').length > 0 ? (
                   <div className="space-y-4">
                     {nfts.filter(nft => nft.status === 'sold').map((nft) => (
                       <div key={nft.id} className="p-4 bg-background/50 rounded-lg border border-nft-border">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <img src={nft.image} alt={nft.name} className="w-16 h-16 rounded-lg object-cover" />
                             <div>
                               <h4 className="font-medium text-white">{nft.name}</h4>
                               <p className="text-sm text-muted-foreground">{nft.collection}</p>
                               <p className="text-sm text-muted-foreground">
                                 Final Price: <span className="text-primary">{nft.price} ETH</span>
                               </p>
                             </div>
                           </div>
                           <div className="text-right">
                             <Badge variant="secondary">
                               Sold
                             </Badge>
                             <p className="text-sm text-muted-foreground mt-2">
                               Total Bids: {nft.currentBids || 0}
                             </p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                     <p className="text-muted-foreground">No completed auctions yet.</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gradient-card border border-nft-border">
              <CardHeader>
                <CardTitle className="text-white">Admin Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure marketplace settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Settings Panel</h3>
                  <p className="text-muted-foreground">
                    Configuration options will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
