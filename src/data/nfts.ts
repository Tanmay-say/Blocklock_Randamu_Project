

// NFT data with metaverse/neon digital art theme
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
  owner?: string; // Current owner address (for sold NFTs)
  bids?: Bid[]; // Array of bids for auction NFTs
  highestBid?: Bid; // Current highest bid
  winner?: string; // Winner address when auction ends
  downloadable?: boolean; // Whether this NFT can be downloaded
  downloadPrice?: number; // Price for download in ETH
}

export interface Bid {
  id: string;
  nftId: string;
  bidder: string; // Wallet address
  amount: number; // Bid amount in ETH
  timestamp: string;
  transactionHash?: string;
}

// Updated NFT data with 20 high-quality, visible Pexels images
export const nfts: NFT[] = [
  {
    id: "1",
    name: "Colorful Abstract NFT",
    description: "A vibrant and colorful abstract digital artwork with flowing shapes and dynamic color combinations",
    image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
    price: 0.004,
    tags: ["abstract", "colorful", "digital-art", "vibrant"],
    creator: "0x742d8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6",
    collection: "Abstract Dreams",
    mintDate: "2024-01-15",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Theme", value: "Colorful" },
      { trait_type: "Mood", value: "Dynamic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "2",
    name: "Cyberpunk Skull",
    description: "A futuristic cyberpunk skull design with neon accents and digital enhancements",
    image: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg",
    price: 0.003,
    tags: ["cyberpunk", "skull", "neon", "futuristic"],
    creator: "0x8ba1d497d497d497d497d497d497d497d497d497",
    collection: "Cyberpunk Collection",
    mintDate: "2024-01-14",
    attributes: [
      { trait_type: "Style", value: "Cyberpunk" },
      { trait_type: "Theme", value: "Skull" },
      { trait_type: "Aesthetic", value: "Neon" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "3",
    name: "Digital Neon Portrait",
    description: "A stunning digital portrait with neon lighting effects and modern artistic style",
    image: "https://images.pexels.com/photos/1704120/pexels-photo-1704120.jpeg",
    price: 0.004,
    tags: ["portrait", "neon", "digital-art", "modern"],
    creator: "0x1234567890123456789012345678901234567890",
    collection: "Digital Portraits",
    mintDate: "2024-01-13",
    attributes: [
      { trait_type: "Style", value: "Portrait" },
      { trait_type: "Theme", value: "Neon" },
      { trait_type: "Art", value: "Digital" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "4",
    name: "Crypto Art Pattern",
    description: "An intricate crypto-themed digital pattern with geometric shapes and blockchain aesthetics",
    image: "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg",
    price: 0.003,
    tags: ["crypto", "pattern", "geometric", "blockchain"],
    creator: "0x9876543210987654321098765432109876543210",
    collection: "Crypto Patterns",
    mintDate: "2024-01-12",
    attributes: [
      { trait_type: "Style", value: "Pattern" },
      { trait_type: "Theme", value: "Crypto" },
      { trait_type: "Design", value: "Geometric" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "5",
    name: "Pixel Glitch Art",
    description: "A retro pixel art piece with glitch effects and digital distortion aesthetics",
    image: "https://images.pexels.com/photos/1476321/pexels-photo-1476321.jpeg",
    price: 0.004,
    tags: ["pixel-art", "glitch", "retro", "digital"],
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    collection: "Pixel Dreams",
    mintDate: "2024-01-11",
    attributes: [
      { trait_type: "Style", value: "Pixel Art" },
      { trait_type: "Theme", value: "Glitch" },
      { trait_type: "Era", value: "Retro" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    currentBids: 3,
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "6",
    name: "Surreal Galaxy NFT",
    description: "A mesmerizing surreal galaxy artwork with cosmic elements and dreamlike atmosphere",
    image: "https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg",
    price: 0.003,
    tags: ["galaxy", "surreal", "cosmic", "dreamlike"],
    creator: "0x9876543210987654321098765432109876543210",
    collection: "Cosmic Dreams",
    mintDate: "2024-01-10",
    attributes: [
      { trait_type: "Style", value: "Surreal" },
      { trait_type: "Theme", value: "Galaxy" },
      { trait_type: "Atmosphere", value: "Cosmic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    currentBids: 1,
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "7",
    name: "Trippy Color Waves",
    description: "A psychedelic artwork featuring flowing color waves and trippy visual effects",
    image: "https://images.pexels.com/photos/169573/pexels-photo-169573.jpeg",
    price: 0.004,
    tags: ["psychedelic", "color-waves", "trippy", "flowing"],
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    collection: "Psychedelic Art",
    mintDate: "2024-01-09",
    attributes: [
      { trait_type: "Style", value: "Psychedelic" },
      { trait_type: "Theme", value: "Color Waves" },
      { trait_type: "Effect", value: "Trippy" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "8",
    name: "Abstract Human Face",
    description: "An abstract interpretation of a human face with artistic distortion and creative expression",
    image: "https://images.pexels.com/photos/615369/pexels-photo-615369.jpeg",
    price: 0.003,
    tags: ["abstract", "human-face", "artistic", "expression"],
    creator: "0x742d8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6",
    collection: "Abstract Faces",
    mintDate: "2024-01-08",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Theme", value: "Human Face" },
      { trait_type: "Expression", value: "Artistic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (ENDED)
    currentBids: 5,
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "9",
    name: "AI Generated Art",
    description: "A unique AI-generated artwork showcasing the intersection of technology and creativity",
    image: "https://images.pexels.com/photos/3601099/pexels-photo-3601099.jpeg",
    price: 0.004,
    tags: ["ai-generated", "technology", "creative", "unique"],
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    collection: "AI Art Collection",
    mintDate: "2024-01-07",
    attributes: [
      { trait_type: "Style", value: "AI Generated" },
      { trait_type: "Theme", value: "Technology" },
      { trait_type: "Creativity", value: "Unique" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "10",
    name: "Psychedelic Mask",
    description: "A vibrant psychedelic mask design with bold colors and intricate patterns",
    image: "https://images.pexels.com/photos/1557183/pexels-photo-1557183.jpeg",
    price: 0.003,
    tags: ["psychedelic", "mask", "vibrant", "intricate"],
    creator: "0x742d8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6",
    collection: "Psychedelic Masks",
    mintDate: "2024-01-06",
    attributes: [
      { trait_type: "Style", value: "Psychedelic" },
      { trait_type: "Theme", value: "Mask" },
      { trait_type: "Pattern", value: "Intricate" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now (ENDING SOON)
    currentBids: 7,
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "11",
    name: "Crypto Punk Style",
    description: "A modern crypto punk aesthetic with edgy design and rebellious attitude",
    image: "https://images.pexels.com/photos/3945682/pexels-photo-3945682.jpeg",
    price: 0.004,
    tags: ["crypto-punk", "edgy", "rebellious", "modern"],
    creator: "0x742d8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6",
    collection: "Crypto Punk Collection",
    mintDate: "2024-01-05",
    attributes: [
      { trait_type: "Style", value: "Crypto Punk" },
      { trait_type: "Theme", value: "Edgy" },
      { trait_type: "Attitude", value: "Rebellious" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "12",
    name: "Neon Vaporwave",
    description: "A stunning neon vaporwave aesthetic with retro-futuristic vibes and cyber aesthetics",
    image: "https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg",
    price: 0.003,
    tags: ["vaporwave", "neon", "retro-futuristic", "cyber"],
    creator: "0x8ba1d497d497d497d497d497d497d497d497d497",
    collection: "Vaporwave Collection",
    mintDate: "2024-01-04",
    attributes: [
      { trait_type: "Style", value: "Vaporwave" },
      { trait_type: "Theme", value: "Neon" },
      { trait_type: "Vibe", value: "Retro-futuristic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "13",
    name: "Fantasy Digital Creature",
    description: "A mystical fantasy creature brought to life through digital artistry and imagination",
    image: "https://images.pexels.com/photos/270640/pexels-photo-270640.jpeg",
    price: 0.004,
    tags: ["fantasy", "creature", "mystical", "digital-art"],
    creator: "0x1234567890123456789012345678901234567890",
    collection: "Fantasy Creatures",
    mintDate: "2024-01-03",
    attributes: [
      { trait_type: "Style", value: "Fantasy" },
      { trait_type: "Theme", value: "Creature" },
      { trait_type: "Atmosphere", value: "Mystical" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    currentBids: 1,
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "14",
    name: "Robot NFT Character",
    description: "A futuristic robot character with advanced AI features and metallic aesthetics",
    image: "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg",
    price: 0.003,
    tags: ["robot", "ai", "futuristic", "metallic"],
    creator: "0x9876543210987654321098765432109876543210",
    collection: "Robot Characters",
    mintDate: "2024-01-02",
    attributes: [
      { trait_type: "Style", value: "Robot" },
      { trait_type: "Theme", value: "AI" },
      { trait_type: "Technology", value: "Futuristic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "15",
    name: "Digital Painting",
    description: "A beautiful digital painting showcasing traditional art techniques in modern digital format",
    image: "https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg",
    price: 0.004,
    tags: ["digital-painting", "traditional", "artistic", "modern"],
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    collection: "Digital Paintings",
    mintDate: "2024-01-01",
    attributes: [
      { trait_type: "Style", value: "Digital Painting" },
      { trait_type: "Theme", value: "Traditional" },
      { trait_type: "Technique", value: "Artistic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    currentBids: 2,
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "16",
    name: "Color Explosion",
    description: "A dynamic color explosion artwork with vibrant hues and energetic composition",
    image: "https://images.pexels.com/photos/370799/pexels-photo-370799.jpeg",
    price: 0.003,
    tags: ["color-explosion", "vibrant", "energetic", "dynamic"],
    creator: "0x742d8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6c8b6",
    collection: "Color Explosions",
    mintDate: "2023-12-31",
    attributes: [
      { trait_type: "Style", value: "Color Explosion" },
      { trait_type: "Theme", value: "Vibrant" },
      { trait_type: "Energy", value: "Dynamic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "17",
    name: "Futuristic AI Face",
    description: "A cutting-edge AI-generated face with futuristic features and technological aesthetics",
    image: "https://images.pexels.com/photos/1319790/pexels-photo-1319790.jpeg",
    price: 0.004,
    tags: ["ai-face", "futuristic", "technological", "cutting-edge"],
    creator: "0x8ba1d497d497d497d497d497d497d497d497d497",
    collection: "AI Faces",
    mintDate: "2023-12-30",
    attributes: [
      { trait_type: "Style", value: "AI Face" },
      { trait_type: "Theme", value: "Futuristic" },
      { trait_type: "Technology", value: "Cutting-edge" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (ENDED)
    currentBids: 3,
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "18",
    name: "Metaverse Vibes",
    description: "A digital artwork capturing the essence of the metaverse with virtual reality aesthetics",
    image: "https://images.pexels.com/photos/443446/pexels-photo-443446.jpeg",
    price: 0.003,
    tags: ["metaverse", "virtual-reality", "digital", "immersive"],
    creator: "0x1234567890123456789012345678901234567890",
    collection: "Metaverse Collection",
    mintDate: "2023-12-29",
    attributes: [
      { trait_type: "Style", value: "Metaverse" },
      { trait_type: "Theme", value: "Virtual Reality" },
      { trait_type: "Experience", value: "Immersive" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  },
  {
    id: "19",
    name: "Digital Skull Artwork",
    description: "A striking digital skull artwork with artistic interpretation and creative design",
    image: "https://images.pexels.com/photos/21264/pexels-photo.jpg",
    price: 0.004,
    tags: ["skull", "digital-art", "artistic", "creative"],
    creator: "0x9876543210987654321098765432109876543210",
    collection: "Skull Art",
    mintDate: "2023-12-28",
    attributes: [
      { trait_type: "Style", value: "Skull Art" },
      { trait_type: "Theme", value: "Digital" },
      { trait_type: "Approach", value: "Artistic" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'auction',
    auctionEndTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    currentBids: 2,
    downloadable: true,
    downloadPrice: 0.002
  },
  {
    id: "20",
    name: "Glitch Aesthetic",
    description: "A modern glitch aesthetic artwork with digital distortion and contemporary appeal",
    image: "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg",
    price: 0.003,
    tags: ["glitch", "aesthetic", "digital-distortion", "contemporary"],
    creator: "0xabcdef1234567890abcdef1234567890abcdef12",
    collection: "Glitch Aesthetics",
    mintDate: "2023-12-27",
    attributes: [
      { trait_type: "Style", value: "Glitch" },
      { trait_type: "Theme", value: "Aesthetic" },
      { trait_type: "Effect", value: "Digital Distortion" },
      { trait_type: "Rarity", value: "Common" }
    ],
    status: 'available',
    downloadable: true,
    downloadPrice: 0.001
  }
];

// Helper functions
export const getDownloadableNFTs = () => nfts.filter(nft => nft.downloadable);
export const getNFTsByDownloadPrice = (maxPrice: number) => nfts.filter(nft => nft.downloadPrice && nft.downloadPrice <= maxPrice);
export const getAuctionNFTs = () => nfts.filter(nft => nft.status === 'auction');
export const getAvailableNFTs = () => nfts.filter(nft => nft.status === 'available');
export const getSoldNFTs = () => nfts.filter(nft => nft.status === 'sold');
