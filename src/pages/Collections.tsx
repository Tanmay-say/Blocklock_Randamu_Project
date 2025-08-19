import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NFTCard } from "@/components/NFTCard";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import nft1 from "@/assets/nft-1.png";
import nft2 from "@/assets/nft-2.png";
import nft3 from "@/assets/nft-3.png";
import nft4 from "@/assets/nft-4.png";
import nft5 from "@/assets/nft-5.png";
import nft6 from "@/assets/nft-6.png";

const allNFTs = [
  { image: nft1, title: "NovatPixel", price: "32.97", likes: 120, category: "Abstract" },
  { image: nft2, title: "Astrobenz", price: "50.20", likes: 95, category: "Character" },
  { image: nft3, title: "Crazebot", price: "39.20", likes: 78, category: "Robot" },
  { image: nft4, title: "Galaxor", price: "32.20", likes: 156, category: "Landscape" },
  { image: nft5, title: "Astrocute", price: "39.20", likes: 203, category: "Character" },
  { image: nft6, title: "Cosmera", price: "39.20", likes: 89, category: "Abstract" },
  { image: nft1, title: "QuantumVoid", price: "45.50", likes: 134, category: "Abstract" },
  { image: nft2, title: "CyberPunk", price: "28.80", likes: 76, category: "Character" },
  { image: nft3, title: "MechWarrior", price: "55.00", likes: 198, category: "Robot" },
  { image: nft4, title: "NebulaScape", price: "42.30", likes: 167, category: "Landscape" },
  { image: nft5, title: "CosmicCute", price: "35.90", likes: 145, category: "Character" },
  { image: nft6, title: "PrismShard", price: "38.70", likes: 112, category: "Abstract" },
];

const categories = ["All", "Abstract", "Character", "Robot", "Landscape"];

const Collections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              NFT <span className="text-primary">Collections</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our curated collections of unique digital art pieces. 
              Discover, collect, and trade extraordinary NFTs from talented artists worldwide.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                placeholder="Search NFTs, collections, or artists..."
                className="pl-10 bg-muted border-border text-white placeholder:text-muted-foreground"
              />
            </div>
            
            <Button variant="outline" className="border-border text-white hover:bg-muted">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-4 mb-12">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className={index === 0 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "border-border text-white hover:bg-muted"
                }
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="bg-gradient-card p-6 rounded-2xl shadow-nft text-center">
              <div className="text-3xl font-bold text-primary mb-2">2.5K+</div>
              <div className="text-muted-foreground">Total Items</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-2xl shadow-nft text-center">
              <div className="text-3xl font-bold text-primary mb-2">1.2K+</div>
              <div className="text-muted-foreground">Owners</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-2xl shadow-nft text-center">
              <div className="text-3xl font-bold text-primary mb-2">45.8</div>
              <div className="text-muted-foreground">Floor Price</div>
            </div>
            <div className="bg-gradient-card p-6 rounded-2xl shadow-nft text-center">
              <div className="text-3xl font-bold text-primary mb-2">890K</div>
              <div className="text-muted-foreground">Volume Traded</div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {allNFTs.map((nft, index) => (
              <NFTCard
                key={index}
                image={nft.image}
                title={nft.title}
                price={nft.price}
                likes={nft.likes}
                isLiked={Math.random() > 0.7}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
              Load More Collections
            </Button>
          </div>

          {/* Featured Collections */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Featured <span className="text-primary">Collections</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <div className="w-full h-48 bg-gradient-hero opacity-20 rounded-xl mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Cosmic Creatures</h3>
                <p className="text-muted-foreground mb-4">A collection of adorable alien beings from distant galaxies.</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-semibold">Floor: 2.5 ETH</span>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Collection
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <div className="w-full h-48 bg-gradient-hero opacity-20 rounded-xl mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Cyber Landscapes</h3>
                <p className="text-muted-foreground mb-4">Futuristic digital environments and abstract worlds.</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-semibold">Floor: 1.8 ETH</span>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Collection
                  </Button>
                </div>
              </div>
              
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <div className="w-full h-48 bg-gradient-hero opacity-20 rounded-xl mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Robo Friends</h3>
                <p className="text-muted-foreground mb-4">Mechanical companions from the digital frontier.</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-semibold">Floor: 3.2 ETH</span>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    View Collection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Collections;