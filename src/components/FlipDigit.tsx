import React, { useEffect, useState } from 'react';

interface FlipDigitProps {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'zen';
}

export const FlipDigit: React.FC<FlipDigitProps> = ({
  value,
  label,
  size = 'md'
}) => {
  const formattedValue = String(value).padStart(2, '0');
  const [currentVal, setCurrentVal] = useState(formattedValue);
  const [prevVal, setPrevVal] = useState(formattedValue);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (formattedValue !== currentVal) {
      setPrevVal(currentVal);
      setCurrentVal(formattedValue);
      setIsFlipping(true);

      const timeout = setTimeout(() => {
        setIsFlipping(false);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [formattedValue, currentVal]);

  const sizeClasses = {
    sm: 'w-14 h-20 text-3xl',
    md: 'w-20 h-28 sm:w-24 sm:h-32 text-4xl sm:text-5xl',
    lg: 'w-24 h-32 sm:w-32 sm:h-44 text-5xl sm:text-7xl',
    zen: 'w-28 h-36 sm:w-44 sm:h-56 text-6xl sm:text-8xl'
  }[size];

  return (
    <div className="flex flex-col items-center select-none">
      <div className={`relative ${sizeClasses} flip-card-container rounded-2xl shadow-2xl group`}>
        {/* Glow backdrop behind cards */}
        <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-purple-600/20 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-500 -z-10" />

        {/* Static Background Cards */}
        <div className="flip-segment flip-segment-top">
          <span className="flip-digit text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-100 to-white drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">
            {currentVal}
          </span>
        </div>

        <div className="flip-segment flip-segment-bottom">
          <span className="flip-digit text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400">
            {isFlipping ? prevVal : currentVal}
          </span>
        </div>

        {/* Center Hinge Seam & Side Notches */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-black/80 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-[#0d0f17] rounded-full -translate-y-1/2 z-30 border border-white/10" />
        <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-[#0d0f17] rounded-full -translate-y-1/2 z-30 border border-white/10" />

        {/* Animated 3D Flaps */}
        {isFlipping && (
          <>
            <div className="flip-flap flip-flap-top flipping">
              <span className="flip-digit text-transparent bg-clip-text bg-gradient-to-b from-cyan-200 via-cyan-100 to-white drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]">
                {prevVal}
              </span>
            </div>

            <div className="flip-flap flip-flap-bottom flipping">
              <span className="flip-digit text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400">
                {currentVal}
              </span>
            </div>
          </>
        )}
      </div>

      {label && (
        <span className="mt-3 text-xs sm:text-sm font-semibold tracking-wider text-cyan-400/80 uppercase">
          {label}
        </span>
      )}
    </div>
  );
};
