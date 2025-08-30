import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface CasinoStatusProps {
  isConnected: boolean;
  currentNetwork: string;
  wrongNetwork: boolean;
  contractInitialized: boolean;
  userBalance: string;
  contractAddress: string;
}

export const CasinoStatus: React.FC<CasinoStatusProps> = ({
  isConnected,
  currentNetwork,
  wrongNetwork,
  contractInitialized,
  userBalance,
  contractAddress
}) => {
  const requiredNetwork = "Base Sepolia";
  const requiredChainId = "84532";
  const faucetUrl = "https://www.alchemy.com/faucets/base-sepolia";
  const baseScanUrl = `https://sepolia.basescan.org/address/${contractAddress}`;

  const addBaseSepoliaNetwork = async () => {
    try {
      // First try to switch to Base Sepolia if it already exists
      try {
        await window.ethereum?.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // 84532 in hex
        });
        window.location.reload(); // Reload page after network switch
        return;
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum?.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14a34', // 84532 in hex
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
          window.location.reload(); // Reload page after adding network
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to add/switch to Base Sepolia network:', error);
    }
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🔧 Casino Status & Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Connection */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white">Wallet Connected</span>
          </div>
          <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {!wrongNetwork && isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : isConnected ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-white">Network</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${!wrongNetwork && isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {isConnected ? currentNetwork || 'Unknown' : 'Not Connected'}
            </span>
            {wrongNetwork && (
              <Button
                onClick={addBaseSepoliaNetwork}
                size="sm"
                variant="outline"
                className="ml-2"
              >
                Switch to Base Sepolia
              </Button>
            )}
          </div>
        </div>

        {/* Contract Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {contractInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white">Contract Connection</span>
          </div>
          <span className={`text-sm ${contractInitialized ? 'text-green-400' : 'text-red-400'}`}>
            {contractInitialized ? 'Connected' : 'Failed'}
          </span>
        </div>

        {/* Balance Status */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {parseFloat(userBalance) >= 0.005 ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : parseFloat(userBalance) > 0 ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white">Balance (need 0.005+ ETH)</span>
          </div>
          <span className={`text-sm ${parseFloat(userBalance) >= 0.005 ? 'text-green-400' : 'text-yellow-400'}`}>
            {userBalance} ETH
          </span>
        </div>

        {/* Setup Instructions */}
        {(!isConnected || wrongNetwork || !contractInitialized || parseFloat(userBalance) < 0.005) && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
            <h4 className="text-white font-bold mb-3">📋 Setup Instructions:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {!isConnected && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">1</span>
                  <span>Connect your MetaMask wallet</span>
                </div>
              )}
              {isConnected && wrongNetwork && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-yellow-500 rounded-full text-xs flex items-center justify-center text-white">2</span>
                  <span>Switch to Base Sepolia testnet (Chain ID: {requiredChainId})</span>
                </div>
              )}
              {isConnected && !wrongNetwork && parseFloat(userBalance) < 0.005 && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white">3</span>
                  <span>Get Base Sepolia ETH from faucet (minimum 0.005 ETH needed)</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => window.open(faucetUrl, '_blank')}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Get Test ETH
              </Button>
              <Button
                onClick={() => window.open(baseScanUrl, '_blank')}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Contract
              </Button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {isConnected && !wrongNetwork && contractInitialized && parseFloat(userBalance) >= 0.005 && (
          <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">🎉 All systems ready! You can now play the casino!</span>
            </div>
          </div>
        )}

        {/* Contract Info */}
        <div className="mt-4 text-xs text-gray-400">
          <p>Contract: {contractAddress}</p>
          <p>Network: Base Sepolia (Chain ID: {requiredChainId})</p>
          <p>Stake Amount: 0.005 ETH | Win Chance: 10% | Max Players: 10</p>
        </div>
      </CardContent>
    </Card>
  );
};
