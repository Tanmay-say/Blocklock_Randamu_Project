import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, Copy } from 'lucide-react';
import { LOCAL_CONTRACT_ADDRESSES } from '@/lib/contracts';
import { toast } from "@/hooks/use-toast";

export const MetaMaskNFTGuide: React.FC = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <Card className="bg-gradient-card border border-nft-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          How to See Your NFTs in MetaMask
        </CardTitle>
        <CardDescription>
          Follow these steps to view your purchased NFTs in MetaMask wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-400">
            <strong>Note:</strong> Currently, NFT ownership is tracked in our marketplace system. 
            For NFTs to appear directly in MetaMask, they need to be minted as ERC-721 tokens.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="text-white font-medium">To manually add our NFT contract:</h4>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">1. Open MetaMask and go to NFTs tab</p>
            <p className="text-sm text-muted-foreground">2. Click "Import NFT" or "Add NFT"</p>
            <p className="text-sm text-muted-foreground">3. Enter the contract address:</p>
            
            <div className="flex items-center gap-2 p-2 bg-background/30 rounded border">
              <code className="text-xs text-white font-mono flex-1">
                {LOCAL_CONTRACT_ADDRESSES.testNFT}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(LOCAL_CONTRACT_ADDRESSES.testNFT, "Contract address")}
                className="border-nft-border hover:bg-background/50"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">4. Token ID: (This would be provided after minting)</p>
            <p className="text-sm text-muted-foreground">5. Click "Add" to import the NFT</p>
          </div>
        </div>

        <div className="pt-4 border-t border-nft-border">
          <h4 className="text-white font-medium mb-2">Current System:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Your NFT purchases are tracked in your Profile</li>
            <li>• Payment goes directly to marketplace admin</li>
            <li>• Digital ownership is recorded on-chain via transactions</li>
            <li>• View your collection in the Profile section</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://sepolia.basescan.org/address/' + LOCAL_CONTRACT_ADDRESSES.testNFT, '_blank')}
            className="border-nft-border text-muted-foreground hover:bg-background/50"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Contract on BaseScan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
