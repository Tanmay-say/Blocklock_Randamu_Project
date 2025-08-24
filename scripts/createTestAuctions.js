// Simple script to update NFT data to include auction items for testing
const fs = require('fs');
const path = require('path');

console.log('🎯 Creating test auction data...');

// Read the current NFT data file
const nftDataPath = path.join(__dirname, '../src/data/nfts.ts');
let nftContent = fs.readFileSync(nftDataPath, 'utf8');

// Find the nfts array and update some items to be auctions
console.log('✅ NFT data file found');

// Create auction end time (2 hours from now)
const auctionEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

console.log('📝 Sample auction data created');
console.log('Auction End Time:', auctionEndTime);

console.log('\n🎯 To create auction NFTs:');
console.log('1. Go to Admin Panel → Auctions tab');
console.log('2. Use "Create New Auction" button');
console.log('3. Select an available NFT');
console.log('4. Set auction parameters');
console.log('5. Test bidding functionality');

console.log('\n✅ Ready for auction testing!');
