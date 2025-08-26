import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { NFTProvider } from "@/contexts/NFTContext";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Collections from "./pages/Collections";
import Contact from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { GenAIEnhanced } from "./pages/GenAIEnhanced";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { NFTs } from "./pages/NFTs";
import { PlaceBid } from "./components/PlaceBid";
import { BuyNFT } from "./components/BuyNFT";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <BlockchainProvider>
        <AdminProvider>
          <NFTProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/contact" element={<Contact />} />
                            <Route path="/admin" element={<Admin />} />
            <Route path="/genai" element={<GenAIEnhanced />} />
            <Route path="/genai-enhanced" element={<GenAIEnhanced />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/nfts" element={<NFTs />} />
            <Route path="/place-bid/:id" element={<PlaceBid />} />
            <Route path="/buy/:id" element={<BuyNFT />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NFTProvider>
      </AdminProvider>
    </BlockchainProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
