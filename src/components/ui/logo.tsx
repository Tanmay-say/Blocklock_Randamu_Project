interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/favicon-32x32.png" 
        alt="Blockto NFT Mart Logo" 
        className="w-10 h-10"
      />
      <span className="text-2xl font-bold text-white">
        Blockto <span className="text-green-400">NFT Mart</span>
      </span>
    </div>
  );
};