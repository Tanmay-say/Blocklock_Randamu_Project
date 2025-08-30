import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/contexts/WalletContext';
import { ADMIN_WALLET_ADDRESS, PAYMENT_CONFIG } from '@/config/admin';
import {
  Download, Coins, CheckCircle, X,
  AlertTriangle, Lock, Shield, Zap, Wallet
} from "lucide-react";
import { parseEther } from 'ethers';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    imageUrl: string;
    prompt: string;
    style: string;
    size: string;
    price: number;
    imageHash: string;
  };
}

export default function PaymentModal({ isOpen, onClose, nftData }: PaymentModalProps) {
  const { account, signer, isConnected } = useWallet();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Admin wallet address from config
  const ADMIN_WALLET = ADMIN_WALLET_ADDRESS;

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!isConnected || !signer || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet to proceed",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Direct ETH transfer to admin wallet
             const tx = await signer.sendTransaction({
         to: ADMIN_WALLET,
         value: parseEther(nftData.price.toString())
       });

      toast({
        title: "Payment Processing",
        description: "ETH transfer submitted. Waiting for confirmation...",
      });

      // Wait for transaction confirmation
      await tx.wait();

      toast({
        title: "Payment Successful!",
        description: "Your ETH has been transferred. Preparing download...",
      });

      // Generate download link
      const response = await fetch(nftData.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsSuccess(true);

    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Transaction failed',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `nft-${nftData.imageHash.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your NFT image is being downloaded",
      });
    }
  };

  const handleClose = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setIsSuccess(false);
    setDownloadUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-green-500" />
            {isSuccess ? "Download Ready" : "ETH Payment"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* NFT Preview */}
          <div className="text-center">
            <img 
              src={nftData.imageUrl} 
              alt={nftData.prompt}
              className="w-32 h-32 mx-auto rounded-lg object-cover border border-border"
            />
            <h3 className="font-medium mt-2">{nftData.prompt}</h3>
            <div className="flex gap-2 justify-center mt-2">
              <Badge variant="secondary">{nftData.style}</Badge>
              <Badge variant="outline">{nftData.size}</Badge>
            </div>
          </div>

          {!isSuccess ? (
            <>
              {/* Payment Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">NFT Price:</span>
                  <span className="font-medium">{nftData.price} ETH</span>
                </div>
                                 <div className="flex justify-between items-center">
                   <span className="text-sm text-muted-foreground">Network Fee:</span>
                   <span className="text-sm text-muted-foreground">~{PAYMENT_CONFIG.NETWORK_FEE_ESTIMATE} ETH</span>
                 </div>
                 <div className="border-t pt-2">
                   <div className="flex justify-between items-center">
                     <span className="font-medium">Total:</span>
                     <span className="font-bold text-lg">{(nftData.price + PAYMENT_CONFIG.NETWORK_FEE_ESTIMATE).toFixed(4)} ETH</span>
                   </div>
                 </div>
              </div>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Payment will be sent directly to admin wallet via MetaMask. 
                  After successful payment, you'll receive a download link.
                </AlertDescription>
              </Alert>

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                disabled={!isConnected || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Pay {nftData.price} ETH via MetaMask
                  </div>
                )}
              </Button>

              {!isConnected && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your MetaMask wallet to proceed with payment
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-500">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your NFT image is ready for download
                  </p>
                </div>
              </div>

              {/* Download Button */}
              <Button 
                onClick={handleDownload}
                className="w-full bg-primary hover:bg-primary/80"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download NFT Image
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Transaction Hash: {nftData.imageHash.slice(0, 16)}...
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
