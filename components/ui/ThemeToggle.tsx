
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400"
      aria-label="Alternar tema"
    >
      {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-600" />}
    </button>
  );
};

export default ThemeToggle;
