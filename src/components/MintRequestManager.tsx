import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from '@/contexts/WalletContext';
import { LOCAL_CONTRACT_ADDRESSES } from '@/lib/contracts';
import { ethers } from 'ethers';
import { Coins, User, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface MintRequest {
  buyer: string;
  nft: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
  purchaseTransaction: string;
  purchasePrice: number;
  purchaseDate: string;
  marketplaceId: string;
  processed?: boolean;
  mintTransaction?: string;
  tokenId?: number;
}

export const MintRequestManager: React.FC = () => {
  const { account, signer, isConnected } = useWallet();
  const [mintRequests, setMintRequests] = useState<MintRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    // Load mint requests from localStorage
    const requests = JSON.parse(localStorage.getItem('nft-mint-requests') || '[]');
    setMintRequests(requests);
  }, []);

  const saveMintRequests = (requests: MintRequest[]) => {
    localStorage.setItem('nft-mint-requests', JSON.stringify(requests));
    setMintRequests(requests);
  };

  const handleMintNFT = async (request: MintRequest, index: number) => {
    if (!signer || !account) {
      toast({
        title: "Error",
        description: "Please connect your wallet to mint NFTs.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(request.buyer + request.marketplaceId);

    try {
      // Get TestNFT contract for minting
      const testNFTContract = new ethers.Contract(
        LOCAL_CONTRACT_ADDRESSES.testNFT,
        [
          "function mint(address to, string memory uri) external returns (uint256)",
          "function ownerOf(uint256 tokenId) external view returns (address)",
          "function tokenURI(uint256 tokenId) external view returns (string memory)",
          "function totalSupply() external view returns (uint256)"
        ],
        signer
      );

      // Create metadata URI for the NFT
      const metadata = {
        name: request.nft.name,
        description: request.nft.description,
        image: request.nft.image,
        attributes: request.nft.attributes,
        purchased_from: "NGT Marketplace",
        original_price: request.purchasePrice,
        purchase_date: request.purchaseDate,
        purchase_transaction: request.purchaseTransaction,
        buyer: request.buyer,
        minted_by: "NGT Marketplace Admin",
        mint_date: new Date().toISOString()
      };

      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      console.log('Minting NFT for user:', request.buyer);
      console.log('Metadata:', metadata);

      // Mint NFT to the buyer
      const mintTx = await testNFTContract.mint(request.buyer, metadataURI);
      console.log('NFT mint transaction:', mintTx.hash);

      toast({
        title: "Minting NFT...",
        description: `Transaction submitted: ${mintTx.hash.slice(0, 10)}...`,
      });

      const mintReceipt = await mintTx.wait();

      if (mintReceipt?.status === 1) {
        // Get the token ID from the transaction logs
        let tokenId = 0;
        if (mintReceipt.logs && mintReceipt.logs.length > 0) {
          try {
            // Try to get token ID from Transfer event
            const transferLog = mintReceipt.logs.find(log => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef');
            if (transferLog && transferLog.topics[3]) {
              tokenId = parseInt(transferLog.topics[3], 16);
            }
          } catch (e) {
            console.warn('Could not extract token ID from logs');
          }
        }

        // Update the mint request as processed
        const updatedRequests = [...mintRequests];
        updatedRequests[index] = {
          ...request,
          processed: true,
          mintTransaction: mintTx.hash,
          tokenId: tokenId
        };
        saveMintRequests(updatedRequests);

        toast({
          title: "NFT Minted Successfully!",
          description: `NFT minted to ${request.buyer.slice(0, 6)}...${request.buyer.slice(-4)}. Token ID: ${tokenId}`,
        });

        console.log('NFT minted successfully. Token ID:', tokenId);

      } else {
        throw new Error(`Transaction failed. Status: ${mintReceipt?.status}`);
      }

    } catch (error: any) {
      console.error('NFT minting failed:', error);

      let errorMessage = 'Failed to mint NFT. Please try again.';
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled by user.';
        } else if (error.message.includes('Ownable: caller is not the owner')) {
          errorMessage = 'Only contract owner can mint NFTs.';
        } else {
          errorMessage = `Minting failed: ${error.message}`;
        }
      }

      toast({
        title: "Minting Failed",
        description: errorMessage,
        variant: "destructive",
      });

    } finally {
      setProcessing(null);
    }
  };

  const clearProcessedRequests = () => {
    const unprocessedRequests = mintRequests.filter(req => !req.processed);
    saveMintRequests(unprocessedRequests);
    
    toast({
      title: "Cleared",
      description: "Processed mint requests have been cleared.",
    });
  };

  if (!isConnected) {
    return (
      <Card className="bg-gradient-card border border-nft-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Connect your admin wallet to manage NFT minting</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = mintRequests.filter(req => !req.processed);
  const processedRequests = mintRequests.filter(req => req.processed);

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card className="bg-gradient-card border border-nft-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-orange-400" />
              Pending NFT Mint Requests ({pendingRequests.length})
            </CardTitle>
            {processedRequests.length > 0 && (
              <Button
                onClick={clearProcessedRequests}
                variant="outline"
                size="sm"
                className="border-nft-border text-muted-foreground hover:bg-background/50"
              >
                Clear Processed
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              No pending mint requests
            </div>
          ) : (
            pendingRequests.map((request, index) => {
              const actualIndex = mintRequests.findIndex(r => r === request);
              const isProcessing = processing === request.buyer + request.marketplaceId;
              
              return (
                <div key={actualIndex} className="p-4 bg-background/30 rounded-lg border border-nft-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={request.nft.image} 
                        alt={request.nft.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="text-white font-semibold">{request.nft.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            {request.buyer.slice(0, 6)}...{request.buyer.slice(-4)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-green-400">
                            <Coins className="w-3 h-3" />
                            {request.purchasePrice} ETH
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(request.purchaseDate).toLocaleDateString()}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://sepolia.basescan.org/tx/${request.purchaseTransaction}`, '_blank')}
                            className="text-xs border-nft-border text-muted-foreground hover:bg-background/50"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-orange-900/20 text-orange-400 border border-orange-700/30">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={() => handleMintNFT(request, actualIndex)}
                        disabled={isProcessing}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Minting...
                          </>
                        ) : (
                          <>
                            <Coins className="w-3 h-3 mr-1" />
                            Mint NFT
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <Card className="bg-gradient-card border border-nft-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Processed Mint Requests ({processedRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedRequests.slice(0, 5).map((request, index) => (
              <div key={index} className="p-4 bg-background/30 rounded-lg border border-green-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={request.nft.image} 
                      alt={request.nft.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="text-white font-medium">{request.nft.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        Minted to: {request.buyer.slice(0, 6)}...{request.buyer.slice(-4)}
                      </div>
                      {request.tokenId !== undefined && (
                        <div className="text-xs text-green-400">Token ID: {request.tokenId}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Minted
                    </Badge>
                    {request.mintTransaction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://sepolia.basescan.org/tx/${request.mintTransaction}`, '_blank')}
                        className="border-nft-border text-muted-foreground hover:bg-background/50"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
