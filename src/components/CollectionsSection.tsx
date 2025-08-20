import React from 'react';
import { Button } from "@/components/ui/button";
import { NFTCard } from './NFTCard';
import { useNFT } from '@/contexts/NFTContext';

export const CollectionsSection: React.FC = () => {
  const { nfts } = useNFT();
  
  // Prioritize auction NFTs, then available, then others
  const featuredNFTs = React.useMemo(() => {
    const auctionNFTs = nfts.filter(nft => nft.status === 'auction');
    const availableNFTs = nfts.filter(nft => nft.status === 'available');
    const otherNFTs = nfts.filter(nft => nft.status !== 'auction' && nft.status !== 'available');
    
    // Combine and take first 6, prioritizing auctions
    return [...auctionNFTs, ...availableNFTs, ...otherNFTs].slice(0, 6);
  }, [nfts]);

  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Featured <span className="text-primary">Auctions</span> &<br />
            Super <span className="text-primary">Unique Art</span><br />
            Collections
          </h2>
          
          <div className="flex justify-center gap-4 mt-8">
            <Button variant="outline" className="border-primary text-primary bg-primary/10">
              Live Auctions
            </Button>
            <Button variant="outline" className="border-nft-cyan text-nft-cyan bg-nft-cyan/10">
              Featured Art
            </Button>
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {featuredNFTs.filter(nft => nft.status === 'auction').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Auctions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {featuredNFTs.filter(nft => nft.status === 'available').length}
            </div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {featuredNFTs.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {nfts.length}
            </div>
            <div className="text-sm text-muted-foreground">Total NFTs</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              showBidButton={true}
            />
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/nfts'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
          >
            View All NFTs
          </Button>
        </div>
      </div>
    </section>
  );
};