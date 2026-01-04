
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'hub' | 'games' | 'finance' | 'studio' | 'travel';
}

const Logo: React.FC<LogoProps> = ({ size = 28, className = "", showText = false, variant = 'hub' }) => {
  const colors = {
    hub: ['#6366f1', '#4f46e5'],
    games: ['#f59e0b', '#d97706'],
    finance: ['#10b981', '#059669'],
    studio: ['#a855f7', '#9333ea'],
    travel: ['#06b6d4', '#0891b2'],
  };

  const [primary] = colors[variant];
  const imageSize = Math.max(size * 1.2, size + 4);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        style={{ width: imageSize, height: imageSize }}
        className="relative shrink-0 overflow-hidden rounded-lg shadow-md ring-1 ring-slate-200/70 dark:ring-white/10 bg-slate-900/70"
      >
        <img
          src="/omnihub-logo.svg"
          alt="OmniHub logo"
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 mix-blend-screen" aria-hidden />
      </div>
      {showText && (
        <div className="flex flex-col -space-y-0.5">
          <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            Omni<span style={{ color: primary }}>hub</span>
          </span>
          <span className="text-[5px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            Intelligent Core
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
