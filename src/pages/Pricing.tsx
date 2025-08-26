import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Bot, Shield, Timer, Coins } from "lucide-react";
import { Link } from "react-router-dom";

const pricingPlans = [
  {
    name: "Free Tier",
    price: "Free",
    period: "forever",
    description: "Perfect for trying out our GenAI platform",
    features: [
      "5 AI images per day",
      "Basic art styles (4 styles)",
      "Standard sizes (512x512, 768x768, 1024x1024)",
      "7-day image storage",
      "Community support",
      "VRF uniqueness verification"
    ],
    limitations: [
      "Images auto-delete after 7 days",
      "Limited styles and sizes",
      "No premium features"
    ],
    buttonText: "Start Free",
    buttonVariant: "outline" as const,
    popular: false,
    icon: <Zap className="w-6 h-6" />
  },
  {
    name: "Monthly Pro",
    price: "0.01 ETH",
    period: "per month",
    description: "Unlimited creativity for serious creators",
    features: [
      "Unlimited AI image generation",
      "All 8 art styles (including premium)",
      "All image sizes (up to 2048x2048)",
      "Permanent image storage",
      "Priority generation queue",
      "Advanced VRF uniqueness",
      "Premium support",
      "Early access to new features"
    ],
    limitations: [],
    buttonText: "Go Pro Monthly",
    buttonVariant: "default" as const,
    popular: true,
    icon: <Crown className="w-6 h-6" />
  },
  {
    name: "Annual Pro",
    price: "0.1 ETH",
    period: "per year",
    description: "Best value for professional creators",
    features: [
      "Everything in Monthly Pro",
      "2 months FREE (12 months for 10)",
      "Exclusive annual-only styles",
      "Priority support",
      "Beta feature access",
      "Creator badge on profile",
      "Analytics dashboard",
      "API access (coming soon)"
    ],
    limitations: [],
    buttonText: "Go Pro Annual",
    buttonVariant: "default" as const,
    popular: false,
    icon: <Star className="w-6 h-6" />
  }
];

const additionalCosts = [
  {
    item: "Soul-Bound NFT Minting",
    price: "0.0005 ETH",
    description: "Convert any generated image to a permanent Soul-Bound NFT",
    icon: <Shield className="w-5 h-5" />
  },
  {
    item: "Gas Fees",
    price: "~$0.10-0.50",
    description: "Base Sepolia network fees for blockchain transactions",
    icon: <Zap className="w-5 h-5" />
  }
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Simple <span className="text-primary">Pricing</span><br />
              for Everyone
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start creating unique AI-generated Soul-Bound NFTs today. Choose the plan that fits your creative needs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <div className="text-4xl font-bold text-white">{plan.price}</div>
                    <div className="text-muted-foreground">{plan.period}</div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <div className="text-sm font-medium text-muted-foreground">Limitations:</div>
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start gap-3">
                          <Timer className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Link to="/genai" className="block">
                    <Button 
                      variant={plan.buttonVariant} 
                      className="w-full"
                      size="lg"
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Costs */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Additional <span className="text-primary">Costs</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {additionalCosts.map((cost, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        {cost.icon}
                      </div>
                      <div>
                        <div>{cost.item}</div>
                        <div className="text-primary font-bold">{cost.price}</div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{cost.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>What are Soul-Bound NFTs?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Soul-Bound NFTs are non-transferable tokens that stay in your wallet forever. 
                    They represent true ownership and cannot be sold or transferred.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How does VRF uniqueness work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every image is verified using Verifiable Random Functions (VRF) to ensure 
                    absolute uniqueness. No two images can ever be the same.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can I upgrade my plan anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade from Free to Pro at any time. Your remaining free usage 
                    will be preserved when you upgrade.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What happens to my images?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Free users: Images auto-delete after 7 days unless minted as NFTs.
                    Pro users: Images stored permanently.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Create Amazing <span className="text-primary">AI Art</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators using our GenAI platform to create unique, 
              verifiable AI-generated Soul-Bound NFTs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/genai">
                <Button size="lg" className="bg-primary hover:bg-primary/80">
                  <Bot className="w-5 h-5 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;

