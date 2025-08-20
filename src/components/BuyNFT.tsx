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
import { ArrowLeft, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

export const BuyNFT: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
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
    if (!nft || !isConnected || !account) return;

    setIsPurchasing(true);
    setError('');

    try {
      // Simulate purchase transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update NFT status to sold
      updateNFT(nft.id, { 
        status: 'sold',
        owner: account 
      });

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${nft.name} for ${nft.price} ETH.`,
      });

      // Navigate back to marketplace after success
      setTimeout(() => {
        navigate('/nfts');
      }, 2000);

    } catch (error) {
      setError('Purchase failed. Please try again.');
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase.",
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
