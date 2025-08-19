import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about NFT ART? Want to partner with us? 
              We'd love to hear from you. Reach out and let's start a conversation.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-gradient-card p-8 rounded-2xl shadow-nft">
              <h2 className="text-3xl font-bold text-white mb-8">Send us a Message</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">First Name</label>
                    <Input 
                      placeholder="Enter your first name"
                      className="bg-muted border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Last Name</label>
                    <Input 
                      placeholder="Enter your last name"
                      className="bg-muted border-border text-white placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-muted border-border text-white placeholder:text-muted-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">Subject</label>
                  <Input 
                    placeholder="What is this regarding?"
                    className="bg-muted border-border text-white placeholder:text-muted-foreground"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-semibold mb-2">Message</label>
                  <Textarea 
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="bg-muted border-border text-white placeholder:text-muted-foreground resize-none"
                  />
                </div>
                
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3">
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  We're here to help and answer any questions you might have. 
                  We look forward to hearing from you!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Address</h3>
                    <p className="text-muted-foreground">hello@nftart.com</p>
                    <p className="text-muted-foreground">support@nftart.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone Number</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-muted-foreground">+1 (555) 765-4321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Office Address</h3>
                    <p className="text-muted-foreground">123 Digital Art Street</p>
                    <p className="text-muted-foreground">Crypto Valley, CV 12345</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-muted-foreground">Saturday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-8">
                <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Discord
                  </Button>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Twitter
                  </Button>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-card p-6 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-3">How do I create an NFT?</h3>
                <p className="text-muted-foreground">
                  Simply connect your wallet, upload your digital artwork, add details, 
                  and mint your NFT. Our platform guides you through each step.
                </p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-3">What are the fees?</h3>
                <p className="text-muted-foreground">
                  We charge a 2.5% marketplace fee on sales. Gas fees depend on 
                  network congestion and are paid directly to the blockchain.
                </p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-3">Which wallets are supported?</h3>
                <p className="text-muted-foreground">
                  We support MetaMask, WalletConnect, Coinbase Wallet, and most 
                  popular Ethereum wallets for seamless transactions.
                </p>
              </div>
              
              <div className="bg-gradient-card p-6 rounded-2xl shadow-nft">
                <h3 className="text-xl font-bold text-white mb-3">How do royalties work?</h3>
                <p className="text-muted-foreground">
                  Creators can set royalty percentages (up to 10%) and receive 
                  payments automatically on every secondary sale of their NFTs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;