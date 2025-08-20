import React, { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';

interface AuctionCountdownProps {
  endTime: string;
  onExpired?: () => void;
  className?: string;
  compact?: boolean;
}

export const AuctionCountdown: React.FC<AuctionCountdownProps> = ({ 
  endTime, 
  onExpired, 
  className = "",
  compact = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpired) {
          onExpired();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Set up interval to update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpired]);

  const formatTime = (value: number, unit: string) => {
    if (compact) {
      return `${value}${unit.charAt(0)}`;
    }
    return `${value} ${unit}${value !== 1 ? 's' : ''}`;
  };

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-400 ${className}`}>
        <Timer className="w-4 h-4" />
        <span className="font-medium">Auction Ended</span>
      </div>
    );
  }

  const hasTime = timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0;

  if (!hasTime) {
    return (
      <div className={`flex items-center gap-2 text-yellow-400 ${className}`}>
        <Clock className="w-4 h-4 animate-pulse" />
        <span className="font-medium">Ending Soon...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-white ${className}`}>
        <Clock className="w-3 h-3" />
        <span className="text-sm font-mono">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {(timeLeft.days > 0 || timeLeft.hours > 0) && `${timeLeft.hours}h `}
          {timeLeft.days === 0 && `${timeLeft.minutes}m `}
          {timeLeft.days === 0 && timeLeft.hours === 0 && `${timeLeft.seconds}s`}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Auction Ends In:</span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {/* Days */}
        <div className="text-center p-2 bg-background/30 rounded-lg">
          <div className="text-lg font-bold text-white">{timeLeft.days}</div>
          <div className="text-xs text-muted-foreground">Days</div>
        </div>
        
        {/* Hours */}
        <div className="text-center p-2 bg-background/30 rounded-lg">
          <div className="text-lg font-bold text-white">{timeLeft.hours}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
        
        {/* Minutes */}
        <div className="text-center p-2 bg-background/30 rounded-lg">
          <div className="text-lg font-bold text-white">{timeLeft.minutes}</div>
          <div className="text-xs text-muted-foreground">Min</div>
        </div>
        
        {/* Seconds */}
        <div className="text-center p-2 bg-background/30 rounded-lg">
          <div className="text-lg font-bold text-primary">{timeLeft.seconds}</div>
          <div className="text-xs text-muted-foreground">Sec</div>
        </div>
      </div>
      
      {/* Urgency indicator */}
      {timeLeft.days === 0 && timeLeft.hours < 2 && (
        <div className="text-center">
          <span className="text-red-400 text-sm font-medium animate-pulse">
            ⚠️ Auction ending soon!
          </span>
        </div>
      )}
    </div>
  );
};
