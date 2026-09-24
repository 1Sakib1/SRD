import React from 'react';

export const LitterPinLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="litterpin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" /> {/* Tailwind emerald-500 */}
          <stop offset="100%" stopColor="#059669" /> {/* Tailwind emerald-600 */}
        </linearGradient>
      </defs>
      
      {/* Main Map Pin Body */}
      <path 
        d="M50,0 C22.4,0 0,22.4 0,50 C0,78 50,120 50,120 C50,120 100,78 100,50 C100,22.4 77.6,0 50,0 Z" 
        fill="url(#litterpin-gradient)" 
      />
      
      {/* Camera Body */}
      <rect x="25" y="25" width="50" height="32" rx="4" fill="white" />
      <circle cx="67" cy="32" r="2.5" fill="url(#litterpin-gradient)" />
      
      {/* Aperture Lens Outer */}
      <circle cx="50" cy="41" r="11" fill="url(#litterpin-gradient)" />
      
      {/* Aperture Blades (White Negative Space) */}
      <circle cx="50" cy="41" r="8" fill="white" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" transform="rotate(60 50 41)" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" transform="rotate(120 50 41)" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" transform="rotate(180 50 41)" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" transform="rotate(240 50 41)" />
      <path d="M50,33 L55,41 L50,41 Z" fill="url(#litterpin-gradient)" transform="rotate(300 50 41)" />
      
      {/* Aperture Inner Hole */}
      <polygon points="48,39 52,39 54,43 50,45 46,43" fill="white" />

      {/* Leaf Bottom */}
      <path d="M50,68 C38,68 35,88 50,98 C50,98 50,98 50,98 C50,98 50,98 50,98 C65,88 62,68 50,68 Z" fill="white" />
      <path d="M50,68 C45,80 50,95 50,95" stroke="url(#litterpin-gradient)" strokeWidth="1.5" fill="none" />
      <path d="M50,85 L44,80" stroke="url(#litterpin-gradient)" strokeWidth="1.5" fill="none" />
      <path d="M50,78 L54,73" stroke="url(#litterpin-gradient)" strokeWidth="1.5" fill="none" />
      
      {/* Leaf Stem */}
      <path d="M50,98 Q50,110 45,115" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
};
