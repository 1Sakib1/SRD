import React from 'react';

export const LitterPinLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Background glow to blend with the website's gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#00B150] blur-[8px] opacity-40 rounded-full"></div>
      
      {/* The EXACT original logo, but with the cream background stripped out and colors upscaled/brightened via CSS */}
      <img 
        src="/litterpin-logo-transparent.png" 
        alt="LitterPin Logo" 
        className="relative w-full h-full object-contain brightness-110 contrast-125 drop-shadow-sm scale-110" 
      />
    </div>
  );
};
