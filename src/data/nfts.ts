import nft1 from '@/assets/nft-1.png';
import nft2 from '@/assets/nft-2.png';
import nft3 from '@/assets/nft-3.png';
import nft4 from '@/assets/nft-4.png';
import nft5 from '@/assets/nft-5.png';
import nft6 from '@/assets/nft-6.png';

export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number; // Base price in ETH
  tags: string[];
  creator: string;
  collection: string;
  mintDate: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  auctionEndTime?: string;
  currentBids?: number;
  status: 'available' | 'auction' | 'sold';
}

export const nfts: NFT[] = [
  {
    id: "1",
    name: "Cosmic Wanderer #001",
    description: "A mysterious traveler from the depths of space, carrying ancient knowledge and cosmic energy. This NFT represents the endless possibilities of the universe.",
    image: nft1,
    price: 0.005,
    tags: ["Space", "Cosmic", "Mystical", "Rare"],
    creator: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    collection: "Cosmic Collection",
    mintDate: "2024-01-15",
    attributes: [
      { trait_type: "Background", value: "Nebula" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Element", value: "Cosmic" },
      { trait_type: "Power Level", value: "95" }
    ],
    status: 'available',
    currentBids: 0
  },
  {
    id: "2",
    name: "Digital Dreamer",
    description: "A digital entity born from the collective consciousness of the internet. This NFT embodies the dreams and aspirations of the digital age.",
    image: nft2,
    price: 0.008,
    tags: ["Digital", "Abstract", "Modern", "Unique"],
    creator: "0x8ba1f109551bA432b026Bc5e5dA0823881e3f409",
    collection: "Digital Dreams",
    mintDate: "2024-01-20",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Theme", value: "Digital" },
      { trait_type: "Complexity", value: "High" }
    ],
    status: 'auction',
    auctionEndTime: "2024-02-15T23:59:59Z",
    currentBids: 3
  },
  {
    id: "3",
    name: "Neon Nights",
    description: "A cyberpunk masterpiece capturing the essence of futuristic city life. Glowing neon lights and urban aesthetics define this stunning piece.",
    image: nft3,
    price: 0.006,
    tags: ["Cyberpunk", "Neon", "Urban", "Futuristic"],
    creator: "0x1234567890123456789012345678901234567890",
    collection: "Cyberpunk Chronicles",
    mintDate: "2024-01-25",
    attributes: [
      { trait_type: "Environment", value: "Urban" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Mood", value: "Dark" },
      { trait_type: "Technology", value: "Advanced" }
    ],
    status: 'available',
    currentBids: 0
  },
  {
    id: "4",
    name: "Nature's Harmony",
    description: "A peaceful representation of nature's perfect balance. This NFT showcases the beauty of natural landscapes and environmental harmony.",
    image: nft4,
    price: 0.007,
    tags: ["Nature", "Peaceful", "Landscape", "Organic"],
    creator: "0x9876543210987654321098765432109876543210",
    collection: "Natural Wonders",
    mintDate: "2024-01-30",
    attributes: [
      { trait_type: "Biome", value: "Forest" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Season", value: "Spring" },
      { trait_type: "Atmosphere", value: "Serene" }
    ],
    status: 'available',
    currentBids: 0
  },
  {
    id: "5",
    name: "Quantum Mechanics",
    description: "An abstract representation of quantum physics principles. This NFT visualizes the complex and beautiful world of subatomic particles.",
    image: nft5,
    price: 0.009,
    tags: ["Science", "Quantum", "Abstract", "Educational"],
    creator: "0x5555555555555555555555555555555555555555",
    collection: "Scientific Art",
    mintDate: "2024-02-05",
    attributes: [
      { trait_type: "Field", value: "Physics" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Complexity", value: "Extreme" },
      { trait_type: "Educational Value", value: "High" }
    ],
    status: 'auction',
    auctionEndTime: "2024-02-20T23:59:59Z",
    currentBids: 5
  },
  {
    id: "6",
    name: "Retro Gaming",
    description: "A nostalgic journey back to the golden age of video games. This NFT captures the pixelated charm and retro aesthetics of classic gaming.",
    image: nft6,
    price: 0.004,
    tags: ["Gaming", "Retro", "Pixel Art", "Nostalgic"],
    creator: "0x6666666666666666666666666666666666666666",
    collection: "Gaming Legends",
    mintDate: "2024-02-10",
    attributes: [
      { trait_type: "Era", value: "80s" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Style", value: "Pixel Art" },
      { trait_type: "Genre", value: "Arcade" }
    ],
    status: 'available',
    currentBids: 0
  }
];

export const getNFTById = (id: string): NFT | undefined => {
  return nfts.find(nft => nft.id === id);
};

export const getNFTsByStatus = (status: NFT['status']): NFT[] => {
  return nfts.filter(nft => nft.status === status);
};

export const getNFTsByCollection = (collection: string): NFT[] => {
  return nfts.filter(nft => nft.collection === collection);
};

export const getNFTsByTag = (tag: string): NFT[] => {
  return nfts.filter(nft => nft.tags.includes(tag));
};
