interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-sm transform rotate-12"></div>
      </div>
      <span className="text-xl font-bold text-white">NFT ART</span>
    </div>
  );
};