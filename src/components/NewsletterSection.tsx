import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NewsletterSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Subscribe and Get Updates<br />
          Every Week.
        </h2>
        
        <div className="mt-8 flex gap-4 max-w-md mx-auto">
          <Input 
            placeholder="Enter your Email address"
            className="bg-muted border-border text-white placeholder:text-muted-foreground"
          />
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
            Send
          </Button>
        </div>
      </div>
    </section>
  );
};