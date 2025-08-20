import React from 'react';
import { Button } from "@/components/ui/button";
import { NFTCard } from './NFTCard';
import { nfts } from '@/data/nfts';

export const CollectionsSection: React.FC = () => {
  // Get featured NFTs (first 6 for the collections section)
  const featuredNFTs = nfts.slice(0, 6);

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
          {featuredNFTs.map((nft) => (
            <NFTCard
              key={nft.id}
              nft={nft}
              showBidButton={false}
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