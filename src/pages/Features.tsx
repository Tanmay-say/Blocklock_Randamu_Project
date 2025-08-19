import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Globe, Coins } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Lightning Fast Transactions",
    description: "Experience instant NFT trading with our optimized blockchain infrastructure. No more waiting for confirmations."
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Secure & Verified",
    description: "All NFTs are verified and secured with advanced encryption. Your digital assets are protected."
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Marketplace",
    description: "Connect with creators and collectors worldwide. Trade NFTs across different blockchains seamlessly."
  },
  {
    icon: <Coins className="w-8 h-8" />,
    title: "Low Fees",
    description: "Enjoy minimal trading fees and maximize your profits. We believe in fair pricing for all users."
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Powerful <span className="text-primary">Features</span><br />
              for Digital Artists
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the cutting-edge features that make our platform the best choice 
              for creating, buying, and selling NFTs in the digital art space.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-card p-8 rounded-2xl shadow-nft hover:shadow-glow transition-all duration-300">
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-white">
                Advanced Tools for<br />
                <span className="text-primary">Professional Creators</span>
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Smart Contract Integration</h4>
                    <p className="text-muted-foreground">Deploy custom smart contracts with royalty management and advanced licensing options.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Analytics Dashboard</h4>
                    <p className="text-muted-foreground">Track your NFT performance with detailed analytics and market insights.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-6 h-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Community Tools</h4>
                    <p className="text-muted-foreground">Build your audience with integrated social features and creator tools.</p>
                  </div>
                </div>
              </div>
              
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                Get Started Today
              </Button>
            </div>
            
            <div className="bg-gradient-hero opacity-20 rounded-3xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-primary" />
                </div>
                <p className="text-white/50 text-lg">Feature Preview</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Features;