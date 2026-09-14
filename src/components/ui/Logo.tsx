import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', text: 'text-lg' },
    md: { box: 'w-10 h-10', text: 'text-xl' },
    lg: { box: 'w-12 h-12', text: 'text-2xl' }
  }[size];

  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* High-Tech Vector AI + Law Scales Emblem */}
      <div className={`relative ${dimensions.box} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 200 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
          aria-hidden="true"
        >
          <defs>
            {/* Blue Metallic Gradient */}
            <linearGradient id="kannunBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#004e92" />
              <stop offset="50%" stopColor="#002d62" />
              <stop offset="100%" stopColor="#001838" />
            </linearGradient>

            {/* Gold Metallic Gradient */}
            <linearGradient id="kannunGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f7d070" />
              <stop offset="40%" stopColor="#d4af37" />
              <stop offset="80%" stopColor="#aa7c11" />
              <stop offset="100%" stopColor="#8a6100" />
            </linearGradient>

            {/* Cyan AI Glow Gradient */}
            <linearGradient id="kannunCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* 1. TOP CREST FLAME / LEAF (Gold) */}
          <path
            d="M 100 8 C 105 22 118 32 118 42 C 118 50 110 56 100 56 C 90 56 82 50 82 42 C 82 32 95 22 100 8 Z"
            fill="url(#kannunGold)"
          />
          <path
            d="M 100 12 C 103 24 112 32 112 40 C 112 45 106 50 100 50 Z"
            fill="#ffe89c"
            opacity="0.6"
          />

          {/* 2. OPEN LEGAL BOOK BASE (Gold Inner Pages, Dark Blue Base) */}
          {/* Bottom Dark Blue Book Spine */}
          <path
            d="M 20 160 Q 100 185 180 160 Q 100 170 20 160 Z"
            fill="url(#kannunBlue)"
          />
          <path
            d="M 15 155 Q 100 182 185 155 L 180 142 Q 100 165 20 142 Z"
            fill="url(#kannunBlue)"
          />

          {/* Gold Open Pages */}
          <path
            d="M 32 142 Q 100 162 168 142 Q 100 152 32 142 Z"
            fill="url(#kannunGold)"
          />
          <path
            d="M 40 134 Q 100 152 160 134 Q 100 142 40 134 Z"
            fill="url(#kannunGold)"
            opacity="0.8"
          />

          {/* 3. CENTRAL STEM (Left Blue, Right Gold & AI Head Silhouette) */}
          {/* Left Stem (Blue) */}
          <path
            d="M 94 48 L 94 140 L 100 140 L 100 48 Z"
            fill="url(#kannunBlue)"
          />

          {/* Right Stem & Integrated AI Profile (Blue & Gold) */}
          <path
            d="M 100 48 L 106 48 L 106 62 Q 120 70 124 85 Q 128 100 120 115 Q 112 125 106 130 L 106 140 L 100 140 Z"
            fill="url(#kannunBlue)"
          />
          {/* Gold accent line down stem center */}
          <path
            d="M 99 48 L 101 48 L 101 140 L 99 140 Z"
            fill="url(#kannunGold)"
          />

          {/* 4. MAIN HORIZONTAL SCALE BEAM */}
          {/* Left Arch (Blue) */}
          <path
            d="M 40 55 C 60 38 85 45 100 48 C 85 48 60 42 40 58 Z"
            fill="url(#kannunBlue)"
          />
          {/* Right Arch (Blue) */}
          <path
            d="M 160 55 C 140 38 115 45 100 48 C 115 48 140 42 160 58 Z"
            fill="url(#kannunBlue)"
          />

          {/* Beam End Knobs */}
          <circle cx="40" cy="56" r="4" fill="url(#kannunBlue)" />
          <circle cx="160" cy="56" r="4" fill="url(#kannunBlue)" />

          {/* 5. LEFT SCALE DISH (Classic Law) */}
          {/* Left Ropes */}
          <line x1="40" y1="56" x2="22" y2="112" stroke="url(#kannunBlue)" strokeWidth="2.5" />
          <line x1="40" y1="56" x2="68" y2="112" stroke="url(#kannunBlue)" strokeWidth="2.5" />

          {/* Left Pan */}
          <path
            d="M 18 112 Q 45 136 72 112 Z"
            fill="url(#kannunBlue)"
          />
          <path
            d="M 22 112 Q 45 120 68 112 Z"
            fill="url(#kannunGold)"
          />

          {/* 6. RIGHT SCALE DISH (AI Circuit Nodes) */}
          {/* Right Ropes */}
          <line x1="160" y1="56" x2="142" y2="112" stroke="url(#kannunBlue)" strokeWidth="2.5" />
          <line x1="160" y1="56" x2="188" y2="112" stroke="url(#kannunBlue)" strokeWidth="2.5" />

          {/* Right Pan */}
          <path
            d="M 138 112 Q 165 136 192 112 Z"
            fill="url(#kannunBlue)"
          />
          <path
            d="M 142 112 Q 165 120 188 112 Z"
            fill="url(#kannunGold)"
          />

          {/* AI Circuit Lines in Right Pan */}
          <path
            d="M 155 110 L 155 98 L 165 90"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="165" cy="90" r="2.5" fill="#38bdf8" />

          <path
            d="M 172 110 L 172 100 L 178 94"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="178" cy="94" r="2.5" fill="#38bdf8" />

          <path
            d="M 162 104 L 168 98"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="162" cy="104" r="2" fill="#38bdf8" />

          {/* AI Circuit Lines in Profile (Center Right) */}
          <path
            d="M 104 68 L 112 62 L 118 62"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="118" cy="62" r="2.5" fill="#ffffff" />

          <path
            d="M 104 80 L 115 72 L 124 72"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="124" cy="72" r="2.5" fill="#ffffff" />

          <path
            d="M 104 94 L 114 88 L 120 100"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="120" cy="100" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <span className={`${dimensions.text} font-extrabold tracking-tight text-[var(--text-primary)] leading-none`}>
          KannunAI
        </span>
      )}
    </div>
  );
};
