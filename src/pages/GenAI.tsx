import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Sparkles, Image, Palette, Wand2, Download, Share2 } from "lucide-react";
import { useState } from "react";

export const GenAI = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("digital-art");
  const [selectedSize, setSelectedSize] = useState("1024x1024");

  const artStyles = [
    { id: "digital-art", name: "Digital Art", description: "Modern digital illustrations" },
    { id: "pixel-art", name: "Pixel Art", description: "Retro 8-bit style graphics" },
    { id: "watercolor", name: "Watercolor", description: "Soft, flowing watercolor paintings" },
    { id: "oil-painting", name: "Oil Painting", description: "Classic oil painting style" },
    { id: "anime", name: "Anime", description: "Japanese anime and manga style" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Futuristic, high-tech aesthetic" },
  ];

  const imageSizes = [
    "512x512",
    "768x768", 
    "1024x1024",
    "1024x1536",
    "1536x1024"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      setGeneratedContent("Generated content based on your prompt: " + prompt);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    // Simulate download functionality
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedContent);
    link.download = 'generated-content.txt';
    link.click();
  };

  const handleShare = () => {
    // Simulate share functionality
    if (navigator.share) {
      navigator.share({
        title: 'AI Generated Content',
        text: generatedContent,
      });
    } else {
      navigator.clipboard.writeText(generatedContent);
      alert('Content copied to clipboard!');
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
                <span className="text-primary">GenAI</span> Studio
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unleash your creativity with AI-powered art generation, text creation, and more. 
              Transform your ideas into stunning visuals and compelling content.
            </p>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="image-gen" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="image-gen">Image Generation</TabsTrigger>
              <TabsTrigger value="text-gen">Text Generation</TabsTrigger>
              <TabsTrigger value="style-transfer">Style Transfer</TabsTrigger>
            </TabsList>

            {/* Image Generation Tab */}
            <TabsContent value="image-gen" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    AI Image Generation
                  </CardTitle>
                  <CardDescription>
                    Create stunning images from text descriptions using advanced AI models
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label htmlFor="image-prompt">Describe your image</Label>
                    <Textarea
                      id="image-prompt"
                      placeholder="A majestic dragon soaring over a mystical forest at sunset, digital art style..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Style Selection */}
                  <div className="space-y-3">
                    <Label>Art Style</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {artStyles.map((style) => (
                        <div
                          key={style.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedStyle === style.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedStyle(style.id)}
                        >
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
                      {imageSizes.map((size) => (
                        <Badge
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate Image
                      </div>
                    )}
                  </Button>

                  {/* Generated Content Display */}
                  {generatedContent && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Generated Image</h3>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={handleDownload}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleShare}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Generated image would appear here</p>
                            <p className="text-sm">(Demo mode - no actual generation)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Text Generation Tab */}
            <TabsContent value="text-gen" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    AI Text Generation
                  </CardTitle>
                  <CardDescription>
                    Generate creative stories, descriptions, and content with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-prompt">What would you like to create?</Label>
                    <Textarea
                      id="text-prompt"
                      placeholder="Write a short story about a time traveler who discovers..."
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Palette className="w-4 h-4 mr-2" />
                      Creative
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Professional
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Poetic
                    </Button>
                  </div>

                  <Button className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Text
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Style Transfer Tab */}
            <TabsContent value="style-transfer" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Style Transfer
                  </CardTitle>
                  <CardDescription>
                    Apply artistic styles to your existing images using AI
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Upload Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <div className="text-muted-foreground">
                        <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Drag and drop your image here, or click to browse</p>
                        <p className="text-sm">Supports JPG, PNG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Choose Style</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {artStyles.slice(0, 6).map((style) => (
                        <div
                          key={style.id}
                          className="p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-all"
                        >
                          <div className="font-medium text-sm">{style.name}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Apply Style
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Features Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose GenAI Studio?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Advanced AI Models</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Powered by state-of-the-art AI models for the highest quality results
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>Multiple Styles</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Choose from hundreds of artistic styles and customize your creations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>High Resolution</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                    Generate images up to 4K resolution for professional use
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
