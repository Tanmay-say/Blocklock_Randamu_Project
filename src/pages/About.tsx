import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import heroCharacter from "@/assets/hero-character.png";

const teamMembers = [
  {
    name: "Tanmay Sayare",
    role: "Founder & CEO",
    bio: "Blockchain enthusiast with 10+ years in digital art and technology."
  }
];

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              About <span className="text-primary">Blockto NFT Mart</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're building the future of digital art ownership and creativity, 
              empowering artists and collectors in the decentralized world.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-white">
                Our <span className="text-primary">Mission</span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                At NFT ART, we believe in democratizing digital art ownership and creating 
                new opportunities for artists to monetize their creativity. Our platform 
                bridges the gap between traditional art collectors and the digital revolution.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Since our founding in 2022, we've facilitated over $50M in NFT transactions 
                and supported thousands of artists in their journey to digital art success.
              </p>
              
              <div className="grid grid-cols-3 gap-8 py-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-muted-foreground">NFTs Traded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-muted-foreground">Active Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">30K+</div>
                  <div className="text-muted-foreground">Collectors</div>
                </div>
              </div>
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

          {/* Team Section */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Meet Our <span className="text-primary">Team</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-gradient-card p-6 rounded-2xl shadow-nft text-center">
                  <div className="w-24 h-24 bg-gradient-hero rounded-full mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values Section */}
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-12">
              Our <span className="text-primary">Values</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
                <p className="text-muted-foreground">
                  We constantly push the boundaries of what's possible in the NFT space.
                </p>
              </div>
              
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-4">Community</h3>
                <p className="text-muted-foreground">
                  Building strong relationships between artists and collectors is our priority.
                </p>
              </div>
              
              <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-4">Transparency</h3>
                <p className="text-muted-foreground">
                  Open, honest communication and fair practices guide everything we do.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Join Our Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're an artist looking to showcase your work or a collector 
              seeking unique digital art, we're here to support your NFT journey.
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
              Join Our Community
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;