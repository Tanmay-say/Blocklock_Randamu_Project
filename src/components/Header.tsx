import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <Link to="/">
        <Logo />
      </Link>
      
      <nav className="hidden md:flex items-center gap-8">
        <Link 
          to="/features" 
          className={`transition-colors ${isActive('/features') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
        >
          Features
        </Link>
        <Link 
          to="/about" 
          className={`transition-colors ${isActive('/about') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
        >
          About
        </Link>
        <Link 
          to="/collections" 
          className={`transition-colors ${isActive('/collections') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
        >
          Collections
        </Link>
        <Link 
          to="/contact" 
          className={`transition-colors ${isActive('/contact') ? 'text-primary' : 'text-foreground hover:text-primary'}`}
        >
          Contact
        </Link>
      </nav>
      
      <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        Join With Us
      </Button>
    </header>
  );
};