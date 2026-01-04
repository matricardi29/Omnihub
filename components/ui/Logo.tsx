
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'hub' | 'games' | 'finance' | 'studio' | 'travel';
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = "", showText = false, variant = 'hub' }) => {
  const colors = {
    hub: ['#6366f1', '#4f46e5'],
    games: ['#f59e0b', '#d97706'],
    finance: ['#10b981', '#059669'],
    studio: ['#a855f7', '#9333ea'],
    travel: ['#06b6d4', '#0891b2'],
  };

  const [primary, secondary] = colors[variant];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size }} className="relative shrink-0">
        <div 
          className="absolute inset-0 blur-xl opacity-20 transition-all duration-500" 
          style={{ backgroundColor: primary }}
        />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`gl-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primary} />
              <stop offset="100%" stopColor={secondary} />
            </linearGradient>
          </defs>
          <path 
            d="M50 18 L78 34 L78 66 L50 82 L22 66 L22 34 Z" 
            stroke={`url(#gl-${variant})`} 
            strokeWidth="9" 
            strokeLinejoin="round"
          />
          <circle cx="50" cy="50" r="9" fill={`url(#gl-${variant})`} />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col -space-y-0.5">
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            Omni<span style={{ color: primary }}>hub</span>
          </span>
          <span className="text-[5px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
            Intelligent Core
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
