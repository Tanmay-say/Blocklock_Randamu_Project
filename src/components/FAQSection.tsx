import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What is an NFT?",
    answer: "An NFT (Non-Fungible Token) is a digital asset that represents ownership or authenticity of a unique item or piece of content, such as an artwork, music file, or video."
  },
  {
    question: "How does NFT benefit society?",
    answer: "NFTs provide new ways for creators to monetize their work, enable proof of ownership for digital assets, and create new economic opportunities in the digital space."
  },
  {
    question: "Are there rules for NFT?",
    answer: "NFT regulations vary by jurisdiction. While the technology itself isn't regulated, the sale and trading of NFTs may be subject to existing financial and consumer protection laws."
  },
  {
    question: "Is NFT still profitable?",
    answer: "NFT profitability depends on various factors including market demand, rarity, utility, and timing. Like any investment, it carries risks and potential rewards."
  },
  {
    question: "Can we withdraw money from NFT?",
    answer: "Yes, you can sell your NFTs on various marketplaces to convert them back to cryptocurrency or fiat currency, though this depends on market demand for your specific NFT."
  },
  {
    question: "What makes an NFT lose value?",
    answer: "NFT values can decrease due to market saturation, lack of utility, declining interest in the project, or broader market conditions affecting the crypto space."
  },
  {
    question: "What is the most expensive NFT?",
    answer: "The most expensive NFT sale to date was Beeple's 'Everydays: The First 5000 Days' which sold for $69.3 million at Christie's auction house."
  },
  {
    question: "Who owns NFT?",
    answer: "NFT ownership is recorded on the blockchain. The person who holds the private keys to the wallet containing the NFT is considered the owner."
  }
];

export const FAQSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">FAQ</h2>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="bg-card border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-white hover:text-primary text-left py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};