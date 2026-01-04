
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gamepad2, TrendingUp, Sparkles, Compass } from 'lucide-react';
import Home from './components/Home';
import GameLobby from './components/games/GameLobby';
import Generala from './components/games/Generala';
import Scrabble from './components/games/Scrabble';
import Catan from './components/games/Catan';
import InterestCalculator from './components/productivity/InterestCalculator';
import ImageStudio from './components/creative/ImageStudio';
import TravelGuide from './components/travel/TravelGuide';
import ThemeToggle from './components/ui/ThemeToggle';

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Hub', variant: 'hub' as const },
    { path: '/games', icon: Gamepad2, label: 'Games', variant: 'games' as const },
    { path: '/creative', icon: Sparkles, label: 'Studio', variant: 'studio' as const },
    { path: '/travel', icon: Compass, label: 'Travel', variant: 'travel' as const },
    { path: '/productivity', icon: TrendingUp, label: 'Finance', variant: 'finance' as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] pb-[env(safe-area-inset-bottom)] bg-white/80 dark:bg-[#050810]/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const colors = {
            hub: 'text-indigo-600 dark:text-indigo-400',
            games: 'text-amber-600 dark:text-amber-500',
            studio: 'text-purple-600 dark:text-purple-400',
            travel: 'text-cyan-600 dark:text-cyan-400',
            finance: 'text-emerald-600 dark:text-emerald-400'
          };

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive ? colors[item.variant] : 'text-slate-400 dark:text-slate-600'}`}
            >
              <item.icon size={20} strokeWidth={isActive ? 3 : 2} className={isActive ? '-translate-y-0.5' : ''} />
              <span className={`text-[9px] font-bold mt-1 tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-white flex flex-col transition-colors duration-500">
        <main className="flex-1 w-full relative pb-20">
          <div className="max-w-md mx-auto px-6 py-6 page-transition">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<GameLobby />} />
              <Route path="/games/generala/:id" element={<Generala />} />
              <Route path="/games/scrabble/:id" element={<Scrabble />} />
              <Route path="/games/catan/:id" element={<Catan />} />
              <Route path="/productivity" element={<InterestCalculator />} />
              <Route path="/creative" element={<ImageStudio />} />
              <Route path="/travel" element={<TravelGuide />} />
            </Routes>
          </div>
        </main>
        
        {/* Posición fija y z-index alto para evitar solapamientos */}
        <div className="fixed top-5 right-5 z-[120]">
          <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
        </div>
        
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;
