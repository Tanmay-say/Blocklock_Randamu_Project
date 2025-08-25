import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NFTCard } from '@/components/NFTCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNFT } from '@/contexts/NFTContext';
import { useWallet } from '@/contexts/WalletContext';
import { Search, Filter, Grid3X3, List } from 'lucide-react';

export const NFTs: React.FC = () => {
  const { nfts, getNFTsByStatus, getNFTsByCollection, getNFTsByTag } = useNFT();
  const { account } = useWallet();
  
  // Debug logging for NFT visibility
  React.useEffect(() => {
    console.log('🏪 MARKETPLACE: Total NFTs in context:', nfts.length);
    console.log('🔍 MARKETPLACE: All NFTs:', nfts.map(nft => ({
      id: nft.id,
      name: nft.name,
      status: nft.status,
      collection: nft.collection,
      owner: nft.owner
    })));
    console.log('👤 MARKETPLACE: Current user account:', account);
  }, [nfts, account]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter NFTs for marketplace display (hide sold NFTs unless owned by user)
  const marketplaceNFTs = useMemo(() => {
    const filtered = nfts.filter(nft => {
      // Show all available and auction NFTs
      if (nft.status === 'available' || nft.status === 'auction') {
        return true;
      }
      
      // For sold NFTs, only show to the owner
      if (nft.status === 'sold' && account) {
        return nft.owner?.toLowerCase() === account.toLowerCase();
      }
      
      // Hide all other sold NFTs
      return false;
    });
    
    console.log('🎯 MARKETPLACE: Filtered NFTs for display:', filtered.length);
    console.log('📊 MARKETPLACE: Available NFTs:', filtered.filter(nft => nft.status === 'available').length);
    console.log('🔨 MARKETPLACE: Auction NFTs:', filtered.filter(nft => nft.status === 'auction').length);
    console.log('💰 MARKETPLACE: User owned NFTs:', filtered.filter(nft => nft.status === 'sold').length);
    
    return filtered;
  }, [nfts, account]);

  // Get unique collections and tags for filters (from marketplace NFTs)
  const collections = useMemo(() => {
    const uniqueCollections = [...new Set(marketplaceNFTs.map(nft => nft.collection))];
    return uniqueCollections;
  }, [marketplaceNFTs]);

  const tags = useMemo(() => {
    const allTags = marketplaceNFTs.flatMap(nft => nft.tags);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags;
  }, [marketplaceNFTs]);

  // Filter NFTs based on search and filters
  const filteredNFTs = useMemo(() => {
    let filtered = marketplaceNFTs;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(nft => nft.status === statusFilter);
    }

    // Collection filter
    if (collectionFilter !== 'all') {
      filtered = filtered.filter(nft => nft.collection === collectionFilter);
    }

    // Tag filter
    if (tagFilter !== 'all') {
      filtered = filtered.filter(nft => nft.tags.includes(tagFilter));
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(nft =>
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [marketplaceNFTs, searchTerm, statusFilter, collectionFilter, tagFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCollectionFilter('all');
    setTagFilter('all');
  };

  const getStatusCount = (status: string) => {
    return marketplaceNFTs.filter(nft => nft.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            NFT <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover, collect, and bid on unique digital assets. Explore our curated collection of NFTs from talented artists and creators.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Filters and Search */}
          <div className="bg-gradient-card rounded-2xl p-6 mb-8 shadow-nft border border-nft-border">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search NFTs, collections, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-nft-border text-white placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background/50'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-primary hover:bg-primary/90' : 'border-nft-border text-muted-foreground hover:bg-background/50'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-background/50 border-nft-border text-white">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-nft-border">
                    <SelectItem value="all" className="text-white hover:bg-background/50">All Statuses</SelectItem>
                    <SelectItem value="available" className="text-white hover:bg-background/50">Available ({getStatusCount('available')})</SelectItem>
                    <SelectItem value="auction" className="text-white hover:bg-background/50">Auction ({getStatusCount('auction')})</SelectItem>
                    <SelectItem value="sold" className="text-white hover:bg-background/50">Sold ({getStatusCount('sold')})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Collection Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Collection</label>
                <Select value={collectionFilter} onValueChange={setCollectionFilter}>
                  <SelectTrigger className="bg-background/50 border-nft-border text-white">
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-nft-border">
                    <SelectItem value="all" className="text-white hover:bg-background/50">All Collections</SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection} value={collection} className="text-white hover:bg-background/50">
                        {collection}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tag</label>
                <Select value={tagFilter} onValueChange={setTagFilter}>
                  <SelectTrigger className="bg-background/50 border-nft-border text-white">
                    <SelectValue placeholder="All Tags" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-nft-border">
                    <SelectItem value="all" className="text-white hover:bg-background/50">All Tags</SelectItem>
                    {tags.map((tag) => (
                      <SelectItem key={tag} value={tag} className="text-white hover:bg-background/50">
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full border-nft-border text-muted-foreground hover:bg-background/50"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-white font-medium">Quick Filters:</span>
            <Button
              variant={statusFilter === 'available' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('available')}
              className={statusFilter === 'available' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'border-green-600 text-green-400 hover:bg-green-600/10'
              }
            >
              Available ({marketplaceNFTs.filter(nft => nft.status === 'available').length})
            </Button>
            <Button
              variant={statusFilter === 'auction' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('auction')}
              className={statusFilter === 'auction' 
                ? 'bg-primary hover:bg-primary/90 text-white' 
                : 'border-primary text-primary hover:bg-primary/10'
              }
            >
              Auction ({marketplaceNFTs.filter(nft => nft.status === 'auction').length})
            </Button>
            <Button
              variant={statusFilter === 'sold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('sold')}
              className={statusFilter === 'sold' 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'border-red-600 text-red-400 hover:bg-red-600/10'
              }
            >
              Sold ({marketplaceNFTs.filter(nft => nft.status === 'sold').length})
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={statusFilter === 'all' 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'border-gray-600 text-gray-400 hover:bg-gray-600/10'
              }
            >
              All ({marketplaceNFTs.length})
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Showing {filteredNFTs.length} of {marketplaceNFTs.length} NFTs
              </span>
              {(statusFilter !== 'all' || collectionFilter !== 'all' || tagFilter !== 'all' || searchTerm) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filters:</span>
                  {statusFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30">{statusFilter}</Badge>
                  )}
                  {collectionFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30">{collectionFilter}</Badge>
                  )}
                  {tagFilter !== 'all' && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30">{tagFilter}</Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30">"{searchTerm}"</Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NFT Grid */}
          {filteredNFTs.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                : 'space-y-4'
            }>
              {filteredNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No NFTs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters, or refresh the marketplace.
              </p>
              <Button onClick={clearFilters} variant="outline" className="border-nft-border text-muted-foreground hover:bg-background/50">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};