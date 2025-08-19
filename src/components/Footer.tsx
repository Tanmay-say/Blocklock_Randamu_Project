import { Logo } from "@/components/ui/logo";

export const Footer = () => {
  return (
    <footer className="px-6 py-16 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <Logo />
            <p className="text-muted-foreground text-sm max-w-xs">
              2022 Award-winning NFT Art and Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Location</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>Americas</p>
              <p>Asia</p>
              <p>Europe</p>
              <p>Africa</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Contact</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>About Us</p>
              <p>Teams</p>
              <p>Profile</p>
              <p>FAQ</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Legals</h3>
            <div className="space-y-2 text-muted-foreground text-sm">
              <p>Privacy</p>
              <p>Disclaimer</p>
              <p>Terms</p>
              <p>Company</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>Copyright © 2025 NFT ART. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};