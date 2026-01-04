import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'hub' | 'games' | 'finance' | 'studio' | 'travel';
}

const Logo: React.FC<LogoProps> = ({ size = 40, className = "", variant = 'hub' }) => {
  const colors = {
    hub: ['#6366F1', '#4F46E5'],     // Indigo
    games: ['#F59E0B', '#D97706'],   // Ámbar
    finance: ['#10B981', '#059669'], // Esmeralda
    studio: ['#A855F7', '#9333EA'],  // Púrpura
    travel: ['#06B6D4', '#0891B2'],  // Cian
  };

  const [primary, secondary] = colors[variant];
  const gradientId = `grad-omni-${variant}`;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
      </defs>

      {/* Estructura de Conexiones (Hub) */}
      <circle cx="50" cy="50" r="12" fill={`url(#${gradientId})`} />
      
      {/* Nodos Satélite */}
      <path 
        d="M50 20V32M50 68V80M20 50H32M68 50H80M29 29L37 37M63 63L71 71M29 71L37 63M63 37L71 29" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="8" 
        strokeLinecap="round"
      />
      
      {/* Anillo exterior segmentado para dar dinamismo */}
      <path 
        d="M85 50C85 69.33 69.33 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeDasharray="1 12"
      />
    </svg>
  );
};

export default Logo;
