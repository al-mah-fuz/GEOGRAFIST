import React from 'react';

interface FlagSvgProps {
  countryCode?: string;
  flagEmoji?: string;
  className?: string;
}

/**
 * High-fidelity, self-contained SVG vectors for Flag Master questions.
 * Crisp, authentic proportions, zero external network dependency.
 */
export const FlagSvg: React.FC<FlagSvgProps> = ({ countryCode, flagEmoji, className = 'w-48 h-32' }) => {
  const code = countryCode?.toUpperCase();

  switch (code) {
    case 'JP': // Japan: White with red sun disc
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg bg-white flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="600" fill="#FFFFFF" />
            <circle cx="450" cy="300" r="180" fill="#BC002D" />
          </svg>
        </div>
      );

    case 'ZA': // South Africa: Horizontal Y-shape with 6 colors
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="300" fill="#E03C31" />
            <rect y="300" width="900" height="300" fill="#001489" />
            <polygon points="0,0 0,600 450,300" fill="#000000" />
            <polygon points="0,0 450,300 0,600 0,520 330,300 0,80" fill="#FFB81C" />
            <polygon points="0,0 0,600 900,600 900,480 360,300 900,120 900,0" fill="#FFFFFF" />
            <polygon points="0,60 0,540 360,300" fill="#FFB81C" />
            <polygon points="0,80 0,520 330,300" fill="#000000" />
            <polygon points="0,60 900,60 900,140 420,300 900,460 900,540 0,540 0,420 240,300 0,180" fill="#FFFFFF" />
            <polygon points="0,120 900,120 900,200 450,300 900,400 900,480 0,480 0,360 210,300 0,240" fill="#007749" />
          </svg>
        </div>
      );

    case 'BR': // Brazil: Green with yellow rhombus and blue celestial sphere
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 1000 700" className="w-full h-full">
            <rect width="1000" height="700" fill="#009B3A" />
            <polygon points="500,80 916,350 500,620 84,350" fill="#FEDF00" />
            <circle cx="500" cy="350" r="175" fill="#002776" />
            {/* Equator banner */}
            <path d="M 330,370 Q 500,310 670,365" stroke="#FFFFFF" strokeWidth="22" fill="none" />
            {/* Stars */}
            <circle cx="500" cy="380" r="4" fill="#FFFFFF" />
            <circle cx="480" cy="390" r="3" fill="#FFFFFF" />
            <circle cx="520" cy="400" r="3" fill="#FFFFFF" />
            <circle cx="500" cy="420" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'CA': // Canada: Red, White, Red with red stylized maple leaf
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            <rect width="250" height="500" fill="#D80621" />
            <rect x="250" width="500" height="500" fill="#FFFFFF" />
            <rect x="750" width="250" height="500" fill="#D80621" />
            {/* 11-pointed maple leaf */}
            <path
              d="M 500,110 L 515,190 L 570,170 L 550,215 L 610,230 L 580,270 L 615,310 L 550,315 L 565,340 L 515,335 L 510,400 L 490,400 L 485,335 L 435,340 L 450,315 L 385,310 L 420,270 L 390,230 L 450,215 L 430,170 L 485,190 Z"
              fill="#D80621"
            />
          </svg>
        </div>
      );

    case 'NG': // Nigeria: Green, White, Green
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 450" className="w-full h-full">
            <rect width="300" height="450" fill="#008751" />
            <rect x="300" width="300" height="450" fill="#FFFFFF" />
            <rect x="600" width="300" height="450" fill="#008751" />
          </svg>
        </div>
      );

    case 'NP': // Nepal: Dual pennant (non-quadrilateral)
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg bg-slate-900/40 p-1 flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 400 490" className="h-full">
            <polygon points="0,0 360,220 120,220 360,490 0,490" fill="#003893" />
            <polygon points="12,18 320,208 108,208 320,472 12,472" fill="#DC143C" />
            {/* White moon and sun symbols */}
            <circle cx="80" cy="140" r="30" fill="#FFFFFF" />
            <circle cx="80" cy="350" r="30" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'AR': // Argentina: Blue, White, Blue with Sol de Mayo
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="200" fill="#75AADB" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#75AADB" />
            {/* Sun of May */}
            <circle cx="450" cy="300" r="45" fill="#F6B40E" stroke="#85340A" strokeWidth="2" />
            <circle cx="450" cy="300" r="32" fill="#F6B40E" />
          </svg>
        </div>
      );

    case 'SE': // Sweden: Blue with yellow Scandinavian cross
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 800 500" className="w-full h-full">
            <rect width="800" height="500" fill="#006AA7" />
            <rect x="250" width="100" height="500" fill="#FECC00" />
            <rect y="200" width="800" height="100" fill="#FECC00" />
          </svg>
        </div>
      );

    case 'CH': // Switzerland: Red with equilateral white cross
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <rect width="500" height="500" fill="#D52B1E" />
            <rect x="215" y="100" width="70" height="300" fill="#FFFFFF" rx="4" />
            <rect x="100" y="215" width="300" height="70" fill="#FFFFFF" rx="4" />
          </svg>
        </div>
      );

    case 'KE': // Kenya: Black, Red, Green with white borders and Maasai shield
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="180" fill="#000000" />
            <rect y="180" width="900" height="30" fill="#FFFFFF" />
            <rect y="210" width="900" height="180" fill="#BB0000" />
            <rect y="390" width="900" height="30" fill="#FFFFFF" />
            <rect y="420" width="900" height="180" fill="#006600" />
            {/* Maasai shield */}
            <ellipse cx="450" cy="300" rx="60" ry="120" fill="#BB0000" stroke="#000000" strokeWidth="6" />
            <line x1="450" y1="170" x2="450" y2="430" stroke="#FFFFFF" strokeWidth="6" />
            <ellipse cx="450" cy="300" rx="20" ry="60" fill="#000000" />
          </svg>
        </div>
      );

    case 'JM': // Jamaica: Gold saltire dividing green and black
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 450" className="w-full h-full">
            <rect width="900" height="450" fill="#000000" />
            <polygon points="0,0 450,225 0,450" fill="#000000" />
            <polygon points="900,0 450,225 900,450" fill="#000000" />
            <polygon points="0,0 450,225 900,0" fill="#007749" />
            <polygon points="0,450 450,225 900,450" fill="#007749" />
            <line x1="0" y1="0" x2="900" y2="450" stroke="#FFB81C" strokeWidth="60" />
            <line x1="900" y1="0" x2="0" y2="450" stroke="#FFB81C" strokeWidth="60" />
          </svg>
        </div>
      );

    case 'IN': // India: Saffron, White, Green with Ashoka Chakra
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="200" fill="#FF9933" />
            <rect y="200" width="900" height="200" fill="#FFFFFF" />
            <rect y="400" width="900" height="200" fill="#138808" />
            {/* Ashoka Chakra */}
            <circle cx="450" cy="300" r="70" fill="none" stroke="#000080" strokeWidth="7" />
            <circle cx="450" cy="300" r="14" fill="#000080" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="450"
                y1="300"
                x2={450 + 66 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={300 + 66 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="#000080"
                strokeWidth="3.5"
              />
            ))}
          </svg>
        </div>
      );

    case 'GR': // Greece: 9 stripes of blue/white with cross canton
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            {Array.from({ length: 9 }).map((_, i) => (
              <rect
                key={i}
                y={(600 / 9) * i}
                width="900"
                height={600 / 9}
                fill={i % 2 === 0 ? '#0D5EAF' : '#FFFFFF'}
              />
            ))}
            {/* Canton */}
            <rect width="333" height={(600 / 9) * 5} fill="#0D5EAF" />
            <rect x="136" width="60" height={(600 / 9) * 5} fill="#FFFFFF" />
            <rect y="136" width="333" height="60" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'KR': // South Korea: White with Taegeuk and 4 trigrams
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 shadow-lg bg-white ${className}`}>
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="600" fill="#FFFFFF" />
            {/* Taegeuk disc */}
            <path d="M 450,200 A 100,100 0 0,1 450,400 A 50,50 0 0,1 450,300 A 50,50 0 0,0 450,200 Z" fill="#CD2E3A" />
            <path d="M 450,400 A 100,100 0 0,1 450,200 A 50,50 0 0,1 450,300 A 50,50 0 0,0 450,400 Z" fill="#0047A0" />
            {/* Trigram representations in corners */}
            <rect x="220" y="150" width="70" height="14" fill="#000000" transform="rotate(-33 220 150)" />
            <rect x="210" y="170" width="70" height="14" fill="#000000" transform="rotate(-33 210 170)" />
            <rect x="200" y="190" width="70" height="14" fill="#000000" transform="rotate(-33 200 190)" />

            <rect x="620" y="400" width="70" height="14" fill="#000000" transform="rotate(-33 620 400)" />
            <rect x="610" y="420" width="70" height="14" fill="#000000" transform="rotate(-33 610 420)" />
            <rect x="600" y="440" width="70" height="14" fill="#000000" transform="rotate(-33 600 440)" />
          </svg>
        </div>
      );

    default:
      // Generic handsome fallback insignia with flagEmoji or countryCode
      return (
        <div className={`relative overflow-hidden rounded-md border border-slate-700/60 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 shadow-lg ${className}`}>
          {flagEmoji ? (
            <span className="text-6xl drop-shadow-md select-none">{flagEmoji}</span>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tracking-widest text-amber-400 font-mono">{code || 'INTL'}</span>
              <span className="text-xs text-slate-400 mt-1 uppercase">National Flag</span>
            </div>
          )}
        </div>
      );
  }
};
