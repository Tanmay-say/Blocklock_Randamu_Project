import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import nft1 from "@/assets/nft-1.png";
import nft2 from "@/assets/nft-2.png";

export const FeatureSection = () => {
  const navigate = useNavigate();

  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-card p-1 rounded-2xl shadow-nft">
                  <img src={nft1} alt="NFT Art 1" className="w-full rounded-xl" />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-gradient-card p-1 rounded-2xl shadow-nft">
                  <img src={nft2} alt="NFT Art 2" className="w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Modern<br />
              Consent and<br />
              Clean
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco 
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            
            <Button 
              onClick={() => {
                console.log('Checkout features button clicked!');
                navigate('/');
                // Scroll to top of the page to show the action
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
            >
              Checkout features
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};