import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface NFTCardProps {
  image: string;
  title: string;
  price: string;
  likes: number;
  isLiked?: boolean;
}

export const NFTCard = ({ image, title, price, likes, isLiked = false }: NFTCardProps) => {
  return (
    <div className="bg-gradient-card rounded-2xl p-4 shadow-nft hover:shadow-glow transition-all duration-300 group">
      <div className="relative mb-4">
        <img 
          src={image} 
          alt={title} 
          className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
        <button className="absolute top-3 right-3 p-2 bg-black/50 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
          <Heart 
            className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
          <span className="text-white text-sm font-semibold">{likes}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Current Bid</p>
            <p className="text-primary font-bold">{price} ETH</p>
          </div>
          
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};