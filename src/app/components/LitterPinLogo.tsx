import React from 'react';

export const LitterPinLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/litterpin-logo-transparent.png" 
        alt="LitterPin Logo" 
        className="relative w-full h-full object-contain brightness-110 contrast-125 scale-110" 
      />
    </div>
  );
};
