import { Button } from "@/components/ui/button";
import { NFTCard } from "./NFTCard";
import nft1 from "@/assets/nft-1.png";
import nft2 from "@/assets/nft-2.png";
import nft3 from "@/assets/nft-3.png";
import nft4 from "@/assets/nft-4.png";
import nft5 from "@/assets/nft-5.png";
import nft6 from "@/assets/nft-6.png";

const nftData = [
  { image: nft1, title: "NovatPixel", price: "32.97", likes: 120 },
  { image: nft2, title: "Astrobenz", price: "50.20", likes: 95 },
  { image: nft3, title: "Crazebot", price: "39.20", likes: 78 },
  { image: nft4, title: "Galaxor", price: "32.20", likes: 156 },
  { image: nft5, title: "Astrocute", price: "39.20", likes: 203 },
  { image: nft6, title: "Cosmera", price: "39.20", likes: 89 },
];

export const CollectionsSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Amazing and<br />
            Super Unique Art<br />
            Collections
          </h2>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" className="border-primary text-primary bg-primary/10">
              Community NFT
            </Button>
            <Button variant="outline" className="border-nft-cyan text-nft-cyan bg-nft-cyan/10">
              Art Play NFT
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {nftData.map((nft, index) => (
            <NFTCard
              key={index}
              image={nft.image}
              title={nft.title}
              price={nft.price}
              likes={nft.likes}
              isLiked={index === 1 || index === 4}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
            Load more
          </Button>
        </div>
      </div>
    </section>
  );
};