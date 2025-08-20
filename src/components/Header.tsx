import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Wallet, Settings, Bot, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const location = useLocation();
  const { account, isConnected, isAdmin, connectWallet, disconnectWallet } = useWallet();
  const { isAdminAuthenticated } = useAdmin();
  
  const isActive = (path: string) => location.pathname === path;
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <header className="w-full px-6 py-6 flex items-center justify-between">
      <Link to="/">
        <Logo />
      </Link>
      
              <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`transition-colors text-lg ${isActive('/') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Home
          </Link>
          <Link 
            to="/nfts" 
            className={`transition-colors text-lg ${isActive('/nfts') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            NFTs
          </Link>
          <Link 
            to="/features" 
            className={`transition-colors text-lg ${isActive('/features') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Features
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors text-lg ${isActive('/about') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors text-lg ${isActive('/contact') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Contact
          </Link>
          
          {/* GenAI Option for all users */}
          <Link 
            to="/genai" 
            className={`transition-colors flex items-center gap-2 text-lg ${isActive('/genai') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            <Bot className="w-5 h-5" />
            GenAI
          </Link>
          
          {/* Profile - only visible to connected users */}
          {isConnected && (
            <Link 
              to="/profile" 
              className={`transition-colors flex items-center gap-2 text-lg ${isActive('/profile') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
          )}
          
          {/* Admin Panel - only visible to authenticated admins */}
          {isAdminAuthenticated && (
            <Link 
              to="/admin" 
              className={`transition-colors flex items-center gap-2 text-lg ${isActive('/admin') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
            >
              <Settings className="w-5 h-5" />
              Admin
            </Link>
          )}
        </nav>
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Wallet className="w-4 h-4 mr-2" />
                {formatAddress(account!)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">
                <Wallet className="w-4 h-4 mr-2" />
                {account}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isAdminAuthenticated && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={connectWallet}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
};