import { Button } from "@/components/ui/button";
import heroCharacter from "@/assets/hero-character.png";

export const HeroSection = () => {
  return (
    <section className="px-6 py-16 min-h-[80vh] flex items-center">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Discover and<br />
              Collect The Best<br />
              <span className="text-primary">cabds</span> Digital Art.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-md">
              There are a thousand more cabds that
              intersect you find one cabds what you like!
            </p>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">30K+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">50K+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <span className="text-white font-semibold">10K+</span>
              </div>
            </div>
            
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
              Join Free Discord
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-full blur-3xl"></div>
            <img 
              src={heroCharacter} 
              alt="3D Digital Character" 
              className="relative z-10 w-full max-w-md mx-auto animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
};