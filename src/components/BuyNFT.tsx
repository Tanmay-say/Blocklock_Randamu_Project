import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from '@/contexts/WalletContext';
import { useNFT } from '@/contexts/NFTContext';
import { getContract, LOCAL_CONTRACT_ADDRESSES } from '@/lib/contracts';
import { ethers } from 'ethers';
import { ArrowLeft, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export const BuyNFT: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, account, signer, chainId } = useWallet();
  const { getNFTById, updateNFT } = useNFT();
  
  const [nft, setNft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      const nftData = getNFTById(id);
      if (nftData) {
        setNft(nftData);
        // Check if NFT is still available
        if (nftData.status !== 'available') {
          setError('This NFT is no longer available for purchase.');
        }
      } else {
        setError('NFT not found.');
      }
    }
  }, [id, getNFTById]);

  const handlePurchase = async () => {
    if (!nft || !isConnected || !account || !signer) {
      setError('Please connect your wallet to purchase this NFT.');
      return;
    }

    // Check if on correct network
    if (chainId !== 84532) {
      setError('Please switch to Base Sepolia network to purchase NFTs.');
      return;
    }

    setIsPurchasing(true);
    setError('');

    try {
      // Check if user has enough balance
      const balance = await signer.provider!.getBalance(account);
      const priceInWei = ethers.parseEther(nft.price.toString());
      
      if (balance < priceInWei) {
        throw new Error(`Insufficient balance. You need ${nft.price} ETH but only have ${ethers.formatEther(balance)} ETH.`);
      }

      // Simple marketplace: Send full amount to admin wallet (marketplace owner)
      // In a real marketplace, this would be split between seller and platform
      const ADMIN_WALLET = "0x286bd33A27079f28a4B4351a85Ad7f23A04BDdfC";
      
      console.log('Purchase details:');
      console.log('Buyer:', account);
      console.log('NFT:', nft.name);
      console.log('Price:', nft.price, 'ETH');
      console.log('Admin wallet:', ADMIN_WALLET);
      
      // Send payment to admin wallet
      console.log('Sending payment to admin wallet...');
      const tx = await signer.sendTransaction({
        to: ADMIN_WALLET,
        value: priceInWei,
        gasLimit: 25000 // Increased gas limit for safety
      });

      toast({
        title: "Transaction Submitted",
        description: `Purchasing ${nft.name} for ${nft.price} ETH. Transaction: ${tx.hash}`,
      });

      console.log('Purchase transaction submitted:', tx.hash);

      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      
      console.log('Transaction receipt:', receipt);
      
      if (receipt && receipt.status === 1) {
        // Transaction successful - now mint NFT to buyer
        console.log('Payment confirmed, minting NFT to buyer...');
        
        // Try to mint real NFT to buyer
        console.log('Payment confirmed, attempting to mint NFT to buyer...');
        
        let nftMinted = false;
        let tokenId = null;
        
        // DIRECT NFT MINTING - Users get NFTs immediately!
        console.log('Minting NFT directly to buyer...');
        
        try {
          // Get TestNFT contract for direct minting
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
            name: nft.name,
            description: nft.description,
            image: nft.image,
            attributes: nft.attributes || [],
            purchased_from: "NGT Marketplace",
            original_price: nft.price,
            purchase_date: new Date().toISOString(),
            purchase_transaction: tx.hash,
            buyer: account,
            mint_date: new Date().toISOString()
          };
          
          const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
          
          console.log('Minting NFT with metadata:', metadata);
          
          // Mint NFT directly to the buyer
          const mintTx = await testNFTContract.mint(account, metadataURI);
          console.log('NFT mint transaction submitted:', mintTx.hash);
          
          toast({
            title: "Minting Your NFT...",
            description: `NFT is being minted to your wallet. Transaction: ${mintTx.hash.slice(0, 10)}...`,
          });
          
          const mintReceipt = await mintTx.wait();
          
          if (mintReceipt?.status === 1) {
            console.log('NFT minted successfully!', mintReceipt);
            nftMinted = true;
            
            // Try to extract token ID from logs
            if (mintReceipt.logs && mintReceipt.logs.length > 0) {
              try {
                // Transfer event signature for ERC721
                const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
                const transferLog = mintReceipt.logs.find(log => log.topics[0] === transferEventSignature);
                if (transferLog && transferLog.topics[3]) {
                  tokenId = parseInt(transferLog.topics[3], 16);
                  console.log('Extracted token ID:', tokenId);
                }
              } catch (e) {
                console.warn('Could not extract token ID from logs:', e);
                tokenId = 0; // Fallback
              }
            }
            
            console.log('🎉 NFT successfully minted to user! Token ID:', tokenId);
            
          } else {
            throw new Error(`NFT minting transaction failed. Status: ${mintReceipt?.status}`);
          }
          
        } catch (mintError: any) {
          console.error('Direct NFT minting failed:', mintError);
          
          if (mintError.message && mintError.message.includes('Ownable: caller is not the owner')) {
            console.log('❌ Contract still has onlyOwner restriction!');
            console.log('ℹ️  Deploy the updated contract using: npx hardhat run scripts/deployDirectMinting.js --network base-sepolia');
            
            toast({
              title: "NFT Minting Failed",
              description: "Contract needs to be updated to allow direct minting. Contact admin.",
              variant: "destructive",
            });
            
            nftMinted = false;
          } else {
            throw mintError; // Re-throw other errors
          }
        }
        
        // Update NFT status in our local system
        console.log('Updating local NFT status...');
        
        updateNFT(nft.id, { 
          status: 'sold',
          owner: account,
          transactionHash: tx.hash
        });

        // Add suggestion to import NFT to MetaMask
        const addToMetaMask = async () => {
          try {
            await window.ethereum.request({
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC721',
                options: {
                  address: LOCAL_CONTRACT_ADDRESSES.testNFT,
                  tokenId: '', // We'd need the actual token ID from the mint receipt
                },
              },
            });
          } catch (error) {
            console.log('User declined or error occurred');
          }
        };

        toast({
          title: nftMinted ? "🎉 NFT Purchased & Minted!" : "⚠️ Payment Successful",
          description: nftMinted 
            ? `Real NFT minted to your wallet! Token ID: ${tokenId || 'N/A'}. Check MetaMask NFTs tab.`
            : `Payment confirmed but NFT minting failed. Deploy updated contract for direct minting.`,
          variant: nftMinted ? "default" : "destructive",
        });

        console.log('Purchase completed successfully:', tx.hash);
        console.log('NFT updated in local state');

      // Navigate back to marketplace after success
      setTimeout(() => {
        navigate('/nfts');
        }, 3000);
      } else {
        console.error('Transaction failed with receipt:', receipt);
        throw new Error(`Transaction failed. Status: ${receipt?.status || 'unknown'}`);
      }

    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      let errorMessage = 'Purchase failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction cancelled by user.';
        } else if (error.message.includes('Insufficient balance')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Transaction failed: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!nft) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">NFT Not Found</h2>
            <Button onClick={() => navigate('/nfts')} variant="outline">
              Back to Marketplace
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => `${price} ETH`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* NFT Image and Details */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border border-nft-border overflow-hidden">
              <div className="relative">
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-900/20 text-green-400 border border-green-700/30">
                    Available
                  </Badge>
                </div>
              </div>
            </Card>

            {/* NFT Details */}
            <Card className="bg-gradient-card border border-nft-border">
              <CardHeader>
                <CardTitle className="text-white">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Collection</span>
                  <span className="text-white">{nft.collection}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="text-white font-mono text-sm">
                    {nft.creator.slice(0, 6)}...{nft.creator.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mint Date</span>
                  <span className="text-white">{formatDate(nft.mintDate)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border border-nft-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Purchase NFT
                </CardTitle>
                <CardDescription>
                  Buy this NFT instantly at a fixed price
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{nft.name}</h3>
                  <p className="text-muted-foreground">{nft.description}</p>
                </div>

                <Separator className="bg-nft-border" />

                {/* Price Display */}
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground mb-2">Fixed Price</div>
                  <div className="text-4xl font-bold text-primary">
                    {formatPrice(nft.price)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Non-negotiable • Instant Purchase
                  </div>
                </div>

                <Separator className="bg-nft-border" />

                {/* Tags */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {nft.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-nft-border text-muted-foreground">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Purchase Button */}
                {!isConnected ? (
                  <Alert className="border-yellow-500/30 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-400">
                      Please connect your wallet to purchase this NFT.
                    </AlertDescription>
                  </Alert>
                ) : chainId !== 84532 ? (
                  <Alert className="border-red-500/30 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      Please switch to Base Sepolia network to purchase NFTs.
                    </AlertDescription>
                  </Alert>
                ) : nft.status !== 'available' ? (
                  <Button 
                    className="w-full bg-gray-600 text-gray-300 cursor-not-allowed"
                    disabled
                  >
                    No Longer Available
                  </Button>
                ) : (
                  <Button 
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    {isPurchasing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Purchase...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Buy Now for {formatPrice(nft.price)}
                      </>
                    )}
                  </Button>
                )}

                {/* Success Message */}
                {isPurchasing && (
                  <Alert className="border-green-500/30 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      Processing your purchase on the blockchain...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
