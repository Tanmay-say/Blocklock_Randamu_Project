import React, { useState, useEffect, useRef } from 'react';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@/contexts/WalletContext';
import { 
  Bot, Sparkles, Image, Crown, Lock, Shield, 
  Zap, Timer, Coins, Star, AlertTriangle, CheckCircle, X, Wallet 
} from "lucide-react";
import { geminiService } from '@/services/geminiService';
import { genaiContractService } from '@/services/genaiContractService';

interface UserProfile {
  subscription: {
    subType: number;
    expiryTime: number;
    active: boolean;
  };
  dailyInfo: {
    used: number;
    limit: number;
    canGenerate: boolean;
  };
  pricing: {
    monthly: string;
    annual: string;
    mintPrice: string;
  };
}

interface GeneratedImage {
  imageUrl: string;
  imageHash: string;
  prompt: string;
  style: string;
  size: string;
  timestamp: number;
  uniquenessScore?: number;
  vrfSeed?: number;
}

export const GenAIEnhanced = () => {
  const { account, signer, isConnected } = useWallet();
  const { toast } = useToast();
  
  // State
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("digital-art");
  const [selectedSize, setSelectedSize] = useState("1024x1024");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [newImageIndex, setNewImageIndex] = useState<number | null>(null);
  const [customMintPrice, setCustomMintPrice] = useState<string>("");
  const [antiScreenshotOn, setAntiScreenshotOn] = useState(false);
  const generationFee = (import.meta.env.VITE_GENAI_GENERATION_FEE_ETH as string) || "0.0001";
 
  // Security refs
  const previewRef = useRef<HTMLDivElement>(null);

  // Local daily usage fallback (client-only) for free users or when contract call fails
  const localUsageKey = `genai_usage_${new Date().toISOString().substring(0,10)}`;
  const getLocalUsage = (): number => {
    try { return Number(localStorage.getItem(localUsageKey) || '0'); } catch { return 0; }
  };
  const incLocalUsage = () => {
    try { const v = getLocalUsage() + 1; localStorage.setItem(localUsageKey, String(v)); } catch {}
  };

  // Art styles with enhanced options
  const artStyles = [
    { id: "digital-art", name: "Digital Art", description: "Modern digital illustrations", premium: false },
    { id: "pixel-art", name: "Pixel Art", description: "Retro 8-bit style graphics", premium: false },
    { id: "watercolor", name: "Watercolor", description: "Soft, flowing watercolor paintings", premium: false },
    { id: "oil-painting", name: "Oil Painting", description: "Classical oil painting style", premium: true },
    { id: "anime", name: "Anime", description: "Japanese anime and manga style", premium: true },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic, high-tech aesthetic", premium: true },
    { id: "surreal", name: "Surreal", description: "Abstract surrealistic art", premium: true },
    { id: "photorealistic", name: "Photorealistic", description: "Ultra-realistic photography style", premium: true },
  ];

  const imageSizes = [
    { size: "512x512", premium: false },
    { size: "768x768", premium: false },
    { size: "1024x1024", premium: false },
    { size: "1024x1536", premium: true },
    { size: "1536x1024", premium: true },
    { size: "2048x2048", premium: true },
  ];

  // Initialize services and load user profile
  useEffect(() => {
    const initializeServices = async () => {
      if (isConnected && signer && account) {
        try {
          // Initialize contract service
          await genaiContractService.initialize(signer);
          
          // Set contract addresses
          genaiContractService.setAddresses({
            nft: "0x5ad80677f48a841E52426e59E1c1751aF9b8F72F",
            subscription: "0xDf7f52a035E7ECb25D17c90afbda13EbA64aAB7E", 
            storage: "0x65AC9024c5ED38c0EbFed17Eb0748c291ae50481"
          });
          
          // Initialize Gemini service (you'll need to add API key to .env)
          const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (geminiApiKey) {
            geminiService.initialize(geminiApiKey);
          }
          
          // Load user profile
          await loadUserProfile();
          
        } catch (error) {
          console.error('Failed to initialize services:', error);
          toast({
            title: "Initialization Error",
            description: "Failed to initialize GenAI services",
            variant: "destructive"
          });
        }
      }
    };

    initializeServices();
  }, [isConnected, signer, account]);

  // Load user profile
  const loadUserProfile = async () => {
    if (!account || !genaiContractService.isInitialized()) return;

    try {
      const profile = await genaiContractService.getUserProfile(account);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  // Purchase subscription
  const purchaseSubscription = async (type: 'monthly' | 'annual') => {
    if (!genaiContractService.isInitialized()) {
      toast({
        title: "Service Not Ready",
        description: "Please connect your wallet and try again",
        variant: "destructive"
      });
      return;
    }

    try {
      let tx;
      if (type === 'monthly') {
        tx = await genaiContractService.purchaseMonthlySubscription();
      } else {
        tx = await genaiContractService.purchaseAnnualSubscription();
      }

      toast({
        title: "Transaction Submitted",
        description: `${type === 'monthly' ? 'Monthly' : 'Annual'} subscription purchase submitted`,
      });

      await tx.wait();

      toast({
        title: "Subscription Purchased!",
        description: `You now have ${type} access to premium features`,
      });

      // Reload user profile
      await loadUserProfile();

    } catch (error) {
      console.error('Subscription purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase subscription. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Generate image with AI
  const handleGenerate = async () => {
    console.log('🚀 Generate button clicked!');
    console.log('📝 Prompt:', prompt);
    console.log('🎨 Style:', selectedStyle);
    console.log('📏 Size:', selectedSize);
    console.log('🔗 Is connected:', isConnected);
    console.log('👤 User profile:', userProfile);
    
    // Dev note: skip noisy test toast; proceed directly
 
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a description for your image",
        variant: "destructive"
      });
      return;
    }
 
    // Strict enforce daily limit when profile loaded
    if (isConnected && genaiContractService.isInitialized() && userProfile && userProfile.dailyInfo && userProfile.dailyInfo.canGenerate === false) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used your 5 images for today. Try again tomorrow or upgrade.",
        variant: "destructive"
      });
      return;
    }

    // Local fallback enforcement (when contract cannot be updated)
    if (userProfile && userProfile.subscription.subType === 0) {
      const localUsed = getLocalUsage();
      const localLimit = 5;
      if (localUsed >= localLimit) {
        toast({
          title: "Daily Limit Reached (Local)",
          description: "You've used your 5 images for today (local fallback).",
          variant: "destructive"
        });
        return;
      }
    }
 
    // Check if premium features are being used
    const selectedStyleObj = artStyles.find(s => s.id === selectedStyle);
    const selectedSizeObj = imageSizes.find(s => s.size === selectedSize);
    
    if ((selectedStyleObj?.premium || selectedSizeObj?.premium) && isConnected && userProfile && (!userProfile.subscription.active || userProfile.subscription.subType === 0)) {
      toast({
        title: "Premium Feature",
        description: "Proceeding for preview only. Some premium features may require subscription to mint.",
      });
      // allow preview generation
    }

    setIsGenerating(true);

    try {
      // Free tier: charge per-generation fee (if any) before generating
      if (isConnected && userProfile && userProfile.subscription.subType === 0 && Number(generationFee) > 0) {
        try {
          const tx = await genaiContractService.sendGenerationFee(generationFee);
          toast({ title: "Generation Fee", description: `Processing fee ${generationFee} ETH...` });
          await tx.wait();
        } catch (feeErr) {
          throw new Error('Payment cancelled or failed');
        }
      }

      // Validate prompt
      console.log('🔍 Validating prompt...');
      const validation = geminiService.validatePrompt(prompt);
      console.log('✅ Validation result:', validation);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Show loading for realistic AI generation time
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds

      console.log('🔧 Calling geminiService.generateImage...');
      // Generate image with Gemini
      const result = await geminiService.generateImage({
        prompt,
        style: selectedStyle,
        size: selectedSize
      });
      console.log('📊 Generation result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      // Generate VRF seed for uniqueness
      let vrfSeed = geminiService.generateVRFSeed(prompt, selectedStyle, Date.now());
      if (genaiContractService.isInitialized()) {
        try {
          // Retry up to 5 times to avoid seed collisions
          for (let i = 0; i < 5; i++) {
            const used = await genaiContractService.nftVRFSeedUsed(vrfSeed);
            if (!used) break;
            vrfSeed = geminiService.generateVRFSeed(prompt, selectedStyle, Date.now() + Math.floor(Math.random() * 1e9));
          }
        } catch (e) {
          console.warn('VRF seed check failed, proceeding with current seed');
        }
      }

      // Create image object
      const newImage: GeneratedImage = {
        imageUrl: result.imageUrl!,
        imageHash: result.imageHash!,
        prompt,
        style: selectedStyle,
        size: selectedSize,
        timestamp: Date.now(),
        vrfSeed
      };

      // Store image metadata on-chain (for cleanup eligibility / uniqueness)
      if (genaiContractService.isInitialized() && account) {
        try {
          await genaiContractService.storeImageWithVRF(result.imageHash!, prompt, selectedStyle, selectedSize, account, vrfSeed);
        } catch (err) {
          console.warn('Failed to store image metadata (non-critical):', err);
        }
      }

      // Record generation in contract (strict 5/day limit enforcement)
      if (genaiContractService.isInitialized() && account) {
        try {
          // This assumes the backend has rights to record; here we call the contract method directly
          // If contract restricts to admin, this would be via an admin relayer in production
          await genaiContractService.recordImageGeneration(account, result.imageHash!, prompt);
          console.log('📒 Recorded image generation');
        } catch (err) {
          console.warn('Could not record image generation (may require admin role):', err);
          // Fallback local usage increment
          incLocalUsage();
        }
      }
      else {
        // No contract available -> use local fallback
        incLocalUsage();
      }

      // Add to generated images
      setGeneratedImages(prev => [newImage, ...prev]);
      setNewImageIndex(0); // Mark the first image as new
      
      // Remove the "new" indicator after 3 seconds
      setTimeout(() => setNewImageIndex(null), 3000);

      toast({
        title: "🎨 Image Generated Successfully!",
        description: "Your unique AI masterpiece is ready for preview and minting",
      });

      // Reload user profile to update daily usage
      if (isConnected) {
        await loadUserProfile();
      }

    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Open secure preview
  const openPreview = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsPreviewOpen(true);
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', preventDefault);
    // Disable common screenshot shortcuts
    document.addEventListener('keydown', preventScreenshots);
    // Attempt to deter PrintScreen by clearing clipboard
    document.addEventListener('keyup', handleKeyUpPrintScreen);
    // Blur image if tab loses visibility while preview open
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  // Close preview and remove security listeners
  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedImage(null);
    document.removeEventListener('contextmenu', preventDefault);
    document.removeEventListener('keydown', preventScreenshots);
    document.removeEventListener('keyup', handleKeyUpPrintScreen);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  // Security functions
  const preventDefault = (e: Event) => {
    e.preventDefault();
    return false;
  };

  const blockMouse: React.MouseEventHandler = (e) => {
    e.preventDefault();
    return false as unknown as void;
  };

  const preventScreenshots = (e: KeyboardEvent) => {
    // Block common screenshot shortcuts
    if (
      (e.key === 'PrintScreen') ||
      (e.ctrlKey && e.shiftKey && e.key === 'S') ||
      (e.metaKey && e.shiftKey && e.key === '3') ||
      (e.metaKey && e.shiftKey && e.key === '4') ||
      (e.metaKey && e.shiftKey && e.key === '5')
    ) {
      e.preventDefault();
      toast({
        title: "Action Blocked",
        description: "Screenshots are disabled in preview mode",
        variant: "destructive"
      });
      // Briefly cover image with opaque overlay
      setAntiScreenshotOn(true);
      setTimeout(() => setAntiScreenshotOn(false), 1500);
      return false;
    }
  };

  const handleKeyUpPrintScreen = async (e: KeyboardEvent) => {
    if (e.key === 'PrintScreen') {
      try {
        // Clear clipboard content to deter instant screen grabs
        await navigator.clipboard.writeText('Screenshots disabled in preview mode');
      } catch {}
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && previewRef.current) {
      previewRef.current.style.filter = 'blur(18px)';
    } else if (previewRef.current) {
      previewRef.current.style.filter = 'none';
    }
  };

  // Mint NFT
  const mintNFT = async (image: GeneratedImage) => {
    if (!genaiContractService.isInitialized()) {
      toast({
        title: "Service Not Ready",
        description: "Please connect your wallet and try again",
        variant: "destructive"
      });
      return;
    }
    if (!isConnected || !account) {
      toast({ title: "Connect Wallet", description: "Please connect your wallet to mint.", variant: "destructive" });
      return;
    }
 
    setIsMinting(true);
 
    try {
      // Network check
      const providerNetwork = await (signer as any)?.provider?.getNetwork?.();
      if (providerNetwork && Number(providerNetwork.chainId) !== 84532) {
        throw new Error('Wrong network. Please switch to Base Sepolia (84532).');
      }

      // Prevent duplicates
      if (await genaiContractService.nftImageExists(image.imageHash)) {
        throw new Error('This image hash already exists in the NFT contract. Try generating a new image.');
      }
      if (image.vrfSeed && (await genaiContractService.nftVRFSeedUsed(image.vrfSeed))) {
        throw new Error('This VRF seed was already used. Generate again.');
      }

      // Ensure price >= base
      const baseMint = await genaiContractService.getBaseMintPrice();
      const priceToUse = customMintPrice && Number(customMintPrice) > 0
        ? (Number(customMintPrice) < Number(baseMint) ? baseMint : customMintPrice)
        : baseMint;
 
      let tx;
      if (priceToUse !== baseMint) {
        tx = await genaiContractService.mintGenAINFTWithPrice(
          account!,
          image.prompt,
          image.imageHash,
          image.style,
          image.size,
          image.vrfSeed || 0,
          priceToUse
        );
      } else {
        tx = await genaiContractService.mintGenAINFT(
          account!,
          image.prompt,
          image.imageHash,
          image.style,
          image.size,
          image.vrfSeed || 0
        );
      }
 
      toast({
        title: "Minting Started",
        description: `Your NFT mint transaction has been submitted (value: ${priceToUse} ETH)`,
      });
 
      await tx.wait();
 
      toast({
        title: "NFT Minted!",
        description: "Your AI-generated NFT has been minted successfully",
      });
 
       // Remove from preview and reload profile
       closePreview();
       await loadUserProfile();
 
     } catch (error) {
       console.error('Minting failed:', error);
       const message = (error as any)?.reason || (error as any)?.shortMessage || (error as any)?.message || 'Failed to mint NFT';
       toast({ title: "Minting Failed", description: message, variant: "destructive" });
     } finally {
       setIsMinting(false);
     }
   };

  // Get subscription type name
  const getSubscriptionTypeName = (subType: number) => {
    switch (subType) {
      case 0: return 'Free';
      case 1: return 'Monthly';
      case 2: return 'Annual';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Bot className="w-12 h-12 text-primary" />
              <h1 className="text-5xl lg:text-6xl font-bold text-white">
                <span className="text-primary">GenAI</span> NFT Studio
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create unique AI-generated Soul-Bound NFTs with advanced AI models. 
              Every image is verified for uniqueness using VRF technology.
            </p>
          </div>

          {/* Connection Prompt for Non-Connected Users */}
          {!isConnected && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Connect Wallet to Get Started
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Connect your wallet to access GenAI features, view subscription status, and mint Soul-Bound NFTs
                  </p>
                  <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/80">
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Profile Card */}
          {isConnected && userProfile && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Your GenAI Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Subscription Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subscription</Label>
                    <Badge variant={userProfile.subscription.active ? "default" : "secondary"}>
                      {getSubscriptionTypeName(userProfile.subscription.subType)}
                    </Badge>
                    {userProfile.subscription.active && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(userProfile.subscription.expiryTime * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Daily Usage */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Daily Usage</Label>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{userProfile.dailyInfo.used}</span>
                        <span>{userProfile.dailyInfo.limit}</span>
                      </div>
                      <Progress 
                        value={(userProfile.dailyInfo.used / userProfile.dailyInfo.limit) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Pricing</Label>
                    <div className="space-y-1 text-sm">
                      <div>Monthly: {userProfile.pricing.monthly} ETH</div>
                      <div>Annual: {userProfile.pricing.annual} ETH</div>
                      <div>Mint: {userProfile.pricing.mintPrice} ETH</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upgrade</Label>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => purchaseSubscription('monthly')}
                        disabled={userProfile.subscription.subType >= 1}
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Monthly
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => purchaseSubscription('annual')}
                        disabled={userProfile.subscription.subType >= 2}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Annual
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Generation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generation Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Image Generation
                </CardTitle>
                <CardDescription>
                  Create unique AI-generated images and mint them as Soul-Bound NFTs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Describe your vision</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A majestic dragon soaring over a mystical cyberpunk city at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-xs text-muted-foreground">
                    {prompt.length}/500 characters
                  </div>
                </div>

                {/* Style Selection */}
                <div className="space-y-3">
                  <Label>Art Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {artStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all relative ${
                          selectedStyle === style.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        } ${style.premium && (!userProfile?.subscription.active || userProfile.subscription.subType === 0) 
                            ? 'opacity-50' : ''}`}
                        onClick={() => {
                          if (!style.premium || (userProfile?.subscription.active && userProfile.subscription.subType > 0)) {
                            setSelectedStyle(style.id);
                          }
                        }}
                      >
                        {style.premium && (
                          <Crown className="w-4 h-4 absolute top-2 right-2 text-yellow-500" />
                        )}
                        <div className="font-medium text-sm">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-3">
                  <Label>Image Size</Label>
                  <div className="flex flex-wrap gap-2">
                    {imageSizes.map((sizeObj) => (
                      <Badge
                        key={sizeObj.size}
                        variant={selectedSize === sizeObj.size ? "default" : "outline"}
                        className={`cursor-pointer relative ${
                          sizeObj.premium && (!userProfile?.subscription.active || userProfile.subscription.subType === 0)
                            ? 'opacity-50' : ''
                        }`}
                        onClick={() => {
                          if (!sizeObj.premium || (userProfile?.subscription.active && userProfile.subscription.subType > 0)) {
                            setSelectedSize(sizeObj.size);
                          }
                        }}
                      >
                        {sizeObj.premium && <Crown className="w-3 h-3 mr-1" />}
                        {sizeObj.size}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={() => {
                    console.log('🔘 Generate clicked');
                    handleGenerate();
                  }} 
                  disabled={!!(userProfile && userProfile.dailyInfo && userProfile.dailyInfo.canGenerate === false) || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {/* Clean button (no debug text) */}
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                        <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                        <div className="absolute inset-1 border-2 border-transparent border-t-white/60 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                      </div>
                      <span className="animate-pulse">Creating your AI masterpiece...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {userProfile && userProfile.dailyInfo ? `Generate Image (Remaining: ${Math.max(0, userProfile.dailyInfo.limit - userProfile.dailyInfo.used)})` : 'Generate Image'}
                    </div>
                  )}
                </Button>

                {/* Usage Warning */}
                {userProfile && userProfile.dailyInfo.used >= userProfile.dailyInfo.limit * 0.8 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      You've used {userProfile.dailyInfo.used} of {userProfile.dailyInfo.limit} daily generations.
                      {userProfile.subscription.subType === 0 && " Upgrade for unlimited access!"}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Generated Images Gallery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Your Creations
                </CardTitle>
                <CardDescription>
                  Generated images ready for minting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="text-center py-12">
                    {/* Epic AI Loading Animation */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      {/* Outer spinning ring */}
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                      
                      {/* Middle spinning ring */}
                      <div className="absolute inset-3 border-4 border-transparent border-r-primary/60 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                      
                      {/* Inner spinning ring */}
                      <div className="absolute inset-6 border-4 border-transparent border-b-primary/40 rounded-full animate-spin" style={{animationDuration: '0.8s'}}></div>
                      
                      {/* Pulsing center */}
                      <div className="absolute inset-8 bg-primary/20 rounded-full animate-pulse"></div>
                      
                      {/* Center dot */}
                      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                    </div>
                    
                    {/* Loading text */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-primary animate-pulse">AI is creating your image...</h3>
                      
                      {/* Bouncing dots */}
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                      
                      {/* Status text */}
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Processing your prompt with advanced AI models...
                      </p>
                      
                      {/* Progress bar effect */}
                      <div className="w-48 h-1 mx-auto bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ) : generatedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No images generated yet</p>
                    <p className="text-sm text-muted-foreground">Create your first AI masterpiece!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group">
                          <img 
                            src={image.imageUrl} 
                            alt={image.prompt}
                            className="w-full h-full object-cover"
                            onClick={() => openPreview(image)}
                          />
                          {/* Success overlay for new images */}
                          {index === newImageIndex && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-pulse">
                              <CheckCircle className="w-8 h-8 text-primary animate-bounce" />
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-sm font-medium">Click to Preview</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">{image.prompt}</p>
                          <div className="flex justify-between items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {image.style}
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => openPreview(image)}
                                variant="outline"
                              >
                                Preview
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => mintNFT(image)}
                              >
                                Mint
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Secure Preview Modal */}
          {isPreviewOpen && selectedImage && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Secure Preview
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={closePreview}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security Notice */}
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      This preview is secure - screenshots and downloads are disabled. 
                      Mint as NFT to own permanently.
                    </AlertDescription>
                  </Alert>

                  {/* Image Preview */}
                  <div 
                    ref={previewRef}
                    className="aspect-square bg-muted rounded-lg overflow-hidden mx-auto max-w-md relative"
                    style={{ 
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none'
                    }}
                  >
                    <img 
                      src={selectedImage.imageUrl} 
                      alt={selectedImage.prompt}
                      className="w-full h-full object-cover"
                      draggable={false}
                      onContextMenu={blockMouse}
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none'
                      }}
                    />
                    {/* Invisible overlay to intercept clicks/drag */}
                    <div
                      className="absolute inset-0"
                      style={{ pointerEvents: 'auto' }}
                      onMouseDown={blockMouse}
                      onDragStart={blockMouse}
                    />
                    {/* Anti-screenshot flash overlay */}
                    {antiScreenshotOn && (
                      <div className="absolute inset-0 bg-black/90" />
                    )}
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                      <div className="text-white/30 text-xl rotate-[-30deg] tracking-widest">
                        PREVIEW • NGT GENAI • PREVIEW • NGT GENAI
                      </div>
                    </div>
                  </div>

                  {/* Image Details */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Prompt</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedImage.prompt}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Style</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedImage.style}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Size</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedImage.size}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Generated</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(selectedImage.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">VRF Seed</Label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedImage.vrfSeed}</p>
                      </div>
                    </div>
                    {/* Free tier expiry hint */}
                    {userProfile && userProfile.subscription.subType === 0 && (
                      <div className="text-xs text-yellow-500">
                        Free tier preview: images may be cleaned up after 24 hours unless minted
                      </div>
                    )}
                  </div>

                  {/* Mint Actions */}
                  <div className="flex flex-col gap-3 pt-4">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm">Your mint price (ETH)</Label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        placeholder={userProfile?.pricing.mintPrice ?? '0.0005'}
                        value={customMintPrice}
                        onChange={(e) => setCustomMintPrice(e.target.value)}
                        className="w-40 rounded-md bg-background border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => mintNFT(selectedImage)}
                        disabled={isMinting}
                        className="flex-1"
                      >
                        {isMinting ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Minting...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Mint as Soul-Bound NFT ({customMintPrice || userProfile?.pricing.mintPrice} ETH)
                          </div>
                        )}
                      </Button>
                      <Button variant="outline" onClick={closePreview}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose GenAI NFT Studio?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>VRF Uniqueness</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Every image verified for uniqueness using Verifiable Random Functions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Soul-Bound NFTs</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Non-transferable NFTs that stay in your wallet forever
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Secure Preview</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Advanced security prevents screenshots and unauthorized downloads
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Timer className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Smart Cleanup</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Free user images auto-delete after 7 days unless minted
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
