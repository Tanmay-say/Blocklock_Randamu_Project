import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/contexts/WalletContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Shield, Wallet, AlertCircle, CheckCircle } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { connectWallet, isConnected, account } = useWallet();
  const { loginAsAdmin } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin credentials (in production, this should be stored securely)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (err) {
      setError('Failed to connect wallet');
    }
  };

  const handleFinalAuth = () => {
    if (isAuthenticated && isConnected) {
      loginAsAdmin();
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-gradient-card shadow-nft border border-nft-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <CardTitle className="text-2xl text-white">Admin Access</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Secure authentication required for administrative functions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isAuthenticated ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                1
              </div>
              <Label className="text-white">Admin Credentials</Label>
              {isAuthenticated && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            <form onSubmit={handleCredentialsLogin} className="space-y-3">
              <div>
                <Label htmlFor="username" className="text-muted-foreground">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="bg-background border-nft-border text-foreground"
                  disabled={isAuthenticated}
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-background border-nft-border text-foreground"
                  disabled={isAuthenticated}
                />
              </div>
              
              {!isAuthenticated && (
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading || !username || !password}
                >
                  {loading ? 'Verifying...' : 'Verify Credentials'}
                </Button>
              )}
            </form>
          </div>

          {/* Step 2: Wallet Connection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isConnected ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                2
              </div>
              <Label className="text-white">Connect Wallet</Label>
              {isConnected && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            {!isConnected ? (
              <Button 
                onClick={handleWalletConnect}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Connect MetaMask
              </Button>
            ) : (
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <p className="text-green-400 text-sm font-mono">
                  Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>
            )}
          </div>

          {/* Final Authentication */}
          {isAuthenticated && isConnected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-green-500 text-white">
                  3
                </div>
                <Label className="text-white">Access Admin Panel</Label>
              </div>
              
              <Button 
                onClick={handleFinalAuth}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Enter Admin Panel
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Demo Credentials */}
          <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-300 text-sm font-medium mb-2">Demo Credentials:</p>
            <p className="text-blue-300 text-xs">Username: admin</p>
            <p className="text-blue-300 text-xs">Password: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
